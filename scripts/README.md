# scripts/

dev-archive의 MD 파일을 Velog에 자동 동기화하는 스크립트 모음.

## 파일 구조

```
scripts/
├── velog_sync.py       # 메인 동기화 스크립트
├── conftest.py         # pytest 경로 설정
└── tests/
    ├── test_parse.py   # 파일 파싱 테스트
    ├── test_state.py   # 상태 파일 저장/로드 테스트
    ├── test_api.py     # Velog API 호출 테스트
    └── test_sync.py    # 동기화 흐름 통합 테스트
```

## 동작 방식

```
MD 파일 경로
    └── 폴더 구조 → 시리즈 / 태그 자동 매핑
            01_cs/02_network/http.md
            └ 시리즈: 01_cs (Velog에 동일 이름 시리즈가 있을 경우 자동 연결)
            └ 태그:   02_network

velog_state.json에 { "파일경로": "velog_post_id" } 저장
    └── 최초 실행 → writePost (신규 발행)
    └── 재실행    → editPost  (내용 수정)
```

## 직접 실행 (테스트용)

```bash
VELOG_TOKEN=<refresh_token> python scripts/velog_sync.py <파일경로> [파일경로...]
```

## 인증

`VELOG_TOKEN`에는 Velog의 **refresh_token** 값을 사용한다 (유효기간 30일).

발급 방법: Velog 로그인 후 브라우저 DevTools → Application → Cookies → `velog.io` → `refresh_token`

> GitHub Actions에서는 `VELOG_TOKEN` secret으로 관리. `.github/workflows/velog-sync.yml` 참고.

## 테스트 실행

```bash
python -m pytest scripts/tests/ -v
```

## 주의사항

- `velog_state.json`은 파일-포스트ID 매핑 파일로, 삭제하면 모든 파일이 신규 발행으로 처리된다.
- 시리즈 자동 생성은 지원하지 않는다 (Velog v3 API 미지원). Velog에서 직접 시리즈를 만든 후 자동 연결된다.
- `url_slug`는 제목에서 자동 생성된다. 중복 슬러그 충돌 시 Velog가 숫자를 붙여 처리한다.
