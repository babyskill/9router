export const meta = {
  name: 'completion-sweep',
  description: 'Fable 5 completion conductor — rà soát gap & hoàn thiện dự án 80%→RC, chia model theo thế mạnh, checkpoint-gated',
  whenToUse: 'Khi cần đưa dự án đang dở lên Release Candidate: quét gap (scan) rồi thực thi task đã duyệt (execute).',
  phases: [
    { title: 'Bootstrap', detail: 'đọc hiến pháp + detect/synthesize register' },
    { title: 'Gap Scan', detail: '5 finder song song, chia model theo thế mạnh' },
    { title: 'Reconcile', detail: 'đối chiếu hiến pháp, reject gap vi phạm', model: 'opus' },
    { title: 'Task-gen', detail: 'sinh task nhỏ có acceptance + gán model', model: 'opus' },
    { title: 'Execute', detail: 'implementers song song, worktree-isolated' },
    { title: 'QA Gate', detail: 'test → emulator → triage → fix → regression → review' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// args = {
//   mode: 'scan' | 'execute',
//   projectRoot: string,
//   constitutionPath?: string,        // mặc định docs/specs/CONSTITUTION.md
//   healthThreshold?: number,         // mặc định 95
//   tasks?: Task[],                   // BẮT BUỘC khi mode='execute' (danh sách đã user duyệt)
//   mobile?: boolean,                 // bật emulator QA (blitz-iphone / ios-simulator)
// }
// ─────────────────────────────────────────────────────────────────────────────
const MODE = (args && args.mode) || 'scan'
const ROOT = (args && args.projectRoot) || '.'
const CONSTITUTION = (args && args.constitutionPath) || 'docs/specs/CONSTITUTION.md'
const THRESHOLD = (args && args.healthThreshold) || 95
const MOBILE = !!(args && args.mobile)

// ── Schemas (structured output — validate tại tool layer, agent tự retry) ──────
const GAP_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          kind: { type: 'string', description: 'feature|flow|todo|stub|mock|dead-code|missing-state|missing-test|security|debt|lint' },
          file: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: { type: 'string' },
          userImpact: { type: 'string' },
        },
        required: ['id', 'title', 'kind', 'severity', 'evidence'],
      },
    },
    metrics: { type: 'object', description: 'con số đếm được cho health score, vd {todos: 12, testFail: 3, coverage: 61}' },
  },
  required: ['dimension', 'gaps', 'metrics'],
}

const RECONCILE_SCHEMA = {
  type: 'object',
  properties: {
    violations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gapId: { type: 'string' },
          principle: { type: 'string' },
          verdict: { type: 'string', enum: ['reject', 'rescope', 'allow'] },
          reason: { type: 'string' },
        },
        required: ['gapId', 'verdict', 'reason'],
      },
    },
  },
  required: ['violations'],
}

const TASK_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          gapIds: { type: 'array', items: { type: 'string' } },
          type: { type: 'string', enum: ['feature', 'ui', 'api', 'test', 'bugfix', 'asset', 'docs', 'refactor'] },
          model: { type: 'string', enum: ['opus', 'sonnet', 'haiku', 'fable', 'codex'] },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          dependsOn: { type: 'array', items: { type: 'string' } },
          acceptance: { type: 'array', items: { type: 'string' } },
          impact: { type: 'string' },
        },
        required: ['id', 'title', 'type', 'model', 'priority', 'acceptance'],
      },
    },
  },
  required: ['tasks'],
}

const EXEC_SCHEMA = {
  type: 'object',
  properties: {
    taskId: { type: 'string' },
    status: { type: 'string', enum: ['done', 'blocked', 'partial'] },
    filesChanged: { type: 'array', items: { type: 'string' } },
    buildOk: { type: 'boolean' },
    notes: { type: 'string' },
    constitutionOk: { type: 'boolean' },
  },
  required: ['taskId', 'status', 'buildOk', 'constitutionOk'],
}

const QA_SCHEMA = {
  type: 'object',
  properties: {
    taskId: { type: 'string' },
    testsPassed: { type: 'boolean' },
    emulatorPassed: { type: ['boolean', 'null'] },
    regressionOk: { type: 'boolean' },
    reviewVerdict: { type: 'string', enum: ['approve', 'changes-requested', 'reject'] },
    bugs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          bugId: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          rootCause: { type: 'string' },
          regressionRisk: { type: 'string' },
        },
        required: ['bugId', 'severity'],
      },
    },
  },
  required: ['taskId', 'testsPassed', 'regressionOk', 'reviewVerdict'],
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE = scan  →  Pha 0–3 (READ-ONLY, không mutate file)
// ─────────────────────────────────────────────────────────────────────────────
async function runScan() {
  // ── Pha 0 · Bootstrap (Fable/Opus): đọc hiến pháp + nắm nguồn sự thật ──────
  phase('Bootstrap')
  const boot = await agent(
    `Bạn là Bootstrap agent của Completion Conductor. Project root: ${ROOT}.\n` +
    `1. Đọc hiến pháp tại ${CONSTITUTION}. NẾU KHÔNG TỒN TẠI → trả {constitutionOk:false} và DỪNG (Fable phải chạy constitution-gate trước).\n` +
    `2. Detect các nguồn sự thật: FEATURE_LIST.md, ROADMAP.md, PROJECT_STATUS.md, TESTING_MASTER_DOC.md, BUG_TRACKER.md, specs .kiro, CODEBASE.md.\n` +
    `3. Tóm tắt: stack, feature-set đã cam kết, và 5-9 nguyên tắc hiến pháp (trích nguyên văn) để các finder đối chiếu.\n` +
    `CHỈ ĐỌC, không sửa gì.`,
    {
      phase: 'Bootstrap',
      label: 'bootstrap',
      model: 'opus',
      schema: {
        type: 'object',
        properties: {
          constitutionOk: { type: 'boolean' },
          principles: { type: 'array', items: { type: 'string' } },
          stack: { type: 'string' },
          committedFeatures: { type: 'array', items: { type: 'string' } },
          docsPresent: { type: 'array', items: { type: 'string' } },
        },
        required: ['constitutionOk'],
      },
    },
  )

  if (!boot || !boot.constitutionOk) {
    log('⛔ Chưa có hiến pháp hợp lệ — DỪNG. Chạy constitution-gate (Gate 0) trước rồi mới sweep.')
    return { aborted: true, reason: 'missing-constitution', health: null, gaps: [], tasks: [] }
  }

  const principlesCtx = (boot.principles || []).map((p, i) => `  ${i + 1}. ${p}`).join('\n')
  const featCtx = (boot.committedFeatures || []).join(', ')

  // ── Pha 1 · Gap Scan (5 finder song song, chia model theo thế mạnh) ────────
  phase('Gap Scan')
  const FINDERS = [
    { key: 'product', model: 'opus', label: 'find:product',
      prompt: `PRODUCT COMPLETION finder. So sánh feature-set cam kết (${featCtx}) + hiến pháp với code thực tế trong ${ROOT}. Tìm: feature thiếu, flow chưa kết thúc, requirement mơ hồ, màn hình chưa hoàn thiện. Xếp theo user impact.` },
    { key: 'arch', model: 'opus', label: 'find:arch',
      prompt: `ARCHITECTURE GUARDIAN finder. Rà ${ROOT} tìm: coupling xấu, sai module boundary, technical debt, file >500 dòng, circular dependency. Nếu có gitnexus, ưu tiên dùng để đo blast radius. Đối chiếu hiến pháp:\n${principlesCtx}` },
    { key: 'ux', model: 'sonnet', label: 'find:ux',
      prompt: `UX FLOW finder. Duyệt end-to-end user flow trong ${ROOT}. Tìm màn hình/flow THIẾU: loading state, empty state, error state, success state, retry, offline handling. Đánh giá friction & recovery path.` },
    { key: 'security', model: 'opus', label: 'find:security',
      prompt: `SECURITY & PRIVACY finder. Rà ${ROOT}: secret hardcoded, token/PII trong log, auth/permission gap, storage không an toàn. KHÔNG in giá trị secret ra — chỉ báo vị trí file:line.` },
    { key: 'inventory', model: 'haiku', label: 'find:inventory',
      prompt: `INVENTORY finder (việc lặp). Grep ${ROOT} liệt kê: TODO, FIXME, HACK, stub, mock, temporary code, dead code, và compiler/linter warning. Mỗi mục kèm file:line + 1 dòng ngữ cảnh.` },
  ]

  const scanResults = (await parallel(
    FINDERS.map((f) => () =>
      agent(`${f.prompt}\n\nTrả theo schema: dimension="${f.key}", gaps[], metrics{} (con số đếm được).`, {
        phase: 'Gap Scan',
        label: f.label,
        model: f.model,
        schema: GAP_SCHEMA,
      }),
    ),
  )).filter(Boolean)

  const allGaps = scanResults.flatMap((r) => r.gaps || [])
  const metrics = scanResults.reduce((acc, r) => Object.assign(acc, r.metrics || {}), {})
  log(`Gap Scan: ${allGaps.length} gap qua ${scanResults.length} chiều.`)

  if (allGaps.length === 0) {
    return { aborted: false, health: scoreHealth(metrics, []), gaps: [], tasks: [], principles: boot.principles }
  }

  // ── Pha 2 · Constitution Reconcile (Opus/Fable): reject gap vi phạm ────────
  phase('Reconcile')
  const reconcile = await agent(
    `CONSTITUTION RECONCILER. Nguyên tắc hiến pháp:\n${principlesCtx}\n\n` +
    `Danh sách gap:\n${JSON.stringify(allGaps.map((g) => ({ id: g.id, title: g.title, kind: g.kind })))}\n\n` +
    `Với mỗi gap có khả năng dẫn tới cách sửa VI PHẠM hiến pháp: verdict=reject (cấm), rescope (sửa hướng khác), hoặc allow. Chỉ liệt kê gap cần chú ý.`,
    { phase: 'Reconcile', label: 'reconcile', model: 'opus', schema: RECONCILE_SCHEMA },
  )
  const rejected = new Set((reconcile && reconcile.violations || []).filter((v) => v.verdict === 'reject').map((v) => v.gapId))
  const validGaps = allGaps.filter((g) => !rejected.has(g.id))
  log(`Reconcile: ${rejected.size} gap bị reject vì phạm hiến pháp; ${validGaps.length} gap hợp lệ.`)

  // ── Pha 3 · Task-gen (Opus): task nhỏ + gán model theo rubric ──────────────
  phase('Task-gen')
  const taskGen = await agent(
    `TASK GENERATOR. Từ các gap hợp lệ, sinh TASK NHỎ (mỗi task ≤ 1 đơn vị công việc gọn).\n` +
    `Gaps:\n${JSON.stringify(validGaps)}\n\n` +
    `RUBRIC GÁN MODEL bắt buộc:\n` +
    `  - architecture/security/root-cause khó → opus\n` +
    `  - feature/ui/api/test/bugfix → sonnet\n` +
    `  - inventory/docs/checklist → haiku\n` +
    `  - tạo image/GUI asset (icon/sprite/HUD) → codex\n` +
    `Mỗi task: id, gapIds, type, model, priority(P0-P3), dependsOn, acceptance[] (testable), impact.`,
    { phase: 'Task-gen', label: 'task-gen', model: 'opus', schema: TASK_SCHEMA },
  )
  const tasks = (taskGen && taskGen.tasks) || []
  log(`Task-gen: ${tasks.length} task (${tasks.filter((t) => t.priority === 'P0').length} P0).`)

  return {
    aborted: false,
    health: scoreHealth(metrics, validGaps),
    gaps: validGaps,
    rejected: Array.from(rejected),
    tasks,
    principles: boot.principles,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE = execute  →  Pha 4–5 trên task đã duyệt (worktree-isolated + QA gate)
// ─────────────────────────────────────────────────────────────────────────────
async function runExecute() {
  const tasks = (args && args.tasks) || []
  if (tasks.length === 0) {
    log('Không có task nào được truyền vào execute mode.')
    return { results: [], bugs: [] }
  }

  // Pipeline: mỗi task tự chạy Implement → QA Gate độc lập (không barrier giữa các task).
  const results = await pipeline(
    tasks,
    // Stage 1 · Execute (worktree-isolated, model theo task.model) ────────────
    (task) => {
      const isAsset = task.type === 'asset' || task.model === 'codex'
      const implPrompt = isAsset
        ? `ASSET agent. Task ${task.id}: ${task.title}. Dùng skill generate-gui-assets + Codex CLI để tạo/tổ chức image asset. ` +
          `Tôn trọng chroma-key/manifest/QA của skill đó. Acceptance:\n- ${(task.acceptance || []).join('\n- ')}`
        : `IMPLEMENTER agent. Task ${task.id} (${task.type}): ${task.title}.\n` +
          `Acceptance:\n- ${(task.acceptance || []).join('\n- ')}\n` +
          `RÀNG BUỘC: file <500 dòng · không hardcode secret · chạy gitnexus impact trước khi sửa symbol · ` +
          `KHÔNG đổi schema/kiến trúc ngoài scope (nếu cần → status=blocked, notes nêu lý do) · đối chiếu hiến pháp.`
      // Codex-asset task vẫn cho Sonnet điều phối (Codex chạy qua CLI); các task khác dùng model đã gán.
      const runModel = task.model === 'codex' ? 'sonnet' : (task.model || 'sonnet')
      return agent(implPrompt, {
        phase: 'Execute',
        label: `exec:${task.id}`,
        model: runModel,
        isolation: 'worktree',
        schema: EXEC_SCHEMA,
      })
    },
    // Stage 2 · QA Gate (test → emulator → regression → review) ───────────────
    (exec, task) => {
      if (!exec || exec.status === 'blocked' || !exec.buildOk) {
        return { taskId: task.id, testsPassed: false, regressionOk: false, reviewVerdict: 'reject', bugs: [], skipped: true, exec }
      }
      const emulatorLine = MOBILE
        ? `3. EMULATOR QA: dùng MCP blitz-iphone / ios-simulator chạy flow chính của task, chụp screenshot, ghi actual result. Fail → tạo bug.`
        : `3. (không mobile — bỏ emulator, dựa test runner của dự án)`
      return agent(
        `QA GATE cho task ${task.id}: ${task.title}. Files: ${JSON.stringify((exec && exec.filesChanged) || [])}.\n` +
        `1. TEST DESIGN + chạy unit/integration test; cập nhật TESTING_MASTER_DOC.md.\n` +
        `2. REGRESSION: kiểm tra feature liên quan không hỏng.\n` +
        `${emulatorLine}\n` +
        `4. CODE REVIEW (compose skill code-review) + verification-gate: đối chiếu acceptance + hiến pháp.\n` +
        `Bug nào phát hiện → bugId, severity, rootCause, regressionRisk. Không đóng bug khi chưa retest.`,
        {
          phase: 'QA Gate',
          label: `qa:${task.id}`,
          model: 'sonnet',
          schema: QA_SCHEMA,
        },
      ).then((qa) => ({ ...(qa || { taskId: task.id }), exec }))
    },
  )

  const clean = results.filter(Boolean)
  const bugs = clean.flatMap((r) => (r && r.bugs) || [])
  const merged = clean.filter((r) => r && r.reviewVerdict === 'approve' && r.testsPassed && r.regressionOk && (MOBILE ? r.emulatorPassed !== false : true))
  log(`Execute: ${clean.length} task xử lý · ${merged.length} qua QA gate · ${bugs.length} bug mở.`)

  return { results: clean, bugs, mergeable: merged.map((r) => r.taskId) }
}

// ── Health scoring: evidence-backed từ metrics + severity gap ─────────────────
function scoreHealth(metrics, gaps) {
  const crit = gaps.filter((g) => g.severity === 'critical').length
  const high = gaps.filter((g) => g.severity === 'high').length
  const med = gaps.filter((g) => g.severity === 'medium').length
  // Trừ điểm theo severity (con số đếm được, không cảm tính).
  const penalty = crit * 20 + high * 8 + med * 3
  const overall = Math.max(0, 100 - penalty)
  return {
    overall,
    counts: { critical: crit, high, medium: med, total: gaps.length },
    metrics: metrics || {},
    releaseReady: crit === 0 && high === 0 && overall >= THRESHOLD,
    threshold: THRESHOLD,
  }
}

// ── Entry ────────────────────────────────────────────────────────────────────
if (MODE === 'execute') {
  return await runExecute()
}
return await runScan()
