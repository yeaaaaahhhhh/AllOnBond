# 채권ETF 은행환산금리 (정적 페이지)

완전 정적(Zero backend)으로 운영되는 채권형 ETF의 TTM 분배율 기반 은행환산금리 공시 페이지입니다.

## 빠른 시작

1) 로컬 미리보기(아무 정적 서버)

```bash
python3 -m http.server 8080
# 또는
npx serve .
```

브라우저에서 `http://localhost:8080` 접속. (docs/ 구조 사용 시 `python3 -m http.server -d docs 8080`)

2) 데이터 구조

`data/etfs.json`

```json
[
  {
    "provider": "KODEX",
    "name": "종합채권(AA-이상) 액티브 월분배",
    "ticker": "273130",
    "ttmYieldPct": 4.20,
    "frequency": "monthly",
    "sourceUrl": "https://example.com/kodex-273130"
  }
]
```

필드 설명:
- `ttmYieldPct`: 최근 12개월 분배율(세전, %)
- `frequency`: `monthly` | `quarterly` | `semiannual` | `annual`
- `sourceUrl`: 원자료 링크(공시/운용사 페이지 등)

3) 계산 로직 요약
- 세후 분배수익률: `afterTax = TTM * (1 - ETF세율)`
- 은행환산(단리) 세전: `bankSimple = afterTax / (1 - 은행세율)`
- 은행환산(복리) 세전: `effective = (1 + afterTax/m)^m - 1`, `bankComp = effective / (1 - 은행세율)`

기본 세율: 은행 15.4%, ETF 15.4%. 분배 빈도 m은 `frequency`에 따라 12/4/2/1.

## 수동 데이터 갱신 방법

1) `data/etfs.json`을 편집하여 신규/변경된 ETF 항목 반영
2) 변경 사항 커밋/푸시

```bash
git add data/etfs.json
git commit -m "update: etf ttm 데이터 갱신"
git push
```

브라우저 캐시를 피하기 위해 앱은 `cache: 'no-store'`로 JSON을 요청합니다.

## GitHub Pages 배포

옵션 A: `main` 브랜치 `/` 루트에서 Pages 서비스
- 리포지토리 Settings → Pages → Source: `Deploy from a branch`
- Branch: `main` / `/ (root)` 선택

옵션 B: `docs/` 폴더 사용
- 현재 구조를 `docs/`로 옮기고 Pages Source를 `docs/`로 지정
- 이 저장소는 `docs/` 폴더로 배포됩니다.

커스텀 도메인 사용 시 DNS CNAME 설정 후 Pages에 입력.

## 향후 고도화(예정)
- 운용사 사이트/공시 스크래핑 → `data/etfs.json` 자동 생성
- Google Sheets 공개 CSV 연동 옵션
- JSON 스키마 검증(워크플로)

## 면책
본 저장소와 페이지는 참고용 정보 제공을 목적으로 하며, 오류가 포함될 수 있습니다. 세율/과세/분배 정책은 개인/상품별로 상이할 수 있으며, 투자 결정 및 책임은 사용자에게 있습니다.
