// AEO/GEO 보조 유틸 (2026-10-31, 인도네시아어판)
//
// ① 글 하단 「Rangkuman」 불릿을 글 맨 위 「Jawaban singkat」 답변 상자로 올린다 — 답변 엔진은 글 첫머리의
//    짧은 답을 가장 많이 인용한다. 새 내용을 만들지 않고 글에 이미 있는 요약을 그대로 옮긴다.
// ② 본문에 실제로 등장하는 규정 이름을 Legislation 노드(mentions)로 연결해, 엔진이 글이 어떤 조문을
//    다루는지(엔티티) 읽게 한다. 본문에 없는 규정은 절대 넣지 않는다(화면에 보이는 것만 마크업).

/** 「## Rangkuman」(또는 Ringkasan/Intinya) 아래 불릿을 평문으로 뽑는다. 없으면 빈 배열. */
export function extractSummary(markdown: string | undefined): string[] {
  if (!markdown) return [];
  const head = markdown.match(/^##\s+(?:Rangkuman|Ringkasan|Intinya|Kesimpulan)[^\r\n]*\r?\n/m);
  if (!head || head.index === undefined) return [];
  let rest = markdown.slice(head.index + head[0].length);
  const stop = rest.search(/^(?:##\s|\*\*Sumber|\*Sumber|---)/m);
  if (stop >= 0) rest = rest.slice(0, stop);
  const m = [null, rest];
  const out: string[] = [];
  for (const line of m[1].split('\n')) {
    const b = line.match(/^\s*[-*]\s+(.*\S)\s*$/);
    if (!b) continue;
    out.push(
      b[1]
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .trim()
    );
  }
  if (out.length === 0) {
    // Bagian ringkasan berupa paragraf (bukan butir): ambil paragraf pertama yang bukan catatan batas/sumber.
    const para = rest
      .split(/\r?\n\s*\r?\n/)
      .map((s) => s.trim())
      .find((s) => s && !/^(?:Konten|Materi|Sumber|\*)/i.test(s));
    if (para) out.push(para.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\s+/g, ' '));
  }
  return out.slice(0, 6);
}

type Law = { name: string; id: string; url: string; test: RegExp };
const LAWS: Law[] = [
  { name: 'Permenkes 24/2022 tentang Rekam Medis', id: 'Permenkes 24/2022', url: 'https://jdih.kemkes.go.id/documents/peraturan-menteri-kesehatan-nomor-24-tahun-2022', test: /Permenkes\s*(?:No\.?\s*)?(?:Nomor\s*)?24(?:\/| Tahun )2022|Peraturan Menteri Kesehatan Nomor 24 Tahun 2022/i },
  { name: 'UU 27/2022 tentang Pelindungan Data Pribadi', id: 'UU 27/2022', url: 'https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang+nomor+27+tahun+2022', test: /UU\s*(?:No\.?\s*)?(?:Nomor\s*)?27(?:\/| Tahun )2022|UU PDP|Pelindungan Data Pribadi|Perlindungan Data Pribadi/i },
  { name: 'UU 17/2023 tentang Kesehatan', id: 'UU 17/2023', url: 'https://jdih.kemkes.go.id/documents/undang-undang-nomor-17-tahun-2023', test: /UU\s*(?:No\.?\s*)?(?:Nomor\s*)?17(?:\/| Tahun )2023|Undang-Undang Nomor 17 Tahun 2023/i },
  { name: 'PP 28/2024 (pelaksanaan UU 17/2023)', id: 'PP 28/2024', url: 'https://jdih.kemkes.go.id/documents/peraturan-pemerintah-nomor-28-tahun-2024', test: /PP\s*(?:No\.?\s*)?(?:Nomor\s*)?28(?:\/| Tahun )2024|Peraturan Pemerintah Nomor 28 Tahun 2024/i },
  { name: 'Kepmenkes HK.01.07/MENKES/951/2026 tentang Pedoman Izin Edar Alat Kesehatan Berbasis Perangkat Lunak', id: 'HK.01.07/MENKES/951/2026', url: 'https://jdih.kemkes.go.id/documents/keputusan-menteri-kesehatan-republik-indonesia-nomor-hk0107menkes9512026', test: /Kepmenkes[^.\n]{0,20}951\/2026|HK\.01\.07\/MENKES\/951\/2026|Keputusan Menteri Kesehatan[^.\n]{0,40}951/i },
];

const TOPICS: [string, RegExp][] = [
  ['Rekam medis elektronik (RME)', /\bRME\b|rekam medis elektronik/i],
  ['SATUSEHAT', /SATUSEHAT|Satu Sehat/i],
  ['Pelindungan data pribadi', /UU PDP|data pribadi|Pelindungan Data/i],
  ['Alat kesehatan berbasis perangkat lunak', /alat kesehatan|izin edar|SaMD|SiMD/i],
  ['Kecerdasan artifisial (AI) di rumah sakit', /\bAI\b|kecerdasan (?:artifisial|buatan)/i],
  ['BPJS Kesehatan dan JKN', /BPJS|JKN/i],
  ['Telemedisin', /telemedisin|telekesehatan/i],
  ['Keamanan siber', /siber|phishing|malware|deepfake|prompt injection/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'ID',
    inLanguage: 'id',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
