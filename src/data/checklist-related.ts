// 언어판 점검표 섹션별 '함께 읽을 글' (2026-09-20 신설).
//
// 키는 섹션 순서(0부터)다. 한국어판(src/pages/checklist.astro)은 섹션 제목을 키로 쓰지만,
// 다른 언어판 제목은 길고 번호가 붙어 있어 순서로 잇는 편이 덜 깨진다.
// 이미 발행된 글만 잇고, 없는 글 ID는 빌드를 멈춘다(src/pages/{loc}/checklist.astro).
// ⚠️ 섹션을 추가·삭제·순서 변경하면 여기 번호도 함께 맞출 것.
import type { Loc } from '../utils/locale';

export const checklistRelated: Record<Exclude<Loc, 'ko'>, Record<number, string[]>> = {
  ja: {
    0: ['2026-08-20-samd-idaten-review-body-reform'],
    1: [
      '2026-08-31-ai-shindan-ishiho-17jo-tsuchi',
      '2026-09-03-program-iryokiki-shido-kanri-ryo',
      '2026-09-18-samd-kihon-yoken-cybersecurity',
    ],
    2: [
      '2026-08-29-kameikako-tokumeikako-joho',
      '2026-08-30-anzen-kanri-guideline-gaibu-itaku-ai',
      '2026-08-28-jisedai-iryo-kiban-ho-honnin-tsuchi',
    ],
    3: ['2026-08-31-ai-shindan-ishiho-17jo-tsuchi', '2026-08-26-ishiji-jimu-hojo-kasan-seiseiai'],
    4: ['2026-08-27-tokyo-ai-katsuyo-hojokin', '2026-09-15-emr-donyu-consultant-hojokin'],
  },
  ru: {
    0: [
      '2026-08-13-registraciya-ii-medizdelie-postanovlenie-1684',
      '2026-08-13-zakon-ob-ii-gost-r-72484',
    ],
    1: [
      '2026-08-13-152-fz-lokalizaciya-dannykh-ii',
      '2026-09-12-prikaz-140-obezlichivanie-dannykh-dlya-ii',
    ],
    2: [
      '2026-09-13-pyatietapnaya-sistema-proverki-ii',
      '2026-08-28-gost-r-59921-ispytaniya-medicinskogo-ii',
    ],
    3: ['2026-09-10-ii-pomoshnik-protokoly-priema-moskva'],
    4: ['2026-09-18-moskva-tarify-ii-analiz-snimkov'],
  },
  id: {
    0: ['2026-09-12-uu-pdp-keamanan-akses-rme-wajib', '2026-09-18-risiko-foto-ai-data-pribadi-spesifik'],
    1: ['2026-09-20-perpres-peta-jalan-ai-belum-terbit-rumah-sakit'],
    2: ['2026-09-06-seb-rme-satusehat-klaim-jkn', '2026-09-13-satusehat-rme-akses-darurat'],
    3: ['2026-09-10-skrining-tbc-ai-rontgen-tindak-lanjut'],
    4: ['2026-09-15-mou-persi-indosat-menilai-tawaran-teknologi'],
  },
  tw: {
    0: [
      '2026-09-06-ai-gongju-shifou-yiliao-qicai',
      '2026-09-10-ai-yiliao-qicai-chayan-dengji-fengxian-fenji',
    ],
    1: ['2026-09-06-bingren-ziliao-ge-zi-fa-di-liu-tiao', '2026-09-15-yiyuan-yingzi-ai-fengxian'],
    2: [
      '2026-09-06-dianzi-binli-liu-zhong-jizhi',
      '2026-09-12-ai-bingli-zhaiyao-chang-loudiao-de-feiyuyan-xijie',
    ],
    3: ['2026-09-12-ai-bingli-zhaiyao-chang-loudiao-de-feiyuyan-xijie'],
    4: ['2026-09-18-huashuo-xhis-maestro-yiyuan-caigou', '2026-09-20-tongxun-zhencha-zhiliao-banfa-xingzheng-queren'],
  },
};
