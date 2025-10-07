## 아키텍처 개요

All on bond는 GitHub Pages에 호스팅되는 정적 웹앱입니다. 계산 로직은 전부 브라우저(클라이언트)에서 실행되며, 채권 비교용 데이터는 GitHub Actions가 스케줄로 수집·정제하여 JSON으로 배포합니다.

### 요구사항 반영 요약
- 통화: KRW/USD 지원(계산기 내 토글)
- 채권 종류: 고정 쿠폰, 제로 쿠폰만 지원
- Day Count: ACT/365
- 과세: 세전/세후 수익률 모두 제공(기본 원천징수율 가정 가능)
- 언어: 한국어 우선
- 브랜딩: 서비스명 "All on bond", 하늘색 테마
- 메타: 데이터 표시 영역에 "기준일 YYYY.MM.DD"를 옅은 텍스트로 표기

### 시스템 다이어그램
```mermaid
flowchart LR
  U[사용자 브라우저] --> W[정적 웹앱 (React+TypeScript, GitHub Pages)]
  W --> M[Bond Math 모듈 (클라이언트 계산)]
  W -->|fetch| J[(public/data/bonds.json)]

  subgraph GitHub
    A[GitHub Actions (cron)] --> S[수집/정제 스크립트 (Node)]
    S --> J
  end
```

### 동작 개요
- 계산기: 사용자가 만기일/기준일/연이율/유형/가격 등 입력 → 브라우저 내 Bond Math 모듈이 현금흐름, 경과이자, 더티/클린, YTM, 예금 환산 수익률(세전/세후)을 계산·표시
- 채권 비교: `public/data/bonds.json`을 로딩하여 테이블로 정렬/필터. 각 행 클릭 시 계산기에 값 사전 채움
- 마지막 조회일: `bonds.json` 내 `lastUpdated` 타임스탬프를 기준으로 화면에 "기준일 YYYY.MM.DD" 표시

### 배포/운영
- 호스팅: GitHub Pages (브랜치 `gh-pages`) 0원
- 빌드: Vite 기반 정적 빌드 → Pages 배포
- 데이터 수집: GitHub Actions 스케줄(예: 매 영업일 09:00 KST)로 실행
  - Node(axios+cheerio 또는 Playwright)로 소스 페이지를 수집
  - 파싱·정제·스키마 검증(zod) 후 `public/data/bonds.json` 생성
  - 커밋 → Pages 자동 배포

### 보안/법적/운영 유의
- 스크래핑은 각 사이트의 robots.txt/이용약관을 준수해야 함. 허용되지 않으면 중단하고 수동 CSV 업로드/공식 API 대체
- 세무/투자 자문 아님 고지 필요. 예금환산·세후 계산은 가정치와 단순화 포함 가능
- CORS 이슈 회피: 수집은 서버측(GitHub Actions)에서 수행, 프런트는 정적 JSON만 조회

### 폴더/파일 계획(웹앱 기준)
- `public/data/bonds.json`: 비교 테이블용 최신 채권 요약 데이터
- `src/lib/bond-math/*`: 가격↔YTM, ACT/365, 쿠폰 스케줄, 경과이자, 예금환산(세전/세후)
- `src/features/calculator/*`: 계산기 UI
- `src/features/compare/*`: 비교 테이블 UI
- `src/lib/i18n/*`: 한국어 우선(i18n 확장 가능)

### 관측성
- 정적 사이트이므로 최소화: 페이지뷰(GA4/umami 선택) 및 오류 로깅(Sentry browser SDK 선택) 가능

### 성능/접근성/SEO
- 성능: Vite 코드 분할, 이미지/폰트 최적화, prefetch
- 접근성: 시맨틱 마크업, 키보드 내비, 명도 대비, 스크린리더 라벨
- SEO: 메타/OG, 구조화 데이터(가능 시), 정적 라우팅