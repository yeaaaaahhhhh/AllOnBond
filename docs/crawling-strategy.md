# 🔍 크롤링 전략

## 대상 사이트 분석

### 1. 고인사이더 (goinsider.kr)

**URL 패턴**: `https://goinsider.kr/bond/KR3831037W13`

#### 사이트 구조 분석
```typescript
interface GoInsiderBondPage {
  url: string;           // 채권 상세 페이지 URL
  isin: string;          // URL에서 추출 가능
  bondInfo: {
    name: string;        // 채권명
    issuer: string;      // 발행기관
    maturityDate: string; // 만기일
    couponRate: number;  // 표면금리
    issueAmount: number; // 발행금액
  };
  priceInfo: {
    currentPrice: number; // 현재가
    yield: number;       // 수익률
    tradingVolume: number; // 거래량
    lastUpdated: string; // 마지막 업데이트
  };
}
```

#### 크롤링 전략
```typescript
// 1단계: 채권 목록 페이지에서 ISIN 수집
const bondListUrl = 'https://goinsider.kr/bonds';

// 2단계: 개별 채권 상세 정보 수집
async function crawlGoInsiderBond(isin: string): Promise<BondData> {
  const url = `https://goinsider.kr/bond/${isin}`;
  
  // Puppeteer로 동적 콘텐츠 로딩
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (compatible; AllOnBond-Bot/1.0)');
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // 데이터 추출
    const bondData = await page.evaluate(() => {
      // DOM에서 데이터 추출 로직
      return {
        isin: document.querySelector('.isin')?.textContent,
        name: document.querySelector('.bond-name')?.textContent,
        // ... 기타 필드
      };
    });
    
    return bondData;
  } finally {
    await page.close();
  }
}
```

### 2. 삼성증권 (samsungpop.com)

**URL 패턴**: `https://www.samsungpop.com/?MENU_CODE=M1231752589437`

#### 사이트 구조 분석
```typescript
interface SamsungBondData {
  // 테이블 형태의 채권 목록
  bondList: Array<{
    isin: string;
    name: string;
    issuer: string;
    maturityDate: string;
    couponRate: number;
    currentPrice: number;
    yield: number;
    creditRating: string;
  }>;
  lastUpdated: string;
}
```

#### 크롤링 전략
```typescript
async function crawlSamsungBonds(): Promise<BondData[]> {
  const url = 'https://www.samsungpop.com/?MENU_CODE=M1231752589437';
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (compatible; AllOnBond-Bot/1.0)');
  
  try {
    await page.goto(url);
    
    // 테이블 데이터 대기
    await page.waitForSelector('.bond-table');
    
    // 테이블에서 데이터 추출
    const bonds = await page.evaluate(() => {
      const rows = document.querySelectorAll('.bond-table tbody tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          isin: cells[0]?.textContent?.trim(),
          name: cells[1]?.textContent?.trim(),
          // ... 기타 필드
        };
      });
    });
    
    return bonds;
  } finally {
    await page.close();
  }
}
```

## 크롤링 아키텍처

### GitHub Actions 워크플로우

```yaml
# .github/workflows/crawl-bonds.yml
name: 채권 데이터 수집

on:
  schedule:
    - cron: '0 0 * * 1-5'  # 평일 오전 9시 (KST)
  workflow_dispatch:        # 수동 실행

jobs:
  crawl-and-update:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run bond crawler
      run: npm run crawl:bonds
      env:
        NODE_ENV: production
    
    - name: Validate data
      run: npm run validate:data
    
    - name: Commit and push
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add public/data/bonds.json
        git diff --staged --quiet || git commit -m "🤖 채권 데이터 업데이트 $(date '+%Y-%m-%d %H:%M')"
        git push
    
    - name: Create issue on failure
      if: failure()
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: '🚨 채권 데이터 수집 실패',
            body: `크롤링 작업이 실패했습니다.\n\n실행 시간: ${new Date().toISOString()}\n워크플로우: ${context.runId}`
          })
```

### 크롤러 구현

```typescript
// scripts/crawlers/base.ts
export abstract class BaseCrawler {
  protected browser: Browser;
  protected rateLimiter: RateLimiter;
  
  constructor() {
    this.rateLimiter = new RateLimiter(1000); // 1초 간격
  }
  
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  abstract crawl(): Promise<RawBondData[]>;
  
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  protected async safeRequest(url: string): Promise<Page> {
    await this.rateLimiter.wait();
    
    const page = await this.browser.newPage();
    
    // 기본 설정
    await page.setUserAgent('Mozilla/5.0 (compatible; AllOnBond-Bot/1.0; +https://github.com/username/AllOnBond)');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 타임아웃 설정
    page.setDefaultTimeout(30000);
    
    return page;
  }
}

// scripts/crawlers/goinsider.ts
export class GoInsiderCrawler extends BaseCrawler {
  async crawl(): Promise<RawBondData[]> {
    const bonds: RawBondData[] = [];
    
    try {
      // 1. 채권 목록 페이지에서 ISIN 수집
      const isins = await this.getBondList();
      
      // 2. 각 채권의 상세 정보 수집
      for (const isin of isins) {
        try {
          const bondData = await this.getBondDetail(isin);
          bonds.push(bondData);
          
          // 요청 간격 준수
          await this.delay(1000);
        } catch (error) {
          console.error(`Failed to crawl bond ${isin}:`, error);
        }
      }
    } catch (error) {
      console.error('GoInsider crawling failed:', error);
      throw error;
    }
    
    return bonds;
  }
  
  private async getBondList(): Promise<string[]> {
    const page = await this.safeRequest('https://goinsider.kr/bonds');
    
    try {
      await page.waitForSelector('.bond-list');
      
      const isins = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href*="/bond/"]');
        return Array.from(links).map(link => {
          const href = link.getAttribute('href');
          return href?.split('/').pop() || '';
        }).filter(Boolean);
      });
      
      return isins;
    } finally {
      await page.close();
    }
  }
  
  private async getBondDetail(isin: string): Promise<RawBondData> {
    const page = await this.safeRequest(`https://goinsider.kr/bond/${isin}`);
    
    try {
      // 페이지 로딩 대기
      await page.waitForSelector('.bond-info');
      
      const bondData = await page.evaluate(() => {
        // 실제 DOM 구조에 맞게 수정 필요
        return {
          isin: document.querySelector('[data-field="isin"]')?.textContent?.trim(),
          name: document.querySelector('[data-field="name"]')?.textContent?.trim(),
          issuer: document.querySelector('[data-field="issuer"]')?.textContent?.trim(),
          maturityDate: document.querySelector('[data-field="maturity"]')?.textContent?.trim(),
          couponRate: parseFloat(document.querySelector('[data-field="coupon"]')?.textContent?.replace('%', '') || '0'),
          currentPrice: parseFloat(document.querySelector('[data-field="price"]')?.textContent || '0'),
          yield: parseFloat(document.querySelector('[data-field="yield"]')?.textContent?.replace('%', '') || '0'),
          source: 'goinsider.kr',
          crawledAt: new Date().toISOString()
        };
      });
      
      return bondData;
    } finally {
      await page.close();
    }
  }
}
```

### 데이터 처리 파이프라인

```typescript
// scripts/processors/bondProcessor.ts
export class BondDataProcessor {
  async process(rawData: RawBondData[]): Promise<ProcessedBondData[]> {
    const processed: ProcessedBondData[] = [];
    
    for (const raw of rawData) {
      try {
        // 1. 데이터 검증
        const validated = this.validateBondData(raw);
        
        // 2. 데이터 정제
        const cleaned = this.cleanBondData(validated);
        
        // 3. 추가 계산
        const enhanced = await this.enhanceBondData(cleaned);
        
        processed.push(enhanced);
      } catch (error) {
        console.error(`Failed to process bond ${raw.isin}:`, error);
      }
    }
    
    return processed;
  }
  
  private validateBondData(data: RawBondData): RawBondData {
    const schema = z.object({
      isin: z.string().regex(/^[A-Z]{2}[A-Z0-9]{10}$/),
      name: z.string().min(1),
      maturityDate: z.string(),
      couponRate: z.number().min(0).max(50),
      currentPrice: z.number().positive(),
      yield: z.number()
    });
    
    return schema.parse(data);
  }
  
  private cleanBondData(data: RawBondData): CleanBondData {
    return {
      ...data,
      name: data.name.trim().replace(/\s+/g, ' '),
      maturityDate: new Date(data.maturityDate).toISOString().split('T')[0],
      couponRate: Math.round(data.couponRate * 100) / 100,
      currentPrice: Math.round(data.currentPrice * 100) / 100,
      yield: Math.round(data.yield * 100) / 100
    };
  }
  
  private async enhanceBondData(data: CleanBondData): Promise<ProcessedBondData> {
    // 예금환산 수익률 계산
    const bankEquivalentYield = this.calculateBankEquivalentYield(
      data.yield,
      data.couponFrequency || 2
    );
    
    // 세후 수익률 계산
    const afterTaxYield = this.calculateAfterTaxYield(data.yield, 'KR');
    
    // 듀레이션 계산 (간소화)
    const duration = this.estimateDuration(data);
    
    return {
      ...data,
      bankEquivalentYield,
      afterTaxYield,
      duration,
      processedAt: new Date().toISOString()
    };
  }
}
```

## 에러 처리 및 복구

### 재시도 로직

```typescript
class RetryableError extends Error {
  constructor(message: string, public retryable: boolean = true) {
    super(message);
  }
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof RetryableError && !error.retryable) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // 지수 백오프
      const delay = backoffMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
```

### 부분 실패 처리

```typescript
export class CrawlingOrchestrator {
  async runCrawling(): Promise<CrawlingResult> {
    const results: CrawlingResult = {
      success: [],
      failed: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        startTime: new Date(),
        endTime: new Date()
      }
    };
    
    const crawlers = [
      new GoInsiderCrawler(),
      new SamsungCrawler()
    ];
    
    for (const crawler of crawlers) {
      try {
        await crawler.initialize();
        const data = await crawler.crawl();
        results.success.push(...data);
      } catch (error) {
        results.failed.push({
          crawler: crawler.constructor.name,
          error: error.message,
          timestamp: new Date()
        });
      } finally {
        await crawler.cleanup();
      }
    }
    
    // 부분 성공이라도 데이터 업데이트
    if (results.success.length > 0) {
      await this.updateBondData(results.success);
    }
    
    return results;
  }
}
```

## 법적 준수사항

### robots.txt 확인

```typescript
async function checkRobotsTxt(baseUrl: string): Promise<boolean> {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).href;
    const response = await fetch(robotsUrl);
    const robotsTxt = await response.text();
    
    // User-agent: * 또는 특정 봇에 대한 제한 확인
    const lines = robotsTxt.split('\n');
    let currentUserAgent = '';
    
    for (const line of lines) {
      if (line.startsWith('User-agent:')) {
        currentUserAgent = line.split(':')[1].trim();
      } else if (line.startsWith('Disallow:') && 
                 (currentUserAgent === '*' || currentUserAgent.includes('AllOnBond'))) {
        const disallowPath = line.split(':')[1].trim();
        if (disallowPath === '/' || disallowPath === '/bond/') {
          return false; // 크롤링 금지
        }
      }
    }
    
    return true; // 크롤링 허용
  } catch {
    return true; // robots.txt가 없으면 허용으로 간주
  }
}
```

### 이용약관 준수

```typescript
const CRAWLING_GUIDELINES = {
  // 요청 간격 (최소 1초)
  MIN_REQUEST_INTERVAL: 1000,
  
  // 동시 요청 수 제한
  MAX_CONCURRENT_REQUESTS: 1,
  
  // 사용자 에이전트 명시
  USER_AGENT: 'Mozilla/5.0 (compatible; AllOnBond-Bot/1.0; +https://github.com/username/AllOnBond)',
  
  // 크롤링 시간대 제한 (업무시간 외)
  ALLOWED_HOURS: [0, 1, 2, 3, 4, 5, 6, 22, 23],
  
  // 최대 페이지 수 제한
  MAX_PAGES_PER_SESSION: 1000
};
```

## 모니터링 및 알림

### 성공률 추적

```typescript
interface CrawlingMetrics {
  date: string;
  totalAttempts: number;
  successfulCrawls: number;
  failedCrawls: number;
  averageResponseTime: number;
  errorsByType: Record<string, number>;
}

class MetricsCollector {
  async recordCrawlingResult(result: CrawlingResult): Promise<void> {
    const metrics: CrawlingMetrics = {
      date: new Date().toISOString().split('T')[0],
      totalAttempts: result.success.length + result.failed.length,
      successfulCrawls: result.success.length,
      failedCrawls: result.failed.length,
      averageResponseTime: this.calculateAverageResponseTime(result),
      errorsByType: this.groupErrorsByType(result.failed)
    };
    
    // GitHub Issues로 주간 리포트 생성
    if (new Date().getDay() === 1) { // 월요일
      await this.createWeeklyReport(metrics);
    }
  }
}
```

### 데이터 품질 모니터링

```typescript
class DataQualityMonitor {
  async validateDataQuality(bonds: ProcessedBondData[]): Promise<QualityReport> {
    const report: QualityReport = {
      totalBonds: bonds.length,
      issues: [],
      score: 100
    };
    
    // 1. 중복 ISIN 확인
    const duplicates = this.findDuplicates(bonds, 'isin');
    if (duplicates.length > 0) {
      report.issues.push({
        type: 'duplicate_isin',
        count: duplicates.length,
        severity: 'high'
      });
    }
    
    // 2. 이상값 감지
    const outliers = this.detectOutliers(bonds, 'yield');
    if (outliers.length > 0) {
      report.issues.push({
        type: 'yield_outliers',
        count: outliers.length,
        severity: 'medium'
      });
    }
    
    // 3. 누락 데이터 확인
    const missingData = bonds.filter(b => !b.currentPrice || !b.yield);
    if (missingData.length > 0) {
      report.issues.push({
        type: 'missing_data',
        count: missingData.length,
        severity: 'high'
      });
    }
    
    return report;
  }
}
```

---

*이 크롤링 전략은 법적 준수와 기술적 안정성을 모두 고려하여 설계되었습니다.*
