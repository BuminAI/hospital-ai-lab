// 연구소(Organization) 엔티티의 언어판 공통 속성
//
// 한국어판은 SchemaOrg.astro, 나머지 네 언어판은 각자의 레이아웃에서 Organization 노드를
// 만든다. `@id`가 같아서 검색엔진은 이 노드들을 한 개체로 합쳐 읽는데, 예전에는 한국어판
// 노드에만 logo·sameAs가 있고 나머지에는 없어서 언어판마다 설명이 달랐다. 공통 속성을 이 한
// 곳에서 만들어 다섯 곳이 같은 값을 쓰게 한다.
//
// ⚠️ 여기에는 사이트에서 이미 확인되는 사실만 넣는다.
//   - 이름: 각 언어판 레이아웃이 실제로 쓰는 이름
//   - sameAs: briefing.md에 있는 공식 채널(유튜브)뿐. SNS·GitHub는 briefing.md에 "추후 추가"라
//     적혀 있어 넣지 않는다. 새 공식 프로필이 생기면 YOUTUBE_CHANNEL_URL 옆에 여기서 추가한다.
import { YOUTUBE_CHANNEL_URL } from './site';

// 연구소를 가리키는 이름들 — 한국어·일본어·러시아어·영어(인도네시아어·대만어판은 영어 이름을 쓴다).
const ORG_NAMES = ['병원 AI 연구소', '病院AI研究所', 'Лаборатория ИИ для больниц', 'Hospital AI Lab'];

// 이 사이트가 실제로 글을 내는 언어(ISO 639 / BCP 47).
const SITE_LANGUAGES = ['ko', 'ja', 'ru', 'id', 'zh-TW'];

interface OrgSharedOptions {
  /** 사이트 루트 URL(끝 슬래시 없음) */
  siteRoot: string;
  /** 이 언어판 Organization 노드의 name — alternateName에서는 뺀다 */
  name: string;
  /** withBase('/logo-512.png') 결과 */
  logoPath: string;
  /** 작성·검증 원칙 페이지(해당 언어판 /about/#principles). 페이지가 있을 때만 넘긴다 */
  principlesUrl?: string;
}

export function organizationShared({ siteRoot, name, logoPath, principlesUrl }: OrgSharedOptions) {
  return {
    alternateName: ORG_NAMES.filter((n) => n !== name),
    // 구글의 조직 로고 기준: 정사각에 가깝고 112px 이상. 그전에는 1200x630 소셜 공유 이미지를
    // 로고로 내보냈다(검색결과의 사이트 아이콘·지식 패널에서 잘리거나 쓰이지 않는다).
    logo: { '@type': 'ImageObject', url: `${siteRoot}${logoPath}`, width: 512, height: 512 },
    sameAs: [YOUTUBE_CHANNEL_URL],
    knowsLanguage: SITE_LANGUAGES,
    ...(principlesUrl ? { publishingPrinciples: principlesUrl } : {}),
  };
}
