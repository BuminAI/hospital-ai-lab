// 일본어·러시아어·인도네시아어·대만어판 연재 시리즈 정의 (2026-09-20 신설).
//
// 한국어판(src/data/series.ts)과 같은 구조다. 새 글을 쓰지 않고, 그 언어판에 이미
// 발행된 글만 읽는 순서대로 묶는다. 글 ID는 각 언어판 콘텐츠 폴더의 파일명(확장자 제외).
//
// ⚠️ 언어판 글은 번역이 아니라 독립 집필이라 언어 사이에 짝이 없다. 시리즈도 언어판마다
//    따로 정의하고, 서로 다른 언어판을 hreflang으로 잇지 않는다.
// ⚠️ 글이 3편 이상 모이는 주제만 시리즈로 만든다(2편짜리는 목록이 빈약해 보인다).
// ⚠️ 없는 글 ID를 적으면 빌드가 실패한다(src/utils/series.ts).
// ⚠️ 시리즈 소개문은 글 내용을 요약할 뿐, 글에 없는 사실을 새로 주장하지 않는다.
import type { SeriesDef } from './series';
import type { Loc } from '../utils/locale';

export const seriesLocales: Record<Exclude<Loc, 'ko'>, SeriesDef[]> = {
  ja: [
    {
      slug: 'ai-devices-and-rules',
      title: 'AI医療機器と制度',
      description:
        'AI医療機器を院内に入れる前に、事務部門が押さえておきたい制度の話をまとめました。学習し続けるAIの変更計画、AIの結果と医師法の関係、プログラム医療機器の報酬、サイバーセキュリティの基準を読む順に並べています。',
      checklist: { href: '/ja/checklist/', label: 'AI導入の点検表' },
      postIds: [
        '2026-08-20-samd-idaten-review-body-reform',
        '2026-08-31-ai-shindan-ishiho-17jo-tsuchi',
        '2026-09-03-program-iryokiki-shido-kanri-ryo',
        '2026-09-18-samd-kihon-yoken-cybersecurity',
        '2026-09-17-healthcare-ax-dx-suishin-honbu-byoin-imi',
      ],
    },
    {
      slug: 'medical-data-security',
      title: '医療情報の取り扱いと安全管理',
      description:
        '院内のデータをAIやクラウドで扱うときの確認点をまとめました。仮名加工情報と匿名加工情報の違い、次世代医療基盤法の本人通知、安全管理ガイドライン、厚生労働省の注意喚起を取り上げます。',
      postIds: [
        '2026-08-29-kameikako-tokumeikako-joho',
        '2026-08-28-jisedai-iryo-kiban-ho-honnin-tsuchi',
        '2026-08-30-anzen-kanri-guideline-gaibu-itaku-ai',
        '2026-08-24-koseino-ai-cybersecurity-tsuchi',
      ],
    },
    {
      slug: 'subsidies-and-fees',
      title: '補助金・診療報酬のお知らせ',
      description:
        '医療機関が申請できる補助金や、診療報酬の改定に関するお知らせをまとめました。締切のある記事は、公開時点の情報です。申請の前に、必ず公式の公募要領で最新の内容を確認してください。',
      postIds: [
        '2026-08-26-ishiji-jimu-hojo-kasan-seiseiai',
        '2026-08-27-tokyo-ai-katsuyo-hojokin',
        '2026-09-12-ai-katsuyo-sokushin-jigyo-shime-9-30',
        '2026-09-05-cybersecurity-hojokin-shime-9-11',
        '2026-09-15-emr-donyu-consultant-hojokin',
        '2026-09-20-tokyo-iryo-dx-jinzai-ikusei-hojokin',
      ],
    },
  ],

  ru: [
    {
      slug: 'regulation-and-registration',
      title: 'Регулирование и регистрация ИИ',
      description:
        'Как проверить, зарегистрирован ли ИИ-инструмент, что меняет закон об ИИ, как устроены испытания и оценка медицинского ИИ. Статьи расположены в порядке, удобном для чтения.',
      checklist: { href: '/ru/checklist/', label: 'Чек-лист оценки ИИ-решения' },
      postIds: [
        '2026-08-13-registraciya-ii-medizdelie-postanovlenie-1684',
        '2026-08-13-zakon-ob-ii-gost-r-72484',
        '2026-08-28-gost-r-59921-ispytaniya-medicinskogo-ii',
        '2026-09-13-pyatietapnaya-sistema-proverki-ii',
        '2026-09-05-niiozmm-otsenka-ii-realnoy-praktiki',
      ],
    },
    {
      slug: 'data-and-security',
      title: 'Данные и безопасность',
      description:
        'Персональные данные пациентов, критическая информационная инфраструктура, обезличивание данных и новые риски при работе с ИИ-сервисами: что стоит проверить административному персоналу.',
      postIds: [
        '2026-08-13-152-fz-lokalizaciya-dannykh-ii',
        '2026-08-21-fstek-prikaz-117-gosudarstvennye-uchrezhdeniya',
        '2026-08-31-medicinskie-sistemy-ii-rezhim-kii-187-fz',
        '2026-09-12-prikaz-140-obezlichivanie-dannykh-dlya-ii',
        '2026-09-17-hakery-podmenyayut-user-agent-ii-servisov',
        '2026-09-20-prava-ii-agenta-zapret-modeli-nedostatochen',
      ],
    },
    {
      slug: 'ai-in-russian-practice',
      title: 'ИИ в российской практике',
      description:
        'Что происходит с ИИ в российском здравоохранении: платформа «Здоровье», ИИ в ЕГИСЗ, протоколы приёма в московских поликлиниках, тарифы и государственные закупки. Каждая статья опирается на открытые источники.',
      postIds: [
        '2026-08-27-natsionalnaya-tsifrovaya-platforma-zdorove-ii',
        '2026-08-29-egisz-ai-consultant-pilot',
        '2026-09-10-ii-pomoshnik-protokoly-priema-moskva',
        '2026-08-24-ffoms-ii-luchevaya-diagnostika-nagruzka-rentgenologov',
        '2026-09-18-moskva-tarify-ii-analiz-snimkov',
        '2026-08-23-gosudarstvennye-investicii-infrastruktura-ii-zdravoohranenie',
      ],
    },
  ],

  id: [
    {
      slug: 'satusehat-and-rme',
      title: 'SATUSEHAT dan Rekam Medis Elektronik',
      description:
        'Apa yang berubah bagi fasilitas kesehatan setelah RME diwajibkan dan SATUSEHAT berjalan: klaim JKN, akses data pasien, dan akses saat darurat. Disusun menurut urutan baca yang disarankan.',
      checklist: { href: '/id/checklist/', label: 'Daftar periksa penilaian AI' },
      postIds: [
        '2026-09-06-seb-rme-satusehat-klaim-jkn',
        '2026-09-12-uu-pdp-keamanan-akses-rme-wajib',
        '2026-09-13-satusehat-rme-akses-darurat',
      ],
    },
    {
      slug: 'assessing-ai-and-technology',
      title: 'Menilai AI dan teknologi untuk rumah sakit',
      description:
        'Hal yang perlu dicek sebelum rumah sakit menerima tawaran AI atau kerja sama teknologi: kesiapan skrining, kerja sama yang cakupannya luas, dampak AI di sisi klaim, risiko privasi saat staf memakai AI, dan status kebijakan AI nasional.',
      postIds: [
        '2026-09-10-skrining-tbc-ai-rontgen-tindak-lanjut',
        '2026-09-15-mou-persi-indosat-menilai-tawaran-teknologi',
        '2026-09-17-bpjs-ai-deteksi-fraud-jkn-efek-rs',
        '2026-09-18-risiko-foto-ai-data-pribadi-spesifik',
        '2026-09-20-perpres-peta-jalan-ai-belum-terbit-rumah-sakit',
      ],
    },
  ],

  tw: [
    {
      slug: 'ai-device-regulation',
      title: 'AI 與醫療器材法規',
      description:
        '廠商說「只是軟體」時該怎麼查、AI 醫療器材的查驗登記與風險分級、衛福部的生成式 AI 指引與施行細則預告，以及美國 FDA 的討論文件。依建議的閱讀順序排列。',
      checklist: { href: '/tw/checklist/', label: 'AI 導入評估檢核表' },
      postIds: [
        '2026-09-06-ai-gongju-shifou-yiliao-qicai',
        '2026-09-10-ai-yiliao-qicai-chayan-dengji-fengxian-fenji',
        '2026-09-07-weishengfuli-bu-shengchengshi-ai-zhiyin',
        '2026-09-13-lifayuan-houshenghui-ai-yiliao-xize',
        '2026-09-09-meiguo-fda-shengchengshi-ai-yiliao-qicai-taolun',
      ],
    },
    {
      slug: 'patient-records-and-data',
      title: '病歷與病人資料',
      description:
        '把病人資料交給 AI 廠商前該先確認什麼、電子病歷的六種機制、AI 病歷摘要容易漏掉的細節、醫院內部的「影子 AI」風險，以及衛福部推動的 FHIR 資料交換。',
      postIds: [
        '2026-09-06-bingren-ziliao-ge-zi-fa-di-liu-tiao',
        '2026-09-06-dianzi-binli-liu-zhong-jizhi',
        '2026-09-12-ai-bingli-zhaiyao-chang-loudiao-de-feiyuyan-xijie',
        '2026-09-15-yiyuan-yingzi-ai-fengxian',
        '2026-09-17-weifubu-fhir-ziliao-jiaohuan-shenbing-ai',
      ],
    },
    {
      slug: 'before-procurement',
      title: '採購與合作前的評估',
      description:
        '院方在採購 AI 產品或與廠商合作之前，行政端可以先確認的事：產品是否屬於醫療器材、採購前的評估重點，以及遠距醫療合作要先看懂的辦法。',
      postIds: [
        '2026-09-06-ai-gongju-shifou-yiliao-qicai',
        '2026-09-18-huashuo-xhis-maestro-yiyuan-caigou',
        '2026-09-20-tongxun-zhencha-zhiliao-banfa-xingzheng-queren',
      ],
    },
  ],
};
