# 🚀 All On Bond 설정 가이드

## 1단계: 필수 패키지 설치

PowerShell에서 실행 정책 오류가 발생하는 경우, **CMD** 또는 **Git Bash**를 사용하세요.

### 기본 도구 설치

```bash
npm install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss
```

### shadcn/ui 의존성

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
```

### 필수 라이브러리

```bash
npm install zustand @tanstack/react-table recharts date-fns zod
```

### Husky (Git 훅, 선택사항)

```bash
npm install -D husky lint-staged
npx husky init
```

## 2단계: shadcn/ui 컴포넌트 설치 (선택사항)

프로젝트가 이미 기본 UI 컴포넌트를 포함하고 있지만, shadcn/ui의 추가 컴포넌트를 사용하려면:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add table
npx shadcn@latest add tabs
```

## 3단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173/AllOnBond/ 접속

## 4단계: 빌드 테스트

```bash
npm run build
npm run preview
```

## 5단계: GitHub Pages 배포

### GitHub 저장소 설정

1. GitHub에서 Settings → Pages로 이동
2. Source: **GitHub Actions** 선택
3. 코드를 main 브랜치에 푸시

```bash
git add .
git commit -m "feat: initial project setup"
git push origin main
```

### 배포 확인

GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다.
배포 후 `https://yeaaaaahhhhh.github.io/AllOnBond/`에서 확인하세요.

## 트러블슈팅

### PowerShell 실행 정책 오류

**방법 1: CMD 사용**

```cmd
# Windows CMD에서 실행
npm install ...
```

**방법 2: Git Bash 사용**

```bash
# Git Bash에서 실행
npm install ...
```

**방법 3: PowerShell 정책 변경 (권장하지 않음)**

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 타입 에러

타입 에러가 발생하면:

```bash
npm install -D @types/node
```

### Tailwind CSS가 작동하지 않음

1. `tailwind.config.js` 파일 확인
2. `src/index.css`에 `@tailwind` 지시어 확인
3. 개발 서버 재시작

### lucide-react 아이콘 에러

```bash
npm install lucide-react
```

## 다음 단계

1. ✅ 프로젝트 스캐폴딩 완료
2. 📦 패키지 설치 (수동)
3. 🧮 채권 계산 엔진 구현 시작 (`src/lib/bondMath.ts`)
4. 📊 계산기 UI 구현
5. 📈 비교 테이블 구현
6. 🕷️ 크롤링 시스템 구축

자세한 개발 계획은 `docs/task-plan.md`를 참조하세요.

## 주요 파일 구조

```
AllOnBond/
├── src/
│   ├── components/
│   │   ├── Layout/          # Header, Footer, TabNavigation ✅
│   │   ├── UI/              # CurrencyToggle, TaxToggle ✅
│   │   └── Calculator/      # 계산기 컴포넌트 (구현 예정)
│   ├── pages/
│   │   ├── Calculator.tsx   # 계산기 페이지 ✅
│   │   ├── Comparison.tsx   # 비교 페이지 ✅
│   │   └── Info.tsx         # 설명 페이지 ✅
│   ├── lib/                 # 계산 로직 (구현 예정)
│   └── types/               # 타입 정의 ✅
├── docs/                    # 프로젝트 문서 ✅
└── .github/workflows/       # GitHub Actions ✅
```

---

**문제가 있으면 이슈를 생성하거나 문서를 참조하세요!** 🎉
