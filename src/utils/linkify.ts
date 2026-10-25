/** 본문 문자열 안의 http(s) 주소를 새 탭 링크로 바꾼다(HTML 특수문자는 먼저 이스케이프). 팁 출처 줄처럼 주소를 글 속에 적는 곳에 쓴다. */
export function linkify(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return esc.replace(
    /https?:\/\/[^\s<]+/g,
    (u) => `<a href="${u}" target="_blank" rel="noopener" style="overflow-wrap:anywhere">${u}</a>`,
  );
}
