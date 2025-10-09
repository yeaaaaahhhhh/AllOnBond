# All On Bond

**채권 투자, 이제 쉽게 계산하세요**

All On Bond는 채권 수익률 계산 및 비교를 위한 웹 기반 도구입니다.

## 🎯 주요 기능

### 1. 채권 계산기

- 만기수익률(YTM) 계산
- 예금환산 수익률 계산
- 현금흐름 시뮬레이션
- 세전/세후 수익률 비교
- 원화/달러 이중 지원

### 2. 채권 비교

- 실시간 채권 정보 비교
- 정렬 및 필터링 기능
- 수익률 기준 랭킹

### 3. 계산 설명

- 수식 상세 설명
- 단계별 계산 과정
- 세금 계산 방법

## 🚀 빠른 시작

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

### 필수 패키지 설치

PowerShell 실행 정책 문제가 있는 경우, `INSTALL_COMMANDS.md` 파일을 참조하세요.

```bash
# Tailwind CSS 및 기본 도구
npm install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss

# shadcn/ui 의존성
npm install class-variance-authority clsx tailwind-merge lucide-react

# 필수 라이브러리
npm install zustand @tanstack/react-table recharts date-fns zod

# 타입 정의
npm install -D @types/node
```

## 📁 프로젝트 구조

```
AllOnBond/
├── .github/
│   └── workflows/          # GitHub Actions 워크플로우
├── docs/                   # 프로젝트 문서
├── src/
│   ├── components/
│   │   ├── Layout/        # 레이아웃 컴포넌트
│   │   ├── UI/            # UI 컴포넌트
│   │   └── Calculator/    # 계산기 컴포넌트 (예정)
│   ├── lib/               # 유틸리티 함수
│   ├── pages/             # 페이지 컴포넌트
│   ├── types/             # TypeScript 타입 정의
│   └── App.tsx            # 메인 앱
├── public/                # 정적 파일
└── package.json
```

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Table**: TanStack Table
- **Charts**: Recharts
- **Date**: date-fns
- **Validation**: Zod
- **Hosting**: GitHub Pages

## 📖 문서

자세한 문서는 `docs/` 폴더를 참조하세요:

- [아키텍처 설계](./docs/architecture.md)
- [데이터 모델](./docs/data-model.md)
- [작업 계획](./docs/task-plan.md)
- [기술 스펙](./docs/technical-spec.md)
- [브랜딩 가이드](./docs/branding.md)
- [크롤링 전략](./docs/crawling-strategy.md)

## 🚧 개발 상태

현재 Phase 0: 프로젝트 기반 구축 단계입니다.

- [x] Vite + React + TypeScript 스캐폴딩
- [x] Tailwind CSS 설정
- [x] 브랜딩 컬러 팔레트 적용
- [x] 기본 레이아웃 컴포넌트
- [x] 샘플 페이지 구조
- [x] GitHub Pages 배포 설정
- [ ] shadcn/ui 컴포넌트 설치 (수동)
- [ ] 필수 의존성 설치 (수동)
- [ ] 채권 계산 엔진 구현
- [ ] 계산기 UI 구현
- [ ] 비교 테이블 구현

## 📝 라이선스

이 프로젝트는 교육 및 참고 목적으로 제공되며, 실제 투자 권유가 아닙니다.

## ⚠️ 면책 조항

본 서비스의 계산 결과는 참고용이며, 실제 투자 결정 시에는 전문가의 조언을 받으시기 바랍니다.

---

© 2025 All On Bond. All rights reserved.
