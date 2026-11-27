from unittest.mock import patch, MagicMock, mock_open
import pytest
from velog_sync import sync_file

TOKEN = "test-token"
USERNAME = "testuser"


def test_sync_new_post_publishes_and_saves_id():
    state = {}
    md = "# My Title\n\nContent"
    with patch("builtins.open", mock_open(read_data=md)), \
         patch("velog_sync.get_series_id", return_value="s-id"), \
         patch("velog_sync.publish_post", return_value="new-post-id") as mock_pub:
        result = sync_file("01_cs/overview.md", TOKEN, USERNAME, state)
    mock_pub.assert_called_once()
    assert result["01_cs/overview.md"] == "new-post-id"


def test_sync_existing_post_updates():
    state = {"01_cs/overview.md": "existing-id"}
    md = "# Updated Title\n\nNew content"
    with patch("builtins.open", mock_open(read_data=md)), \
         patch("velog_sync.get_series_id", return_value="series-id"), \
         patch("velog_sync.update_post") as mock_upd:
        result = sync_file("01_cs/overview.md", TOKEN, USERNAME, state)
    mock_upd.assert_called_once_with(TOKEN, "existing-id", {
        "title": "Updated Title",
        "body": md,
        "series": "cs",  # NN_ prefix stripped by _clean_name
        "tags": [],  # no subfolders → no tags
    }, "series-id")
    assert result["01_cs/overview.md"] == "existing-id"


def test_sync_no_series_skips_get_or_create():
    state = {}
    md = "# Title"
    with patch("builtins.open", mock_open(read_data=md)), \
         patch("velog_sync.get_series_id") as mock_series, \
         patch("velog_sync.publish_post", return_value="pid"):
        sync_file("overview.md", TOKEN, USERNAME, state)
    mock_series.assert_not_called()


def test_sync_file_error_is_caught():
    state = {}
    with patch("builtins.open", side_effect=FileNotFoundError("not found")):
        result = sync_file("missing.md", TOKEN, USERNAME, state)
    assert "missing.md" not in result


def test_sync_api_error_is_caught():
    state = {}
    md = "# Title"
    with patch("builtins.open", mock_open(read_data=md)), \
         patch("velog_sync.get_series_id", return_value="s-id"), \
         patch("velog_sync.publish_post", side_effect=Exception("API error")):
        result = sync_file("01_cs/overview.md", TOKEN, USERNAME, state)
    assert "01_cs/overview.md" not in result
