# 병원 AI 연구소 (Hospital AI Lab)

의료 현장의 문제를 AI로 풉니다. — [Astro](https://astro.build)로 만든 정적 사이트입니다.

## 로컬에서 미리 보기

```bash
npm install        # 처음 한 번만
npm run dev        # 개발 서버 실행 → http://localhost:4321
```

배포될 결과물을 그대로 확인하려면:

```bash
npm run build      # dist/ 폴더에 정적 파일 생성
npm run preview    # 빌드 결과 미리보기 → http://localhost:4321
```

## 새 글 쓰기

1. `src/content/blog/_writing-template.md`를 복사해 새 파일로 저장합니다. 파일 이름이 글 주소(URL)가 됩니다. 예: `ai-tools-for-planners.md`
2. frontmatter를 채웁니다.

   ```yaml
   ---
   title: "글 제목"
   description: "한두 문장 요약"
   pubDate: 2026-07-15
   category: "칼럼"   # 논문리뷰 | AI도구 | 칼럼 | 소식
   draft: false        # true면 사이트에 표시되지 않음
   ---
   ```

3. 본문을 마크다운으로 작성하고 push하면 자동 배포됩니다.

## GitHub Pages 배포

1. GitHub에 저장소를 만들고 이 폴더를 push합니다. (기본 브랜치: `main`)
2. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
3. 이후 `main`에 push할 때마다 `.github/workflows/deploy.yml`이 자동으로 빌드·배포합니다.
4. 사이트 주소: `https://아이디.github.io/저장소명/`

경로(base) 설정은 자동입니다 — 워크플로가 저장소 이름을 읽어 `site`와 `base`를 계산하므로, 저장소 이름이 무엇이든 CSS·링크가 깨지지 않습니다.

## 나중에 커스텀 도메인을 연결할 때

1. `astro.config.mjs` 맨 위의 `CUSTOM_DOMAIN`에 도메인을 적습니다.

   ```js
   const CUSTOM_DOMAIN = 'https://예시도메인.com';
   ```

2. 저장소 **Settings → Pages → Custom domain**에 같은 도메인을 입력합니다.
3. push하면 base가 자동으로 `/`로 바뀌어 새 주소에서도 경로가 깨지지 않습니다.

## 폴더 구조

```
src/
├── content/blog/     # 블로그 글(마크다운). _writing-template.md 참고
├── layouts/          # 공통 레이아웃(헤더·푸터)
├── components/       # 재사용 컴포넌트
├── pages/            # 홈·소개·연구·블로그·문의 페이지
├── styles/           # 전역 스타일(색·폰트)
└── utils/site.ts     # 사이트 이름·이메일·면책 문구 등 공통 값
```

사이트 이름, 이메일, 푸터 면책 문구를 바꾸려면 `src/utils/site.ts` 한 곳만 수정하면 됩니다.
