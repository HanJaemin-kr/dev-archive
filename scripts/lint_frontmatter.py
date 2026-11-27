#!/usr/bin/env python3
"""Validate YAML frontmatter across all notes. Exit non-zero on any violation.

Checks (per note):
- frontmatter block present and valid YAML,
- all required keys present,
- domain matches the top-level folder,
- created/updated are YYYY-MM-DD dates,
- tags/related are lists, velog is a bool,
- level/status use known values (warning only).

Usage (run from repo root):  python scripts/lint_frontmatter.py
"""
import datetime
import os
import re
import sys

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from add_frontmatter import iter_notes, split_frontmatter  # noqa: E402
from velog_sync import _parse_path  # noqa: E402

REQUIRED = ["title", "domain", "tags", "level", "status",
            "created", "updated", "velog", "related"]
LEVELS = {"beginner", "intermediate", "advanced"}
STATUSES = {"draft", "in-progress", "published"}
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def check(full, rel):
    errs, warns = [], []
    with open(full, "r", encoding="utf-8", newline="") as f:
        content = f.read()
    fm_lines, _ = split_frontmatter(content)
    if fm_lines is None:
        return ["no frontmatter"], []
    try:
        meta = yaml.safe_load("".join(fm_lines[1:-1])) or {}
    except yaml.YAMLError as e:
        return ["invalid YAML: {}".format(e)], []
    if not isinstance(meta, dict):
        return ["frontmatter is not a mapping"], []

    for k in REQUIRED:
        if k not in meta:
            errs.append("missing key: {}".format(k))

    domain = _parse_path(rel)[0]
    if meta.get("domain") not in (None, domain):
        errs.append("domain '{}' != folder '{}'".format(meta.get("domain"), domain))
    if not isinstance(meta.get("tags"), list):
        errs.append("tags must be a list")
    if not isinstance(meta.get("related"), list):
        errs.append("related must be a list")
    if not isinstance(meta.get("velog"), bool):
        errs.append("velog must be a boolean")
    for k in ("created", "updated"):
        v = meta.get(k)
        if isinstance(v, datetime.date):
            continue
        if not (isinstance(v, str) and DATE.match(v)):
            errs.append("{} not a YYYY-MM-DD date: {!r}".format(k, v))
    if meta.get("level") not in LEVELS:
        warns.append("unknown level: {!r}".format(meta.get("level")))
    if meta.get("status") not in STATUSES:
        warns.append("unknown status: {!r}".format(meta.get("status")))
    return errs, warns


def main():
    n = fail = warncount = 0
    for full, rel in iter_notes():
        n += 1
        errs, warns = check(full, rel)
        for w in warns:
            warncount += 1
            print("WARN  {}: {}".format(rel, w))
        if errs:
            fail += 1
            for e in errs:
                print("ERROR {}: {}".format(rel, e))
    print("\n{} notes checked, {} with errors, {} warnings.".format(n, fail, warncount))
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
