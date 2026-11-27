from unittest.mock import patch, MagicMock
import pytest
from velog_sync import publish_post, update_post, get_current_user, get_series_id


def _mock_session(data):
    session = MagicMock()
    resp = MagicMock()
    resp.json.return_value = data
    resp.raise_for_status = MagicMock()
    session.post.return_value = resp
    return session


def test_publish_post_returns_id():
    session = _mock_session({"data": {"writePost": {"id": "new-id"}}})
    post_id = publish_post(session, {"title": "T", "body": "B", "tags": ["t1"]})
    assert post_id == "new-id"


def test_publish_post_with_series():
    session = _mock_session({"data": {"writePost": {"id": "new-id"}}})
    publish_post(session, {"title": "T", "body": "B", "tags": []}, series_id="s-id")
    payload = session.post.call_args.kwargs["json"]
    assert payload["variables"]["input"]["series_id"] == "s-id"


def test_update_post_calls_edit_mutation():
    session = _mock_session({"data": {"editPost": {"id": "e-id"}}})
    update_post(session, "e-id", {"title": "T", "body": "B", "tags": []})
    payload = session.post.call_args.kwargs["json"]
    assert "editPost" in payload["query"]
    assert payload["variables"]["input"]["id"] == "e-id"


def test_get_current_user():
    session = _mock_session({"data": {"currentUser": {"username": "testuser"}}})
    assert get_current_user(session) == "testuser"


def test_get_series_id_existing():
    session = _mock_session({"data": {"series": {"id": "s-id-1"}}})
    assert get_series_id(session, "testuser", "01_cs") == "s-id-1"


def test_get_series_id_not_found():
    session = _mock_session({"data": {"series": None}})
    assert get_series_id(session, "testuser", "01_cs") is None


def test_get_series_id_url_slug():
    session = _mock_session({"data": {"series": {"id": "s-id"}}})
    get_series_id(session, "testuser", "01_cs")
    payload = session.post.call_args.kwargs["json"]
    assert payload["variables"]["input"]["url_slug"] == "01-cs"
