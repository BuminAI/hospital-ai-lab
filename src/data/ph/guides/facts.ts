// Mga pangunahing katotohanang maaaring sipiin — datos para sa /ph/facts/ at /ph/llms-full.txt (2026-11-14)
//
// Bawat aytem = isang tanong, maikling sagot, ang seksyong pinagbabatayan, at isang pangunahing sanggunian. Isinulat ang lahat
// matapos aktuwal na buksan ang teksto: RA 9711, RA 10173, RA 11223 (LawPhil) at ang ASEAN Guide on AI Governance and Ethics (2024).
// Huwag magdagdag mula sa balita o sa haka-haka; huwag magsulat ng numero o deadline na wala sa teksto.
// Hindi saklaw dahil hindi nabuksan ang pinagmulan (HTTP 403): mga circular at administrative order ng FDA Philippines at DOH,
// mga advisory at circular ng National Privacy Commission (kasama ang IRR ng Data Privacy Act), at ang mga site ng DICT.
import { SRC } from './milestones';

export const FACTS_CHECKED = 'Nobyembre 14, 2026';

export const FACT_TOPICS = [
  'Medical device at FDA (RA 9711)',
  'Personal na datos (Data Privacy Act)',
  'Health information system (UHC Act)',
  'Pamamahala ng AI (ASEAN Guide)',
] as const;

export type FactTopic = (typeof FACT_TOPICS)[number];

export type Fact = {
  id: string;
  topic: FactTopic;
  q: string;
  a: string;
  /** Maikling batayan, hal. "RA 9711, Sec. 4(g)(1)" */
  basis: string;
  src: keyof typeof SRC;
};

export const FACTS: Fact[] = [
  // ── Medical device at FDA ────────────────────────────
  {
    id: 'fda-definition-software',
    topic: 'Medical device at FDA (RA 9711)',
    q: 'Puwede bang ituring na medical device ang software sa Pilipinas?',
    a: 'Oo, puwede. Sa FDA Act of 2009, kasama sa kahulugan ng “medical device” ang “software” na nilalayon ng manufacturer na gamitin sa tao para sa diagnosis, pag-iwas, pagsubaybay, panggagamot o pagpapagaan ng sakit o pinsala, pagsuporta sa anatomiya o prosesong pisyolohikal, at iba pang tinukoy na layunin. Mahalaga ang “intended by the manufacturer”, kaya itanong sa vendor ang nakasulat nitong layunin.',
    basis: 'RA 9711, kahulugan ng “medical device”',
    src: 'ra9711',
  },
  {
    id: 'fda-lto',
    topic: 'Medical device at FDA (RA 9711)',
    q: 'May kailangan bang lisensya ang nagbebenta o namamahagi ng medical device?',
    a: 'Ipinagbabawal ng batas ang paggawa, pag-angkat, pag-export, pagbebenta, pag-aalok ng benta, pamamahagi, paglilipat o retail ng anumang gamot, device o in-vitro diagnostic reagent ng sinumang tao o kumpanya nang walang license to operate mula sa FDA.',
    basis: 'RA 9711, Sec. 10, ipinagbabawal na gawain (k)',
    src: 'ra9711',
  },
  {
    id: 'fda-unregistered',
    topic: 'Medical device at FDA (RA 9711)',
    q: 'Ano ang sinasabi ng batas sa produktong kailangang irehistro pero hindi nakarehistro?',
    a: 'Ipinagbabawal ang paggawa, pag-angkat, pagbebenta, pamamahagi, promosyon at advertisement ng anumang health product na kahit kailangang irehistro ay hindi nakarehistro sa FDA. Hindi sinasabi ng pahinang ito kung aling software ang kailangang irehistro; nasa mga circular ng FDA iyon, na hindi namin nabuksan.',
    basis: 'RA 9711, Sec. 10, ipinagbabawal na gawain (j)',
    src: 'ra9711',
  },
  // ── Personal na datos ────────────────────────────────
  {
    id: 'dpa-health-sensitive',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Itinuturing bang sensitibo ang datos pangkalusugan ng pasyente?',
    a: 'Oo. Itinuturing ng Data Privacy Act na “sensitive personal information” ang impormasyon tungkol sa kalusugan ng isang tao, at ang mga kasalukuyan o dating rekord pangkalusugan na inisyu ng mga ahensya ng gobyerno. Mas mahigpit ang kondisyon sa pagproseso ng ganitong impormasyon.',
    basis: 'RA 10173, Sec. 3(l)(2) at (3)',
    src: 'ra10173',
  },
  {
    id: 'dpa-medical-treatment',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Kailan puwedeng iproseso ang sensitibong impormasyon ng pasyente?',
    a: 'Bawal ang pagproseso ng sensitive personal information maliban sa mga kasong nakalista, gaya ng may pahintulot na tiyak sa layunin bago ang pagproseso, o kapag kailangan ito sa medical treatment, isinasagawa ng medical practitioner o medical treatment institution, at tinitiyak ang sapat na antas ng proteksyon. Hindi nito sakop ang lahat ng gamit ng AI; kailangang suriin kung ang partikular na gamit ay pasok sa isa sa mga kasong ito.',
    basis: 'RA 10173, Sec. 13(a) at (e)',
    src: 'ra10173',
  },
  {
    id: 'dpa-principles',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Anong mga pangkalahatang prinsipyo ang kailangang sundin sa pagproseso ng personal na impormasyon?',
    a: 'Transparency, legitimate purpose at proportionality. Kasama rito: kolektahin para sa tinukoy at lehitimong layunin na idineklara bago o sa lalong madaling panahon pagkatapos kolektahin; iproseso nang patas at ayon sa batas; tiyaking tama at napapanahon; sapat at hindi labis sa layunin; at itago lamang hangga’t kailangan.',
    basis: 'RA 10173, Sec. 11',
    src: 'ra10173',
  },
  {
    id: 'dpa-rights',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Anong impormasyon ang dapat ibigay sa pasyente bago pumasok ang datos niya sa sistema?',
    a: 'Ayon sa mga karapatan ng data subject, bago ang pagpasok ng datos o sa susunod na praktikal na pagkakataon: paglalarawan ng datos, mga layunin, saklaw at paraan ng pagproseso, mga tatanggap, ang paraan ng automated access kung pinapayagan, pagkakakilanlan at contact ng controller, tagal ng pag-iimbak, at ang mga karapatan niya, kasama ang karapatang magreklamo sa Commission. May mga eksepsiyon ang batas.',
    basis: 'RA 10173, Sec. 16(a) at (b)',
    src: 'ra10173',
  },
  {
    id: 'dpa-automated',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'May karapatan ba ang pasyente na malaman kung automated na proseso ang ginamit sa desisyon?',
    a: 'Kasama sa karapatan sa makatwirang access ang impormasyon tungkol sa automated processes kung ang datos ay gagawing o malamang na gagawing nag-iisang batayan ng desisyong may malaking epekto sa data subject.',
    basis: 'RA 10173, Sec. 16(c)(6)',
    src: 'ra10173',
  },
  {
    id: 'dpa-subcontract',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Pananagutan pa rin ba ng ospital ang datos kapag vendor ang nagpoproseso?',
    a: 'Oo. Puwedeng i-subcontract ang pagproseso, pero ang personal information controller ang dapat magtiyak ng wastong safeguards, at responsable siya sa datos na nasa kanyang kustodiya, kasama ang ipinasa sa third party sa loob o labas ng bansa. Dapat ding tiyakin ng controller na ang mga third party na nagpoproseso para sa kanya ay may kaukulang security measures.',
    basis: 'RA 10173, Sec. 14, Sec. 20(d) at Sec. 21',
    src: 'ra10173',
  },
  {
    id: 'dpa-security',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Anong mga hakbang sa seguridad ang hinihingi ng batas?',
    a: 'Makatwiran at naaangkop na organizational, physical at technical measures. Kasama, ayon sa batas at sa mga gabay ng Commission: proteksyon sa computer network, security policy, proseso para tukuyin at tugunan ang mga vulnerability, at regular na pagbabantay sa mga security breach. Nakadepende ang antas sa uri ng impormasyon, panganib, laki ng organisasyon at gastos.',
    basis: 'RA 10173, Sec. 20(a) hanggang (c)',
    src: 'ra10173',
  },
  {
    id: 'dpa-breach',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'Kailan kailangang abisuhan ang Commission at ang apektadong tao tungkol sa breach?',
    a: 'Kailangang agad na abisuhan ang Commission at ang mga apektadong data subject kapag may makatwirang paniniwalang nakuha ng hindi awtorisadong tao ang sensitive personal information o impormasyong magagamit sa identity fraud, at naniniwala ang controller o ang Commission na malamang itong magdulot ng tunay na panganib ng malubhang pinsala. Hindi binigyan ng bilang ng oras ang Section 20(f); ang mga takdang oras ay nasa mga patakaran ng Commission na hindi namin nabuksan.',
    basis: 'RA 10173, Sec. 20(f)',
    src: 'ra10173',
  },
  {
    id: 'dpa-concealment',
    topic: 'Personal na datos (Data Privacy Act)',
    q: 'May parusa ba sa pagtatago ng security breach?',
    a: 'Mayroon. Ang sinumang, matapos malaman ang breach at ang tungkuling mag-abiso ayon sa Sec. 20(f), ay sadyang magtago o magpabaya sa pag-aabiso ay may parusang pagkakulong na 1 taon at 6 na buwan hanggang 5 taon at multang hindi bababa sa Php500,000 ngunit hindi hihigit sa Php1,000,000.',
    basis: 'RA 10173, Sec. 30',
    src: 'ra10173',
  },
  // ── Health information system ────────────────────────
  {
    id: 'uhc-his',
    topic: 'Health information system (UHC Act)',
    q: 'Kailangan bang may electronic health records ang mga ospital ayon sa UHC Act?',
    a: 'Ayon sa Section 36, kailangang magkaroon ang lahat ng health service provider at insurer ng health information system na binubuo ng enterprise resource planning, human resource information, electronic health records at electronic prescription log na naaayon sa pamantayan ng DOH, at regular na ina-upload nang elektroniko sa pamamagitan ng interoperable na sistema.',
    basis: 'RA 11223, Sec. 36',
    src: 'ra11223',
  },
  {
    id: 'uhc-privacy',
    topic: 'Health information system (UHC Act)',
    q: 'Paano nauugnay ang privacy ng pasyente sa health information system?',
    a: 'Sinasabi ng Section 36 na dapat palaging itaguyod ang privacy at confidentiality ng pasyente alinsunod sa Data Privacy Act of 2012. Ibig sabihin, anumang AI na gagamit ng datos mula sa EHR ay kailangang pumasa sa mga pamantayan ng batas na iyon.',
    basis: 'RA 11223, Sec. 36; RA 10173',
    src: 'ra11223',
  },
  // ── Pamamahala ng AI ─────────────────────────────────
  {
    id: 'asean-principles',
    topic: 'Pamamahala ng AI (ASEAN Guide)',
    q: 'Ano ang pitong gabay na prinsipyo ng ASEAN Guide on AI Governance and Ethics?',
    a: 'Transparency at explainability; fairness at equity; security at safety; human-centricity; privacy at data governance; accountability at integrity; at robustness at reliability. Boluntaryo ang pag-aampon ng balangkas ayon sa mismong gabay.',
    basis: 'ASEAN Guide, Bahagi B at panimula',
    src: 'asean',
  },
  {
    id: 'asean-human',
    topic: 'Pamamahala ng AI (ASEAN Guide)',
    q: 'Gaano dapat kalaki ang papel ng tao sa desisyong tinutulungan ng AI?',
    a: 'Inilalarawan ng gabay ang tatlong antas batay sa panganib: human-in-the-loop (ang AI ay nagrerekomenda lamang at ang tao ang nagpapasya), human-over-the-loop (ang tao ang nagbabantay at puwedeng makialam) at human-out-of-the-loop. Sinasabi nito na ang mga AI system na mataas ang bigat at posibilidad ng pinsala ay dapat gumamit ng human-in-the-loop. Nagbabala rin ito sa “automation bias”, kung saan nasasanay ang tao na aprubahan na lang ang output ng AI.',
    basis: 'ASEAN Guide, bahagi tungkol sa antas ng paglahok ng tao',
    src: 'asean',
  },
  {
    id: 'asean-governance',
    topic: 'Pamamahala ng AI (ASEAN Guide)',
    q: 'Anong istruktura ng pamamahala ang iminumungkahi ng ASEAN Guide sa organisasyon?',
    a: 'Isang multi-disciplinary na sentral na lupon (halimbawa, AI Ethics Advisory Board o Ethics Committee) na nangangasiwa sa AI governance, malinaw na mga tungkulin ng mga taong sangkot, at mga pamantayan, gabay at template para sa responsableng paggamit ng AI. May kasama rin itong pagtatasa ng panganib bago magsimula ang pagkolekta ng datos at pagmomodelo, at pagbubunyag kung kailan ginagamit ang AI sa produkto o serbisyo.',
    basis: 'ASEAN Guide, buod ng apat na pangunahing bahagi',
    src: 'asean',
  },
];
