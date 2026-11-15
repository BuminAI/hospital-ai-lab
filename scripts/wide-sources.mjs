// 광폭 수집기 출처 목록 (2026-11-14, ae·ie·fr 2026-11-15). 전부 2026-11-14에 이 저장소 환경에서 응답을 확인한 공개 RSS/Atom/RDF다.
//
// topic
//   health  — 의료 전문 매체. 제목·요약에 AI 단어만 있으면 통과(의료 맥락은 매체가 보장).
//   tech    — IT·AI 매체. AI 단어 + 의료 단어가 모두 있어야 통과.
//   general — 종합 일간지·통신사. tech와 같다.
//   gov     — 정부·공공기관. 뉴스: AI·디지털헬스 단어, 정부 지원사업: 지원사업 단어 + (의료|AI).
// popular: true — 그 매체의 '많이 본 기사' 피드. 항목에 popular·rank가 붙는다.
//
// 출처를 추가·제거할 때는 해당 언어판 뉴스·정부·행사 페이지의 출처 안내 문구와 HANDOFF.md의 수집 표를 함께 고친다.
// (CLAUDE.md '수집처 문구' 규정: 사이트의 출처 설명은 실제 수집처와 같아야 한다.)

const rss = (name, url, topic, extra = {}) => ({ name, url, topic, ...extra });
// 한국 지역 신문 CMS의 공통 규칙: /rss/allArticle.xml(최신 50건), /rss/clickTop.xml(조회수 상위 10건)
const kcms = (name, host, topic) => [
  rss(name, `https://${host}/rss/allArticle.xml`, topic),
  rss(`${name} 많이 본 기사`, `https://${host}/rss/clickTop.xml`, topic, { popular: true, sourceLabel: name }),
];

export const EDITIONS = {
  ko: {
    lang: 'ko',
    files: { news: 'src/data/news.json', gov: 'src/data/gov-programs.json', events: 'src/data/events.json' },
    sources: [
      ...kcms('청년의사', 'www.docdocdoc.co.kr', 'health'),
      ...kcms('의협신문', 'www.doctorsnews.co.kr', 'health'),
      ...kcms('히트뉴스', 'www.hitnews.co.kr', 'health'),
      ...kcms('의학신문', 'www.bosa.co.kr', 'health'),
      ...kcms('라포르시안', 'www.rapportian.com', 'health'),
      ...kcms('e-의료정보', 'www.kmedinfo.co.kr', 'health'),
      ...kcms('메디칼업저버', 'www.monews.co.kr', 'health'),
      ...kcms('약사공론', 'www.kpanews.co.kr', 'health'),
      ...kcms('메디팜스투데이', 'www.pharmstoday.com', 'health'),
      ...kcms('병원신문', 'www.khanews.com', 'health'),
      rss('의약뉴스', 'https://www.newsmp.com/rss/allArticle.xml', 'health'),
      rss('메디파나뉴스', 'https://www.medipana.com/rss/allArticle.xml', 'health'),
      ...kcms('AI타임스', 'www.aitimes.com', 'tech'),
      rss('디지털투데이', 'https://www.digitaltoday.co.kr/rss/allArticle.xml', 'tech'),
      rss('한국경제', 'https://www.hankyung.com/feed/it', 'general'),
      rss('ZDNet Korea', 'https://feeds.feedburner.com/zdkorea', 'tech'),
      rss('연합뉴스', 'https://www.yna.co.kr/rss/health.xml', 'general'),
      rss('연합뉴스', 'https://www.yna.co.kr/rss/industry.xml', 'general'),
      rss('뉴시스', 'https://www.newsis.com/RSS/health.xml', 'general'),
      rss('매일경제', 'https://www.mk.co.kr/rss/30000001/', 'general'),
      rss('보건복지부', 'https://www.mohw.go.kr/rss/board.es?mid=a10503000000&bid=0027', 'gov'),
    ],
  },
  ja: {
    lang: 'ja',
    files: { news: 'src/data/ja/news.json', gov: null, events: null },
    sources: [
      rss('CBnews', 'https://www.cbnews.jp/rss/news.xml', 'health'),
      rss('ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml', 'tech'),
      rss('ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', 'tech'),
      rss('ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', 'tech'),
      rss('日経クロステック', 'https://xtech.nikkei.com/rss/index.rdf', 'tech'),
      rss('日経ビジネス', 'https://business.nikkei.com/rss/sns/nb.rdf', 'general'),
      rss('Yahoo!ニュース', 'https://news.yahoo.co.jp/rss/topics/it.xml', 'general'),
      rss('Yahoo!ニュース', 'https://news.yahoo.co.jp/rss/topics/science.xml', 'general'),
      rss('Yahoo!ニュース', 'https://news.yahoo.co.jp/rss/topics/domestic.xml', 'general'),
      rss('朝日新聞', 'https://www.asahi.com/rss/asahi/newsheadlines.rdf', 'general'),
      rss('GIGAZINE', 'https://gigazine.net/news/rss_2.0/', 'tech'),
      rss('厚生労働省', 'https://www.mhlw.go.jp/stf/news.rdf', 'gov'),
      rss('デジタル庁', 'https://www.digital.go.jp/rss/news.xml', 'gov'),
    ],
  },
  ru: {
    lang: 'ru',
    files: { news: 'src/data/ru/news.json', gov: 'src/data/ru/gov-notices.json', events: null },
    sources: [
      rss('Vademecum', 'https://vademec.ru/rss/', 'health'),
      rss('Doctor Piter', 'https://www.doctorpiter.ru/rss/', 'health'),
      rss('РИА Новости', 'https://ria.ru/export/rss2/archive/index.xml', 'general'),
      rss('ТАСС', 'https://tass.ru/rss/v2.xml', 'general'),
      rss('Интерфакс', 'https://www.interfax.ru/rss.asp', 'general'),
      rss('Коммерсантъ', 'https://www.kommersant.ru/RSS/news.xml', 'general'),
      rss('РБК', 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss', 'general'),
      rss('Ведомости', 'https://www.vedomosti.ru/rss/news', 'general'),
      rss('Российская газета', 'https://rg.ru/xml/index.xml', 'general'),
      rss('Lenta.ru', 'https://lenta.ru/rss/news', 'general'),
      rss('Хабр', 'https://habr.com/ru/rss/articles/', 'tech'),
      rss('CNews', 'https://www.cnews.ru/inc/rss/news.xml', 'tech'),
      rss('CNews', 'https://www.cnews.ru/inc/rss/news_top.xml', 'tech'),
      rss('3DNews', 'https://3dnews.ru/news/rss/', 'tech'),
      rss('iXBT', 'https://www.ixbt.com/export/news.rss', 'tech'),
      rss('Rusbase', 'https://rb.ru/feeds/all/', 'tech'),
      rss('vc.ru', 'https://vc.ru/rss', 'tech'),
      rss('Росздравнадзор', 'https://roszdravnadzor.gov.ru/rss', 'gov'),
    ],
  },
  id: {
    lang: 'id',
    files: { news: 'src/data/id/news.json', gov: 'src/data/id/gov-notices.json', events: 'src/data/id/events.json' },
    sources: [
      rss('ANTARA', 'https://www.antaranews.com/rss/terkini.xml', 'general'),
      rss('ANTARA', 'https://www.antaranews.com/rss/tekno.xml', 'tech'),
      rss('CNN Indonesia', 'https://www.cnnindonesia.com/nasional/rss', 'general'),
      rss('CNN Indonesia', 'https://www.cnnindonesia.com/teknologi/rss', 'tech'),
      rss('CNN Indonesia', 'https://www.cnnindonesia.com/gaya-hidup/rss', 'general'),
      rss('CNBC Indonesia', 'https://www.cnbcindonesia.com/rss', 'general'),
      rss('Katadata', 'https://katadata.co.id/rss', 'general'),
      rss('Liputan6', 'https://feed.liputan6.com/rss/health', 'health'),
      rss('Liputan6', 'https://feed.liputan6.com/rss/tekno', 'tech'),
      rss('Tempo', 'https://rss.tempo.co/', 'general'),
      rss('Republika', 'https://www.republika.co.id/rss', 'general'),
      rss('Media Indonesia', 'https://mediaindonesia.com/feed', 'general'),
      rss('Okezone', 'https://sindikasi.okezone.com/index.php/rss/1/RSS2.0', 'general'),
      rss('Okezone', 'https://sindikasi.okezone.com/index.php/rss/16/RSS2.0', 'tech'),
      rss('BBC Indonesia', 'https://feeds.bbci.co.uk/indonesia/rss.xml', 'general'),
      rss('PERSI', 'https://persi.or.id/feed/', 'health'),
    ],
  },
  tw: {
    lang: 'tw',
    files: { news: 'src/data/tw/news.json', gov: 'src/data/tw/gov-notices.json', events: 'src/data/tw/events.json' },
    sources: [
      rss('中央社', 'https://feeds.feedburner.com/rsscna/mainland', 'general'),
      rss('中央社', 'https://feeds.feedburner.com/rsscna/technology', 'tech'),
      rss('中央社', 'https://feeds.feedburner.com/rsscna/lifehealth', 'health'),
      rss('中央社', 'https://feeds.feedburner.com/rsscna/finance', 'general'),
      rss('自由時報', 'https://news.ltn.com.tw/rss/all.xml', 'general'),
      rss('自由時報', 'https://news.ltn.com.tw/rss/life.xml', 'general'),
      rss('ETtoday', 'https://feeds.feedburner.com/ettoday/health', 'health'),
      rss('ETtoday', 'https://feeds.feedburner.com/ettoday/news', 'general'),
      rss('科技新報', 'https://technews.tw/feed/', 'tech'),
      rss('iThome', 'https://www.ithome.com.tw/rss', 'tech'),
      rss('INSIDE', 'https://www.inside.com.tw/feed/rss', 'tech'),
      rss('科技橘報', 'https://buzzorange.com/techorange/feed/', 'tech'),
      rss('醫療新聞網', 'https://www.mdnkids.com/rss', 'health'),
      rss('遠見雜誌', 'https://www.gvm.com.tw/rss', 'general'),
      rss('經濟日報', 'https://money.udn.com/rssfeed/news/1001/5591/5612?ch=money', 'general'),
      rss('公視新聞網', 'https://news.pts.org.tw/xml/newsfeed.xml', 'general'),
      rss('BBC 中文', 'https://feeds.bbci.co.uk/zhongwen/trad/rss.xml', 'general'),
      rss('衛生福利部', 'https://www.mohw.gov.tw/rss-16-1.html', 'gov'),
    ],
  },
  en: {
    lang: 'en',
    files: { news: 'src/data/en/news.json', gov: 'src/data/en/gov-notices.json', events: null },
    sources: [
      rss('Healthcare Dive', 'https://www.healthcaredive.com/feeds/news/', 'health'),
      rss('Fierce Healthcare', 'https://www.fiercehealthcare.com/rss/xml', 'health'),
      rss('STAT', 'https://www.statnews.com/feed/', 'health'),
      rss('MedCity News', 'https://medcitynews.com/feed/', 'health'),
      rss('HIT Consultant', 'https://hitconsultant.net/feed/', 'health'),
      rss('Health Affairs', 'https://www.healthaffairs.org/action/showFeed?type=etoc&feed=rss&jc=hlthaff', 'health'),
      rss('KFF Health News', 'https://kffhealthnews.org/feed/', 'health'),
      rss('Radiology Business', 'https://radiologybusiness.com/rss.xml', 'health'),
      rss('Healthcare Business Today', 'https://www.healthcarebusinesstoday.com/feed/', 'health'),
      rss('NEJM AI', 'https://ai.nejm.org/action/showFeed?type=etoc&feed=rss&jc=ai', 'health'),
      rss('TechCrunch', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'tech'),
      rss('The Verge', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'tech'),
      rss('Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index', 'tech'),
      rss('WIRED', 'https://www.wired.com/feed/rss', 'tech'),
      rss('MIT Technology Review', 'https://www.technologyreview.com/feed/', 'tech'),
      rss('The New York Times', 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', 'general'),
      rss('NPR', 'https://feeds.npr.org/1128/rss.xml', 'general'),
      rss('BBC News', 'https://feeds.bbci.co.uk/news/health/rss.xml', 'general'),
      rss('The Guardian', 'https://www.theguardian.com/society/health/rss', 'general'),
      rss('FDA', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml', 'gov'),
    ],
  },
  in: {
    lang: 'in',
    files: { news: 'src/data/in/news.json', gov: 'src/data/in/gov-notices.json', events: null },
    sources: [
      rss('ET HealthWorld', 'https://health.economictimes.indiatimes.com/rss/topstories', 'health'),
      rss('ET HealthWorld', 'https://health.economictimes.indiatimes.com/rss/health-it', 'health'),
      rss('ET HealthWorld', 'https://health.economictimes.indiatimes.com/rss/recentstories', 'health'),
      rss('Express Healthcare', 'https://www.expresshealthcare.in/feed/', 'health'),
      rss('The Economic Times', 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms', 'general'),
      rss('The Hindu', 'https://www.thehindu.com/sci-tech/health/feeder/default.rss', 'general'),
      rss('The Hindu', 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss', 'general'),
      rss('Hindustan Times', 'https://www.hindustantimes.com/feeds/rss/lifestyle/health/rssfeed.xml', 'general'),
      rss('Hindustan Times', 'https://www.hindustantimes.com/feeds/rss/technology/rssfeed.xml', 'general'),
      rss('The Indian Express', 'https://indianexpress.com/section/lifestyle/health/feed/', 'general'),
      rss('The Indian Express', 'https://indianexpress.com/section/technology/feed/', 'general'),
      rss('Mint', 'https://www.livemint.com/rss/technology', 'general'),
      rss('Analytics India Magazine', 'https://analyticsindiamag.com/feed/', 'tech'),
      rss('YourStory', 'https://yourstory.com/feed', 'tech'),
      rss('Inc42', 'https://inc42.com/feed/', 'tech'),
      rss('MediaNama', 'https://www.medianama.com/feed/', 'tech'),
      rss('Scroll.in', 'https://feeds.feedburner.com/ScrollinArticles.rss', 'general'),
    ],
  },
  sg: {
    lang: 'sg',
    files: { news: 'src/data/sg/news.json', gov: 'src/data/sg/gov-notices.json', events: null },
    sources: [
      rss('The Straits Times', 'https://www.straitstimes.com/news/singapore/rss.xml', 'general'),
      rss('The Straits Times', 'https://www.straitstimes.com/news/life/rss.xml', 'general'),
      rss('The Straits Times', 'https://www.straitstimes.com/news/asia/rss.xml', 'general'),
      rss('The Straits Times', 'https://www.straitstimes.com/news/business/rss.xml', 'general'),
      rss('The Straits Times', 'https://www.straitstimes.com/news/world/rss.xml', 'general'),
      rss('CNA', 'https://www.channelnewsasia.com/rssfeeds/8395986', 'general'),
      rss('CNA', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416', 'general'),
      rss('CNA', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936', 'general'),
      rss('CNA', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511', 'general'),
      rss('Business Times', 'https://www.businesstimes.com.sg/rss/singapore', 'general'),
      rss('Mothership', 'https://mothership.sg/feed/', 'general'),
      rss('e27', 'https://e27.co/feed/', 'tech'),
      rss('Singapore Business Review', 'https://sbr.com.sg/rss.xml', 'general'),
    ],
  },
  // 2026-11-15 UAE판. 전부 이 환경에서 응답을 확인한 공개 RSS다(The National·Gulf News·Arab News·Tahawul Tech).
  ae: {
    lang: 'ae',
    files: { news: 'src/data/ae/news.json', gov: 'src/data/ae/gov-notices.json', events: null },
    sources: [
      rss('The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml', 'general'),
      rss('The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/news/uae/?outputType=xml', 'general'),
      rss('The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/news/mena/?outputType=xml', 'general'),
      rss('The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/news/gulf/?outputType=xml', 'general'),
      rss('The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/business/?outputType=xml', 'general'),
      rss('The National', 'https://www.thenationalnews.com/arc/outboundfeeds/rss/category/opinion/?outputType=xml', 'general'),
      rss('Gulf News', 'https://gulfnews.com/feed', 'general'),
      rss('Arab News', 'https://www.arabnews.com/rss.xml', 'general'),
      rss('Arab News', 'https://www.arabnews.com/taxonomy/term/1/feed', 'general'),
      rss('Tahawul Tech', 'https://www.tahawultech.com/feed/', 'tech'),
    ],
  },
  // 2026-11-15 아일랜드판. 전부 이 환경에서 응답을 확인한 공개 RSS다(Irish Independent·TheJournal.ie·Medical Independent·Irish Medical Times·Hospital Professional News·Irish Tech News·RTÉ).
  ie: {
    lang: 'ie',
    files: { news: 'src/data/ie/news.json', gov: 'src/data/ie/gov-notices.json', events: null },
    sources: [
      rss('Irish Independent', 'https://www.independent.ie/irish-news/health/rss/', 'general'),
      rss('Irish Independent', 'https://www.independent.ie/rss', 'general'),
      rss('TheJournal.ie', 'https://www.thejournal.ie/feed/', 'general'),
      rss('RTÉ', 'https://www.rte.ie/news/rss/news-headlines.xml', 'general'),
      rss('Medical Independent', 'https://www.medicalindependent.ie/feed/', 'health', { maxAgeDays: 400 }),
      rss('Irish Medical Times', 'https://www.imt.ie/feed/', 'health', { maxAgeDays: 400 }),
      rss('Hospital Professional News', 'https://hospitalprofessionalnews.ie/feed/', 'health', { maxAgeDays: 180 }),
      rss('Irish Tech News', 'https://irishtechnews.ie/feed/', 'tech'),
    ],
  },
  // 2026-11-15 프랑스어판. 전부 이 환경에서 응답을 확인한 공개 RSS다(Le Monde·Le Figaro·franceinfo·20 Minutes·Ouest-France·Sud Ouest·Numerama·Les Numériques·ZDNet France·Le Quotidien du Médecin·Le Quotidien du Pharmacien·Infirmiers.com·DSIH·CNIL).
  fr: {
    lang: 'fr',
    files: { news: 'src/data/fr/news.json', gov: 'src/data/fr/gov-notices.json', events: null },
    sources: [
      rss('Le Monde', 'https://www.lemonde.fr/sante/rss_full.xml', 'general'),
      rss('Le Monde', 'https://www.lemonde.fr/pixels/rss_full.xml', 'general'),
      rss('Le Monde', 'https://www.lemonde.fr/sciences/rss_full.xml', 'general'),
      rss('Le Monde', 'https://www.lemonde.fr/rss/une.xml', 'general'),
      rss('Le Figaro', 'https://www.lefigaro.fr/rss/figaro_sante.xml', 'general'),
      rss('franceinfo', 'https://www.francetvinfo.fr/sante.rss', 'general'),
      rss('franceinfo', 'https://www.francetvinfo.fr/titres.rss', 'general'),
      rss('20 Minutes', 'https://www.20minutes.fr/feeds/rss-sante.xml', 'general'),
      rss('Ouest-France', 'https://www.ouest-france.fr/rss/une', 'general'),
      rss('Sud Ouest', 'https://www.sudouest.fr/rss.xml', 'general'),
      rss('Numerama', 'https://www.numerama.com/feed/', 'tech'),
      rss('Les Numériques', 'https://www.lesnumeriques.com/rss.xml', 'tech'),
      rss('ZDNet France', 'https://www.zdnet.fr/feeds/rss/actualites/', 'tech'),
      rss('Le Quotidien du Médecin', 'https://www.lequotidiendumedecin.fr/rss.xml', 'health', { maxAgeDays: 400 }),
      rss('Le Quotidien du Pharmacien', 'https://www.lequotidiendupharmacien.fr/rss.xml', 'health', { maxAgeDays: 400 }),
      rss('Infirmiers.com', 'https://www.infirmiers.com/rss.xml', 'health', { maxAgeDays: 400 }),
      rss('DSIH', 'https://www.dsih.fr/rss', 'health', { maxAgeDays: 400 }),
      rss('Egora', 'https://www.egora.fr/rss.xml', 'health', { maxAgeDays: 400 }),
      rss('What’s up doc', 'https://www.whatsupdoc-lemag.fr/rss.xml', 'health', { maxAgeDays: 400 }),
    ],
  },
};

// ── 2026-11-15 UAE: 구글 뉴스 검색 RSS로 UAE 매체(Khaleej Times·Gulf News·Arabian Business·WAM 등)의 의료 AI 기사를 모은다.
//    UAE 매체 자체 피드는 AI+의료 기사가 드물어 주 단위로 10건을 못 채운다(2026-11-15 실측). <source>가 허용 목록에 있는 것만 받는다.
const UAE_OUTLETS = /^(Khaleej Times|Gulf News|The National|Arabian Business|Gulf Business|www\.wam\.ae|Emirates 24\|7|Gulf Today|Zawya|Fast Company Middle East|Arab News|AGBI|Middle East Health|Tahawul Tech|Tbreak UAE|Dubai Eye|Cleveland Clinic Abu Dhabi|Department of Health Abu Dhabi|Abu Dhabi Media Office|Digital Watch Observatory)$/;
const UAE_RENAME = { 'www.wam.ae': 'WAM', 'Department of Health Abu Dhabi': 'Department of Health – Abu Dhabi' };
const gnews = (q) => ({
  name: 'Google News',
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-AE&gl=AE&ceid=AE:en`,
  topic: 'general',
  gnews: true,
  allow: UAE_OUTLETS,
  rename: UAE_RENAME,
  maxAgeDays: 90,
});
EDITIONS.ae.sources.push(
  gnews('UAE hospital artificial intelligence'),
  gnews('Abu Dhabi Department of Health AI'),
  gnews('Dubai Health Authority AI'),
  gnews('UAE healthcare AI when:30d'),
  gnews('Malaffi AI health'),
  gnews('Dubai hospital AI patients'),
  gnews('Abu Dhabi hospital AI doctors'),
  gnews('UAE medical AI nurses'),
  gnews('UAE digital health AI regulation'),
);

// ── 2026-11-15 아일랜드: 구글 뉴스 검색 RSS를 아일랜드 매체 허용 목록으로 거른다(자체 RSS에는 AI+의료 기사가 드물다) ──
const IE_OUTLETS = /^(The Irish Times|RTÉ|RTE\.ie|Irish Independent|Independent\.ie|Irish Examiner|TheJournal\.ie|The Journal|Silicon Republic|Business Post|The Sunday Business Post|Medical Independent|Irish Medical Times|Hospital Professional News|Irish Tech News|Pulse IT|Pulse+IT News|Irish Legal News|Newstalk|BreakingNews\.ie|HIQA|Health Information and Quality Authority|HSE|Health Service Executive|Data Protection Commission|Dublin Live|Irish Mirror|Gript)$/;
const gnewsIe = (q) => ({
  name: 'Google News',
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IE&gl=IE&ceid=IE:en`,
  topic: 'general',
  gnews: true,
  allow: IE_OUTLETS,
  rename: { "Pulse+IT News": "Pulse IT", "The Journal": "TheJournal.ie", 'RTE.ie': 'RTÉ', 'Independent.ie': 'Irish Independent', 'Health Service Executive': 'HSE', 'Health Information and Quality Authority': 'HIQA', 'The Sunday Business Post': 'Business Post' },
  maxAgeDays: 400, // 아일랜드 의료 AI 보도는 드물어 90일로는 10건이 안 찬다(2026-11-15 실측)
});
EDITIONS.ie.sources.push(
  gnewsIe('Ireland hospital artificial intelligence'),
  gnewsIe('HSE artificial intelligence'),
  gnewsIe('HIQA artificial intelligence guidance'),
  gnewsIe('Irish hospitals AI patients'),
  gnewsIe('Ireland healthcare AI when:30d'),
  gnewsIe('Ireland nurses AI'),
  gnewsIe('Data Protection Commission AI health data'),
  gnewsIe('Ireland AI Act health'),
  gnewsIe('Ireland digital health AI strategy'),
  gnewsIe('Ireland medical AI HPRA'),
);

// ── 2026-11-15 프랑스: 구글 뉴스 검색 RSS를 프랑스 매체 허용 목록으로 거른다 ──
const FR_OUTLETS = /^(Le Monde|Le Figaro|franceinfo|France Info|Les Echos|Les Échos|Le Parisien|Libération|La Croix|Ouest-France|Sud Ouest|20 Minutes|La Tribune|L’Usine Nouvelle|L'Usine Nouvelle|Usine Digitale|Le Quotidien du Médecin|Le Quotidien du Pharmacien|Hospimedia|DSIH|Egora|What’s up doc|TICsanté|Décision Santé|Infirmiers\.com|Actusoins|Techniques Hospitalières|Numerama|Les Numériques|ZDNet France|01net|Sciences et Avenir|Challenges|BFM TV|BFMTV|RTL\.fr|Europe 1|France 24|Public Sénat|Vie publique|CNIL|Mediapart|Le Journal du Dimanche|La Gazette des communes|Banque des Territoires|Maddyness|FrenchWeb|L’Informaticien|LeMagIT|Silicon\.fr|Journal du Net|Industrie Pharma|Mind Health|Pharmaceutiques)$/;
const gnewsFr = (q) => ({
  name: 'Google News',
  url: `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fr&gl=FR&ceid=FR:fr`,
  topic: 'general',
  gnews: true,
  allow: FR_OUTLETS,
  rename: { 'France Info': 'franceinfo', 'Les Echos': 'Les Échos', 'BFMTV': 'BFM TV', 'L\'Usine Nouvelle': 'L’Usine Nouvelle' },
  maxAgeDays: 120,
});
EDITIONS.fr.sources.push(
  gnewsFr('intelligence artificielle hôpital'),
  gnewsFr('intelligence artificielle santé CNIL'),
  gnewsFr('IA établissements de santé HAS'),
  gnewsFr('IA hôpitaux patients soignants'),
  gnewsFr('intelligence artificielle santé when:30d'),
  gnewsFr('IA infirmiers hôpital'),
  gnewsFr('CNIL IA données de santé'),
  gnewsFr('règlement européen IA santé'),
  gnewsFr('numérique en santé IA stratégie'),
  gnewsFr('ANSM dispositif médical intelligence artificielle'),
  gnewsFr('CHU intelligence artificielle'),
  gnewsFr('AP-HP intelligence artificielle'),
);

// ── 2026-11-14 추가: 건강·기술 섹션 피드(응답 확인) ─────────────────────
const more = (ed, list) => EDITIONS[ed].sources.push(...list.map(([n, u, t, x]) => rss(n, u, t, x || {})));
more('ja', [
  ['ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/enterprise.xml', 'tech'],
  ['ITmedia', 'https://rss.itmedia.co.jp/rss/2.0/news_industry.xml', 'tech'],
  ['Impress Watch', 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf', 'tech'],
  ['日経クロステック', 'https://xtech.nikkei.com/rss/xtech-it.rdf', 'tech'],
  ['東洋経済オンライン', 'https://toyokeizai.net/list/feed/rss', 'general'],
  ['現代ビジネス', 'https://gendai.media/list/feed/rss', 'general'],
  ['PRESIDENT Online', 'https://president.jp/list/rss', 'general'],
  ['Engadget 日本版', 'https://www.engadget.com/rss.xml', 'tech'],
]);
more('ru', [
  ['Zdrav.ru', 'https://www.zdrav.ru/rss/rss.xml', 'health'],
  ['Фармвестник', 'https://pharmvestnik.ru/rss/rss.xml', 'health'],
  ['Ведомости', 'https://www.vedomosti.ru/rss/rubric/technology', 'general'],
  ['Ведомости', 'https://www.vedomosti.ru/rss/rubric/society', 'general'],
  ['Независимая газета', 'https://www.ng.ru/rss/', 'general'],
  ['Московский комсомолец', 'https://www.mk.ru/rss/index.xml', 'general'],
  ['Комсомольская правда', 'https://www.kp.ru/rss/allsections.xml', 'general'],
  ['Коммерсантъ', 'https://www.kommersant.ru/RSS/section-society.xml', 'general'],
  ['ТАСС', 'https://tass.ru/rss/v2.xml?sections=OTI%3D', 'general'],
]);
more('id', [
  ['Okezone', 'https://sindikasi.okezone.com/index.php/rss/12/RSS2.0', 'health'],
  ['CNBC Indonesia', 'https://www.cnbcindonesia.com/tech/rss', 'tech'],
  ['CNBC Indonesia', 'https://www.cnbcindonesia.com/lifestyle/rss', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/humaniora.xml', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/ekonomi.xml', 'general'],
  ['Sindonews', 'https://www.sindonews.com/feed', 'general'],
  ['JPNN', 'https://www.jpnn.com/rss', 'general'],
  ['Viva', 'https://www.viva.co.id/get/all', 'general'],
]);
more('tw', [
  ['自由時報', 'https://news.ltn.com.tw/rss/business.xml', 'general'],
  ['iThome', 'https://www.ithome.com.tw/rss/category/ai', 'tech'],
  ['科技新報', 'https://technews.tw/tag/ai/feed/', 'tech'],
]);
more('en', [
  ['STAT', 'https://www.statnews.com/category/health-tech/feed/', 'health'],
  ['STAT', 'https://www.statnews.com/topic/artificial-intelligence/feed/', 'health'],
  ['MedCity News', 'https://medcitynews.com/tag/artificial-intelligence/feed/', 'health'],
  ['HIT Consultant', 'https://hitconsultant.net/tag/artificial-intelligence/feed/', 'health'],
  ['TechCrunch', 'https://techcrunch.com/tag/healthcare/feed/', 'health'],
  ['JAMA Network', 'https://jamanetwork.com/rss/site_3/67.xml', 'health'],
  ['Federal Register', 'https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bterm%5D=artificial+intelligence+health', 'gov'],
]);
more('in', [
  ['Analytics India Magazine', 'https://analyticsindiamag.com/category/ai-origins/feed/', 'tech'],
  ['The Hindu', 'https://www.thehindu.com/topic/artificial-intelligence/feeder/default.rss', 'general'],
  ['Express Healthcare', 'https://www.expresshealthcare.in/?s=AI&feed=rss2', 'health'],
  ['Medical Dialogues', 'https://medicaldialogues.in/feed', 'health', { maxAgeDays: 120 }],
]);
more('sg', [
  ['The Straits Times', 'https://www.straitstimes.com/tags/healthcare/rss.xml', 'health'],
  ['The Straits Times', 'https://www.straitstimes.com/tags/artificial-intelligence/rss.xml', 'general'],
  ['Business Times', 'https://www.businesstimes.com.sg/rss/technology', 'general'],
  ['Business Times', 'https://www.businesstimes.com.sg/rss/companies-markets', 'general'],
]);

// ── 2026-11-15 추가: 인도네시아·싱가포르·대만 출처 확대(전부 이 환경에서 응답 확인) ─────────────
more('id', [
  ['ANTARA', 'https://www.antaranews.com/rss/ekonomi-bisnis.xml', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/hukum.xml', 'general'],
  ['CNBC Indonesia', 'https://www.cnbcindonesia.com/news/rss', 'general'],
  ['CNBC Indonesia', 'https://www.cnbcindonesia.com/entrepreneur/rss', 'general'],
  ['CNBC Indonesia', 'https://www.cnbcindonesia.com/research/rss', 'general'],
  ['CNN Indonesia', 'https://www.cnnindonesia.com/ekonomi/rss', 'general'],
  ['CNN Indonesia', 'https://www.cnnindonesia.com/internasional/rss', 'general'],
  ['CNN Indonesia', 'https://www.cnnindonesia.com/edukasi/rss', 'general'],
  ['Liputan6', 'https://feed.liputan6.com/rss/news', 'general'],
  ['Liputan6', 'https://feed.liputan6.com/rss/bisnis', 'general'],
  ['Liputan6', 'https://feed.liputan6.com/rss/global', 'general'],
  ['Liputan6', 'https://feed.liputan6.com/rss/regional', 'general'],
  ['Liputan6', 'https://feed.liputan6.com/rss/lifestyle', 'general'],
  ['Okezone', 'https://sindikasi.okezone.com/index.php/rss/11/RSS2.0', 'general'],
  ['Okezone', 'https://sindikasi.okezone.com/index.php/rss/1/RSS2.0', 'general'],
  ['Republika', 'https://www.republika.co.id/rss/nasional', 'general'],
  ['Republika', 'https://www.republika.co.id/rss/ekonomi', 'general'],
  ['Republika', 'https://www.republika.co.id/rss/khazanah', 'general'],
  ['Republika', 'https://www.republika.co.id/rss/internasional', 'general'],
  ['Tempo', 'https://rss.tempo.co/nasional', 'general'],
  ['Tempo', 'https://rss.tempo.co/bisnis', 'general'],
  ['Kontan', 'https://nasional.kontan.co.id/rss', 'general'],
  ['Kumparan', 'https://lapi.kumparan.com/v2.0/rss/', 'general'],
  ['RRI', 'https://www.rri.co.id/rss', 'general'],
  ['Selular.ID', 'https://selular.id/feed/', 'tech'],
  ['Media Indonesia', 'https://mediaindonesia.com/feed', 'general'],
]);
more('sg', [
  ['CNA', 'https://www.channelnewsasia.com/rssfeeds/8396082', 'general'],
  ['CNA', 'https://www.channelnewsasia.com/rssfeeds/8395744', 'general'],
  ['CNA', 'https://www.channelnewsasia.com/rssfeeds/8395954', 'general'],
  ['The Straits Times', 'https://www.straitstimes.com/news/opinion/rss.xml', 'general'],
  ['The Straits Times', 'https://www.straitstimes.com/tags/hospitals/rss.xml', 'health'],
  ['Business Times', 'https://www.businesstimes.com.sg/rss/opinion-features', 'general'],
  ['Business Times', 'https://www.businesstimes.com.sg/rss/asean', 'general'],
  ['Business Times', 'https://www.businesstimes.com.sg/rss/technology', 'general'],
  ['Asian Scientist Magazine', 'https://www.asianscientist.com/feed/', 'tech'],
  ['NUS News', 'https://news.nus.edu.sg/feed/', 'general'],
  // RSS <title>이 부제 문장이라 pageTitle: 통과한 항목만 기사 페이지에서 진짜 제목을 읽는다
  ['Healthcare Asia', 'https://www.healthcareasiamagazine.com/rss.xml', 'health', { pageTitle: true }],
]);
more('tw', [
  ['自由時報', 'https://news.ltn.com.tw/rss/politics.xml', 'general'],
  ['自由時報', 'https://news.ltn.com.tw/rss/society.xml', 'general'],
  ['自由時報', 'https://news.ltn.com.tw/rss/local.xml', 'general'],
  ['自由時報', 'https://news.ltn.com.tw/rss/opinion.xml', 'general'],
  ['自由時報', 'https://news.ltn.com.tw/rss/world.xml', 'general'],
  ['中央社', 'https://feeds.feedburner.com/rsscna/politics', 'general'],
  ['中央社', 'https://feeds.feedburner.com/rsscna/social', 'general'],
  ['中央社', 'https://feeds.feedburner.com/rsscna/local', 'general'],
  ['中央社', 'https://feeds.feedburner.com/rsscna/intworld', 'general'],
  ['中央社', 'https://feeds.feedburner.com/rsscna/culture', 'general'],
  ['ETtoday', 'https://feeds.feedburner.com/ettoday/finance', 'general'],
  ['ETtoday', 'https://feeds.feedburner.com/ettoday/society', 'general'],
  ['經濟日報', 'https://money.udn.com/rssfeed/news/1001/12017?ch=money', 'general'],
  ['經濟日報', 'https://money.udn.com/rssfeed/news/1001/5590?ch=money', 'general'],
  ['經濟日報', 'https://money.udn.com/rssfeed/news/1001/5588?ch=money', 'general'],
  ['Heho健康', 'https://heho.com.tw/feed', 'health'],
  ['科技新報', 'https://finance.technews.tw/feed/', 'tech'],
  ['新頭殼', 'https://newtalk.tw/rss/all', 'general'],
  ['中央廣播電臺', 'https://www.rti.org.tw/rss', 'general'],
  ['報導者', 'https://www.twreporter.org/a/rss2.xml', 'general'],
  ['衛生福利部', 'https://www.mohw.gov.tw/rss-17-1.html', 'gov'],
  ['衛生福利部', 'https://www.mohw.gov.tw/rss-18-1.html', 'gov'],
]);

// ── 2026-11-15 추가(인도네시아 2차): detik 계열·의료 단체·학술 매체 ──────────────────────────
more('id', [
  ['detikHealth', 'https://health.detik.com/rss', 'health'],
  ['detikInet', 'https://inet.detik.com/rss', 'tech'],
  ['detikNews', 'https://news.detik.com/rss', 'general'],
  ['detikFinance', 'https://finance.detik.com/rss', 'general'],
  ['detikEdu', 'https://www.detik.com/edu/rss', 'general'],
  ['detikJabar', 'https://www.detik.com/jabar/rss', 'general'],
  ['detikJatim', 'https://www.detik.com/jatim/rss', 'general'],
  ['detikJateng', 'https://www.detik.com/jateng/rss', 'general'],
  ['detikSulsel', 'https://www.detik.com/sulsel/rss', 'general'],
  ['detikSumut', 'https://www.detik.com/sumut/rss', 'general'],
  ['detikBali', 'https://www.detik.com/bali/rss', 'general'],
  ['KARS', 'https://kars.or.id/feed/', 'health'],
  ['PORMIKI', 'https://www.pormiki.or.id/feed/', 'health'],
  ['The Conversation Indonesia', 'https://theconversation.com/id/articles.atom', 'general'],
  ['Kontan', 'https://industri.kontan.co.id/rss', 'general'],
  ['iNews', 'https://www.inews.id/feed', 'general'],
  ['Warta Ekonomi', 'https://wartaekonomi.co.id/rss', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/top-news.xml', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/lifestyle.xml', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/metro.xml', 'general'],
  ['ANTARA', 'https://www.antaranews.com/rss/ekonomi-finansial.xml', 'general'],
]);
