import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock http2
const mockHttp2Request = {
  on: vi.fn(),
  end: vi.fn(),
};

const mockHttp2Client = {
  request: vi.fn(() => mockHttp2Request),
  on: vi.fn(),
  close: vi.fn(),
};

const mockConnect = vi.fn(() => mockHttp2Client);

vi.mock("http2", () => ({
  default: {
    connect: mockConnect,
  },
  connect: mockConnect,
}));

// We will dynamically import these after the mocks are set up
let clearCursorModelCache;
let parseCursorUsableModels;
let resolveCursorModels;

function varint(value) {
  const bytes = [];
  while (value >= 0x80) {
    bytes.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  bytes.push(value);
  return Uint8Array.from(bytes);
}

function field(fieldNumber, value) {
  return Uint8Array.from([(fieldNumber << 3) | 2, ...varint(value.length), ...value]);
}

function text(value) {
  return new TextEncoder().encode(value);
}

function concat(...parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function model(id, name) {
  return field(1, concat(field(1, text(id)), field(4, text(name))));
}

describe("Cursor live model catalog", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../../open-sse/services/cursorModels.js");
    clearCursorModelCache = mod.clearCursorModelCache;
    parseCursorUsableModels = mod.parseCursorUsableModels;
    resolveCursorModels = mod.resolveCursorModels;
    clearCursorModelCache();
  });

  afterEach(() => {
    if (clearCursorModelCache) {
      clearCursorModelCache();
    }
  });

  it("decodes the GetUsableModels protobuf response", () => {
    const payload = concat(
      model("default", "Auto"),
      model("gpt-5.3-codex", "GPT 5.3 Codex"),
      model("gpt-5.3-codex", "Duplicate"),
    );

    expect(parseCursorUsableModels(payload)).toEqual([
      { id: "default", name: "Auto" },
      { id: "gpt-5.3-codex", name: "GPT 5.3 Codex" },
    ]);
  });

  it("fetches the account-specific catalog and caches it", async () => {
    const payload = concat(model("claude-4.6-opus", "Claude 4.6 Opus"));
    
    mockHttp2Request.on.mockImplementation((event, callback) => {
      if (event === "response") {
        callback({ ":status": 200 });
      } else if (event === "end") {
        setImmediate(() => {
          const dataCallback = mockHttp2Request.on.mock.calls.find(c => c[0] === "data")?.[1];
          if (dataCallback) dataCallback(Buffer.from(payload));
          callback();
        });
      }
      return mockHttp2Request;
    });

    const credentials = {
      accessToken: "cursor-token",
      providerSpecificData: { machineId: "machine-id" },
    };

    await expect(resolveCursorModels(credentials)).resolves.toEqual({
      models: [{ id: "claude-4.6-opus", name: "Claude 4.6 Opus" }],
    });
    await expect(resolveCursorModels(credentials)).resolves.toEqual({
      models: [{ id: "claude-4.6-opus", name: "Claude 4.6 Opus" }],
    });

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith("https://agent.api5.cursor.sh");
    expect(mockHttp2Client.request).toHaveBeenCalledWith(
      expect.objectContaining({
        ":method": "POST",
        ":path": "/agent.v1.AgentService/GetUsableModels",
        ":authority": "agent.api5.cursor.sh",
        accept: "application/proto",
        "content-type": "application/proto",
      })
    );
  });

  it("fails open when the Cursor catalog request fails", async () => {
    mockHttp2Request.on.mockImplementation((event, callback) => {
      if (event === "response") {
        callback({ ":status": 403 });
      } else if (event === "end") {
        setImmediate(() => callback());
      }
      return mockHttp2Request;
    });

    await expect(resolveCursorModels({
      accessToken: "cursor-token",
      providerSpecificData: { machineId: "machine-id" },
    })).resolves.toBeNull();
  });
});
