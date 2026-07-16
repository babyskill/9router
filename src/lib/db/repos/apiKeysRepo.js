import { v4 as uuidv4 } from "uuid";
import { getAdapter } from "../driver.js";

function rowToKey(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    machineId: row.machineId,
    isActive: row.isActive === 1 || row.isActive === true,
    quotaLimitUsd: row.quotaLimitUsd == null ? null : Number(row.quotaLimitUsd),
    quotaUsageUsd: Number(row.quotaUsageUsd ?? 0),
    quotaLimitTokens: row.quotaLimitTokens == null ? null : Number(row.quotaLimitTokens),
    quotaUsageTokens: Number(row.quotaUsageTokens ?? 0),
    createdAt: row.createdAt,
  };
}

export async function getApiKeys() {
  const db = await getAdapter();
  const rows = db.all(`SELECT * FROM apiKeys ORDER BY createdAt ASC`);
  return rows.map(rowToKey);
}

export async function getApiKeyById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
  return rowToKey(row);
}

export async function createApiKey(name, machineId, quotaLimitUsd = null, quotaLimitTokens = null) {
  if (!machineId) throw new Error("machineId is required");
  const db = await getAdapter();
  const { generateApiKeyWithMachine } = await import("@/shared/utils/apiKey");
  const result = generateApiKeyWithMachine(machineId);
  const apiKey = {
    id: uuidv4(),
    name,
    key: result.key,
    machineId,
    isActive: true,
    quotaLimitUsd,
    quotaUsageUsd: 0,
    quotaLimitTokens,
    quotaUsageTokens: 0,
    createdAt: new Date().toISOString(),
  };
  db.run(
    `INSERT INTO apiKeys(id, key, name, machineId, isActive, quotaLimitUsd, quotaUsageUsd, quotaLimitTokens, quotaUsageTokens, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      apiKey.id, apiKey.key, apiKey.name, apiKey.machineId, 1,
      apiKey.quotaLimitUsd, apiKey.quotaUsageUsd,
      apiKey.quotaLimitTokens, apiKey.quotaUsageTokens, apiKey.createdAt,
    ]
  );
  return apiKey;
}

export async function updateApiKey(id, data) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
    if (!row) return;
    const merged = { ...rowToKey(row), ...data };
    db.run(
      `UPDATE apiKeys SET key = ?, name = ?, machineId = ?, isActive = ?, quotaLimitUsd = ?, quotaUsageUsd = ?, quotaLimitTokens = ?, quotaUsageTokens = ? WHERE id = ?`,
      [
        merged.key, merged.name, merged.machineId, merged.isActive ? 1 : 0,
        merged.quotaLimitUsd, merged.quotaUsageUsd,
        merged.quotaLimitTokens, merged.quotaUsageTokens, id,
      ]
    );
    result = merged;
  });
  return result;
}

export async function deleteApiKey(id) {
  const db = await getAdapter();
  const res = db.run(`DELETE FROM apiKeys WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}

export async function validateApiKey(key) {
  const result = await validateApiKeyDetails(key);
  return result.valid;
}

export async function validateApiKeyDetails(key) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE key = ?`, [key]);
  const apiKey = rowToKey(row);

  if (!apiKey) return { valid: false, error: "Invalid API key", status: 401 };
  if (!apiKey.isActive) {
    return { valid: false, error: "API key is paused/inactive", status: 401 };
  }
  if (apiKey.quotaLimitUsd !== null && apiKey.quotaUsageUsd >= apiKey.quotaLimitUsd) {
    return {
      valid: false,
      error: "API key quota exceeded (USD budget limit reached)",
      status: 402,
    };
  }
  if (
    apiKey.quotaLimitTokens !== null &&
    apiKey.quotaUsageTokens >= apiKey.quotaLimitTokens
  ) {
    return {
      valid: false,
      error: "API key quota exceeded (Token limit reached)",
      status: 429,
    };
  }
  return { valid: true };
}
