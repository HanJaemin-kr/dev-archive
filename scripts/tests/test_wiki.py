from add_frontmatter import scalar, kv_line, split_frontmatter
from build_index import should_index, summarize, cell, wikilink
from check_links import normalize_target, resolve


# ---- add_frontmatter ----

def test_scalar_plain_and_quoted():
    assert scalar("MQTT") == "MQTT"
    assert scalar("인증: 세션 vs 토큰").startswith('"')  # colon -> quoted
    assert scalar("") == '""'


def test_kv_line_types():
    assert kv_line("related", []) == "related: []"
    assert kv_line("tags", ["cs", "network"]) == "tags: [cs, network]"
    assert kv_line("velog", True) == "velog: true"


def test_split_frontmatter_roundtrip():
    content = "---\ntitle: X\n---\n\n# X\nbody"
    fm, body = split_frontmatter(content)
    assert fm[0].strip() == "---" and fm[-1].strip() == "---"
    assert body == "\n# X\nbody"  # leading blank line preserved (unlike strip_frontmatter)
    assert split_frontmatter("# no fm")[0] is None


# ---- build_index ----

def test_should_index_depth():
    assert should_index("01_cs")
    assert should_index("01_cs/01_os")
    assert not should_index("01_cs/01_os/deep")
    assert not should_index("scripts")


def test_summarize_skips_headings_and_code():
    body = "# Heading\n\n```\ncode\n```\n\n실제 첫 문장이다."
    assert summarize(body) == "실제 첫 문장이다."


def test_cell_escapes_pipe():
    assert cell("a | b") == "a \\| b"


def test_wikilink_format():
    assert wikilink("06_infra/04_iiot/mqtt", "MQTT") == "[[06_infra/04_iiot/mqtt|MQTT]]"


# ---- check_links ----

def test_normalize_target():
    assert normalize_target("path/note|alias") == "path/note"
    assert normalize_target("note#heading") == "note"
    assert normalize_target("[[note.md]]") == "note"


def test_resolve_variants():
    paths = {"06_infra/04_iiot/mqtt", "09_pdm/03_anomaly/_index"}
    basenames = {"mqtt", "_index"}
    index_dirs = {"09_pdm/03_anomaly"}
    index_basenames = {"03_anomaly"}
    src = __file__

    def r(t):
        return resolve(t, src, paths, basenames, index_dirs, index_basenames)

    assert r("06_infra/04_iiot/mqtt")   # vault path
    assert r("mqtt")                    # basename
    assert r("03_anomaly")              # folder with _index
    assert r("1,0")                     # numeric literal ignored
    assert not r("does-not-exist")
