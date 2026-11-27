from tistory_sync import (
    read_frontmatter,
    has_tistory_flag,
    parse_result_url,
    is_ignored,
)


FM = """---
title: 테스트 노트
domain: cs
tags: [cs, test]
tistory: true
velog: false
---

# 테스트 노트

본문.
"""


def test_read_frontmatter_extracts_block():
    fm = read_frontmatter(FM)
    assert "title: 테스트 노트" in fm
    assert "tistory: true" in fm
    assert "본문" not in fm


def test_has_tistory_flag_true():
    assert has_tistory_flag(FM) is True


def test_has_tistory_flag_false_when_false():
    content = FM.replace("tistory: true", "tistory: false")
    assert has_tistory_flag(content) is False


def test_has_tistory_flag_false_when_missing():
    content = "---\ntitle: X\ntags: [a]\n---\n\n# X\n"
    assert has_tistory_flag(content) is False


def test_has_tistory_flag_no_frontmatter():
    assert has_tistory_flag("# just a heading\n\nbody") is False


def test_parse_result_url_published():
    assert parse_result_url("Published: https://b.tistory.com/42") == "https://b.tistory.com/42"


def test_parse_result_url_draft():
    out = "some log\nSaved as draft: https://b.tistory.com/manage/post/43\n"
    assert parse_result_url(out) == "https://b.tistory.com/manage/post/43"


def test_parse_result_url_none():
    assert parse_result_url("nothing here") is None


def test_is_ignored_matches_index_and_meta():
    patterns = ["AGENTS.md", "**/_index.md"]
    assert is_ignored("AGENTS.md", patterns) is True
    assert is_ignored("08_llm/_index.md", patterns) is True
    assert is_ignored("08_llm/05_inference/note.md", patterns) is False
