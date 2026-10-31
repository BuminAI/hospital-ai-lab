// 智慧醫療與 AI 規範年表 — /tw/dx-roadmap/ 與 /tw/calendar/ 共用的資料 (2026-10-31)
//
// ⚠️ 這裡的每一項事實，都來自 SRC 所列的一手資料，且是實際連線讀過原文後才寫的。
//    「預計」「將」這類字眼，原文或報導本來就是計畫而不是定案，畫面上也照樣標成計畫。
//    不要用推測補上日期或義務。更新時請重新讀一手資料，並改寫 CHECKED。
export const CHECKED = '2026 年 10 月 31 日';

export const SRC = {
  aiAct: {
    label: '全國法規資料庫《人工智慧基本法》',
    url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0160093',
  },
  cyberAct: {
    label: '全國法規資料庫《資通安全管理法》（含法規沿革）',
    url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030297',
  },
  cyberReport: {
    label: '全國法規資料庫《資通安全事件通報及應變辦法》',
    url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030305',
  },
  cyberLevel: {
    label: '全國法規資料庫《資通安全責任等級分級辦法》',
    url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0030304',
  },
  pdpa: {
    label: '全國法規資料庫《個人資料保護法》',
    url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021',
  },
  guideline: {
    label: '衛福部《醫療機構應用生成式人工智慧指引》（115 年 5 月 29 日衛部醫字第 1151663164 號函頒）',
    url: 'https://www.mohw.gov.tw/cp-18-86695-1.html',
  },
  fhir: {
    label: '衛福部新聞稿：衛福部完成全國醫療資料互通關鍵拼圖（115 年 5 月 26 日）',
    url: 'https://www.mohw.gov.tw/cp-2704-86614-1.html',
  },
  aimdOffice: {
    label: '衛福部：智慧醫療器材專案辦公室成立（110 年 5 月 7 日）',
    url: 'https://www.mohw.gov.tw/cp-5016-59558-1.html',
  },
  cna0806: {
    label: '中央社：立法院厚生會智慧醫療委員會成立報導（2026 年 8 月 6 日）',
    url: 'https://www.cna.com.tw/news/ahel/202608060301.aspx',
  },
} as const;

export type ThemeKey = 'ai' | 'data' | 'cyber' | 'device' | 'privacy';

export const THEMES: Record<ThemeKey, string> = {
  ai: 'AI 規範',
  data: '資料互通',
  cyber: '資通安全',
  device: '醫療器材',
  privacy: '個人資料',
};

export type Milestone = {
  /** 畫面上顯示的時間 */
  when: string;
  /** 排序用 (YYYY-MM) */
  sort: string;
  status: 'done' | 'ahead';
  theme: ThemeKey;
  title: string;
  body: string;
  src: keyof typeof SRC;
  /** 報導（非官方文件）依據的項目，畫面上會標示「報導」 */
  report?: boolean;
};

export const MILESTONES: Milestone[] = [
  // ── 已發生 ──────────────────────────────────────
  {
    when: '2021 年 5 月 7 日',
    sort: '2021-05',
    status: 'done',
    theme: 'device',
    title: '食藥署成立「智慧醫療器材專案辦公室」',
    body: '針對使用人工智慧或機器學習技術的醫療器材，提供單一窗口的輔導，協助業者了解醫療器材法規。',
    src: 'aimdOffice',
  },
  {
    when: '2025 年 9 月 24 日修正、12 月 1 日施行',
    sort: '2025-12',
    status: 'done',
    theme: 'cyber',
    title: '《資通安全管理法》全文修正並施行',
    body: '條文明定公務機關與特定非公務機關的定義、委外時要選任適當受託者並以書面契約約定（第 10 條）、資通安全長與維護計畫、事件通報與應變機制（第 24 條）。施行日由行政院訂為 114 年 12 月 1 日。',
    src: 'cyberAct',
  },
  {
    when: '2025 年 11 月 11 日公布（施行日未定）',
    sort: '2025-11',
    status: 'done',
    theme: 'privacy',
    title: '《個人資料保護法》修正公布，新增事故通報與安全維護規定',
    body: '總統於 2025 年 11 月 11 日令修正公布。法規資料庫標示最後生效日期未定，施行日期由行政院另定。',
    src: 'pdpa',
  },
  {
    when: '2025 年底',
    sort: '2025-12',
    status: 'done',
    theme: 'data',
    title: '長庚、馬偕、中山三大醫療體系完成跨院病歷互通',
    body: '衛福部新聞稿指出，採用國際標準 FHIR，並提出「FHIR Box」概念，在不中斷既有醫療資訊系統的前提下，透過資料中台互通。新聞稿沒有列出醫學中心以外各層級醫院的時程。',
    src: 'fhir',
  },
  {
    when: '2026 年 1 月 5 日、1 月 7 日',
    sort: '2026-01',
    status: 'done',
    theme: 'cyber',
    title: '資通安全事件通報及應變辦法、責任等級分級辦法修正',
    body: '特定非公務機關知悉事件後 1 小時內要通報；應變處置為 72 小時內（重大事件 36 小時內），事後 1 個月內送交調查、處理及改善報告。分級辦法規定公立醫學中心為 A 級、公立區域醫院或地區醫院為 B 級。',
    src: 'cyberReport',
  },
  {
    when: '2026 年 1 月 14 日',
    sort: '2026-01',
    status: 'done',
    theme: 'ai',
    title: '《人工智慧基本法》公布並施行',
    body: '第 4 條訂有七項原則：永續發展與福祉、人類自主、隱私保護與資料治理、資安與安全、透明與可解釋、公平與不歧視、問責。條文沒有專門針對醫療的規定，醫療領域的細節要靠主管機關後續訂定。',
    src: 'aiAct',
  },
  {
    when: '2026 年 5 月 29 日',
    sort: '2026-05',
    status: 'done',
    theme: 'ai',
    title: '衛福部函頒《醫療機構應用生成式人工智慧指引》',
    body: '屬行政指導性質，不是強制規定。適用於公私立醫院與診所，涵蓋病歷撰寫輔助、臨床決策支援、行政文書撰擬與病人溝通工具；醫療器材與 AI 代理系統不在適用範圍內。',
    src: 'guideline',
  },
  {
    when: '2026 年 8 月 6 日',
    sort: '2026-08',
    status: 'done',
    theme: 'ai',
    title: '立法院厚生會成立「智慧醫療委員會」',
    body: '中央社報導，委員會邀集衛福部、數位發展部等部會，會議中衛福部資訊處長預告後續的醫療 AI 施行細則與資料互通平台時程。',
    src: 'cna0806',
    report: true,
  },

  // ── 之後 ────────────────────────────────────────
  {
    when: '預計 2026 年底',
    sort: '2026-12',
    status: 'ahead',
    theme: 'data',
    title: '「FHIR Box」作業平台預計上線',
    body: '依中央社報導，衛福部資訊處長在 2026 年 8 月 6 日的會議表示，目標是讓全台醫學中心之間的資料互通，並規劃在 3 到 5 年內推廣至全台約八成的醫療院所。這是報導中的計畫，不是已公告的期限。',
    src: 'cna0806',
    report: true,
  },
  {
    when: '預告「3 個月內」提出（自 2026 年 8 月 6 日起算）',
    sort: '2026-11',
    status: 'ahead',
    theme: 'ai',
    title: '醫療領域人工智慧施行細則草案',
    body: '中央社報導，衛福部資訊處長預告將於 3 個月內提出，並依循《人工智慧基本法》第 4 條的七項原則。具體條文尚未公布。',
    src: 'cna0806',
    report: true,
  },
  {
    when: '2027 年 1 月中旬前（公布施行後 2 年內）',
    sort: '2027-01',
    status: 'ahead',
    theme: 'ai',
    title: '各機關完成所管法規與行政措施的檢視',
    body: '《人工智慧基本法》第 18 條第 1 項規定，政府應於施行後 2 年內，依本法檢視所管法規與行政措施，並完成必要的制定、修正、廢止與改善。因為本法公布日就是施行日，期限落在 2027 年 1 月中旬前後（條文沒有寫出確切日期）。',
    src: 'aiAct',
  },
  {
    when: '施行日未定',
    sort: '2099-12',
    status: 'ahead',
    theme: 'privacy',
    title: '個資法修正條文的施行日，由行政院另定',
    body: '在施行日公告前，新增的事故通報與安全維護規定尚未生效；主管機關另訂的通報辦法也要另外確認。',
    src: 'pdpa',
  },
];
