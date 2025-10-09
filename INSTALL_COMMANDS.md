# 📦 설치 명령어 가이드

PowerShell 실행 정책 문제로 인해 아래 명령어들을 직접 실행해주세요.

## 1단계: 필수 패키지 설치

```bash
npm install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss
```

## 2단계: shadcn/ui 의존성 설치

```bash
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

## 3단계: 필수 라이브러리 설치

```bash
npm install zustand @tanstack/react-table recharts date-fns zod react-router-dom
```

## 4단계: 타입 정의 설치

```bash
npm install -D @types/node
```

## 5단계: Husky 설치 (선택사항, Git 훅)

```bash
npm install -D husky lint-staged
npx husky init
```

그 다음 `.husky/pre-commit` 파일 생성:

```bash
npm test
npm run lint
```

## 6단계: shadcn/ui 컴포넌트 설치

```bash
npx shadcn@latest add button card input label table tabs dialog tooltip select
```

## 설치 확인

```bash
npm run dev
```

브라우저에서 http://localhost:5173/AllOnBond/ 접속하여 확인

---

## 트러블슈팅

### PowerShell 실행 정책 오류 시:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

또는 관리자 권한 없이:

```cmd
# Git Bash나 CMD에서 실행
npm install ...
```
