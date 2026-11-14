// Roadmap ng AI at digital health para sa mga ospital sa Pilipinas — datos para sa /ph/dx-roadmap/ at /ph/calendar/ (2026-11-14)
//
// ⚠️ Ang bawat katotohanan dito ay galing sa dokumentong aktuwal na binuksan at binasa noong 2026-11-14:
//    ang buong teksto ng RA 9711 (FDA Act of 2009), RA 10173 (Data Privacy Act of 2012), RA 10175 (Cybercrime Prevention Act of 2012)
//    at RA 11223 (Universal Health Care Act) mula sa LawPhil, at ang ASEAN Guide on AI Governance and Ethics (2024).
//    HINDI nabuksan ang mga website ng FDA Philippines, DOH, National Privacy Commission, DICT at Official Gazette (HTTP 403 sa automated na request).
//    Kaya walang nakasulat dito mula sa mga circular, administrative order, advisory o IRR na nasa mga site na iyon
//    (halimbawa ang detalye ng pagpaparehistro ng software bilang medical device, o ang takdang oras ng pag-abiso sa NPC).
//    Huwag magdagdag ng petsa o tungkulin mula sa balita o buod ng law firm; basahin muna ang orihinal at i-update ang CHECKED.
export const CHECKED = 'Nobyembre 14, 2026';

export const SRC = {
  ra9711: { label: 'LawPhil — Republic Act No. 9711, Food and Drug Administration (FDA) Act of 2009 (buong teksto)', url: 'https://lawphil.net/statutes/repacts/ra2009/ra_9711_2009.html' },
  ra10173: { label: 'LawPhil — Republic Act No. 10173, Data Privacy Act of 2012 (buong teksto)', url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html' },
  ra10175: { label: 'LawPhil — Republic Act No. 10175, Cybercrime Prevention Act of 2012 (buong teksto)', url: 'https://lawphil.net/statutes/repacts/ra2012/ra_10175_2012.html' },
  ra11223: { label: 'LawPhil — Republic Act No. 11223, Universal Health Care Act (buong teksto)', url: 'https://lawphil.net/statutes/repacts/ra2019/ra_11223_2019.html' },
  asean: { label: 'ASEAN — ASEAN Guide on AI Governance and Ethics (2024)', url: 'https://asean.org/wp-content/uploads/2024/02/ASEAN-Guide-on-AI-Governance-and-Ethics_beautified_201223_v2.pdf' },
  hotline911: { label: 'The Manila Times — Dial 911: New nationwide emergency hotline to go live on Sept. 11 (2025)', url: 'https://www.manilatimes.net/2025/09/06/news/dilg-to-roll-out-nationwide-unified-911-hotline-on-sept-11/2180041' },
  philhealth: { label: 'PhilHealth — Balita (news)', url: 'https://www.philhealth.gov.ph/news/' },
  lawphil: { label: 'LawPhil — Mga Republic Act', url: 'https://lawphil.net/statutes/repacts/repacts.html' },
} as const;

export type ThemeKey = 'pd' | 'ai' | 'device' | 'sec';

export const THEMES: Record<ThemeKey, string> = {
  pd: 'Proteksyon ng personal na datos',
  ai: 'Gabay sa AI (ASEAN)',
  device: 'FDA at medical device',
  sec: 'Seguridad at cybercrime',
};

export type Milestone = {
  /** Petsa gaya ng makikita sa screen */
  when: string;
  /** Pang-ayos (YYYY-MM) */
  sort: string;
  status: 'done' | 'ahead';
  theme: ThemeKey;
  title: string;
  body: string;
  src: keyof typeof SRC;
  report?: boolean;
};

export const MILESTONES: Milestone[] = [
  {
    when: 'Agosto 18, 2009',
    sort: '2009-08',
    status: 'done',
    theme: 'device',
    title: 'Inaprubahan ang FDA Act of 2009 (RA 9711), na may kahulugan ng “medical device” na kasama ang software',
    body:
      'Ayon sa teksto ng batas, ang “medical device” ay anumang instrumento, aparato, makina, implant, reagent, “software”, materyal o katulad na bagay na nilalayon ng manufacturer na gamitin sa tao para sa diagnosis, pag-iwas, pagsubaybay, panggagamot o pagpapagaan ng sakit, at iba pang tinukoy na layunin. Ipinagbabawal ang paggawa, pag-angkat, pagbebenta at pamamahagi ng device nang walang license to operate mula sa FDA, gayundin ng produktong kailangang irehistro pero hindi nakarehistro.',
    src: 'ra9711',
    report: true,
  },
  {
    when: 'Agosto 15, 2012',
    sort: '2012-08',
    status: 'done',
    theme: 'pd',
    title: 'Inaprubahan ang Data Privacy Act of 2012 (RA 10173)',
    body:
      'Itinuturing nitong “sensitive personal information” ang impormasyon tungkol sa kalusugan ng isang tao at ang mga rekord pangkalusugan na inisyu ng ahensya ng gobyerno. Nakasaad ang mga prinsipyo ng transparency, legitimate purpose at proportionality (Sec. 11), ang mga karapatan ng data subject (Sec. 16), ang mga hakbang sa seguridad at ang pag-abiso sa Commission at sa apektadong tao kapag may breach (Sec. 20), at ang pananagutan ng controller sa datos na ipinasa sa third party (Sec. 21).',
    src: 'ra10173',
    report: true,
  },
  {
    when: 'Setyembre 12, 2012',
    sort: '2012-09',
    status: 'done',
    theme: 'sec',
    title: 'Inaprubahan ang Cybercrime Prevention Act of 2012 (RA 10175)',
    body:
      'Binasa ang buong teksto ng batas, ngunit hindi sinuri sa pahinang ito ang bawat probisyon nito. Binanggit dito para ipaalam sa mga ospital na may hiwalay na batas laban sa cybercrime, bukod sa Data Privacy Act. Magtanong sa inyong legal counsel kung alin ang may kinalaman sa sistema ng ospital.',
    src: 'ra10175',
  },
  {
    when: 'Pebrero 20, 2019',
    sort: '2019-02',
    status: 'done',
    theme: 'device',
    title: 'Inaprubahan ang Universal Health Care Act (RA 11223) na may kautusan tungkol sa health information system',
    body:
      'Sa Section 36, kailangang magkaroon ang lahat ng health service provider at insurer ng health information system na binubuo ng enterprise resource planning, human resource information, electronic health records at electronic prescription log na naaayon sa pamantayan ng DOH, at regular na ina-upload nang elektroniko sa pamamagitan ng interoperable na sistema. Palaging dapat protektahan ang privacy at confidentiality ng pasyente alinsunod sa Data Privacy Act.',
    src: 'ra11223',
    report: true,
  },
  {
    when: '2024',
    sort: '2024-02',
    status: 'done',
    theme: 'ai',
    title: 'Inilathala ng ASEAN ang ASEAN Guide on AI Governance and Ethics',
    body:
      'Pitong gabay na prinsipyo ang inilatag: transparency at explainability, fairness at equity, security at safety, human-centricity, privacy at data governance, accountability at integrity, at robustness at reliability. May apat na pangunahing bahagi para sa organisasyon: internal governance, antas ng paglahok ng tao, operations management, at komunikasyon sa stakeholders. Boluntaryo ang pag-aampon ayon sa mismong gabay.',
    src: 'asean',
    report: true,
  },
];
