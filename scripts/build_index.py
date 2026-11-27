#!/usr/bin/env python3
"""Generate per-folder `_index.md` and a root `KNOWLEDGE_MAP.md` — idempotent.

- Walks the vault, emits an `_index.md` in every domain folder and subfolder
  (roadmap placeholder for empty stub folders), listing child folders and notes
  (title + one-line summary + wikilink).
- Emits root `KNOWLEDGE_MAP.md`; human prose outside the AUTO markers is preserved.
- Deterministic (stable sort, no timestamps) -> byte-identical on re-run.
- Excludes private/, generated/meta files, assets/, apps (12_side-project), and
  all denylisted dirs.

Usage (run from repo root):  python scripts/build_index.py [--check]
  --check : exit non-zero if any index would change (for CI / pre-commit).
"""
import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from add_frontmatter import split_frontmatter, H1  # noqa: E402
from velog_sync import _clean_name  # noqa: E402

DENY_DIRS = {".git", ".github", ".obsidian", ".gstack", ".pytest_cache",
             "node_modules", "__pycache__", "private", "assets", "12_side-project",
             "svg", "img", "images"}
DENY_NAMES = {"README.md", "AGENTS.md", "CLAUDE.md", "KNOWLEDGE_MAP.md", "_index.md"}
BEGIN = "<!-- AUTO:BEGIN — build_index.py가 생성/관리합니다. 직접 편집하지 말고 `python scripts/build_index.py`로 재생성하세요. -->"
END = "<!-- AUTO:END -->"
MAP_FILE = os.path.join(ROOT, "KNOWLEDGE_MAP.md")

DESCRIPTIONS = {
    "01_cs": "CS 기초 — OS·네트워크·디자인 패턴",
    "02_language": "언어 심화 — JavaScript·TypeScript",
    "03_coding": "알고리즘 & 코딩테스트",
    "04_database": "DB — RDBMS·Redis·InfluxDB·Vector·NoSQL",
    "05_web": "웹 — 브라우저·REST API·인증·성능",
    "06_infra": "인프라 — 게이트웨이·CI/CD·메시징·IIoT",
    "07_ai": "AI/ML — 평가·머신러닝·딥러닝·강화학습·생성형",
    "08_llm": "LLM — 기초·프롬프트·RAG·파인튜닝·추론·에이전트·평가",
    "09_pdm": "설비 예지보전 스터디 — 신호·아키텍처·이상감지·알림",
    "10_good": "잘 쓴 기술 글·엔지니어링 사례 스크랩",
    "11_process": "산업 공정 — 철강·석유화학·반도체·공통설비",
    "12_side-project": "사이드 프로젝트 (Quiz Studio 등)",
    "13_certification": "자격증 — 정보처리기사 실기",
}


def is_note(name):
    return name.endswith(".md") and name not in DENY_NAMES


def note_title_body(full):
    with open(full, "r", encoding="utf-8", newline="") as f:
        content = f.read()
    fm, body = split_frontmatter(content)
    if fm:
        for ln in fm[1:-1]:
            m = re.match(r"^title:\s*(.+?)\s*$", ln)
            if m:
                t = m.group(1).strip()
                if len(t) >= 2 and t[0] in "\"'" and t[-1] == t[0]:
                    t = t[1:-1]
                return t, body
    m = H1.search(body)
    if m:
        return m.group(1).strip(), body
    base = os.path.splitext(os.path.basename(full))[0]
    return re.sub(r"^\d+_", "", base).replace("_", " "), body


def summarize(body):
    in_code = False
    for raw in body.splitlines():
        s = raw.strip()
        if s.startswith("```"):
            in_code = not in_code
            continue
        if in_code or not s or s.startswith(("#", ">", "|", "<!--", "---", "===")):
            continue
        s = re.sub(r"^([-*+]|\d+\.)\s+", "", s)          # list markers
        s = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", s)  # links/images
        s = re.sub(r"\[\[([^\]|]+\|)?([^\]]+)\]\]", r"\2", s)  # wikilinks
        s = re.sub(r"[*_`]", "", s).strip()
        if s:
            return s[:70] + "…" if len(s) > 70 else s
    return ""


def cell(text):
    return text.replace("|", "\\|").replace("\n", " ")


def wikilink(rel_noext, title):
    return "[[{}|{}]]".format(rel_noext, cell(title))


def count_notes(dir_full):
    n = 0
    for dp, dns, fns in os.walk(dir_full):
        dns[:] = [d for d in dns if d not in DENY_DIRS]
        n += sum(1 for f in fns if is_note(f))
    return n


def should_index(rel):
    """Indexes are generated only at domain (depth 1) and subdomain (depth 2)."""
    comps = rel.split("/")
    if not re.match(r"^\d\d?_", comps[0]):
        return False
    return len(comps) <= 2


def collect_notes(dir_full, recursive):
    out = []
    if recursive:
        for dp, dns, fns in os.walk(dir_full):
            dns[:] = [d for d in dns if d not in DENY_DIRS]
            for f in fns:
                if is_note(f):
                    out.append(os.path.join(dp, f))
    else:
        for f in os.listdir(dir_full):
            full = os.path.join(dir_full, f)
            if os.path.isfile(full) and is_note(f):
                out.append(full)
    return sorted(out, key=lambda p: os.path.relpath(p, ROOT).replace("\\", "/"))


def build_folder_index(dir_full, dir_rel):
    comps = dir_rel.split("/")
    domain = _clean_name(comps[0])
    disp = _clean_name(comps[-1])
    depth = len(comps)

    subdirs = [d for d in sorted(os.listdir(dir_full))
               if os.path.isdir(os.path.join(dir_full, d))
               and d not in DENY_DIRS
               and should_index("{}/{}".format(dir_rel, d))]
    # domain index lists direct notes; subdomain index lists notes recursively
    notes = collect_notes(dir_full, recursive=(depth >= 2))

    fm = ["---", "title: {} 인덱스".format(disp), "domain: {}".format(domain)]
    if depth > 1:
        fm.append("category: {}".format(_clean_name(comps[1])))
    if not subdirs and not notes:
        fm.append("status: draft")
    fm += ["generated: true", "---", ""]

    lines = ["# {} 인덱스".format(dir_rel), "", BEGIN, ""]
    if subdirs:
        lines += ["## 하위 폴더", ""]
        for d in subdirs:
            cnt = count_notes(os.path.join(dir_full, d))
            sub_rel = "{}/{}".format(dir_rel, d)
            lines.append("- {} · {}개 노트".format(
                wikilink(sub_rel + "/_index", _clean_name(d)), cnt))
        lines.append("")
    if notes:
        lines += ["## 노트", "", "| 노트 | 요약 |", "|------|------|"]
        for full in notes:
            title, body = note_title_body(full)
            rel_noext = os.path.splitext(
                os.path.relpath(full, ROOT).replace("\\", "/"))[0]
            lines.append("| {} | {} |".format(
                wikilink(rel_noext, title), cell(summarize(body))))
        lines.append("")
    if not subdirs and not notes:
        lines += ["> 🚧 예정 (로드맵) — 아직 노트가 없습니다.", ""]
    lines += [END, ""]
    return "\n".join(fm + lines)


def build_map(domains):
    rows = ["| 도메인 | 설명 | 노트 | 인덱스 |", "|--------|------|------|--------|"]
    for d in domains:
        desc = DESCRIPTIONS.get(d, "")
        cnt = count_notes(os.path.join(ROOT, d))
        if d == "12_side-project":
            link = "[{}]({}/)".format(d, d)
            cnt_disp = "프로젝트"
        else:
            link = "[[{}/_index|{}]]".format(d, d)
            cnt_disp = str(cnt)
        rows.append("| {} | {} | {} | {} |".format(d, cell(desc), cnt_disp, link))
    auto = "\n".join(rows)

    default_pre = (
        "# 📚 dev-archive Knowledge Map\n\n"
        "> 전체 학습 아카이브의 도메인 지도. 각 도메인의 `_index.md`로 들어가면 노트 목록이 있다.\n"
        "> 에이전트 탐색 규칙은 [AGENTS.md](AGENTS.md) 참조. (이 표는 자동 생성)\n\n")

    if os.path.exists(MAP_FILE):
        with open(MAP_FILE, "r", encoding="utf-8", newline="") as f:
            old = f.read().replace("\r\n", "\n")
        if BEGIN in old and END in old:
            pre = old.split(BEGIN)[0]
            post = old.split(END, 1)[1]
            return pre + BEGIN + "\n" + auto + "\n" + END + post
    return default_pre + BEGIN + "\n" + auto + "\n" + END + "\n"


def write_if_changed(path, text, check, changes):
    existing = None
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8", newline="") as f:
            existing = f.read().replace("\r\n", "\n")
    if existing == text:
        return
    changes.append(os.path.relpath(path, ROOT).replace("\\", "/"))
    if not check:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="exit non-zero if any index is stale; write nothing")
    args = ap.parse_args()

    changes = []
    removed = []
    for dp, dns, fns in os.walk(ROOT):
        dns[:] = sorted(d for d in dns if d not in DENY_DIRS)
        rel = os.path.relpath(dp, ROOT).replace("\\", "/")
        if rel == ".":
            continue
        idx = os.path.join(dp, "_index.md")
        if should_index(rel):
            write_if_changed(idx, build_folder_index(dp, rel), args.check, changes)
        elif os.path.exists(idx) and re.match(r"^\d\d?_", rel.split("/")[0]):
            removed.append(rel + "/_index.md")  # orphan from a previous run
            if not args.check:
                os.remove(idx)

    # root map
    domains = sorted(d for d in os.listdir(ROOT)
                     if os.path.isdir(os.path.join(ROOT, d)) and re.match(r"^\d\d_", d))
    write_if_changed(MAP_FILE, build_map(domains), args.check, changes)

    stale = changes + removed
    if args.check:
        if stale:
            print("STALE indexes ({}):".format(len(stale)))
            for c in stale:
                print("  " + c)
            sys.exit(1)
        print("All indexes up to date.")
    else:
        for c in changes:
            print("wrote: " + c)
        for c in removed:
            print("removed (orphan): " + c)
        print("\n{} written/updated, {} removed.".format(len(changes), len(removed)))


if __name__ == "__main__":
    main()
