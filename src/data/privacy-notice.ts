// 언어판별 개인정보 안내(2026-11-26, 애드센스 심사 대비).
// 구글 게시자 정책은 광고에 따른 쿠키·식별자 수집을 방문자가 알 수 있게 공개하라고 한다.
// 그전에는 모든 언어판 푸터가 한국어 처리방침(/privacy/)으로만 연결돼 있었다.
//
// ⚠️ 여기에는 한국어 처리방침(src/pages/privacy.astro)에 이미 있는 사실만 옮긴다.
//    한국어 처리방침의 광고·통계·심사실·위탁 내용을 고치면 이 파일도 함께 고칠 것.

export interface PrivacyNotice {
  title: string;
  description: string;
  lead: string;
  sections: { h: string; p?: string[]; items?: { text: string; link?: { href: string; label: string } }[] }[];
  effective: string;
}

const ADS = 'https://www.google.com/settings/ads';
const ABOUT_ADS = 'https://www.aboutads.info/choices/';
const PARTNER = 'https://policies.google.com/technologies/partner-sites';
const MAIL = 'mailto:choyj80@naver.com';
const FULL = '/privacy/';

const en: PrivacyNotice = {
  title: 'Privacy policy',
  description: 'How Hospital AI Lab handles advertising cookies, visit statistics, embedded videos, files sent to the program review tool and your requests.',
  lead: 'This notice covers the pages of hospital-ai-lab.com in this language. It summarises how information is handled when you read the site or use its tools.',
  sections: [
    {
      h: 'Advertising and cookies',
      p: ['This site shows ads through Google AdSense.'],
      items: [
        { text: 'Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this site or other sites.' },
        { text: 'Through ad serving, third parties may place and read cookies in your browser, or use web beacons, IP addresses and other identifiers to collect information.' },
        { text: 'You can opt out of personalised advertising.', link: { href: ADS, label: 'Google Ads Settings' } },
        { text: 'You can also opt out of some third-party vendors’ cookies.', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: 'You can block or delete cookies in your browser settings; some features may then be limited.' },
        { text: 'How Google uses data:', link: { href: PARTNER, label: 'when you use our partners’ sites or apps' } },
      ],
    },
    {
      h: 'Visit statistics and embedded videos',
      p: ['The site uses GoatCounter for visit statistics, and some pages embed YouTube videos.'],
    },
    {
      h: 'AI program review tool',
      p: ['No account is needed. If you consent to submit, the program name, submitter or department, the uploaded files, and the grade and score are sent to the site operator and kept for checking the review record and improving the criteria. They are stored with our processor Supabase, Inc. on servers in Seoul, Korea, and deleted one month after submission, or earlier if you ask. Review result screens and PDFs are not stored.'],
    },
    {
      h: 'Member accounts',
      p: ['Sign-up, log-in and members-only notes are offered on the Korean pages. The full policy for member data, including processors and retention, is in Korean.'],
      items: [{ text: 'Full policy:', link: { href: FULL, label: 'Korean privacy policy' } }],
    },
    {
      h: 'Your requests and contact',
      p: ['You may ask to see, correct or delete information about you, or to stop its processing.'],
      items: [{ text: 'Write to the operator:', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: 'Effective 26 November 2026.',
};

const ja: PrivacyNotice = {
  title: 'プライバシーポリシー',
  description: '病院AI研究所における広告のCookie、アクセス統計、埋め込み動画、プログラム審査ツールへの送信ファイルの扱いと、お問い合わせ先を説明します。',
  lead: 'この案内は hospital-ai-lab.com の日本語ページを対象に、閲覧やツール利用の際の情報の扱いをまとめたものです。',
  sections: [
    {
      h: '広告とCookie',
      p: ['当サイトは Google AdSense による広告を掲載します。'],
      items: [
        { text: 'Googleを含む第三者配信事業者は、Cookieを使用して、当サイトや他のサイトへの過去のアクセス情報に基づく広告を配信します。' },
        { text: '広告配信の過程で、第三者がブラウザのCookieを保存・読み取りしたり、ウェブビーコン、IPアドレスなどの識別子で情報を収集したりすることがあります。' },
        { text: 'パーソナライズ広告は無効にできます。', link: { href: ADS, label: 'Google 広告設定' } },
        { text: '一部の第三者配信事業者のCookieは、次のページでも無効にできます。', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: 'ブラウザの設定でCookieを拒否・削除できます。その場合、一部の機能が制限されることがあります。' },
        { text: 'Googleによるデータの使用方法：', link: { href: PARTNER, label: 'パートナーのサイトやアプリを使用する際の説明' } },
      ],
    },
    { h: 'アクセス統計と埋め込み動画', p: ['アクセス統計に GoatCounter を使用しています。一部のページには YouTube の動画を埋め込んでいます。'] },
    {
      h: 'AIプログラム審査ツール',
      p: ['会員登録は不要です。送信に同意した場合のみ、プログラム名、提出者（所属）、アップロードしたファイル、等級と点数が運営者に送られ、審査記録の確認と基準の改善のために保管されます。データは委託先の Supabase, Inc. の韓国ソウルのサーバーに保存し、提出日から1か月後に削除します（希望があればそれ以前にも削除します）。審査結果の画面とPDFは保存しません。'],
    },
    {
      h: '会員情報',
      p: ['会員登録・ログイン・会員限定ノートは韓国語ページで提供しています。委託先や保管期間を含む会員情報の方針全文は韓国語です。'],
      items: [{ text: '全文：', link: { href: FULL, label: '韓国語の個人情報処理方針' } }],
    },
    {
      h: '開示などの請求とお問い合わせ',
      p: ['ご自身の情報の開示、訂正、削除、利用停止を請求できます。'],
      items: [{ text: '運営者あて：', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: '2026年11月26日から適用します。',
};

const tw: PrivacyNotice = {
  title: '隱私權政策',
  description: '說明 Hospital AI Lab 如何處理廣告 Cookie、造訪統計、嵌入影片、送交程式審查工具的檔案，以及聯絡方式。',
  lead: '本說明適用於 hospital-ai-lab.com 的繁體中文頁面，整理您閱覽網站或使用工具時資訊如何處理。',
  sections: [
    {
      h: '廣告與 Cookie',
      p: ['本網站透過 Google AdSense 刊登廣告。'],
      items: [
        { text: '包括 Google 在內的第三方供應商，會使用 Cookie，依據您先前造訪本網站或其他網站的紀錄放送廣告。' },
        { text: '在廣告放送過程中，第三方可能在您的瀏覽器存取 Cookie，或利用網路信標、IP 位址及其他識別碼蒐集資訊。' },
        { text: '您可以停用個人化廣告。', link: { href: ADS, label: 'Google 廣告設定' } },
        { text: '部分第三方供應商的 Cookie 也可在此停用。', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: '您可在瀏覽器設定中封鎖或刪除 Cookie，部分功能可能因此受限。' },
        { text: 'Google 如何使用資料：', link: { href: PARTNER, label: '您使用合作夥伴網站或應用程式時的說明' } },
      ],
    },
    { h: '造訪統計與嵌入影片', p: ['本網站使用 GoatCounter 統計造訪情形，部分頁面嵌入 YouTube 影片。'] },
    {
      h: 'AI 程式審查工具',
      p: ['無須註冊會員。僅在您同意送出時，程式名稱、提交者（單位）、上傳的檔案、等級與分數才會傳給網站經營者，用於確認審查紀錄與改進標準。資料存放於受託廠商 Supabase, Inc. 位於韓國首爾的伺服器，自送出日起一個月後刪除，您也可要求提前刪除。審查結果畫面與 PDF 不保存。'],
    },
    {
      h: '會員資料',
      p: ['會員註冊、登入與會員限定筆記僅於韓文頁面提供。包含受託廠商與保存期間的會員資料政策全文為韓文。'],
      items: [{ text: '全文：', link: { href: FULL, label: '韓文個人資料處理方針' } }],
    },
    {
      h: '您的請求與聯絡方式',
      p: ['您可以要求查閱、更正、刪除您的資料，或停止處理。'],
      items: [{ text: '聯絡經營者：', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: '自 2026 年 11 月 26 日起適用。',
};

const ru: PrivacyNotice = {
  title: 'Политика конфиденциальности',
  description: 'Как Hospital AI Lab обращается с рекламными файлами cookie, статистикой посещений, встроенными видео и файлами, отправленными в инструмент проверки программ.',
  lead: 'Этот документ относится к русскоязычным страницам hospital-ai-lab.com и описывает, как обрабатывается информация при чтении сайта и использовании инструментов.',
  sections: [
    {
      h: 'Реклама и файлы cookie',
      p: ['На сайте показывается реклама через Google AdSense.'],
      items: [
        { text: 'Сторонние поставщики, включая Google, используют файлы cookie для показа объявлений на основе ваших предыдущих посещений этого и других сайтов.' },
        { text: 'При показе рекламы третьи лица могут сохранять и читать файлы cookie в вашем браузере, а также собирать сведения с помощью веб-маяков, IP-адресов и других идентификаторов.' },
        { text: 'Персонализированную рекламу можно отключить.', link: { href: ADS, label: 'настройки рекламы Google' } },
        { text: 'Файлы cookie некоторых сторонних поставщиков можно отключить здесь.', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: 'Файлы cookie можно заблокировать или удалить в настройках браузера; тогда часть функций может быть ограничена.' },
        { text: 'Как Google использует данные:', link: { href: PARTNER, label: 'при использовании сайтов и приложений партнёров' } },
      ],
    },
    { h: 'Статистика посещений и встроенные видео', p: ['Для статистики посещений используется GoatCounter, на некоторых страницах встроены видео YouTube.'] },
    {
      h: 'Инструмент проверки программ с ИИ',
      p: ['Регистрация не нужна. Только если вы согласились на отправку, название программы, автор или подразделение, загруженные файлы, уровень и балл передаются оператору сайта для проверки записей и улучшения критериев. Данные хранятся у обработчика Supabase, Inc. на серверах в Сеуле (Корея) и удаляются через месяц после отправки, а по просьбе — раньше. Экраны и PDF с результатом не сохраняются.'],
    },
    {
      h: 'Учётные записи',
      p: ['Регистрация, вход и материалы для участников доступны на корейских страницах. Полный текст политики о данных участников — на корейском языке.'],
      items: [{ text: 'Полный текст:', link: { href: FULL, label: 'политика на корейском' } }],
    },
    {
      h: 'Ваши запросы и контакты',
      p: ['Вы можете запросить доступ к своим данным, их исправление, удаление или прекращение обработки.'],
      items: [{ text: 'Письмо оператору:', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: 'Действует с 26 ноября 2026 года.',
};

const id: PrivacyNotice = {
  title: 'Kebijakan privasi',
  description: 'Cara Hospital AI Lab menangani cookie iklan, statistik kunjungan, video tersemat, dan berkas yang dikirim ke alat penilaian program.',
  lead: 'Pemberitahuan ini berlaku untuk halaman berbahasa Indonesia di hospital-ai-lab.com dan merangkum pengelolaan informasi saat Anda membaca situs atau memakai alatnya.',
  sections: [
    {
      h: 'Iklan dan cookie',
      p: ['Situs ini menayangkan iklan melalui Google AdSense.'],
      items: [
        { text: 'Vendor pihak ketiga, termasuk Google, menggunakan cookie untuk menayangkan iklan berdasarkan kunjungan Anda sebelumnya ke situs ini atau situs lain.' },
        { text: 'Dalam penayangan iklan, pihak ketiga dapat menyimpan dan membaca cookie di peramban Anda, atau mengumpulkan informasi dengan web beacon, alamat IP, dan pengenal lain.' },
        { text: 'Iklan yang dipersonalisasi dapat dimatikan.', link: { href: ADS, label: 'Setelan Iklan Google' } },
        { text: 'Cookie sebagian vendor pihak ketiga juga dapat dimatikan di sini.', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: 'Anda dapat memblokir atau menghapus cookie di setelan peramban; sebagian fitur mungkin menjadi terbatas.' },
        { text: 'Cara Google menggunakan data:', link: { href: PARTNER, label: 'saat Anda memakai situs atau aplikasi mitra' } },
      ],
    },
    { h: 'Statistik kunjungan dan video tersemat', p: ['Situs ini memakai GoatCounter untuk statistik kunjungan, dan sebagian halaman menyematkan video YouTube.'] },
    {
      h: 'Alat penilaian program AI',
      p: ['Tidak perlu akun. Hanya jika Anda setuju mengirim, nama program, pengirim atau unit, berkas yang diunggah, serta tingkat dan skor dikirim ke pengelola situs untuk memeriksa catatan penilaian dan memperbaiki kriteria. Data disimpan pada pemroses Supabase, Inc. di server di Seoul, Korea, dan dihapus satu bulan setelah dikirim, atau lebih cepat bila diminta. Layar hasil dan PDF tidak disimpan.'],
    },
    {
      h: 'Akun anggota',
      p: ['Pendaftaran, masuk akun, dan catatan khusus anggota tersedia di halaman berbahasa Korea. Teks lengkap kebijakan data anggota berbahasa Korea.'],
      items: [{ text: 'Teks lengkap:', link: { href: FULL, label: 'kebijakan privasi berbahasa Korea' } }],
    },
    {
      h: 'Permintaan dan kontak',
      p: ['Anda dapat meminta melihat, memperbaiki, atau menghapus data Anda, atau menghentikan pemrosesannya.'],
      items: [{ text: 'Hubungi pengelola:', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: 'Berlaku sejak 26 November 2026.',
};

const ph: PrivacyNotice = {
  title: 'Patakaran sa privacy',
  description: 'Paano hinahawakan ng Hospital AI Lab ang cookie ng patalastas, estadistika ng bisita, naka-embed na video, at mga file na ipinadala sa tool sa pagsusuri ng programa.',
  lead: 'Saklaw ng paunawang ito ang mga pahina sa Filipino ng hospital-ai-lab.com at kung paano hinahawakan ang impormasyon kapag nagbabasa kayo o gumagamit ng mga tool.',
  sections: [
    {
      h: 'Patalastas at cookie',
      p: ['Nagpapakita ang site na ito ng patalastas sa pamamagitan ng Google AdSense.'],
      items: [
        { text: 'Gumagamit ng cookie ang mga third-party vendor, kabilang ang Google, para magpakita ng patalastas batay sa nauna ninyong pagbisita sa site na ito o sa iba pang site.' },
        { text: 'Sa paghahatid ng patalastas, maaaring maglagay at magbasa ng cookie ang third party sa inyong browser, o mangolekta ng impormasyon gamit ang web beacon, IP address at iba pang identifier.' },
        { text: 'Maaari ninyong patayin ang naka-personalize na patalastas.', link: { href: ADS, label: 'Google Ads Settings' } },
        { text: 'Maaari ding patayin dito ang cookie ng ilang third-party vendor.', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: 'Maaari ninyong harangin o burahin ang cookie sa browser; maaaring limitado ang ilang feature pagkatapos.' },
        { text: 'Paano ginagamit ng Google ang datos:', link: { href: PARTNER, label: 'kapag gumagamit kayo ng site o app ng mga partner' } },
      ],
    },
    { h: 'Estadistika ng bisita at naka-embed na video', p: ['Gumagamit ang site ng GoatCounter para sa estadistika ng bisita, at may mga pahinang may naka-embed na YouTube video.'] },
    {
      h: 'Tool sa pagsusuri ng programang AI',
      p: ['Hindi kailangan ng account. Kung pumayag kayong magpadala lamang, ipinadadala sa operator ng site ang pangalan ng programa, nagpasa o yunit, mga in-upload na file, at ang grado at puntos para tingnan ang tala ng pagsusuri at pahusayin ang pamantayan. Nakaimbak ang mga ito sa processor na Supabase, Inc. sa mga server sa Seoul, Korea, at binubura isang buwan matapos ipasa, o mas maaga kung hihilingin. Hindi itinatago ang screen at PDF ng resulta.'],
    },
    {
      h: 'Account ng miyembro',
      p: ['Nasa mga pahinang Koreano ang pagrehistro, pag-log in at tala para sa miyembro. Nasa wikang Koreano ang buong patakaran sa datos ng miyembro.'],
      items: [{ text: 'Buong teksto:', link: { href: FULL, label: 'patakaran sa privacy sa Koreano' } }],
    },
    {
      h: 'Inyong kahilingan at pakikipag-ugnayan',
      p: ['Maaari ninyong hilinging makita, itama o burahin ang inyong datos, o itigil ang pagproseso nito.'],
      items: [{ text: 'Sumulat sa operator:', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: 'May bisa mula Nobyembre 26, 2026.',
};

const fr: PrivacyNotice = {
  title: 'Politique de confidentialité',
  description: 'Comment Hospital AI Lab traite les cookies publicitaires, les statistiques de visite, les vidéos intégrées et les fichiers envoyés à l’outil d’examen de programmes.',
  lead: 'Cette notice concerne les pages en français de hospital-ai-lab.com et résume le traitement des informations lorsque vous consultez le site ou utilisez ses outils.',
  sections: [
    {
      h: 'Publicité et cookies',
      p: ['Ce site affiche des annonces avec Google AdSense.'],
      items: [
        { text: 'Des fournisseurs tiers, dont Google, utilisent des cookies pour diffuser des annonces à partir de vos visites antérieures sur ce site ou sur d’autres.' },
        { text: 'Lors de la diffusion des annonces, des tiers peuvent déposer et lire des cookies dans votre navigateur, ou recueillir des informations au moyen de balises web, d’adresses IP et d’autres identifiants.' },
        { text: 'Vous pouvez désactiver la publicité personnalisée.', link: { href: ADS, label: 'paramètres des annonces Google' } },
        { text: 'Les cookies de certains fournisseurs tiers peuvent aussi être désactivés ici.', link: { href: ABOUT_ADS, label: 'aboutads.info' } },
        { text: 'Vous pouvez bloquer ou supprimer les cookies dans votre navigateur ; certaines fonctions peuvent alors être limitées.' },
        { text: 'Comment Google utilise les données :', link: { href: PARTNER, label: 'lorsque vous utilisez les sites ou applications de ses partenaires' } },
      ],
    },
    { h: 'Statistiques de visite et vidéos intégrées', p: ['Le site utilise GoatCounter pour les statistiques de visite et certaines pages intègrent des vidéos YouTube.'] },
    {
      h: 'Outil d’examen de programmes d’IA',
      p: ['Aucun compte n’est nécessaire. Seulement si vous consentez à l’envoi, le nom du programme, l’auteur ou le service, les fichiers déposés, la mention et la note sont transmis à l’exploitant du site pour vérifier les examens et améliorer les critères. Ils sont conservés chez le sous-traitant Supabase, Inc., sur des serveurs à Séoul (Corée), et supprimés un mois après l’envoi, ou plus tôt sur demande. Les écrans et PDF de résultat ne sont pas conservés.'],
    },
    {
      h: 'Comptes des membres',
      p: ['L’inscription, la connexion et les notes réservées aux membres sont proposées sur les pages coréennes. La politique complète concernant les données des membres est en coréen.'],
      items: [{ text: 'Texte complet :', link: { href: FULL, label: 'politique en coréen' } }],
    },
    {
      h: 'Vos demandes et contact',
      p: ['Vous pouvez demander l’accès, la rectification ou la suppression de vos données, ou l’arrêt de leur traitement.'],
      items: [{ text: 'Écrire à l’exploitant :', link: { href: MAIL, label: 'choyj80@naver.com' } }],
    },
  ],
  effective: 'En vigueur depuis le 26 novembre 2026.',
};

export const privacyNotice = { en, ja, tw, ru, id, ph, fr };
