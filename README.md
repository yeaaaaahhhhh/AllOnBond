# All on bond

Vite + React + TypeScript 기반의 채권 수익률 계산/비교 서비스. GitHub Pages로 배포됩니다.

## 개발
```bash
npm i
npm run dev
```

## 빌드
```bash
npm run build
npm run preview
```

## 배포
- 기본적으로 GitHub Actions `gh-pages.yml` 워크플로우가 `dist`를 Pages에 배포합니다.
- 리포 이름이 사용자/오거나이제이션 페이지가 아닌 프로젝트 페이지인 경우, `vite.config.ts`의 `base`가 `/리포지토리명/`으로 설정되도록 `GITHUB_PAGES` 환경변수를 사용합니다.

## 문서
- `docs/all-on-bond` 폴더에 아키텍처, ERD, 수학, 데이터 소스, UI/UX, 브랜딩, 작업 목록 문서가 포함되어 있습니다.
