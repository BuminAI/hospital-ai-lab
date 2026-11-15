// AI 일반 동향 수집기 (2026-09-10 신설 — 오너 지시)
//
// 왜 만들었나:
//   러시아어판·인도네시아어판은 유입이 적었고 원인은 **새 글이 드물어서**였다.
//   두 판 모두 수집원이 의료 매체뿐이라 하루 1~2건밖에 안 들어왔다
//   (실측 2026-09-10: ru 1.6건/일, id 1.1건/일. 한국어판은 5.0건/일).
//   그래서 "꼭 병원이 아니어도 AI 관련 자료면 싣자"는 오너 지시로
//   **일반 기술 매체의 AI 기사**를 따로 모으는 수집기를 만들었다.
//
//   기존 뉴스(src/data/<lang>/news.json)는 **의료 AI 전용**으로 그대로 둔다.
//   이 수집기가 만드는 것은 별도 파일(ai-digest.json)이고 화면도 따로다.
//   섞으면 의료 AI 뉴스 페이지의 주제가 흐려져 검색·답변 엔진 양쪽에 손해다.
//
// 수집원 (전부 RSS — 2026-09-10 실측)
//   러시아어  Habr(AI 허브·ML 허브)·CNews·TAdviser·3DNews  → 채택 17.4건/일
//   인도네시아어 CNN Indonesia·detikINET·detikFinance·Katadata·Tempo·
//              ANTARA·Liputan6(tekno·health)·Media Indonesia·
//              Tech in Asia·Uzone                       → 채택 5건/일 안팎
//   ⚠️ 응답이 없거나 RSS가 아니었던 곳(다시 시험하지 말 것):
//      bisnis.com·kontan.co.id·kumparan.com·suara.com·medcom.id(item 0),
//      tekno.kompas.com(404), republika 이노베이션(최신 글이 9년 전),
//      ria.ru/science(404), ict.moscow(응답 없음).
//
// ⚠️ 필터를 3단으로 둔 이유
//   1) AI 신호 — 제목에 AI 관련 낱말이 있는가
//   2) 소음 제외 — 게임·연예·가십·암호화폐·기기 리뷰처럼 **이 사이트 독자와
//      무관한 소비자 흥미 기사**를 뺀다. 이걸 안 하면 "80년대 사진 편집 프롬프트"
//      같은 기사가 병원 실무자용 사이트에 실린다. 사이트 주제성이 흐려지면
//      검색엔진의 주제 신뢰도와 답변 엔진의 인용 가능성이 함께 떨어진다.
//   3) 실무 신호 — 규제·정책·기관·데이터·보안·노동·의료·연구처럼
//      **일하는 사람에게 닿는 말**이 있거나, 주요 기관·기업 이름이 있는가.
//   실측(2026-09-10): 러시아어 759건 중 202건 채택, 인도네시아어는 3단 필터가
//   너무 좁아 2)까지만 적용하고 3)은 완화했다(아래 requirePro 참고).
//
// ⚠️ 제목만 보고 거른다. 본문을 읽지 않는다 —
//    매체 수가 많아 본문까지 읽으면 실행 시간이 길어지고 차단 위험도 커진다.
//    그래서 필터는 넉넉히 잡되 소음 제외를 강하게 둔다.
//
// ⚠️ 원문을 옮기지 않는다. 제목·링크·발행일·매체명만 저장한다(저작권).
import { readFile, writeFile } from 'node:fs/promises';

const LANG = process.argv[2];
const MAX_ITEMS = 300;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// ── 언어별 설정 ────────────────────────────────────────
const CONFIG = {
  ru: {
    out: 'src/data/ru/ai-digest.json',
    // requirePro: 실무 신호까지 요구할지. 러시아어는 기사량이 많아 요구해도 충분하다.
    requirePro: true,
    feeds: [
      ['Хабр', 'https://habr.com/ru/rss/hubs/artificial_intelligence/articles/?fl=ru'],
      ['Хабр', 'https://habr.com/ru/rss/hubs/machine_learning/articles/?fl=ru'],
      ['CNews', 'https://www.cnews.ru/inc/rss/news.xml'],
      ['TAdviser', 'https://www.tadviser.ru/xml/tadviser.xml'],
      ['3DNews', 'https://3dnews.ru/software-news/rss/'],
    ],
    ai: /(?<![A-Za-zА-Яа-я])(ИИ|AI)(?![A-Za-zА-Яа-я])|искусственн\w*\s+интеллект\w*|нейросет\w*|нейронн\w*\s+сет\w*|машинн\w*\s+обучен\w*|\bLLM\b|языков\w*\s+модел\w*|генеративн\w*|чат-?бот\w*|ChatGPT|GPT-?\d|Copilot|Gemini|OpenAI|Anthropic/i,
    noise:
      /\bигр\w*\b|геймер\w*|консол\w*|наушник\w*|сериал\w*|фильм\w*|актер\w*|блогер\w*|мем\w*|аниме|криптовалют\w*|биткоин|майнинг|обзор\s+смартфона|распродаж\w*|скидк\w*|промокод|гороскоп/i,
    pro: /закон|регулиров\w*|правител\w*|минцифр\w*|минздрав\w*|госдум\w*|указ|постановлен\w*|стандарт\w*|ГОСТ|персональн\w*\s+данн\w*|данн\w*|безопасн\w*|кибер\w*|утечк\w*|медицин\w*|здравоохранен\w*|больниц\w*|клиник\w*|врач\w*|пациент\w*|диагност\w*|компани\w*|бизнес\w*|предприят\w*|внедрен\w*|импортозамещен\w*|госуслуг\w*|образован\w*|сотрудник\w*|работник\w*|рынок|инвестиц\w*|этик\w*|приватност\w*|документ\w*|отчет\w*|исследован\w*|учены\w*|университет\w*|агент\w*|модел\w*|платформ\w*|сервис\w*|разработ\w*/i,
  },
  en: {
    out: 'src/data/en/ai-digest.json',
    // U.S. technology publications carry a lot of AI coverage, so a practical-signal filter (policy, regulation,
    // organizations, security, health) can be required without starving the list.
    requirePro: true,
    feeds: [
      ['TechCrunch', 'https://techcrunch.com/category/artificial-intelligence/feed/'],
      ['Ars Technica', 'https://arstechnica.com/ai/feed/'],
      ['MIT Technology Review', 'https://www.technologyreview.com/topic/artificial-intelligence/feed'],
      ['The Verge', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'],
      ['Wired', 'https://www.wired.com/feed/tag/ai/latest/rss'],
    ],
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|artificial\s+intelligence|machine\s+learning|deep\s+learning|large\s+language\s+model|\bLLMs?\b|generative|chatbot|ChatGPT|OpenAI|Anthropic|Gemini|Copilot|neural\s+network/i,
    noise:
      /\bgames?\b|gaming|gamer|console|headphones?|netflix|movie|film|celebrit\w*|influencer|meme|crypto\w*|bitcoin|discount|deal\b|coupon|review:|unboxing|iphone\s+\d|pixel\s+\d|galaxy\s+s\d|sports?|nfl|nba/i,
    pro: /law|legislat\w*|regulat\w*|congress|senate|white\s+house|\bFDA\b|\bFTC\b|\bHHS\b|\bNIST\b|policy|privacy|data\s+protection|security|cyber\w*|breach|lawsuit|court|standard\w*|hospital|health\w*|medical|patient|clinical|doctor|nurse|enterprise|workforce|jobs?\b|labor|research|study|benchmark|safety|audit|governance|compliance|procurement|government|federal|state\s+attorney/i,
  },
  in: {
    out: 'src/data/in/ai-digest.json',
    // Indian technology publications; a practical-signal filter (policy, regulation, organisations, security, health) is
    // required so the list stays relevant to a hospital reader. Verified reachable on 2026-11-07.
    requirePro: true,
    feeds: [
      ['Analytics India Magazine', 'https://analyticsindiamag.com/feed/'],
      ['YourStory', 'https://yourstory.com/feed'],
    ],
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|artificial\s+intelligence|machine\s+learning|deep\s+learning|large\s+language\s+model|\bLLMs?\b|generative|chatbot|ChatGPT|OpenAI|Anthropic|Gemini|Copilot|neural\s+network/i,
    noise:
      /\bgames?\b|gaming|gamer|console|headphones?|netflix|movie|film|celebrit\w*|influencer|meme|crypto\w*|bitcoin|discount|deal\b|coupon|review:|unboxing|iphone\s+\d|pixel\s+\d|galaxy\s+s\d|sports?|nfl|nba/i,
    pro: /law|legislat\w*|regulat\w*|congress|senate|white\s+house|\bFDA\b|\bFTC\b|\bHHS\b|\bNIST\b|policy|privacy|data\s+protection|security|cyber\w*|breach|lawsuit|court|standard\w*|hospital|health\w*|medical|patient|clinical|doctor|nurse|enterprise|workforce|jobs?\b|labor|research|study|benchmark|safety|audit|governance|compliance|procurement|government|federal|state\s+attorney/i,
  },
  sg: {
    out: 'src/data/sg/ai-digest.json',
    // Singapore news outlets (RSS verified reachable on 2026-11-14); a practical-signal filter (policy, regulation,
    // organisations, security, health) is required so the list stays relevant to a hospital reader.
    requirePro: true,
    feeds: [
      ['The Straits Times', 'https://www.straitstimes.com/news/singapore/rss.xml'],
      ['CNA', 'https://www.channelnewsasia.com/rssfeeds/8395986'],
    ],
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|artificial\s+intelligence|machine\s+learning|deep\s+learning|large\s+language\s+model|\bLLMs?\b|generative|chatbot|ChatGPT|OpenAI|Anthropic|Gemini|Copilot|neural\s+network/i,
    noise:
      /\bgames?\b|gaming|gamer|console|headphones?|netflix|movie|film|celebrit\w*|influencer|meme|crypto\w*|bitcoin|discount|deal\b|coupon|review:|unboxing|iphone\s+\d|pixel\s+\d|galaxy\s+s\d|sports?|nfl|nba/i,
    pro: /\bMOH\b|\bHSA\b|\bPDPC\b|\bIMDA\b|Synapxe|\bCSA\b|law|legislat\w*|regulat\w*|congress|senate|white\s+house|\bFDA\b|\bFTC\b|\bHHS\b|\bNIST\b|policy|privacy|data\s+protection|security|cyber\w*|breach|lawsuit|court|standard\w*|hospital|health\w*|medical|patient|clinical|doctor|nurse|enterprise|workforce|jobs?\b|labor|research|study|benchmark|safety|audit|governance|compliance|procurement|government|federal|state\s+attorney/i,
  },
  ae: {
    out: 'src/data/ae/ai-digest.json',
    // UAE news outlets (RSS verified reachable on 2026-11-15); a practical-signal filter (policy, regulation,
    // organisations, security, health) is required so the list stays relevant to a hospital reader.
    requirePro: true,
    feeds: [
      ['The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/business/technology/?outputType=xml'],
      ['The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/news/uae/?outputType=xml'],
      ['Khaleej Times', 'https://www.khaleejtimes.com/api/v1/collections/uae.rss'],
      ['Khaleej Times', 'https://www.khaleejtimes.com/api/v1/collections/business.rss'],
      ['Emirates 24|7', 'https://www.emirates247.com/rss/mobile/v2/technology.rss'],
      ['Emirates 24|7', 'https://www.emirates247.com/rss/mobile/v2/uae.rss'],
      ['The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml'],
      ['The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/news/mena/?outputType=xml'],
      ['The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/business/?outputType=xml'],
      ['Gulf News', 'https://gulfnews.com/feed'],
      ['Arab News', 'https://www.arabnews.com/rss.xml'],
      ['Arab News', 'https://www.arabnews.com/taxonomy/term/1/feed'],
      ['Tahawul Tech', 'https://www.tahawultech.com/feed/'],
      // Google News searches limited to UAE outlets (see UAE_OUTLETS below): the RSS <source> of each item is the real outlet.
      ...[
        'UAE artificial intelligence regulation',
        'UAE AI law',
        'UAE AI policy government',
        'Abu Dhabi artificial intelligence',
        'Dubai artificial intelligence',
        'UAE generative AI',
        'UAE AI jobs workforce',
        'UAE AI cybersecurity',
        'UAE AI data protection privacy',
        'UAE AI hospital',
      ].map((q) => [
        'Google News',
        `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:30d')}&hl=en-AE&gl=AE&ceid=AE:en`,
        { gnews: true },
      ]),
    ],
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|artificial\s+intelligence|machine\s+learning|deep\s+learning|large\s+language\s+model|\bLLMs?\b|generative|chatbot|ChatGPT|OpenAI|Anthropic|Gemini|Copilot|neural\s+network/i,
    noise:
      /\bgames?\b|gaming|gamer|console|headphones?|netflix|movie|film|celebrit\w*|influencer|meme|crypto\w*|bitcoin|discount|deal\b|coupon|review:|unboxing|iphone\s+\d|pixel\s+\d|galaxy\s+s\d|sports?|nfl|nba/i,
    pro: /\bDoH\b|\bDHA\b|\bMOHAP\b|\bTDRA\b|\bADHICS\b|Malaffi|NABIDH|\bCSC\b|law|legislat\w*|regulat\w*|congress|senate|white\s+house|\bFDA\b|\bFTC\b|\bHHS\b|\bNIST\b|policy|privacy|data\s+protection|security|cyber\w*|breach|lawsuit|court|standard\w*|hospital|health\w*|medical|patient|clinical|doctor|nurse|enterprise|workforce|jobs?\b|labor|research|study|benchmark|safety|audit|governance|compliance|procurement|government|federal|state\s+attorney/i,
  },
  ie: {
    out: 'src/data/ie/ai-digest.json',
    gnewsAllow: /^(The Irish Times|RTÉ|RTE\.ie|Irish Independent|Independent\.ie|Irish Examiner|TheJournal\.ie|The Journal|Silicon Republic|Business Post|The Sunday Business Post|Medical Independent|Irish Medical Times|Hospital Professional News|Irish Tech News|Pulse IT|Pulse\+IT News|Irish Legal News|Newstalk|BreakingNews\.ie|Gript)$/,
    gnewsRename: { 'The Journal': 'TheJournal.ie', 'RTE.ie': 'RTÉ', 'Independent.ie': 'Irish Independent', 'Pulse+IT News': 'Pulse IT', 'The Sunday Business Post': 'Business Post' },
    // Irish news outlets (RSS verified reachable on 2026-11-15) plus Google News searches limited to Irish outlets;
    // a practical-signal filter (policy, regulation, organisations, security, health) keeps the list relevant to a hospital reader.
    requirePro: true,
    feeds: [
      ['Irish Independent', 'https://www.independent.ie/rss'],
      ['Irish Independent', 'https://www.independent.ie/irish-news/health/rss/'],
      ['TheJournal.ie', 'https://www.thejournal.ie/feed/'],
      ['RTÉ', 'https://www.rte.ie/news/rss/news-headlines.xml'],
      ['Irish Tech News', 'https://irishtechnews.ie/feed/'],
      ['Medical Independent', 'https://www.medicalindependent.ie/feed/'],
      ['Irish Medical Times', 'https://www.imt.ie/feed/'],
      ...[
        'Ireland artificial intelligence regulation',
        'Ireland AI Act',
        'Ireland AI policy government',
        'Irish artificial intelligence strategy',
        'Ireland generative AI',
        'Ireland AI jobs workforce',
        'Ireland AI cybersecurity',
        'Ireland AI data protection privacy',
        'Ireland AI hospital',
        'Irish public sector AI guidelines',
      ].map((q) => [
        'Google News',
        `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:60d')}&hl=en-IE&gl=IE&ceid=IE:en`,
        { gnews: true },
      ]),
    ],
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|artificial\s+intelligence|machine\s+learning|deep\s+learning|large\s+language\s+model|\bLLMs?\b|generative|chatbot|ChatGPT|OpenAI|Anthropic|Gemini|Copilot|neural\s+network/i,
    noise:
      /\bgames?\b|gaming|gamer|console|headphones?|netflix|movie|film|celebrit\w*|influencer|meme|crypto\w*|bitcoin|discount|deal\b|coupon|review:|unboxing|iphone\s+\d|pixel\s+\d|galaxy\s+s\d|sports?|gaa\b|rugby|soccer|nfl|nba/i,
    pro: /\bHSE\b|\bHIQA\b|\bHPRA\b|\bDPC\b|Data\s+Protection|\bGDPR\b|AI\s+Act|law|legislat\w*|regulat\w*|Oireachtas|Dáil|Seanad|policy|privacy|security|cyber\w*|breach|lawsuit|court|standard\w*|hospital|health\w*|medical|patient|clinical|doctor|nurse|enterprise|workforce|jobs?\b|labor|labour|research|study|benchmark|safety|audit|governance|compliance|procurement|government|public\s+sector|state\s+attorney/i,
  },
  fr: {
    out: 'src/data/fr/ai-digest.json',
    gnewsAllow: /^(Le Monde|Le Figaro|franceinfo|France Info|Les Echos|Les Échos|Le Parisien|Libération|La Croix|Ouest-France|Sud Ouest|20 Minutes|La Tribune|L’Usine Nouvelle|Usine Digitale|Numerama|Les Numériques|ZDNet France|01net|Sciences et Avenir|Challenges|BFM TV|BFMTV|RTL\.fr|Europe 1|France 24|Public Sénat|Vie publique|CNIL|LeMagIT|Silicon\.fr|Journal du Net|Le Quotidien du Médecin|DSIH|Infirmiers\.com|Hospimedia|L’Informaticien|Maddyness|FrenchWeb)$/,
    gnewsRename: { 'France Info': 'franceinfo', 'Les Echos': 'Les Échos', 'BFMTV': 'BFM TV' },
    // Médias français (RSS vérifiés le 2026-11-15) + recherches Google Actualités limitées aux médias français ; un filtre de signal pratique
    // (régulation, organisations, sécurité, santé) garde la liste utile pour un lecteur hospitalier.
    requirePro: true,
    feeds: [
      ['Le Monde', 'https://www.lemonde.fr/pixels/rss_full.xml'],
      ['Le Monde', 'https://www.lemonde.fr/sciences/rss_full.xml'],
      ['Le Monde', 'https://www.lemonde.fr/rss/une.xml'],
      ['Le Figaro', 'https://www.lefigaro.fr/rss/figaro_sante.xml'],
      ['franceinfo', 'https://www.francetvinfo.fr/titres.rss'],
      ['Numerama', 'https://www.numerama.com/feed/'],
      ['Les Numériques', 'https://www.lesnumeriques.com/rss.xml'],
      ['ZDNet France', 'https://www.zdnet.fr/feeds/rss/actualites/'],
      ['Ouest-France', 'https://www.ouest-france.fr/rss/une'],
      ['Sud Ouest', 'https://www.sudouest.fr/rss.xml'],
      ['DSIH', 'https://www.dsih.fr/rss'],
      ...[
        'intelligence artificielle réglementation',
        'règlement européen IA entreprises',
        'IA politique publique gouvernement France',
        'intelligence artificielle emploi travail',
        'IA cybersécurité',
        'IA données personnelles CNIL',
        'IA générative entreprises',
        'intelligence artificielle hôpital',
        'IA fonction publique administration',
        'stratégie nationale intelligence artificielle',
      ].map((q) => [
        'Google News',
        `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:60d')}&hl=fr&gl=FR&ceid=FR:fr`,
        { gnews: true },
      ]),
    ],
    ai: /(?<![A-Za-z])(IA|AI)(?![A-Za-z])|intelligence\s+artificielle|apprentissage\s+(automatique|profond)|grands?\s+mod[eè]les?\s+de\s+langage|\bLLMs?\b|g[ée]n[ée]rative|chatbot|ChatGPT|OpenAI|Anthropic|Mistral|Gemini|Copilot|r[ée]seaux?\s+de\s+neurones/i,
    noise:
      /\bjeux?\b|gaming|gamer|console|casque|netflix|film\b|c[ée]l[ée]brit[ée]|influenceu|m[èe]me\b|crypto|bitcoin|promo|soldes|bon plan|test\s*:|d[ée]ballage|iphone\s+\d|pixel\s+\d|galaxy\s+s\d|football|rugby|ligue\s*1|tennis|pr[ée]sidentielle|municipales/i,
    pro: /\bCNIL\b|\bHAS\b|\bANSM\b|\bARS\b|RGPD|AI\s+Act|loi\b|l[ée]gislat|r[ée]glement|r[ée]gulat|Assembl[ée]e|S[ée]nat|politique|vie priv[ée]e|donn[ée]es|s[ée]curit[ée]|cyber|fuite|violation|proc[èe]s|tribunal|justice|norme|h[ôo]pita|sant[ée]|m[ée]dic|patient|clinique|m[ée]decin|soignant|entreprise|emploi|travail|salari|recherche|[ée]tude|audit|gouvernance|conformit[ée]|march[ée] public|gouvernement|administration|fonction publique|souverain/i,
  },
  id: {
    out: 'src/data/id/ai-digest.json',
    // 인도네시아 일반 매체는 AI 기사 자체가 적어(325건 중 25건) 실무 신호까지
    // 요구하면 3건으로 떨어진다. 소음 제외만 강하게 걸고 실무 신호는 요구하지 않는다.
    requirePro: false,
    feeds: [
      // ⚠️ CNN Indonesia 는 **GitHub Actions 러너에서 HTTP 403** 이다(2026-09-10 확인).
      //    로컬에서는 200 이라 데이터센터 IP 차단으로 보인다. 수집기는 한 곳이
      //    실패해도 계속하므로 남겨 두지만, CI 로그에 실패가 찍히는 것은 정상이다.
      //    이 손실(약 1.1건/일)을 메우려고 아래 매체들을 함께 넣었다.
      ['CNN Indonesia', 'https://www.cnnindonesia.com/teknologi/rss'],
      ['detikINET', 'https://inet.detik.com/rss'],
      ['Katadata', 'https://katadata.co.id/rss'],
      ['Katadata', 'https://katadata.co.id/rss/digital'],
      ['Tempo', 'https://rss.tempo.co/tekno'],
      ['ANTARA', 'https://www.antaranews.com/rss/terkini.xml'],
      ['ANTARA', 'https://www.antaranews.com/rss/tekno.xml'],
      ['Liputan6', 'https://feed.liputan6.com/rss/tekno'],
      // 보건 지면 — 의료 AI 기사가 실제로 나온다(BPJS Healthkathon,
      // Fujifilm·Siloam 제휴 등). 이 사이트 주제와 가장 가까운 축이다.
      ['Liputan6', 'https://feed.liputan6.com/rss/health'],
      // 경제 지면 — 정부·기관의 AI 도입(국세청 탐지 시스템, 데이터센터 등).
      ['detikFinance', 'https://finance.detik.com/rss'],
      ['Media Indonesia', 'https://mediaindonesia.com/feed'],
      ['Tech in Asia', 'https://id.techinasia.com/feed'],
      ['Uzone', 'https://uzone.id/feed'],
    ],
    ai: /(?<![A-Za-z])AI(?![A-Za-z])|kecerdasan\s+buatan|kecerdasan\s+artifisial|artificial\s+intelligence|machine\s+learning|pembelajaran\s+mesin|deep\s+learning|model\s+bahasa|generatif|chatbot|ChatGPT|Copilot|Gemini|OpenAI|Anthropic|\bLLM\b/i,
    // 'viral'·'bukan hasil AI'(AI가 아니라는 화제성 기사)까지 뺀다 —
    // 2026-09-10 실측에서 개구리 사진 기사가 통과했다.
    noise:
      /\bgame\b|\bgim\b|gamer|konsol|anime|\bfilm\b|sinetron|selebriti|\bartis\b|gosip|\bmeme\b|kripto|bitcoin|mining|diskon|promo|harga\s+hp|spesifikasi|unboxing|prakiraan\s+cuaca|sepak\s+bola|\bliga\b|jadwal\s+(?:sholat|bola)|\bviral\b|bukan\s+hasil\s+ai|zodiak|ramalan|edit\s+foto|foto\s+ala|bikin\s+foto|filter\s+foto/i,
    pro: /undang|regulasi|peraturan|pemerintah|kementerian|kemenkes|komdigi|kominfo|ojk|standar|kebijakan|data\s+pribadi|perlindungan\s+data|keamanan|siber|kebocoran|kesehatan|rumah\s+sakit|dokter|pasien|medis|perusahaan|bisnis|industri|adopsi|implementasi|karyawan|pekerja|tenaga\s+kerja|pendidikan|riset|penelitian|universitas|etika|privasi|publik|layanan/i,
  },
};

const cfg = CONFIG[LANG];
if (!cfg) {
  console.error(`언어를 지정하세요: node scripts/fetch-ai-digest.mjs <${Object.keys(CONFIG).join('|')}>`);
  process.exit(1);
}

// ── 도우미 ────────────────────────────────────────────
const decodeEntities = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&#039;|&apos;/g, "'")
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ⚠️ CDATA 를 **먼저** 벗긴 뒤에 태그를 지운다. 순서를 바꾸면 안 된다 —
//    `<[^>]+>` 는 `<![CDATA[제목]]>` 전체를 하나의 태그로 보고 통째로 지워서
//    제목이 빈 문자열이 된다. 2026-09-10에 실제로 이 순서 때문에 Habr·TAdviser가
//    0건으로 나왔다(두 곳은 제목을 CDATA 로 감싸고, CNews·3DNews 는 안 감싼다).
const stripTags = (s) =>
  decodeEntities(
    String(s)
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]+>/g, ' ')
  );

// 제목 정규화 — 같은 기사가 여러 매체 피드에 뜨는 경우를 한 건으로 본다.
const normTitle = (t) =>
  (t || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/["'«»“”‘’.,!?:;()\[\]—–\-·]/g, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'application/rss+xml,application/xml,text/xml,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(25000),
      });
      if (res.ok) return res;
      last = new Error(`HTTP ${res.status}`);
      if (res.status === 429) await sleep(8000 * (i + 1));
    } catch (e) {
      last = new Error(`${e.message}${e.cause?.code ? ` (${e.cause.code})` : ''}`);
    }
    if (i < tries - 1) await sleep(1500 * (i + 1));
  }
  throw last;
}

// Google News search RSS: keep only items whose <source> is a UAE outlet, label them with that outlet, and cut the ' - Outlet' title suffix.
const UAE_OUTLETS = /^(Khaleej Times|Gulf News|The National|Arabian Business|Gulf Business|www\.wam\.ae|Emirates 24\|7|Gulf Today|Zawya|Fast Company Middle East|Arab News|AGBI|Tahawul Tech|Tbreak UAE)$/;
function parseGnews(xml) {
  const allow = cfg.gnewsAllow || UAE_OUTLETS;
  const rows = [];
  for (const block of xml.split('<item>').slice(1)) {
    const src = stripTags(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? '');
    if (!allow.test(src)) continue;
    let title = stripTags(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const cut = title.lastIndexOf(' - ');
    if (cut > 0) title = title.slice(0, cut).trim();
    const link = decodeEntities(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '');
    const dRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    const d = dRaw ? new Date(decodeEntities(dRaw)) : null;
    if (!title || !link || !d || Number.isNaN(d.getTime())) continue;
    rows.push({ title, link, source: (cfg.gnewsRename && cfg.gnewsRename[src]) || (src === 'www.wam.ae' ? 'WAM' : src), pubDate: d.toISOString() });
  }
  return rows;
}

function parseFeed(xml, source) {
  const rows = [];
  for (const block of xml.split(/<item[\s>]/).slice(1)) {
    const title = stripTags(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
    // link 는 <link>...</link> 또는 <link ... href="..."/>(Atom) 두 형태가 있다.
    const link =
      decodeEntities(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? '') ||
      block.match(/<link[^>]+href="([^"]+)"/)?.[1] ||
      '';
    const dRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
    const d = dRaw ? new Date(decodeEntities(dRaw)) : null;
    if (!title || !link || !d || Number.isNaN(d.getTime())) continue;
    rows.push({ title, link, source, pubDate: d.toISOString() });
  }
  return rows;
}

const isKept = (title) => {
  if (!cfg.ai.test(title)) return false;
  if (cfg.noise.test(title)) return false;
  if (cfg.requirePro && !cfg.pro.test(title)) return false;
  return true;
};

// ── 수집 ──────────────────────────────────────────────
const collected = [];
let okFeeds = 0;

for (const [i, [source, url, opt]] of cfg.feeds.entries()) {
  if (i > 0) await sleep(1200);
  try {
    const xml = await (await fetchRetry(url)).text();
    const rows = opt?.gnews ? parseGnews(xml) : parseFeed(xml, source);
    const kept = rows.filter((r) => isKept(r.title));
    collected.push(...kept);
    okFeeds++;
    console.log(`${source}: ${rows.length}건 중 ${kept.length}건 채택`);
  } catch (e) {
    console.error(`${source} 수집 실패 — ${e.message}`);
  }
}

if (okFeeds === 0) {
  console.error(`모든 수집원을 읽지 못했습니다. 기존 ${cfg.out}을 유지합니다.`);
  process.exit(1);
}

// ── 기존 항목과 병합 (누적) ────────────────────────────
let existing = [];
try {
  const prev = JSON.parse(await readFile(cfg.out, 'utf8'));
  if (Array.isArray(prev.items)) existing = prev.items;
} catch (e) {
  if (e.code !== 'ENOENT') {
    console.error(`${cfg.out} 읽기/파싱 실패 — 누적 이력 보호를 위해 중단: ${e.message}`);
    process.exit(1);
  }
}

const seenTitle = new Set();
const seenLink = new Set();
const items = [...collected, ...existing]
  .filter((it) => {
    const t = normTitle(it.title);
    const l = (it.link || '').split('?')[0];
    if (!t || seenTitle.has(t) || seenLink.has(l)) return false;
    seenTitle.add(t);
    seenLink.add(l);
    return true;
  })
  .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
  .slice(0, MAX_ITEMS);

if (JSON.stringify(items) === JSON.stringify(existing)) {
  console.log(`변경 없음: 새 기사 없이 종료 (누적 ${items.length}건 유지)`);
  process.exit(0);
}

const sources = cfg.feeds.some((f) => f[2]?.gnews)
  ? [...new Set(items.map((i) => i.source))].join('·')
  : [...new Set(cfg.feeds.map(([s]) => s))].join('·');
await writeFile(
  cfg.out,
  JSON.stringify({ updatedAt: new Date().toISOString(), source: sources, items }, null, 2) + '\n',
  'utf8'
);
console.log(`수집 완료: 신규 ${items.length - existing.length}건 / 누적 ${items.length}건`);
