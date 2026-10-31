// AEO/GEO 보조 유틸 (2026-10-31, 러시아어판)
//
// ① 글 하단 「Главное / Коротко / Итог / Основные выводы」 불릿을 글 맨 위 「Краткий ответ」 상자로 올린다 —
//    답변 엔진은 글 첫머리의 짧은 답을 가장 많이 인용한다. 새 내용을 만들지 않고 글에 이미 있는 요약을 그대로 옮긴다.
// ② 본문에 실제로 등장하는 규정 이름을 Legislation 노드(mentions)로 연결한다.
//    본문에 없는 규정은 절대 넣지 않는다(화면에 보이는 것만 마크업).

const HEAD = /^##\s+(?:Главное|Коротко|Итог|Итоги|Основные выводы|Вывод|Выводы)[^\r\n]*\r?\n/m;

/** 「## Главное」 등 아래 불릿을 평문으로 뽑는다. 없으면 빈 배열. */
export function extractSummary(markdown: string | undefined): string[] {
  if (!markdown) return [];
  const head = markdown.match(HEAD);
  if (!head || head.index === undefined) return [];
  let rest = markdown.slice(head.index + head[0].length);
  const stop = rest.search(/^(?:##\s|<br|\*\*Источник|\*Источник|---)/m);
  if (stop >= 0) rest = rest.slice(0, stop);
  const out: string[] = [];
  for (const line of rest.split('\n')) {
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
  return out.slice(0, 6);
}

type Law = { name: string; id: string; url: string; test: RegExp };
const LAWS: Law[] = [
  { name: 'Федеральный закон № 152-ФЗ «О персональных данных»', id: '152-ФЗ', url: 'https://www.consultant.ru/document/cons_doc_LAW_61801/', test: /152-ФЗ|№\s?152-ФЗ|О персональных данных/ },
  { name: 'Федеральный закон № 323-ФЗ «Об основах охраны здоровья граждан в Российской Федерации»', id: '323-ФЗ', url: 'https://www.consultant.ru/document/cons_doc_LAW_121895/', test: /323-ФЗ|Об основах охраны здоровья/ },
  { name: 'Федеральный закон № 187-ФЗ «О безопасности критической информационной инфраструктуры»', id: '187-ФЗ', url: 'https://www.consultant.ru/document/cons_doc_LAW_220885/', test: /187-ФЗ/ },
  { name: 'Кодекс Российской Федерации об административных правонарушениях (ст. 13.11)', id: 'КоАП РФ ст. 13.11', url: 'https://www.consultant.ru/document/cons_doc_LAW_34661/', test: /13\.11/ },
  { name: 'Приказ Минздрава России от 25.03.2026 № 209н', id: '209н', url: 'http://publication.pravo.gov.ru/document/0001202604230013', test: /209н/ },
  { name: 'Приказ ФСТЭК России от 11.04.2025 № 117', id: 'Приказ ФСТЭК № 117', url: 'https://normativ.kontur.ru/document?moduleId=1&documentId=500478', test: /ФСТЭК[^.\n]{0,40}№?\s?117|№\s?117/ },
];

const TOPICS: [string, RegExp][] = [
  ['Персональные данные пациентов', /персональн\w+ данн|152-ФЗ/i],
  ['Медицинская информационная система (МИС)', /\bМИС\b|медицинск\w+ информационн/i],
  ['ЕГИСЗ', /ЕГИСЗ/],
  ['Электронные медицинские документы', /электронн\w+ медицинск\w+ документ|\bРЭМД\b|209н/i],
  ['Искусственный интеллект в больнице', /\bИИ\b|искусственн\w+ интеллект/i],
  ['Медицинские изделия и регистрация ПО', /медицинск\w+ издели|Росздравнадзор/i],
  ['Информационная безопасность', /кибер|информационн\w+ безопасност|утечк|ФСТЭК|фишинг/i],
  ['Телемедицина', /телемедицин/i],
];

export function legislationMentions(text: string) {
  return LAWS.filter((l) => l.test.test(text)).map((l) => ({
    '@type': 'Legislation',
    name: l.name,
    legislationIdentifier: l.id,
    url: l.url,
    legislationJurisdiction: 'RU',
    inLanguage: 'ru',
  }));
}

export function aboutTopics(text: string) {
  return TOPICS.filter(([, re]) => re.test(text)).map(([name]) => ({ '@type': 'Thing', name }));
}
