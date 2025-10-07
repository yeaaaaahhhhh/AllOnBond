## 데이터 소스 및 수집 전략

요구 링크(참고):
- goinsider: `https://goinsider.kr/bond/KR3831037W13`
- 삼성증권 POP: `https://www.samsungpop.com/?MENU_CODE=M1231752589437`

크롤링 가능 여부는 각 사이트의 이용약관/robots.txt에 따릅니다. 불가 시 대안(수동 CSV 업로드/공식 데이터)으로 전환합니다.

### 수집 파이프라인(GitHub Actions)
- 스케줄: 평일 09:00 KST
- 실행: Node 20, axios+cheerio 또는 Playwright(동적 로딩 시)
- 절차:
  1) 소스 요청 → HTML/JSON 획득
  2) 선택자/패턴으로 파싱(종목명, ISIN/표준코드, 만기, 쿠폰, 통화, 가격 등)
  3) 정규화 및 스키마 검증(zod)
  4) `public/data/bonds.json` 생성: `lastUpdated`, `bonds[]`
  5) 커밋 → Pages 자동 배포

### 필드 매핑 가이드
- `isin`/식별자: 페이지에 노출된 표준코드(ISIN 우선)
- `name`: 종목명(만기 포함 표기 시 정규식으로 정제)
- `maturityDate`: ISO yyyy-mm-dd
- `currency`: KRW 또는 USD
- `faceValue`: 100 고정(시장慣行), 필요 시 원화/달러 표기 분리
- `couponRate`: 고정 쿠폰은 명목 연이율, 제로는 0
- `couponFrequency`: 반기(2) 기본, 페이지 정보가 있으면 반영
- `dayCount`: "ACT_365" 고정
- 가격: cleanPrice(면가 100 기준) 산출. 원문이 금액가(예: 98.76)인지, 수익률인지 구분

### 데이터 품질·동기화
- `asOfDate`: 원문 제공일자 또는 수집 시각(현지화: KST)
- `lastUpdated`: 파일 단위 최신시각
- 값 검증: 
  - 수익률(yield) ↔ 가격(price) 일관성 검사(내부 계산기로 역산)
  - 음수/비정상 값 필터링

### 법적·윤리 고려
- 스크래핑 허가되지 않으면 즉시 중단하고 대안 경로 사용
- 저장 데이터는 가공된 요약값에 한정(원문 무단 복제 지양)

### 대안 데이터 경로(권장)
- 수동 업로드: `data/manual/yyyymmdd.csv` 업로드 시 빌드가 `bonds.json` 재생성
- 오픈 데이터: DART/한은 통계, 해외는 FINRA/treasury(각각 약관 확인)
