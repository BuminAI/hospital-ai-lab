// 각 언어판 '의료 기술·논문' 페이지의 화면 문구 (2026-11-14, 오너 지시). 데이터는 src/data/research/<언어판>.json (scripts/fetch-research.mjs가 수집).
// 논문·시험 제목은 원문(대부분 영어)이다. 화면 문구만 언어별로 다르다.
import type { Loc } from '../../utils/locale';

export interface ResearchStrings {
  nav: string;
  metaTitle: string;
  h1: string;
  metaDescription: string;
  lead: string;
  window: (from: string, to: string) => string;
  noteTitle: string;
  note: string[];
  sections: Record<'surgery' | 'drug' | 'trials' | 'disease', { title: string; desc: string }>;
  count: (shown: number, total: number) => string;
  phase: string;
  sponsor: string;
  started: string;
  conditions: string;
  intervention: string;
  empty: string;
  source: string;
  titlesNote: string;
}

const en = (country: string, adj: string): ResearchStrings => ({
  nav: 'Medical research',
  metaTitle: `Medical research from ${country}: last 12 months`,
  h1: `Medical technology and research in ${country}`,
  metaDescription: `Recent papers and clinical trials with ${adj} authors or sites in the last 12 months: surgical techniques, new drugs and therapies, and disease studies, collected automatically from PubMed and ClinicalTrials.gov.`,
  lead: `What is ${country} publishing and testing in medicine right now? This page collects papers whose author affiliations include ${country} and drug trials with sites there, all from the last 12 months, in three groups: surgical techniques, new drugs and therapies, and diseases.`,
  window: (from, to) => `Period: ${from} to ${to} · updated automatically every week`,
  noteTitle: 'How to read this page',
  note: [
    'This is an automatic list of titles, journals, dates and links from PubMed and ClinicalTrials.gov. We do not copy abstracts or article text, and we have not checked the findings.',
    'A paper or a trial existing is not evidence that a treatment works or is safe, and it is not medical advice. Ask your clinician about any treatment.',
    '“Papers from {country}” means at least one author affiliation mentions the country; it does not mean the whole study was done there.',
  ].map((s) => s.replace('{country}', country)),
  sections: {
    surgery: { title: 'Surgical techniques', desc: 'Minimally invasive, robot-assisted, endoscopic, joint replacement and transplant papers.' },
    drug: { title: 'New drugs and therapies (papers)', desc: 'Phase 1–3 and randomized trials of drugs, antibodies, vaccines and new therapies.' },
    trials: { title: 'Drug trials started in the last year', desc: 'Drug studies registered on ClinicalTrials.gov with a site in this country, newest first.' },
    disease: { title: 'Diseases and population studies', desc: 'Nationwide cohorts, registries and population-based studies on incidence and prevalence.' },
  },
  count: (shown, total) => `Showing the latest ${shown} of ${total.toLocaleString('en')} matches`,
  phase: 'Phase',
  sponsor: 'Sponsor',
  started: 'Started',
  conditions: 'Conditions',
  intervention: 'Drug / intervention',
  empty: 'Nothing found for this period yet.',
  source: 'Source',
  titlesNote: 'Titles are shown in their original language (mostly English).',
});

export const RESEARCH_STRINGS: Record<Loc, ResearchStrings> = {
  ko: {
    nav: '의료 기술·논문',
    metaTitle: '한국 의료 기술·논문: 최근 1년 수술·신약·질환',
    h1: '한국의 의료 기술과 학술·논문',
    metaDescription: '최근 1년 안에 한국 소속 저자가 발표한 논문과 한국에서 시작한 약물 임상시험을 수술 술기, 신약·치료제, 질환으로 나눠 PubMed와 ClinicalTrials.gov에서 자동으로 모았습니다.',
    lead: '한국의 의료진과 연구진은 지금 무엇을 발표하고 시험하고 있을까요? 저자 소속에 한국이 들어간 논문과 한국에 시험 장소가 있는 약물 시험 가운데 최근 1년 안의 것만 모아, 수술 술기·신약과 치료제·질환의 세 갈래로 보여 드립니다.',
    window: (from, to) => `기간: ${from} ~ ${to} · 매주 자동 갱신`,
    noteTitle: '이 페이지를 읽는 법',
    note: [
      'PubMed와 ClinicalTrials.gov의 제목·저널·날짜·링크만 자동으로 모은 목록입니다. 초록이나 본문은 옮기지 않았고, 연구 결과가 맞는지도 이 사이트가 확인하지 않았습니다.',
      '논문이나 시험이 있다는 것이 그 치료의 효과나 안전성을 뜻하지 않으며, 진료 조언도 아닙니다. 치료는 반드시 담당 의료진과 상의하세요.',
      '“한국 논문”은 저자 소속 중 한 곳 이상에 한국이 들어간 논문입니다. 연구 전체가 한국에서 이루어졌다는 뜻은 아닙니다.',
    ],
    sections: {
      surgery: { title: '수술 술기', desc: '최소침습·로봇 보조·내시경·인공관절·이식 등 수술 방법을 다룬 논문' },
      drug: { title: '신약·치료제 (논문)', desc: '약물·항체·백신·새 치료법의 1~3상 및 무작위 대조 시험 논문' },
      trials: { title: '최근 1년 안에 시작한 약물 시험', desc: 'ClinicalTrials.gov에 등록되고 한국에 시험 장소가 있는 약물 시험(최신순)' },
      disease: { title: '질환·인구 집단 연구', desc: '전국 코호트·등록 자료·인구 기반 연구로 본 발생률과 유병률' },
    },
    count: (shown, total) => `검색된 ${total.toLocaleString('ko')}건 중 최신 ${shown}건`,
    phase: '단계',
    sponsor: '주관 기관',
    started: '시작일',
    conditions: '대상 질환',
    intervention: '약물·중재',
    empty: '이 기간에는 아직 찾은 항목이 없습니다.',
    source: '출처',
    titlesNote: '제목은 원문(대부분 영어)으로 표시합니다.',
  },
  ja: {
    nav: '医療技術・論文',
    metaTitle: '日本の医療技術・論文：直近1年の手術・新薬・疾患',
    h1: '日本の医療技術と学術・論文',
    metaDescription: '直近1年に日本の所属の著者が発表した論文と日本に実施施設がある薬の治験を、手術手技・新薬と治療薬・疾患に分けて、PubMedとClinicalTrials.govから自動で集めました。',
    lead: '日本の医療者・研究者はいま何を発表し、何を試しているのでしょうか。著者の所属に日本が含まれる論文と、日本に実施施設がある薬の治験のうち、直近1年のものだけを集め、手術手技・新薬と治療薬・疾患の3つに分けて載せています。',
    window: (from, to) => `期間：${from}～${to} ・毎週自動更新`,
    noteTitle: 'このページの読み方',
    note: [
      'PubMedとClinicalTrials.govの題名・雑誌名・日付・リンクだけを自動で集めた一覧です。抄録や本文は転載しておらず、研究結果の正しさも当サイトでは確認していません。',
      '論文や治験があることは、その治療が効く・安全であることを意味せず、診療上の助言でもありません。治療は必ず担当の医療者に相談してください。',
      '「日本の論文」とは、著者の所属のいずれかに日本が含まれる論文です。研究の全体が日本で行われたという意味ではありません。',
    ],
    sections: {
      surgery: { title: '手術手技', desc: '低侵襲・ロボット支援・内視鏡・人工関節・移植などの手術方法に関する論文' },
      drug: { title: '新薬・治療薬（論文）', desc: '薬・抗体・ワクチン・新しい治療法の第1〜3相およびランダム化比較試験の論文' },
      trials: { title: '直近1年に始まった薬の治験', desc: 'ClinicalTrials.govに登録され、日本に実施施設がある薬の試験（新しい順）' },
      disease: { title: '疾患・集団研究', desc: '全国コホート・レジストリ・集団ベースの研究による発生率と有病率' },
    },
    count: (shown, total) => `該当${total.toLocaleString('ja')}件のうち最新${shown}件`,
    phase: '相',
    sponsor: '実施主体',
    started: '開始',
    conditions: '対象疾患',
    intervention: '薬・介入',
    empty: 'この期間はまだ見つかっていません。',
    source: '出典',
    titlesNote: '題名は原文（主に英語）のまま表示します。',
  },
  ru: {
    nav: 'Мед. технологии и наука',
    metaTitle: 'Медицина России: исследования за 12 месяцев',
    h1: 'Медицинские технологии и научные работы России',
    metaDescription: 'Свежие статьи авторов из России и клинические исследования препаратов с центрами в России за последние 12 месяцев: хирургические методики, новые препараты, заболевания. Автоматически из PubMed и ClinicalTrials.gov.',
    lead: 'Что сейчас публикуют и проверяют врачи и учёные России? Здесь собраны статьи, в аффилиациях авторов которых указана Россия, и исследования препаратов с центрами в России — только за последние 12 месяцев, в трёх группах: хирургические методики, новые препараты и терапия, заболевания.',
    window: (from, to) => `Период: ${from} — ${to} · обновляется автоматически раз в неделю`,
    noteTitle: 'Как читать эту страницу',
    note: [
      'Это автоматический список названий, журналов, дат и ссылок из PubMed и ClinicalTrials.gov. Мы не копируем рефераты и тексты статей и не проверяли выводы работ.',
      'Наличие статьи или исследования не доказывает, что лечение эффективно и безопасно, и не является медицинской рекомендацией. Любое лечение обсуждайте с врачом.',
      '«Статья из России» означает, что хотя бы в одной аффилиации автора указана Россия; это не значит, что всё исследование проведено там.',
    ],
    sections: {
      surgery: { title: 'Хирургические методики', desc: 'Малоинвазивные, робот-ассистированные, эндоскопические операции, эндопротезирование и трансплантация' },
      drug: { title: 'Новые препараты и терапия (статьи)', desc: 'Фазы 1–3 и рандомизированные исследования препаратов, антител, вакцин и новых методов' },
      trials: { title: 'Исследования препаратов, начатые за год', desc: 'Исследования препаратов в ClinicalTrials.gov с центром в России (сначала новые)' },
      disease: { title: 'Заболевания и популяционные исследования', desc: 'Общенациональные когорты, регистры и популяционные работы о заболеваемости и распространённости' },
    },
    count: (shown, total) => `Показаны последние ${shown} из ${total.toLocaleString('ru')}`,
    phase: 'Фаза',
    sponsor: 'Спонсор',
    started: 'Начало',
    conditions: 'Заболевания',
    intervention: 'Препарат / вмешательство',
    empty: 'За этот период пока ничего не найдено.',
    source: 'Источник',
    titlesNote: 'Названия показаны на языке оригинала (в основном английском).',
  },
  id: {
    nav: 'Teknologi & riset medis',
    metaTitle: 'Riset medis Indonesia: 12 bulan terakhir',
    h1: 'Teknologi medis dan riset di Indonesia',
    metaDescription: 'Makalah terbaru dengan penulis dari Indonesia dan uji klinis obat dengan lokasi di Indonesia dalam 12 bulan terakhir: teknik bedah, obat dan terapi baru, serta penyakit. Dikumpulkan otomatis dari PubMed dan ClinicalTrials.gov.',
    lead: 'Apa yang sedang diterbitkan dan diuji oleh dokter dan peneliti Indonesia? Halaman ini mengumpulkan makalah yang afiliasi penulisnya menyebut Indonesia dan uji klinis obat dengan lokasi di Indonesia, hanya dari 12 bulan terakhir, dalam tiga kelompok: teknik bedah, obat dan terapi baru, serta penyakit.',
    window: (from, to) => `Periode: ${from} sampai ${to} · diperbarui otomatis setiap minggu`,
    noteTitle: 'Cara membaca halaman ini',
    note: [
      'Ini daftar otomatis berisi judul, jurnal, tanggal, dan tautan dari PubMed dan ClinicalTrials.gov. Kami tidak menyalin abstrak atau isi makalah, dan belum memeriksa temuannya.',
      'Adanya makalah atau uji klinis bukan bukti bahwa suatu terapi berhasil atau aman, dan bukan nasihat medis. Bicarakan setiap terapi dengan tenaga kesehatan Anda.',
      '“Makalah dari Indonesia” berarti setidaknya satu afiliasi penulis menyebut Indonesia; bukan berarti seluruh studi dilakukan di sana.',
    ],
    sections: {
      surgery: { title: 'Teknik bedah', desc: 'Makalah tentang bedah invasif minimal, berbantuan robot, endoskopi, penggantian sendi, dan transplantasi' },
      drug: { title: 'Obat dan terapi baru (makalah)', desc: 'Uji fase 1–3 dan uji acak terkontrol untuk obat, antibodi, vaksin, dan terapi baru' },
      trials: { title: 'Uji obat yang dimulai setahun terakhir', desc: 'Uji obat terdaftar di ClinicalTrials.gov dengan lokasi di Indonesia (terbaru dulu)' },
      disease: { title: 'Penyakit dan studi populasi', desc: 'Kohort nasional, registri, dan studi berbasis populasi tentang insiden dan prevalensi' },
    },
    count: (shown, total) => `Menampilkan ${shown} terbaru dari ${total.toLocaleString('id')} hasil`,
    phase: 'Fase',
    sponsor: 'Sponsor',
    started: 'Mulai',
    conditions: 'Kondisi',
    intervention: 'Obat / intervensi',
    empty: 'Belum ada yang ditemukan untuk periode ini.',
    source: 'Sumber',
    titlesNote: 'Judul ditampilkan dalam bahasa aslinya (sebagian besar bahasa Inggris).',
  },
  tw: {
    nav: '醫療技術與論文',
    metaTitle: '臺灣醫療技術與論文：近一年手術、新藥、疾病',
    h1: '臺灣的醫療技術與學術論文',
    metaDescription: '近一年臺灣作者發表的論文，以及在臺灣設有試驗地點的藥物臨床試驗，依手術技術、新藥與療法、疾病分類，由 PubMed 與 ClinicalTrials.gov 自動彙整。',
    lead: '臺灣的醫師與研究人員現在發表了什麼、正在試驗什麼？本頁只收錄近一年內、作者單位含臺灣的論文，以及在臺灣設有試驗地點的藥物試驗，分成手術技術、新藥與療法、疾病三類。',
    window: (from, to) => `期間：${from} 至 ${to} · 每週自動更新`,
    noteTitle: '如何閱讀本頁',
    note: [
      '這是從 PubMed 與 ClinicalTrials.gov 自動彙整的標題、期刊、日期與連結清單。本站不轉載摘要或內文，也未查證研究結果。',
      '有論文或試驗，並不代表該療法有效或安全，也不是醫療建議。任何治療請務必與您的醫療人員討論。',
      '「臺灣論文」指作者單位至少有一處含臺灣，不代表整項研究都在臺灣進行。',
    ],
    sections: {
      surgery: { title: '手術技術', desc: '微創、機器人輔助、內視鏡、人工關節與移植等手術方法的論文' },
      drug: { title: '新藥與療法（論文）', desc: '藥物、抗體、疫苗與新療法的第一至三期及隨機對照試驗論文' },
      trials: { title: '近一年開始的藥物試驗', desc: '登錄於 ClinicalTrials.gov、在臺灣設有試驗地點的藥物試驗（由新到舊）' },
      disease: { title: '疾病與族群研究', desc: '全國性世代、登錄資料與族群研究所呈現的發生率與盛行率' },
    },
    count: (shown, total) => `符合 ${total.toLocaleString('zh-TW')} 筆，顯示最新 ${shown} 筆`,
    phase: '期別',
    sponsor: '主辦單位',
    started: '開始日期',
    conditions: '疾病',
    intervention: '藥物／介入',
    empty: '此期間尚未找到項目。',
    source: '出處',
    titlesNote: '標題以原文（多為英文）顯示。',
  },
  en: en('the United States', 'U.S.'),
  in: en('India', 'Indian'),
  sg: en('Singapore', 'Singapore-based'),
  ph: {
    nav: 'Medical research',
    metaTitle: 'Pananaliksik medikal ng Pilipinas: nakaraang taon',
    h1: 'Medical technology at pananaliksik sa Pilipinas',
    metaDescription: 'Mga kamakailang papel na may mga may-akdang Pilipino at mga clinical trial ng gamot na may lugar sa Pilipinas sa nakaraang 12 buwan: surgical technique, bagong gamot at therapy, at mga sakit. Awtomatikong kinolekta mula sa PubMed at ClinicalTrials.gov.',
    lead: 'Ano ang inilalathala at sinusubok ngayon ng mga doktor at mananaliksik sa Pilipinas? Kinokolekta ng pahinang ito ang mga papel na may kaakibat na institusyon sa Pilipinas sa mga may-akda at ang mga drug trial na may lugar doon, mula lamang sa nakaraang 12 buwan, sa tatlong pangkat: surgical technique, bagong gamot at therapy, at mga sakit.',
    window: (from, to) => `Panahon: ${from} hanggang ${to} · awtomatikong ina-update kada linggo`,
    noteTitle: 'Paano basahin ang pahinang ito',
    note: [
      'Awtomatikong listahan ito ng pamagat, journal, petsa at link mula sa PubMed at ClinicalTrials.gov. Hindi namin kinokopya ang abstract o teksto ng papel, at hindi pa namin sinusuri ang mga natuklasan.',
      'Hindi patunay na epektibo o ligtas ang isang gamutan ang pagkakaroon ng papel o trial, at hindi ito payong medikal. Kausapin ang inyong clinician tungkol sa anumang gamutan.',
      'Ang “papel mula sa Pilipinas” ay nangangahulugang hindi bababa sa isang kaakibat na institusyon ng may-akda ang nagbabanggit sa bansa; hindi ito nangangahulugang doon ginawa ang buong pag-aaral.',
    ],
    sections: {
      surgery: { title: 'Mga surgical technique', desc: 'Mga papel tungkol sa minimally invasive, robot-assisted, endoscopic, joint replacement at transplant' },
      drug: { title: 'Bagong gamot at therapy (mga papel)', desc: 'Phase 1–3 at randomized na pagsubok ng gamot, antibody, bakuna at bagong therapy' },
      trials: { title: 'Mga drug trial na nagsimula sa nakaraang taon', desc: 'Mga pag-aaral ng gamot na nakarehistro sa ClinicalTrials.gov na may lugar sa Pilipinas (pinakabago muna)' },
      disease: { title: 'Mga sakit at pag-aaral sa populasyon', desc: 'Mga nationwide cohort, registry at population-based na pag-aaral sa insidensya at prevalence' },
    },
    count: (shown, total) => `Ipinapakita ang pinakabagong ${shown} mula sa ${total.toLocaleString('en')} na tugma`,
    phase: 'Phase',
    sponsor: 'Sponsor',
    started: 'Nagsimula',
    conditions: 'Mga kondisyon',
    intervention: 'Gamot / interbensyon',
    empty: 'Wala pang nakita para sa panahong ito.',
    source: 'Sanggunian',
    titlesNote: 'Ipinapakita ang mga pamagat sa orihinal na wika (karamihan ay Ingles).',
  },
};

export const researchPath = (loc: Loc) => (loc === 'ko' ? '/research/' : `/${loc}/research/`);
