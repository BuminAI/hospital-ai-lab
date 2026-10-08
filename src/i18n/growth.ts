// 연재 시리즈·점검표·구독 안내의 언어별 문구 (2026-09-20 신설).
//
// 언어판마다 JSON을 따로 고치지 않고 이 파일 하나에서 다섯 언어를 함께 관리한다.
// 그래야 "한 언어판에만 문구가 빠지거나 다른 언어판 말이 남는" 사고(메모리
// locale-clone-foreign-text-trap)를 눈으로 대조하기 쉽다.
//
// ⚠️ 구독 안내는 **메일을 약속하지 않는다**(ko의 EMAIL_NEWSLETTER_LIVE 참고).
//    비한국어판에는 회원가입·메일 발송 자체가 없으므로 RSS만 안내한다.
// ⚠️ 문장을 고칠 때는 다섯 언어의 뜻이 같은지 함께 볼 것.
import type { Loc } from '../utils/locale';

export interface GrowthStrings {
  /** 푸터·브레드크럼에 쓰는 이름 */
  seriesName: string;
  hub: {
    title: string;
    lead: string;
    metaDescription: string;
    count: (n: number) => string;
    latest: string;
    firstPost: string;
    viewList: string;
  };
  detail: {
    back: string;
    order: (n: number) => string;
    relatedChecklist: string;
    metaSuffix: (n: number) => string;
  };
  box: { heading: string; prev: string; next: string; all: string };
  subscribe: {
    title: (context?: string) => string;
    body: string;
    rss: string;
  };
  checklist: {
    progress: (done: string, total: number) => string;
    reset: string;
    print: string;
    related: string;
  };
  home: { title: string; more: string };
}

const ruPlural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

export const growth: Record<Loc, GrowthStrings> = {
  ko: {
    seriesName: '연재 시리즈',
    hub: {
      title: '연재 시리즈',
      lead: '한 편씩 읽어도 되지만, 주제별로 이어 읽으면 판단 기준이 더 분명해집니다. 병원 행정·간호 실무자가 자주 마주치는 질문을 시리즈로 묶었습니다. 각 시리즈는 권장 읽기 순서대로 정렬돼 있습니다.',
      metaDescription:
        '병원 행정·간호 실무자를 위한 의료 AI 글을 주제별 연재로 묶었습니다. AI 제안서 검토, 환자정보와 AI, 업무 도구 활용, 제도 소식을 읽는 순서대로 볼 수 있습니다.',
      count: (n) => `글 ${n}편`,
      latest: '최근',
      firstPost: '첫 글부터 읽기',
      viewList: '목록 보기',
    },
    detail: {
      back: '← 연재 시리즈',
      order: (n) => `글 ${n}편 · 아래 순서대로 읽으시길 권합니다.`,
      relatedChecklist: '이어서 쓰기 좋은 점검표:',
      metaSuffix: (n) => `글 ${n}편을 읽는 순서대로 모았습니다.`,
    },
    box: { heading: '이 글이 속한 연재', prev: '← 이전 글', next: '다음 글 →', all: '연재 시리즈 전체 보기' },
    subscribe: {
      title: (c = '새 글') => `${c}을 놓치지 않으려면`,
      body: '병원 행정·간호 실무자를 위한 의료 AI 글을 날마다 올립니다. RSS 리더에 등록해 두면 새 글이 바로 도착하고, 회원가입하시면 실무자용 강의노트도 볼 수 있습니다.',
      rss: 'RSS로 구독',
    },
    checklist: {
      progress: (d, t) => `${d} / ${t} 항목 확인`,
      reset: '처음부터 다시',
      print: '인쇄 · PDF 저장',
      related: '함께 읽을 글',
    },
    home: { title: '주제별로 이어 읽기', more: '연재 시리즈 전체 보기 →' },
  },

  ja: {
    seriesName: '連載シリーズ',
    hub: {
      title: '連載シリーズ',
      lead: '記事は1本ずつ読んでもかまいませんが、テーマごとに続けて読むと判断の基準がはっきりします。日本の医療機関の事務・看護部門が、AI導入の場面で確認することの多い論点をシリーズにまとめました。各シリーズは読む順に並べてあります。',
      metaDescription:
        '病院の事務・看護部門向けに、医療AIの記事をテーマ別の連載にまとめました。AI医療機器と制度、医療情報の取り扱い、補助金のお知らせを、読む順に追えます。',
      count: (n) => `全${n}本`,
      latest: '最新',
      firstPost: '最初の記事から読む',
      viewList: '記事一覧を見る',
    },
    detail: {
      back: '← 連載シリーズ',
      order: (n) => `全${n}本 · 上から順に読むことをおすすめします。`,
      relatedChecklist: 'あわせて使いたい点検表:',
      metaSuffix: (n) => `全${n}本を読む順にまとめました。`,
    },
    box: { heading: 'この記事が属する連載', prev: '← 前の記事', next: '次の記事 →', all: '連載シリーズをすべて見る' },
    subscribe: {
      title: (c = '新着記事') => `${c}を逃さないために`,
      body: '病院の事務・看護部門向けに、医療AIの記事を新しく公開しています。RSSリーダーに登録しておくと、新着記事がすぐに届きます。',
      rss: 'RSSで購読',
    },
    checklist: {
      progress: (d, t) => `${d} / ${t} 項目を確認`,
      reset: '最初からやり直す',
      print: '印刷・PDF保存',
      related: 'あわせて読みたい記事',
    },
    home: { title: 'テーマ別に続けて読む', more: '連載シリーズをすべて見る →' },
  },

  ru: {
    seriesName: 'Серии статей',
    hub: {
      title: 'Серии статей',
      lead: 'Статьи можно читать по одной, но в тематических сериях критерии оценки складываются в цельную картину. Мы собрали вопросы, которые чаще всего возникают у административного и сестринского персонала российских больниц при внедрении ИИ. Внутри серии статьи идут в рекомендуемом порядке чтения.',
      metaDescription:
        'Статьи об ИИ в медицине для административного и сестринского персонала больниц, собранные в тематические серии: регулирование и регистрация, данные и безопасность, ИИ в российской практике.',
      count: (n) => `${n} ${ruPlural(n, 'статья', 'статьи', 'статей')}`,
      latest: 'Последняя',
      firstPost: 'Читать с первой статьи',
      viewList: 'Список статей',
    },
    detail: {
      back: '← Серии статей',
      order: (n) => `${n} ${ruPlural(n, 'статья', 'статьи', 'статей')} · рекомендуем читать в указанном порядке.`,
      relatedChecklist: 'Чек-лист к теме:',
      metaSuffix: (n) => `${n} ${ruPlural(n, 'статья', 'статьи', 'статей')} в порядке чтения.`,
    },
    box: { heading: 'Эта статья входит в серию', prev: '← Предыдущая', next: 'Следующая →', all: 'Все серии' },
    subscribe: {
      title: (c = 'новые статьи') => `Как не пропустить ${c}`,
      body: 'Мы регулярно публикуем материалы об ИИ в медицине для административного и сестринского персонала больниц. Добавьте RSS-ленту в читалку — новые статьи будут приходить сразу.',
      rss: 'Подписаться по RSS',
    },
    checklist: {
      progress: (d, t) => `Отмечено ${d} из ${t}`,
      reset: 'Начать заново',
      print: 'Печать / сохранить в PDF',
      related: 'Читайте также',
    },
    home: { title: 'Читать по темам', more: 'Все серии →' },
  },

  id: {
    seriesName: 'Seri Artikel',
    hub: {
      title: 'Seri Artikel',
      lead: 'Artikel boleh dibaca satu per satu, tetapi jika dibaca berurutan per topik, kriteria penilaiannya menjadi lebih jelas. Kami mengelompokkan pertanyaan yang paling sering muncul bagi staf administrasi dan keperawatan rumah sakit di Indonesia saat menilai AI dan teknologi digital. Di dalam tiap seri, artikel disusun menurut urutan baca yang disarankan.',
      metaDescription:
        'Artikel tentang AI di bidang kesehatan untuk staf administrasi dan keperawatan rumah sakit, dikelompokkan per topik: SATUSEHAT dan RME, serta cara menilai AI dan teknologi untuk rumah sakit.',
      count: (n) => `${n} artikel`,
      latest: 'Terbaru',
      firstPost: 'Mulai dari artikel pertama',
      viewList: 'Lihat daftar artikel',
    },
    detail: {
      back: '← Seri Artikel',
      order: (n) => `${n} artikel · disarankan dibaca sesuai urutan di bawah.`,
      relatedChecklist: 'Daftar periksa terkait:',
      metaSuffix: (n) => `${n} artikel menurut urutan baca.`,
    },
    box: { heading: 'Artikel ini bagian dari seri', prev: '← Sebelumnya', next: 'Berikutnya →', all: 'Lihat semua seri' },
    subscribe: {
      title: (c = 'artikel baru') => `Agar tidak ketinggalan ${c}`,
      body: 'Kami rutin menerbitkan artikel tentang AI di bidang kesehatan untuk staf administrasi dan keperawatan rumah sakit. Daftarkan umpan RSS di pembaca RSS Anda agar artikel baru langsung sampai.',
      rss: 'Berlangganan lewat RSS',
    },
    checklist: {
      progress: (d, t) => `${d} dari ${t} butir dicentang`,
      reset: 'Mulai dari awal',
      print: 'Cetak / simpan PDF',
      related: 'Bacaan terkait',
    },
    home: { title: 'Baca berurutan per topik', more: 'Semua seri →' },
  },

  tw: {
    seriesName: '系列專欄',
    hub: {
      title: '系列專欄',
      lead: '文章可以單篇閱讀，但依主題連著讀，判斷標準會更清楚。我們把臺灣醫院行政與護理人員在評估 AI 時最常遇到的問題整理成系列，每個系列依建議的閱讀順序排列。',
      metaDescription:
        '為醫院行政與護理人員整理的醫療 AI 專欄，依主題編成系列：AI 與醫療器材法規、病歷與病人資料、採購與合作前的評估。',
      count: (n) => `共 ${n} 篇`,
      latest: '最新',
      firstPost: '從第一篇開始讀',
      viewList: '查看文章列表',
    },
    detail: {
      back: '← 系列專欄',
      order: (n) => `共 ${n} 篇 · 建議依下列順序閱讀。`,
      relatedChecklist: '搭配使用的檢核表：',
      metaSuffix: (n) => `共 ${n} 篇，依閱讀順序排列。`,
    },
    box: { heading: '這篇文章所屬的系列', prev: '← 上一篇', next: '下一篇 →', all: '查看所有系列' },
    subscribe: {
      title: (c = '新文章') => `不錯過${c}`,
      body: '我們持續為醫院行政與護理人員發布醫療 AI 相關文章。把 RSS 加入閱讀器，新文章就會第一時間送達。',
      rss: '以 RSS 訂閱',
    },
    checklist: {
      progress: (d, t) => `已確認 ${d} / ${t} 項`,
      reset: '重新開始',
      print: '列印／另存 PDF',
      related: '延伸閱讀',
    },
    home: { title: '依主題連續閱讀', more: '查看所有系列 →' },
  },
};
