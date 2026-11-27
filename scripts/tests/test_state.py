import pytest
from velog_sync import load_state, save_state


def test_load_state_no_file(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    assert load_state() == {}


def test_save_and_load_roundtrip(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    state = {"01_cs/overview.md": "post-uuid-abc"}
    save_state(state)
    assert load_state() == state


def test_save_preserves_korean(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    state = {"04_database/sql.md": "uuid-123"}
    save_state(state)
    loaded = load_state()
    assert loaded == state
