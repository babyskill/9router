import { OPENAI_BLOCK } from "../schema/index.js";

// Collapse an OpenAI content-part array: a lone text part becomes a plain string,
// otherwise the array is returned as-is. Matches existing translator behavior.
export function collapseTextParts(parts) {
  if (parts.length > 0 && parts.every(p => p.type === OPENAI_BLOCK.TEXT && Object.keys(p).every(k => k === "type" || k === "text"))) {
    return parts.map(p => p.text).join("\n");
  }
  return parts;
}
