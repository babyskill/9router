from __future__ import annotations

import argparse
import base64
import json
import os
import re
import time
from pathlib import Path
from typing import Any

import requests


def _load_json_documents(path: Path) -> list[Any]:
    text = path.read_text(encoding="utf-8")
    decoder = json.JSONDecoder()
    docs: list[Any] = []
    i = 0
    while i < len(text):
        while i < len(text) and text[i].isspace():
            i += 1
        if i >= len(text):
            break
        doc, end = decoder.raw_decode(text, idx=i)
        docs.append(doc)
        i = end
    return docs


def _sanitize_filename(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"[^a-z0-9._-]+", "", value)
    return value or "voice"


def _load_dotenv_value(dotenv_path: Path, key: str) -> str | None:
    if not dotenv_path.exists():
        return None
    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k.strip() != key:
            continue
        value = v.strip()
        if not value:
            return ""
        if value[0] in ("'", '"') and len(value) >= 2 and value[-1] == value[0]:
            return value[1:-1]
        value = value.split(" #", 1)[0].split("\t#", 1)[0].strip()
        return value
    return None


def _extract_bearer_from_curl(curl_text: str) -> str | None:
    m = re.search(r"-H\s+'authorization:\s*Bearer\s+([^']+)'", curl_text, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m = re.search(r'-H\s+"authorization:\s*Bearer\s+([^"]+)"', curl_text, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return None


def _extract_headers_from_curl(curl_text: str) -> dict[str, str]:
    headers: dict[str, str] = {}
    for m in re.finditer(r"-H\s+'([^']+)'", curl_text):
        raw = m.group(1)
        if ":" not in raw:
            continue
        k, v = raw.split(":", 1)
        headers[k.strip()] = v.strip()
    for m in re.finditer(r'-H\s+"([^"]+)"', curl_text):
        raw = m.group(1)
        if ":" not in raw:
            continue
        k, v = raw.split(":", 1)
        headers[k.strip()] = v.strip()
    return headers


def _extract_endpoint_from_curl(curl_text: str) -> str | None:
    m = re.search(r"curl\s+'([^']+)'", curl_text)
    if m:
        return m.group(1).strip()
    m = re.search(r'curl\s+"([^"]+)"', curl_text)
    if m:
        return m.group(1).strip()
    return None


def _load_voices(voice_json_path: Path) -> list[dict[str, Any]]:
    voices: list[dict[str, Any]] = []
    for doc in _load_json_documents(voice_json_path):
        if not isinstance(doc, dict):
            continue
        items: Any = doc.get("items")
        if items is None:
            items = doc.get("result", {}).get("items", [])
        if not isinstance(items, list):
            continue
        for v in items:
            if not isinstance(v, dict):
                continue
            if v.get("id") and v.get("name"):
                voices.append(v)
    return voices


def _select_voices(voices: list[dict[str, Any]], selectors: list[str], limit: int) -> list[dict[str, Any]]:
    if not selectors:
        return voices[:limit]

    selected: list[dict[str, Any]] = []
    used_ids: set[str] = set()
    for sel in selectors:
        sel_norm = sel.strip().lower()
        for v in voices:
            vid = str(v.get("id", ""))
            if not vid or vid in used_ids:
                continue
            name = str(v.get("name", "")).lower()
            slug = str(v.get("slug", "")).lower()
            if sel_norm == vid.lower() or sel_norm in name or (slug and sel_norm in slug):
                selected.append(v)
                used_ids.add(vid)
    return selected


def _extract_scene_speeches(script_text: str) -> list[tuple[int, str]]:
    scenes: list[tuple[int, str]] = []
    for m in re.finditer(
        r"SCENE\s+(\d+):.*?tông giọng[^:]*:\s*'([^']+)'",
        script_text,
        flags=re.IGNORECASE | re.DOTALL,
    ):
        idx = int(m.group(1))
        speech = m.group(2).strip()
        scenes.append((idx, speech))
    scenes.sort(key=lambda x: x[0])
    return scenes


def _find_audio_url(obj: Any) -> str | None:
    if isinstance(obj, dict):
        for k in ("cdnUrl", "audioUrl", "url", "fileUrl", "downloadUrl"):
            v = obj.get(k)
            if isinstance(v, str) and v.startswith("http"):
                return v
        for v in obj.values():
            found = _find_audio_url(v)
            if found:
                return found
    if isinstance(obj, list):
        for v in obj:
            found = _find_audio_url(v)
            if found:
                return found
    return None


def _find_audio_base64(obj: Any) -> str | None:
    if isinstance(obj, dict):
        for k in ("audioBase64", "base64", "dataBase64"):
            v = obj.get(k)
            if isinstance(v, str) and len(v) > 200:
                return v
        for v in obj.values():
            found = _find_audio_base64(v)
            if found:
                return found
    if isinstance(obj, list):
        for v in obj:
            found = _find_audio_base64(v)
            if found:
                return found
    return None


def _post_tts(
    session: requests.Session,
    *,
    endpoint: str,
    headers: dict[str, str],
    bearer_token: str,
    text: str,
    user_voice_id: str,
    speed: float,
    block_version: int,
    timeout_s: float,
) -> dict[str, Any]:
    req_headers = dict(headers)
    req_headers["authorization"] = f"Bearer {bearer_token}"
    req_headers["content-type"] = "application/json"

    payload = {
        "method": "tts",
        "input": {
            "text": text,
            "userVoiceId": user_voice_id,
            "speed": speed,
            "blockVersion": block_version,
        },
    }
    resp = session.post(endpoint, headers=req_headers, json=payload, timeout=timeout_s)
    resp.raise_for_status()
    return resp.json()


def _write_audio_from_result(
    session: requests.Session,
    result: dict[str, Any],
    out_path_base: Path,
    timeout_s: float,
) -> Path:
    audio_url = _find_audio_url(result)
    if audio_url:
        suffix = Path(audio_url.split("?", 1)[0]).suffix.lower()
        out_path = out_path_base.with_suffix(suffix if suffix else ".mp3")
        with session.get(audio_url, stream=True, timeout=timeout_s) as r:
            r.raise_for_status()
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with out_path.open("wb") as f:
                for chunk in r.iter_content(chunk_size=1024 * 128):
                    if chunk:
                        f.write(chunk)
        return out_path

    audio_b64 = _find_audio_base64(result)
    if audio_b64:
        out_path = out_path_base.with_suffix(".wav")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(base64.b64decode(audio_b64))
        return out_path

    out_path = out_path_base.with_suffix(".json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(prog="lucylab-tts")
    parser.add_argument("--endpoint", default="https://api.lucylab.io/json-rpc")
    parser.add_argument("--curl-file", default="")
    parser.add_argument("--header", action="append", default=[])
    parser.add_argument("--bearer", default="")
    parser.add_argument("--voice-json", default="")
    parser.add_argument("--export-voice-library", default="")
    parser.add_argument("--out-dir", default="outputs/tts-lucylab")
    parser.add_argument("--text", default="")
    parser.add_argument("--text-file", default="")
    parser.add_argument("--voices", action="append", default=[])
    parser.add_argument("--voice", action="append", default=[])
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--speed", type=float, default=1.0)
    parser.add_argument("--block-version", type=int, default=0)
    parser.add_argument("--sleep", type=float, default=0.25)
    parser.add_argument("--timeout", type=float, default=60.0)
    parser.add_argument("--mode", choices=("auto", "plain", "script-scenes"), default="auto")
    args = parser.parse_args()

    if args.export_voice_library:
        src = Path(args.voice_json) if args.voice_json else Path("voice.json")
        if not src.exists():
            raise SystemExit("Missing source voice json. Provide --voice-json or create voice.json.")
        voices = _load_voices(src)
        def normalize_desc(desc: str) -> str:
            d = (desc or "").strip()
            d_lower = d.lower()
            if d_lower.startswith("đây là một giọng nói hay"):
                return ""
            return d

        def compact_item(v: dict[str, Any]) -> dict[str, Any] | None:
            vid = str(v.get("id", "")).strip()
            name = str(v.get("name", "")).strip()
            if not vid or not name:
                return None
            tags: Any = v.get("tag")
            if not isinstance(tags, list):
                tags = v.get("tags")
            if not isinstance(tags, list):
                tags = []
            return {
                "id": vid,
                "name": name,
                "description": normalize_desc(str(v.get("description") or "")),
                "tag": tags,
            }

        def categorize(tags: list[str]) -> str:
            t = {str(x).strip().lower() for x in tags if str(x).strip()}
            region = "other"
            if "miền bắc" in t:
                region = "north"
            elif "miền nam" in t:
                region = "south"
            gender = "other"
            if "nam" in t:
                gender = "male"
            elif "nữ" in t:
                gender = "female"
            if region in ("north", "south") and gender in ("male", "female"):
                return f"{region}_{gender}"
            return "other"

        out_path = Path(args.export_voice_library)
        if out_path.suffix.lower() != ".json":
            out_dir = out_path
            out_dir.mkdir(parents=True, exist_ok=True)
            by_cat: dict[str, list[dict[str, Any]]] = {
                "north_male": [],
                "north_female": [],
                "south_male": [],
                "south_female": [],
                "other": [],
            }
            for v in voices:
                if not isinstance(v, dict):
                    continue
                it = compact_item(v)
                if it is None:
                    continue
                cid = categorize([str(x) for x in it.get("tag", [])])
                by_cat[cid].append(it)

            name_map = {
                "north_male": "Nam miền Bắc",
                "north_female": "Nữ miền Bắc",
                "south_male": "Nam miền Nam",
                "south_female": "Nữ miền Nam",
                "other": "Khác / không rõ",
            }
            index: dict[str, Any] = {"version": 1, "categories": []}
            for cid, cat_items in by_cat.items():
                (out_dir / f"{cid}.json").write_text(
                    json.dumps({"version": 1, "items": cat_items}, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8",
                )
                index["categories"].append(
                    {"id": cid, "name": name_map[cid], "file": f"{cid}.json", "count": len(cat_items)}
                )
            (out_dir / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(f"OK: {out_dir}")
            return 0

        items: list[dict[str, Any]] = []
        for v in voices:
            if not isinstance(v, dict):
                continue
            it = compact_item(v)
            if it is not None:
                items.append(it)

        out_path.write_text(json.dumps({"version": 1, "items": items}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"OK: {out_path}")
        return 0

    out_dir = Path(args.out_dir)

    endpoint = args.endpoint.strip() or "https://api.lucylab.io/json-rpc"
    headers: dict[str, str] = {"accept": "*/*"}

    curl_text = ""
    if args.curl_file:
        curl_path = Path(args.curl_file)
        if curl_path.exists():
            curl_text = curl_path.read_text(encoding="utf-8")
            endpoint = _extract_endpoint_from_curl(curl_text) or endpoint
            headers.update(_extract_headers_from_curl(curl_text))

    for h in args.header:
        raw = str(h).strip()
        if not raw or ":" not in raw:
            raise SystemExit("Invalid --header. Expected format: 'Key: Value'")
        k, v = raw.split(":", 1)
        headers[k.strip()] = v.strip()

    bearer_token = args.bearer.strip() or os.environ.get("LUCYLAB_BEARER", "").strip()
    if not bearer_token:
        bearer_token = _load_dotenv_value(Path.cwd() / ".env", "LUCYLAB_BEARER") or ""
    if not bearer_token:
        bearer_token = _load_dotenv_value(Path(__file__).resolve().with_name(".env"), "LUCYLAB_BEARER") or ""
    if not bearer_token:
        bearer_token = _extract_bearer_from_curl(curl_text) or ""
    if not bearer_token:
        raise SystemExit("Missing bearer token. Set LUCYLAB_BEARER or pass --bearer.")

    voice_specs: list[dict[str, Any]] = []
    for spec in args.voice:
        raw = str(spec).strip()
        if not raw:
            continue
        if ":" in raw:
            voice_id, voice_name = raw.split(":", 1)
            voice_id = voice_id.strip()
            voice_name = voice_name.strip() or voice_id
        else:
            voice_id = raw
            voice_name = voice_id
        if voice_id:
            voice_specs.append({"id": voice_id, "name": voice_name, "slug": _sanitize_filename(voice_name)})

    selected_voices: list[dict[str, Any]] = []
    if args.voice_json:
        voice_path = Path(args.voice_json)
        if voice_path.exists():
            voices = _load_voices(voice_path)
            selected_voices = _select_voices(voices, args.voices, args.limit)

    if not selected_voices:
        if voice_specs:
            selected_voices = voice_specs
        else:
            raise SystemExit(
                "No voices selected. Provide --voice-json + --voices, or pass explicit --voice <id>[:name]."
            )

    text = args.text.strip()
    if args.text_file:
        text = Path(args.text_file).read_text(encoding="utf-8").strip()
    if not text:
        raise SystemExit("Provide --text or --text-file.")

    mode = args.mode
    if mode == "auto":
        mode = "script-scenes" if re.search(r"\bSCENE\s+\d+\b", text, flags=re.IGNORECASE) else "plain"

    items: list[tuple[str, str]] = []
    if mode == "plain":
        items = [("full", text)]
    else:
        scenes = _extract_scene_speeches(text)
        if not scenes:
            raise SystemExit("No SCENE thoại found in text. Use --mode plain or check script format.")
        items = [(f"scene-{idx:02d}", speech) for idx, speech in scenes]

    session = requests.Session()

    manifest: dict[str, Any] = {
        "endpoint": endpoint,
        "speed": args.speed,
        "blockVersion": args.block_version,
        "mode": mode,
        "voices": [],
        "items": [],
    }

    for voice in selected_voices:
        voice_id = str(voice["id"])
        voice_name = str(voice.get("name", voice_id))
        voice_slug = _sanitize_filename(str(voice.get("slug", voice_name)))
        manifest["voices"].append({"id": voice_id, "name": voice_name, "slug": voice_slug})

    for label, speech in items:
        manifest["items"].append({"label": label, "text": speech})

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    for voice in selected_voices:
        voice_id = str(voice["id"])
        voice_name = str(voice.get("name", voice_id))
        voice_slug = _sanitize_filename(str(voice.get("slug", voice_name)))

        for label, speech in items:
            base = out_dir / voice_slug / label
            attempt = 0
            while True:
                attempt += 1
                try:
                    result = _post_tts(
                        session,
                        endpoint=endpoint,
                        headers=headers,
                        bearer_token=bearer_token,
                        text=speech,
                        user_voice_id=voice_id,
                        speed=args.speed,
                        block_version=args.block_version,
                        timeout_s=args.timeout,
                    )
                    _write_audio_from_result(session, result, base, args.timeout)
                    break
                except Exception:
                    if attempt >= 3:
                        raise
                    time.sleep(1.5 * attempt)

            if args.sleep > 0:
                time.sleep(args.sleep)

    print(f"OK: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
