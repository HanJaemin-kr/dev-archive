#!/usr/bin/env python3
"""Resolve every [[wikilink]] and frontmatter `related:` target across the vault
and report danglers (targets that resolve to no file).

Resolution mirrors Obsidian:
- `[[path/to/note]]`  -> vault-root path (with or without .md),
- `[[../rel/note]]`   -> path relative to the source file,
- `[[note]]`          -> shortest-path basename match,
- a target that names a folder holding an `_index.md` resolves to that index.
Aliases (`|`) and heading anchors (`#`) are ignored. Code spans/fences are skipped.

Usage (run from repo root):  python scripts/check_links.py
"""
import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from add_frontmatter import split_frontmatter  # noqa: E402

DENY_DIRS = {".git", ".github", ".obsidian", ".gstack", ".pytest_cache",
             "node_modules", "__pycache__", "private"}
WIKILINK = re.compile(r"\[\[([^\]]+)\]\]")


def all_md():
    out = []
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = [d for d in dns if d not in DENY_DIRS]
        for f in fns:
            if f.endswith(".md"):
                out.append(os.path.join(dp, f))
    return out


def rel_noext(full):
    return os.path.splitext(os.path.relpath(full, ROOT).replace("\\", "/"))[0]


def strip_code(text):
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    return re.sub(r"`[^`]*`", "", text)


def normalize_target(raw):
    t = raw.split("|")[0].split("#")[0].strip()
    t = re.sub(r"^\[\[|\]\]$", "", t).strip()      # tolerate wrapped [[...]]
    if t.lower().endswith(".md"):
        t = t[:-3]
    return t


def resolve(target, source_full, paths, basenames, index_dirs, index_basenames):
    t = normalize_target(target)
    if not t or not re.search(r"[A-Za-z가-힣]", t):
        return True  # empty/anchor-only or numeric array literal ([[1,0]]) -> ignore
    if t.startswith((".", "/")) or "/" in t:
        if t.startswith(("./", "../")):
            base = os.path.dirname(os.path.relpath(source_full, ROOT))
            t = os.path.normpath(os.path.join(base, t)).replace("\\", "/")
        t = t.lstrip("/")
        return t in paths or t in index_dirs or (t + "/_index") in paths
    # bare name: a note basename, or a folder that has an _index.md
    return t in basenames or t in index_dirs or t in index_basenames


def main():
    md = all_md()
    paths = {rel_noext(f) for f in md}
    basenames = {os.path.basename(rel_noext(f)) for f in md}
    index_dirs = {os.path.dirname(p) for p in paths if p.endswith("/_index")}
    index_basenames = {os.path.basename(d) for d in index_dirs}

    danglers = []
    for full in md:
        rel = os.path.relpath(full, ROOT).replace("\\", "/")
        with open(full, "r", encoding="utf-8", newline="") as f:
            content = f.read()
        fm_lines, body = split_frontmatter(content)
        targets = []
        if fm_lines is not None:
            try:
                meta = yaml.safe_load("".join(fm_lines[1:-1])) or {}
            except yaml.YAMLError:
                meta = {}
            for r in (meta.get("related") or []):
                targets.append(("related", str(r)))
        for m in WIKILINK.finditer(strip_code(body)):
            targets.append(("wikilink", m.group(1)))
        for kind, tgt in targets:
            if not resolve(tgt, full, paths, basenames, index_dirs, index_basenames):
                danglers.append((rel, kind, normalize_target(tgt)))

    if danglers:
        print("DANGLING links ({}):".format(len(danglers)))
        for src, kind, tgt in danglers:
            print("  {}  --{}-->  {}".format(src, kind, tgt))
    else:
        print("No dangling links.")
    print("\n{} markdown files scanned.".format(len(md)))
    sys.exit(1 if danglers else 0)


if __name__ == "__main__":
    main()
