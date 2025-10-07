## ERD (개념 모델)

GitHub Pages 환경에서는 DB 대신 JSON으로 직렬화하여 배포합니다. 비교 페이지는 요약 스키마를, 상세 계산은 개별 채권 로딩 시 필요한 핵심 필드만 사용합니다.

```mermaid
erDiagram
  ISSUER ||--o{ BOND : has
  BOND ||--o{ COUPON : schedules
  BOND ||--o{ PRICE_SNAPSHOT : quotes_optional

  ISSUER {
    string id PK
    string name
    string rating
    string sector
  }

  BOND {
    string isin PK
    string name
    string issuerId FK
    date   issueDate
    date   maturityDate
    string currency         // KRW, USD
    decimal faceValue
    decimal couponRate      // 연 이율(명목)
    enum  couponFrequency   // 1,2,4,12
    enum  dayCount          // ACT/365 고정
    enum  bondType          // fixed, zero
  }

  COUPON {
    string id PK
    string bondIsin FK
    date   paymentDate
    decimal amount
  }

  PRICE_SNAPSHOT {
    string id PK
    string bondIsin FK
    date   asOfDate
    decimal cleanPrice      // 기준 100 면가 대비
    decimal dirtyPrice
    decimal yieldReported
  }
```

### 공개 JSON 스키마(요약)
`public/data/bonds.json`
```json
{
  "lastUpdated": "2025-10-07T00:00:00Z",
  "bonds": [
    {
      "isin": "KR3831037W13",
      "name": "국고채 3Y 2027-12-10",
      "issuer": "KTB",
      "maturityDate": "2027-12-10",
      "currency": "KRW",
      "faceValue": 100,
      "bondType": "fixed",
      "couponRate": 0.0375,
      "couponFrequency": 2,
      "dayCount": "ACT_365",
      "cleanPrice": 98.76,
      "yieldComputed": 0.0412,
      "source": "goinsider",
      "asOfDate": "2025-10-07"
    }
  ]
}
```

필드 설명:
- `yieldComputed`: 크롤링된 가격을 기준으로 사이트 내 계산기로 산출한 YTM(검증용)
- 가격 단위: 면가=100 기준(시장慣行)
- 통화: "KRW" 또는 "USD"
- `lastUpdated`: 화면에 "기준일 YYYY.MM.DD"로 표기해 사용