# 인수인계 가이드 (HANDOFF)

다른 컴퓨터 · 다른 Claude 계정의 Claude Code에서 이 프로젝트를 이어서 작업할 때 읽는 문서입니다.
(사이트 운영 규칙은 [CLAUDE.md](CLAUDE.md), 사실의 원천은 [briefing.md](briefing.md), 회원 기능 개통은 [supabase/SETUP-GUIDE.md](supabase/SETUP-GUIDE.md) 참조)

## 1. 이 프로젝트가 무엇인가

- 사이트: **병원 AI 연구소** — https://hospital-ai-lab.com
- 목적: 병원 행정·간호 등 병원 종사자를 위한 의료 AI 콘텐츠
- 스택: **Astro 5**(정적 사이트) + **GitHub Pages**(호스팅) + **GitHub Actions**(자동 배포·수집) + **Supabase**(회원/인증/DB) + **GoatCounter**(방문자 통계)
- 저장소: https://github.com/BuminAI/hospital-ai-lab (public)

## 2. 다른 환경에서 이어가는 법

```bash
git clone https://github.com/BuminAI/hospital-ai-lab.git
cd hospital-ai-lab
npm install
npm run dev      # 개발 서버(http://localhost:4321)
npm run build    # 배포본 생성(dist/)
```

- Node 18.17+ 필요. Windows에서 node가 PATH에 없으면 `.claude/run-npm.cmd`(이 PC 전용, gitignore됨)처럼 절대경로로 실행.
- `main`에 push하면 `.github/workflows/deploy.yml`이 자동 빌드·배포한다.
- 새 글/영상은 관리자 페이지(`/admin`) 또는 저장소 직접 수정 후 push.

## 3. 외부 서비스 · 크리덴셜 위치

| 서비스 | 용도 | 크리덴셜 / 설정 위치 |
| --- | --- | --- |
| GitHub | 저장소·호스팅·자동화 | 계정: BuminAI. 관리자 페이지는 Fine-grained 토큰(브라우저 localStorage, 저장소에 없음) |
| 도메인(가비아) | hospital-ai-lab.com | A레코드 4개(185.199.108~111.153) + www CNAME. `astro.config.mjs`의 `CUSTOM_DOMAIN` |
| Supabase | 회원·인증·DB | `src/utils/site.ts`의 `SUPABASE_URL`·`SUPABASE_ANON_KEY`(anon 키는 공개용, RLS로 보호). service_role 키는 절대 코드에 넣지 말 것 |
| GoatCounter | 방문자 통계 | `src/utils/site.ts`의 `GOATCOUNTER_CODE = 'hospital-ai-lab'` |
| 네이버/구글 | 검색 등록 | `src/utils/site.ts`의 `NAVER_SITE_VERIFICATION`·`GOOGLE_SITE_VERIFICATION` |

> Supabase DB 스키마는 `supabase/setup.sql`(전체) / `supabase/migrate-oauth.sql`(추가분)에 있다.
> 새 Supabase 프로젝트로 옮기려면 이 SQL을 실행하고 URL·anon 키만 교체하면 된다.

## 4. 자동화 (GitHub Actions)

| 워크플로 | 시각(KST) | 하는 일 |
| --- | --- | --- |
| `deploy.yml` | main push 시 | Astro 빌드 → GitHub Pages 배포 |
| `update-news.yml` | 매일 07:00 | 구글 뉴스에서 병원·의료 AI 기사 수집 → `src/data/news.json` |
| `update-videos.yml` | 매주 수요일 09:00 | 유튜브에서 입문·클로드·병원·의료 영상 수집 → `src/data/recommended-videos.json` |

- 모두 **GitHub 클라우드**에서 실행 — 오너 컴퓨터가 꺼져 있어도 동작한다.
- 수집 스크립트: `scripts/fetch-news.mjs`, `scripts/fetch-videos.mjs`
- 추천 영상은 `source:"manual"`(관리자 수동 추가)을 보존하고 `source:"auto"`만 갱신한다.

## 5. 주요 파일 지도

```
src/
├── pages/            # 홈·소개·블로그·AI뉴스·강의노트·추천영상·문의·로그인·회원가입·관리자·개인정보
│   ├── index.astro   # 홈
│   ├── admin.astro   # 관리자 대시보드(글/이미지/영상/회원/강의노트/통계)
│   ├── login.astro / signup.astro / notes.astro   # 회원 기능(Supabase)
│   ├── rss.xml.js    # RSS(+ public/rss-styles.xsl 로 브라우저 표시)
│   └── robots.txt.ts
├── content/blog/     # 블로그 글(마크다운) — _writing-template.md 참고
├── data/             # research.ts, news.json, recommended-videos.json
├── layouts/BaseLayout.astro   # 헤더·푸터·메뉴·검색코드·GoatCounter
├── components/       # PostCard, ResearchIcon
└── utils/site.ts     # 사이트 상수·크리덴셜(한 곳에서 관리)
.claude/agents/       # planner·writer·reviewer·builder·maintainer
.claude/skills/       # new-post·maintenance·update-page
supabase/             # setup.sql·migrate-oauth.sql·SETUP-GUIDE.md
scripts/              # fetch-news.mjs·fetch-videos.mjs
```

## 6. 현재 미완료 · 오너 수동 작업 (2026-07-05 기준)

- [ ] **카카오 로그인**: Supabase에서 미연결(`kakao:false`). 카카오 디벨로퍼스 앱 + 개인 개발자 비즈 앱 전환(이메일용) 후 Supabase Providers에 키 입력. → 켜면 로그인 버튼이 자동 활성화됨. (구글 로그인은 연결 완료)
- [ ] **검색엔진 소유확인·사이트맵 제출**: 네이버 서치어드바이저·구글 서치 콘솔에서 소유확인 후 `sitemap-index.xml` 제출.
- [ ] **강의노트 콘텐츠**: 아직 0개. 관리자 계정(choyj80@naver.com) 로그인 후 `/admin`에서 작성.
- [ ] **연구소장이 직접 만든 유튜브 영상**: "준비 중" 상태. 영상 제작 후 반영.
- [ ] (선택) 개인정보 처리방침 보호책임자 실명, briefing.md 공개 여부 검토.

## 7. 반드시 지키는 원칙

- **사실 검증 절대 원칙**: 모든 사실 주장에 객관적 출처. 할루시네이션 금지. (CLAUDE.md 참조)
- 저자 관련 사실은 briefing.md에 있는 것만.
- 새 글은 draft로 시작 → 브랜치 + PR → 오너 머지. 커밋 메시지는 한국어.
