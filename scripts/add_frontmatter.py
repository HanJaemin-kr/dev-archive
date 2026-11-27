#!/usr/bin/env python3
"""Backfill YAML frontmatter into markdown notes — idempotent & additive.

- Adds only MISSING frontmatter keys; never overwrites an existing value.
- Derives: title (H1, else humanized filename), domain/category/tags (path),
  created/updated (git history), velog (velog_state.json membership).
- Body bytes and line endings are preserved exactly.
- Skips private/, generated/meta files (README/AGENTS/CLAUDE/KNOWLEDGE_MAP/_index),
  and non-note directories.

Usage (run from repo root):
  python scripts/add_frontmatter.py [--dry-run] [--only GLOB] [--allow-dirty]

Refuses to run on a dirty git tree unless --dry-run or --allow-dirty, so the
backfill lands as one reviewable diff.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from velog_sync import _parse_path  # noqa: E402  (reuse the one path convention)

DENY_DIRS = {".git", ".github", ".obsidian", ".gstack", ".pytest_cache",
             "node_modules", "__pycache__", "private",
             "12_side-project"}  # apps, not study notes — don't touch app markdown
DENY_NAMES = {"README.md", "AGENTS.md", "CLAUDE.md", "KNOWLEDGE_MAP.md", "_index.md"}
KEY_ORDER = ["title", "domain", "category", "tags", "level", "status",
             "created", "updated", "velog", "related"]
H1 = re.compile(r"^#\s+(.+)$", re.MULTILINE)
KEYLINE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*):")
STATE_FILE = os.path.join(ROOT, "velog_state.json")


def iter_notes(only=None):
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in DENY_DIRS]
        for name in filenames:
            if not name.endswith(".md") or name in DENY_NAMES:
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            if only and not _match(rel, only):
                continue
            yield full, rel


def _match(rel, pattern):
    import fnmatch
    return fnmatch.fnmatch(rel, pattern) or rel.startswith(pattern.rstrip("/*") + "/")


def git_dates():
    """One pass over history -> {relpath: (created, updated)} as YYYY-MM-DD."""
    try:
        out = subprocess.run(
            ["git", "-c", "core.quotepath=false", "log",
             "--pretty=format:\x00%as", "--name-only"],
            cwd=ROOT, capture_output=True, text=True, encoding="utf-8", check=True,
        ).stdout
    except Exception:
        return {}
    first, last, cur = {}, {}, None  # log is newest-first: first seen=updated, last=created
    for line in out.splitlines():
        if line.startswith("\x00"):
            cur = line[1:].strip()
        elif line.strip():
            f = line.strip()
            if f not in first:
                first[f] = cur
            last[f] = cur
    return {f: (last.get(f), first.get(f)) for f in first}


def mtime_date(full):
    import datetime
    return datetime.date.fromtimestamp(os.path.getmtime(full)).isoformat()


def title_of(body, full):
    m = H1.search(body)
    if m:
        return m.group(1).strip()
    base = os.path.splitext(os.path.basename(full))[0]
    return re.sub(r"^\d+_", "", base).replace("_", " ").strip()


def scalar(v):
    s = str(v)
    if s == "":
        return '""'
    special = set(":#[]{},&*!|>%@`\"'")
    if s != s.strip() or s[0] in "-?" or any(c in special for c in s):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return s


def kv_line(key, value):
    if isinstance(value, list):
        if not value:
            return key + ": []"
        return "{}: [{}]".format(key, ", ".join(scalar(x) for x in value))
    if isinstance(value, bool):
        return "{}: {}".format(key, "true" if value else "false")
    return "{}: {}".format(key, scalar(value))


def split_frontmatter(content):
    """Return (fm_lines_with_ends, body) or (None, content)."""
    lines = content.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return None, content
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return lines[:i + 1], "".join(lines[i + 1:])
    return None, content  # unclosed -> not frontmatter


def build_meta(rel, body, dates, velog_keys, full):
    series, subtags = _parse_path(rel)
    domain = series or "root"
    tags = list(dict.fromkeys([t for t in [domain] + subtags if t]))
    created, updated = dates.get(rel, (None, None))
    if not created:
        created = updated = mtime_date(full)
    meta = {
        "title": title_of(body, full),
        "domain": domain,
        "tags": tags,
        "level": "intermediate",
        "status": "published",
        "created": created,
        "updated": updated,
        "velog": rel in velog_keys,
        "related": [],
    }
    if subtags:
        meta["category"] = subtags[0]
    return meta


def process(full, rel, dates, velog_keys):
    with open(full, "r", encoding="utf-8", newline="") as f:
        content = f.read()
    nl = "\r\n" if "\r\n" in content else "\n"
    fm_lines, body = split_frontmatter(content)
    meta = build_meta(rel, body if fm_lines else content, dates, velog_keys, full)

    if fm_lines is None:
        block = "---" + nl
        for k in KEY_ORDER:
            if k in meta:
                block += kv_line(k, meta[k]) + nl
        block += "---" + nl
        sep = "" if content.startswith(("\n", "\r\n")) else nl
        return block + sep + content

    existing = {m.group(1) for m in (KEYLINE.match(ln) for ln in fm_lines[1:-1]) if m}
    missing = [k for k in KEY_ORDER if k in meta and k not in existing]
    if not missing:
        return None  # idempotent: nothing to add
    inserted = [kv_line(k, meta[k]) + nl for k in missing]
    return "".join(fm_lines[:-1]) + "".join(inserted) + fm_lines[-1] + body


def git_dirty():
    out = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT,
                         capture_output=True, text=True, encoding="utf-8").stdout
    return bool(out.strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", help="restrict to paths matching this glob/prefix")
    ap.add_argument("--allow-dirty", action="store_true")
    args = ap.parse_args()

    if not args.dry_run and not args.allow_dirty and git_dirty():
        print("Refusing to run: git tree is dirty. Commit/stash first, or pass "
              "--allow-dirty (backfill is meant to land as one reviewable diff).")
        sys.exit(1)

    dates = git_dates()
    velog_keys = set(json.load(open(STATE_FILE, encoding="utf-8")).keys()) \
        if os.path.exists(STATE_FILE) else set()

    changed = skipped = 0
    for full, rel in iter_notes(args.only):
        try:
            new = process(full, rel, dates, velog_keys)
        except Exception as e:
            print("ERROR {}: {}".format(rel, e))
            continue
        if new is None:
            skipped += 1
            continue
        changed += 1
        if args.dry_run:
            print("would add frontmatter: {}".format(rel))
        else:
            with open(full, "w", encoding="utf-8", newline="") as f:
                f.write(new)
            print("frontmatter: {}".format(rel))
    print("\n{} to update, {} already had frontmatter (idempotent skip).".format(
        changed, skipped))


if __name__ == "__main__":
    main()
