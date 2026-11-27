from unittest.mock import mock_open, patch
from velog_sync import parse_post, _parse_path, strip_frontmatter, is_ignored


def test_parse_path_nested():
    series, tags = _parse_path("01_cs/02_network/05_websocket/websocket.md")
    assert series == "cs"
    assert tags == ["network", "websocket"]


def test_parse_path_single_folder():
    series, tags = _parse_path("01_cs/overview.md")
    assert series == "cs"
    assert tags == []


def test_parse_path_no_folder():
    series, tags = _parse_path("overview.md")
    assert series is None
    assert tags == []


def test_parse_post_extracts_heading():
    md = "# My Title\n\nSome content"
    with patch("builtins.open", mock_open(read_data=md)):
        result = parse_post("01_cs/02_network/websocket.md")
    assert result["title"] == "My Title"
    assert result["body"] == md
    assert result["series"] == "cs"
    assert result["tags"] == ["network"]


def test_parse_post_no_heading_uses_filename():
    md = "No heading here\n\nJust content"
    with patch("builtins.open", mock_open(read_data=md)):
        result = parse_post("01_cs/overview.md")
    assert result["title"] == "overview"


def test_parse_post_windows_path():
    md = "# Title"
    with patch("builtins.open", mock_open(read_data=md)):
        result = parse_post("01_cs\\02_network\\websocket.md")
    assert result["series"] == "cs"
    assert result["tags"] == ["network"]


def test_strip_frontmatter_removes_block():
    md = "---\ntitle: MQTT\ntags: [infra]\n---\n\n# MQTT\n\nbody"
    assert strip_frontmatter(md) == "# MQTT\n\nbody"


def test_strip_frontmatter_no_frontmatter_unchanged():
    md = "# MQTT\n\n---\n\nhorizontal rule below heading"
    assert strip_frontmatter(md) == md


def test_strip_frontmatter_unclosed_unchanged():
    md = "---\ntitle: broken\nno closing fence\n# body"
    assert strip_frontmatter(md) == md


def test_parse_post_strips_frontmatter_from_body():
    md = "---\ntitle: Meta\ndomain: cs\n---\n\n# Real Heading\n\ncontent"
    with patch("builtins.open", mock_open(read_data=md)):
        result = parse_post("01_cs/02_network/websocket.md")
    assert result["title"] == "Real Heading"
    assert result["body"] == "# Real Heading\n\ncontent"
    assert not result["body"].startswith("---")


def test_is_ignored_matches_index_and_root_docs():
    patterns = ["AGENTS.md", "CLAUDE.md", "KNOWLEDGE_MAP.md", "**/_index.md"]
    assert is_ignored("AGENTS.md", patterns)
    assert is_ignored("08_llm/_index.md", patterns)
    assert is_ignored("08_llm/06_agents/_index.md", patterns)
    assert not is_ignored("08_llm/06_agents/00_overview.md", patterns)
    assert not is_ignored("01_cs/02_network/websocket.md", patterns)
