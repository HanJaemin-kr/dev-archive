"""Tistory 발행 — dev-archive 노트를 티스토리에 올린다.

velog_sync.py 와 대칭. 단, 티스토리는 공식 글쓰기 API가 없어(2024 종료) 브라우저 자동화
도구 `local-llm-stack/tistory-uploader`(Playwright)를 subprocess 로 호출한다.

대상: frontmatter 에 `tistory: true` 인 노트. (velog 플래그와 독립)
멱등: tistory_state.json(경로→포스트 URL). 이미 올린 파일은 건너뛴다(--force 로 재발행).
이 state 파일은 git 으로 **추적한다**(velog_state.json 과 일관 · 머신 간 중복 재발행 방지 · 비밀 아님).

기본은 **임시저장(--draft)**. 실제 발행은 --publish.
기본값을 코드 수정 없이 바꾸려면 env `TISTORY_DEFAULT_PUBLISH=1` (설정 시 기본이 발행, --draft 로 그때만 임시저장).

업로더는 글 수정 API가 없다 → state 에 있으면 중복 방지로 skip. 내용을 고쳐 다시 올리려면 --force
(새 글이 하나 더 생기고 옛 글은 남는다. 옛 글은 블로그에서 직접 지운다).

환경변수:
  TISTORY_UPLOADER_DIR  업로더 경로(기본: ~/Desktop/dev/local-llm-stack/tistory-uploader)
  TISTORY_PYTHON        업로더 실행 파이썬(기본: python) — playwright/markdown2/yaml 설치된 환경

사용:
  python scripts/tistory_sync.py                 # tistory:true 노트 전부, 임시저장
  python scripts/tistory_sync.py path/a.md b.md  # 특정 파일만
  python scripts/tistory_sync.py --publish       # 임시저장 대신 실제 발행
  python scripts/tistory_sync.py --force path.md # 이미 올린 것도 다시(새 글 생성)
"""
import argparse
import fnmatch
import glob
import json
import os
import re
import subprocess
import sys
from typing import List, Optional

STATE_FILE = "tistory_state.json"
IGNORE_FILE = ".velogignore"  # 발행 제외 목록은 velog 와 공유

DEFAULT_UPLOADER_DIR = os.path.join(os.path.expanduser("~"), "Desktop", "dev", "local-llm-stack", "tistory-uploader")


def uploader_dir() -> str:
    return os.environ.get("TISTORY_UPLOADER_DIR", DEFAULT_UPLOADER_DIR)


def uploader_python() -> str:
    return os.environ.get("TISTORY_PYTHON", "python")


def read_frontmatter(content: str) -> str:
    """Return the raw YAML frontmatter block (without fences), or '' if none."""
    lines = content.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return ""
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return "".join(lines[1:i])
    return ""


def has_tistory_flag(content: str) -> bool:
    """True iff frontmatter has `tistory: true` (loose, yaml-free)."""
    fm = read_frontmatter(content)
    for line in fm.splitlines():
        m = re.match(r"\s*tistory\s*:\s*(.+?)\s*$", line)
        if m:
            return m.group(1).strip().lower() in ("true", "yes", "on", "1")
    return False


def load_velogignore() -> List[str]:
    if not os.path.exists(IGNORE_FILE):
        return []
    with open(IGNORE_FILE, encoding="utf-8") as f:
        return [ln.strip() for ln in f if ln.strip() and not ln.startswith("#")]


def is_ignored(filepath: str, patterns: List[str]) -> bool:
    p = filepath.replace("\\", "/").lstrip("./")
    base = p.rsplit("/", 1)[-1]
    for pat in patterns:
        if fnmatch.fnmatch(p, pat) or fnmatch.fnmatch(base, pat):
            return True
        if pat.startswith("**/") and fnmatch.fnmatch(base, pat[3:]):
            return True
    return False


def load_state() -> dict:
    if not os.path.exists(STATE_FILE):
        return {}
    with open(STATE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def parse_result_url(stdout: str) -> Optional[str]:
    """upload.py 는 'Published: <url>' 또는 'Saved as draft: <url>' 를 찍는다."""
    m = re.search(r"(?:Published|Saved as draft):\s*(\S+)", stdout)
    return m.group(1) if m else None


def discover_targets() -> List[str]:
    """repo 전체에서 tistory:true 노트 경로(상대) 목록."""
    out = []
    for path in glob.glob("**/*.md", recursive=True):
        norm = path.replace("\\", "/")
        if norm.startswith("private/") or "/_index.md" in "/" + norm:
            continue
        try:
            with open(path, encoding="utf-8") as f:
                content = f.read()
        except OSError:
            continue
        if has_tistory_flag(content):
            out.append(norm)
    return out


def upload_one(filepath: str, draft: bool) -> Optional[str]:
    """업로더 subprocess 호출. 성공 시 URL, 실패 시 None."""
    abs_path = os.path.abspath(filepath)
    cmd = [uploader_python(), "upload.py", abs_path]
    if draft:
        cmd.append("--draft")
    try:
        proc = subprocess.run(
            cmd, cwd=uploader_dir(), capture_output=True, text=True, timeout=180
        )
    except FileNotFoundError:
        print("Error: uploader not found at {} (set TISTORY_UPLOADER_DIR)".format(uploader_dir()))
        return None
    except subprocess.TimeoutExpired:
        print("Error: upload timed out for {}".format(filepath))
        return None
    if proc.returncode != 0:
        print("Error uploading {}: {}".format(filepath, (proc.stderr or proc.stdout).strip()))
        return None
    url = parse_result_url(proc.stdout)
    if not url:
        print("Warning: no URL parsed for {} — stdout: {}".format(filepath, proc.stdout.strip()))
    return url


def main() -> None:
    ap = argparse.ArgumentParser(description="Publish dev-archive notes (tistory:true) to Tistory")
    ap.add_argument("files", nargs="*", help="특정 .md 경로(미지정 시 tistory:true 전체)")
    ap.add_argument("--publish", action="store_true", help="임시저장 대신 실제 발행")
    ap.add_argument("--draft", action="store_true", help="강제 임시저장(기본이 발행으로 바뀐 경우)")
    ap.add_argument("--force", action="store_true", help="이미 올린 것도 다시 발행(새 글 생성)")
    args = ap.parse_args()

    default_publish = os.environ.get("TISTORY_DEFAULT_PUBLISH", "").strip().lower() in ("1", "true", "yes", "on")
    if args.draft:
        draft = True
    elif args.publish:
        draft = False
    else:
        draft = not default_publish
    ignore = load_velogignore()

    if args.files:
        targets = []
        for f in args.files:
            norm = f.replace("\\", "/")
            try:
                with open(f, encoding="utf-8") as fh:
                    content = fh.read()
            except OSError:
                print("Skip (not found): {}".format(f))
                continue
            if not has_tistory_flag(content):
                print("Skip (no tistory:true): {}".format(f))
                continue
            targets.append(norm)
    else:
        targets = discover_targets()

    targets = [t for t in targets if not is_ignored(t, ignore)]
    if not targets:
        print("No tistory:true notes to publish.")
        return

    state = load_state()
    for filepath in targets:
        if filepath in state and not args.force:
            print("Skip (already posted): {} -> {}".format(filepath, state[filepath]))
            continue
        url = upload_one(filepath, draft)
        if url:
            state[filepath] = url
            status = "Draft" if draft else "Published"
            print("{}: {} -> {}".format(status, filepath, url))
            save_state(state)  # 건건이 저장(중간 실패 대비)


if __name__ == "__main__":
    main()
