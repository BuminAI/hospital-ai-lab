// 보관 기간: 최근 한 달 (2026-11-26, 오너 지시)
//
// 한국어판의 AI 뉴스·정부 지원사업(보건복지부 보도자료 포함)·AI 교육·행사 목록은 **게시일 기준 최근 한 달**만
// 보관한다. 한 달이 지난 항목은 데이터 파일에서 지운다(이전 내용은 git 이력에만 남는다).
// 수집기마다 병합한 뒤 이 함수를 거치므로, 원본 게시판에 남아 있는 옛 글도 다시 붙지 않는다.
//
// ⚠️ 지원사업 공고에는 마감일 자료가 없어 **게시일**로 자른다. 게시한 지 한 달이 넘은 공고는 접수 중이어도
//    목록에서 빠지며, 화면 안내(src/pages/gov-support.astro)에 그 사실을 적어 둔다.
// ⚠️ 다른 언어판에는 적용하지 않는다. 적용하려면 오너 확인이 필요하다(몇몇 판은 공고 목록이 통째로 빈다).

/** 지금부터 달력상 한 달 전 시각. 3월 31일의 한 달 전은 2월 말일이다. */
export function oneMonthAgo(now = new Date()) {
  const d = new Date(now);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 1);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

/** 게시일이 한 달 안인 항목만. 날짜를 읽을 수 없는 항목은 조용히 버리지 않고 남긴다. */
export function keepRecent(items, now = new Date()) {
  const cutoff = oneMonthAgo(now).getTime();
  return items.filter((it) => {
    const t = Date.parse(it.pubDate);
    return Number.isNaN(t) || t >= cutoff;
  });
}
