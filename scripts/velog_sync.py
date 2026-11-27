import fnmatch
import json
import os
import re
import sys
import time
from typing import Optional, Tuple, List

import requests

VELOG_GRAPHQL = "https://v3.velog.io/graphql"
VELOG_GRAPHQL_V2 = "https://v2.velog.io/graphql"
STATE_FILE = "velog_state.json"
IGNORE_FILE = ".velogignore"


def _clean_name(name: str) -> str:
    return re.sub(r"^\d+_", "", name)


def strip_frontmatter(content: str) -> str:
    """Remove a leading YAML frontmatter block (--- ... ---) so it is not
    published into the Velog post body. Returns content unchanged if there is
    no frontmatter or the block is not properly closed."""
    lines = content.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return content
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return "".join(lines[i + 1:]).lstrip("\n")
    return content  # no closing fence -> treat as normal content


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


def _parse_path(filepath: str) -> Tuple[Optional[str], List[str]]:
    parts = filepath.replace("\\", "/").split("/")
    folders = parts[:-1]
    series = _clean_name(folders[0]) if folders else None
    tags = [_clean_name(f) for f in folders[1:]] if len(folders) > 1 else []
    return series, tags


def parse_post(filepath: str) -> dict:
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    body = strip_frontmatter(content)
    title_match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else os.path.splitext(os.path.basename(filepath))[0]
    series, tags = _parse_path(filepath)
    return {"title": title, "body": body, "series": series, "tags": tags}


def load_state() -> dict:
    if not os.path.exists(STATE_FILE):
        return {}
    with open(STATE_FILE, encoding="utf-8") as f:
        return json.load(f)


def save_state(state: dict) -> None:
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def _make_session(refresh_token: str) -> requests.Session:
    # v3 issues a new access_token on first request with refresh_token
    session = requests.Session()
    session.cookies.set("refresh_token", refresh_token, domain=".velog.io")
    session.headers.update({"Content-Type": "application/json"})
    # warm-up: exchange refresh_token for access_token
    session.post(VELOG_GRAPHQL, json={"query": "{ currentUser { username } }", "variables": {}})
    return session


def _gql(session: requests.Session, query: str, variables: dict) -> dict:
    resp = session.post(VELOG_GRAPHQL, json={"query": query, "variables": variables})
    resp.raise_for_status()
    return resp.json() if resp.text.strip() else {}


def get_current_user(session: requests.Session) -> str:
    data = _gql(session, "{ currentUser { username } }", {})
    return data["data"]["currentUser"]["username"]


def get_series_id(session: requests.Session, username: str, series_name: str) -> Optional[str]:
    url_slug = re.sub(r"[^a-z0-9가-힣]", "-", series_name.lower()).strip("-")
    data = _gql(session, """
        query Series($input: GetSeriesInput!) {
          series(input: $input) { id }
        }
    """, {"input": {"username": username, "url_slug": url_slug}})
    series = data["data"].get("series")
    if series:
        return series["id"]
    # v2 API로 시리즈 생성 (v3에는 createSeries 없음)
    access_token = session.cookies.get("access_token", "")
    resp = session.post(VELOG_GRAPHQL_V2,
        json={"query": "mutation CreateSeries($name: String!, $url_slug: String!) { createSeries(name: $name, url_slug: $url_slug) { id } }",
              "variables": {"name": series_name, "url_slug": url_slug}},
        headers={"Cookie": "access_token={}".format(access_token)})
    resp.raise_for_status()
    data = resp.json()
    created = data.get("data", {}).get("createSeries")
    if created:
        print("Created series: {}".format(series_name))
        return created["id"]
    return None


def _url_slug(title: str) -> str:
    slug = re.sub(r"[^a-z0-9가-힣\s]", "", title.lower()).strip()
    return re.sub(r"\s+", "-", slug) or "post"


def publish_post(session: requests.Session, post_data: dict, series_id: Optional[str] = None) -> str:
    inp = {
        "title": post_data["title"],
        "body": post_data["body"],
        "tags": post_data["tags"],
        "is_markdown": True,
        "is_temp": False,
        "is_private": False,
        "url_slug": _url_slug(post_data["title"]),
        "meta": {},
    }
    if series_id:
        inp["series_id"] = series_id
    data = _gql(session, """
        mutation WritePost($input: WritePostInput!) {
          writePost(input: $input) { id }
        }
    """, {"input": inp})
    return data["data"]["writePost"]["id"]


def update_post(session: requests.Session, post_id: str, post_data: dict, series_id: Optional[str] = None) -> None:
    inp = {
        "id": post_id,
        "title": post_data["title"],
        "body": post_data["body"],
        "tags": post_data["tags"],
        "is_markdown": True,
        "meta": {},
    }
    if series_id:
        inp["series_id"] = series_id
    _gql(session, """
        mutation EditPost($input: EditPostInput!) {
          editPost(input: $input) { id }
        }
    """, {"input": inp})


def sync_file(filepath: str, session: requests.Session, username: str, state: dict) -> dict:
    for attempt in range(3):
        try:
            post_data = parse_post(filepath)
            series_id = None
            if post_data["series"]:
                series_id = get_series_id(session, username, post_data["series"])
            post_id = state.get(filepath)
            if post_id:
                update_post(session, post_id, post_data, series_id)
                print("Updated: {}".format(filepath))
            else:
                post_id = publish_post(session, post_data, series_id)
                state[filepath] = post_id
                print("Published: {} -> {}".format(filepath, post_id))
            time.sleep(1.5)
            break
        except Exception as e:
            if attempt < 2:
                print("Retry {}/2 for {}: {}".format(attempt + 1, filepath, e))
                time.sleep(5 * (attempt + 1))
            else:
                print("Error syncing {}: {}".format(filepath, e))
    return state


def main() -> None:
    token = os.environ.get("VELOG_TOKEN")
    if not token:
        print("Error: VELOG_TOKEN environment variable not set")
        sys.exit(1)

    filepaths = sys.argv[1:]
    if not filepaths:
        print("No files to sync")
        return

    ignore = load_velogignore()
    skipped = [f for f in filepaths if is_ignored(f, ignore)]
    filepaths = [f for f in filepaths if not is_ignored(f, ignore)]
    for f in skipped:
        print("Skipped (.velogignore): {}".format(f))
    if not filepaths:
        print("No files to sync after .velogignore filter")
        return

    state = load_state()
    session = _make_session(token)
    username = get_current_user(session)
    for filepath in filepaths:
        state = sync_file(filepath, session, username, state)
    save_state(state)


if __name__ == "__main__":
    main()
