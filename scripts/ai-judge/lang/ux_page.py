# -*- coding: utf-8 -*-
# AI 심사실 '첫 화면 + 결과 창' 개편용 문구표 (2026-11-07, 오너 지시: 첫 화면은 업로드·설명만, 결과는 별개 창, 계속 쓰고 싶은 도구로).
# page = 정적 HTML에 들어가는 문구({{키}}로 치환, H에 병합), ui = 브라우저 스크립트가 쓰는 문구(T['ui']).
# 6개 언어의 키가 같아야 한다(build.py가 대조한다).

UXP = {}

UXP['ko'] = dict(
 page=dict(
  hero_sub="만든 프로그램을 올려 주세요. 안전성·신뢰성·사용성·유지보수성·이식성, 열네 가지 눈으로 차분히 읽어 드립니다.",
  trust_line="AI를 부르지 않습니다 · 같은 코드는 같은 점수 · 분석은 이 브라우저 안에서",
  upload_title="프로그램 올리기",
  opt_info="프로그램 이름·제출자 적기 (선택)",
  try_sample="샘플로 먼저 체험해 보기",
  sample_hint="샘플은 연습용입니다. 운영자에게 전송되지 않고 기록에도 남지 않습니다.",
  how_title="이렇게 읽어 드립니다",
  how1_t="올리기", how1_d="HTML·JS·Python 등 프로그램 파일이나 ZIP을 올립니다. 문서와 이미지는 대상이 아닙니다.",
  how2_t="읽기", how2_d="코드를 읽고, 가능한 것은 격리된 창에서 실제로 실행해 봅니다. 모든 분석은 이 브라우저 안에서만 이뤄집니다.",
  how3_t="채점", how3_d="코드에서 찾은 사실만으로 14항목, 100점 만점. 같은 코드는 언제나 같은 점수가 나옵니다.",
  how4_t="안내", how4_d="점수와 함께 잘한 점, 다음에 할 일, 근거가 된 줄 번호를 알려 드립니다. 고쳐서 다시 올려 점수가 오르는 것을 확인해 보세요.",
  rules_link="채점 기준 전체 보기",
  tab_sum="결과 요약", tab_rep="분석 리포트", tab_rules="채점 기준",
  card_btn="결과 카드 저장",
  hist_title="내 점검 기록",
  hist_sub="이 브라우저에만 저장됩니다. 고쳐서 다시 올리면 점수가 어떻게 달라지는지 볼 수 있습니다.",
  hist_clear="기록 지우기"),
 ui=dict(
  back_hello="다시 오셨네요. 마지막 점검은 {d}, {s}점이었습니다.",
  hist_confirm="점검 기록을 모두 지울까요? 되돌릴 수 없습니다.",
  sample_banner="샘플 프로그램의 결과입니다. 연습용이라 운영자에게 전송되지 않았고 점검 기록에도 남지 않습니다.",
  card_done="결과 카드를 저장했습니다.",
  card_sample="샘플 체험",
  hist_none="이름 없음")
)

UXP['en'] = dict(
 page=dict(
  hero_sub="Upload a program you built. We read it calmly through fourteen lenses: safety, reliability, usability, maintainability and portability.",
  trust_line="No AI calls · same code, same score · analysis runs in this browser",
  upload_title="Upload a program",
  opt_info="Add a program name and submitter (optional)",
  try_sample="Try it with a sample first",
  sample_hint="The sample is for practice. It is not sent to the operator and not kept in your history.",
  how_title="How we read your program",
  how1_t="Upload", how1_d="Upload program files such as HTML, JS or Python, or a ZIP. Documents and images are not reviewed.",
  how2_t="Read", how2_d="We read the code and, where possible, run it in an isolated window. All analysis stays in this browser.",
  how3_t="Score", how3_d="14 items, 100 points, from facts found in the code only. The same code always gets the same score.",
  how4_t="Guide", how4_d="With the score you get what went well, what to do next and the lines behind each point. Fix, upload again and watch the score move.",
  rules_link="See all scoring rules",
  tab_sum="Summary", tab_rep="Analysis report", tab_rules="Scoring rules",
  card_btn="Save result card",
  hist_title="My review history",
  hist_sub="Saved only in this browser. Fix and upload again to see how the score changes.",
  hist_clear="Clear history"),
 ui=dict(
  back_hello="Welcome back. Your last check was on {d}, with {s} points.",
  hist_confirm="Clear all review history? This cannot be undone.",
  sample_banner="This is the result for the sample program. It is for practice, so it was not sent to the operator or saved in your history.",
  card_done="Saved the result card.",
  card_sample="Sample trial",
  hist_none="No name")
)

UXP['ja'] = dict(
 page=dict(
  hero_sub="作ったプログラムをアップロードしてください。安全性・信頼性・使いやすさ・保守性・移植性を、14の視点で落ち着いて読み解きます。",
  trust_line="AIは呼び出しません · 同じコードなら同じ点数 · 分析はこのブラウザ内で",
  upload_title="プログラムをアップロード",
  opt_info="プログラム名・提出者を入力（任意）",
  try_sample="まずはサンプルで体験",
  sample_hint="サンプルは練習用です。運営者には送信されず、履歴にも残りません。",
  how_title="このように読み解きます",
  how1_t="アップロード", how1_d="HTML・JS・Pythonなどのプログラムファイル、またはZIPをアップロードします。文書や画像は対象外です。",
  how2_t="読み解く", how2_d="コードを読み、可能なものは隔離されたウィンドウで実際に動かします。分析はすべてこのブラウザ内で行われます。",
  how3_t="採点", how3_d="コードから見つかった事実だけで、14項目・100点満点。同じコードには必ず同じ点数が出ます。",
  how4_t="ご案内", how4_d="点数とともに、よくできた点、次にやること、根拠となった行番号をお伝えします。直して再アップロードし、点数が上がるのを確かめてください。",
  rules_link="採点基準をすべて見る",
  tab_sum="結果の要約", tab_rep="分析レポート", tab_rules="採点基準",
  card_btn="結果カードを保存",
  hist_title="私の点検履歴",
  hist_sub="このブラウザにだけ保存されます。直して再アップロードすると、点数がどう変わるか確認できます。",
  hist_clear="履歴を消す"),
 ui=dict(
  back_hello="おかえりなさい。前回の点検は{d}、{s}点でした。",
  hist_confirm="点検履歴をすべて消しますか？元に戻せません。",
  sample_banner="サンプルプログラムの結果です。練習用のため、運営者には送信されず、点検履歴にも残りません。",
  card_done="結果カードを保存しました。",
  card_sample="サンプル体験",
  hist_none="名称なし")
)

UXP['ru'] = dict(
 page=dict(
  hero_sub="Загрузите свою программу. Мы спокойно прочитаем её по четырнадцати пунктам: безопасность, надёжность, удобство, сопровождаемость и переносимость.",
  trust_line="Без вызовов ИИ · один код — один балл · анализ идёт в этом браузере",
  upload_title="Загрузить программу",
  opt_info="Указать название программы и автора (необязательно)",
  try_sample="Сначала попробовать на образце",
  sample_hint="Образец нужен для тренировки. Он не отправляется оператору и не сохраняется в истории.",
  how_title="Как мы читаем программу",
  how1_t="Загрузка", how1_d="Загрузите файлы программы (HTML, JS, Python и т. п.) или ZIP. Документы и изображения не проверяются.",
  how2_t="Чтение", how2_d="Мы читаем код и, где возможно, запускаем его в изолированном окне. Весь анализ остаётся в этом браузере.",
  how3_t="Оценка", how3_d="14 пунктов, 100 баллов, только по фактам из кода. Один и тот же код всегда получает один и тот же балл.",
  how4_t="Подсказки", how4_d="Вместе с баллом вы увидите, что получилось хорошо, что делать дальше и строки кода, на которых основана оценка. Исправьте, загрузите снова и увидите рост.",
  rules_link="Все правила оценки",
  tab_sum="Итог", tab_rep="Отчёт анализа", tab_rules="Правила оценки",
  card_btn="Сохранить карточку результата",
  hist_title="История моих проверок",
  hist_sub="Хранится только в этом браузере. Исправьте и загрузите снова — увидите, как изменится балл.",
  hist_clear="Очистить историю"),
 ui=dict(
  back_hello="С возвращением. Последняя проверка была {d}: {s} б.",
  hist_confirm="Очистить всю историю проверок? Это нельзя отменить.",
  sample_banner="Это результат для образца программы. Он нужен для тренировки, поэтому не отправлялся оператору и не сохранён в истории.",
  card_done="Карточка результата сохранена.",
  card_sample="Пробный образец",
  hist_none="Без названия")
)

UXP['id'] = dict(
 page=dict(
  hero_sub="Unggah program buatan Anda. Kami membacanya dengan tenang lewat empat belas sudut pandang: keamanan, keandalan, kemudahan penggunaan, pemeliharaan, dan portabilitas.",
  trust_line="Tanpa pemanggilan AI · kode sama, nilai sama · analisis berjalan di browser ini",
  upload_title="Unggah program",
  opt_info="Isi nama program dan pengaju (opsional)",
  try_sample="Coba dulu dengan contoh",
  sample_hint="Contoh hanya untuk latihan. Tidak dikirim ke pengelola dan tidak tersimpan di riwayat.",
  how_title="Cara kami membaca program Anda",
  how1_t="Unggah", how1_d="Unggah berkas program seperti HTML, JS, atau Python, atau ZIP. Dokumen dan gambar tidak dinilai.",
  how2_t="Baca", how2_d="Kami membaca kode dan, bila bisa, menjalankannya di jendela terisolasi. Semua analisis tetap di browser ini.",
  how3_t="Nilai", how3_d="14 butir, 100 poin, hanya dari fakta di dalam kode. Kode yang sama selalu mendapat nilai yang sama.",
  how4_t="Arahan", how4_d="Bersama nilai, Anda mendapat hal yang sudah baik, langkah berikutnya, dan nomor baris yang menjadi dasarnya. Perbaiki, unggah lagi, dan lihat nilai naik.",
  rules_link="Lihat semua aturan penilaian",
  tab_sum="Ringkasan", tab_rep="Laporan analisis", tab_rules="Aturan penilaian",
  card_btn="Simpan kartu hasil",
  hist_title="Riwayat pemeriksaan saya",
  hist_sub="Hanya tersimpan di browser ini. Perbaiki lalu unggah lagi untuk melihat perubahan nilai.",
  hist_clear="Hapus riwayat"),
 ui=dict(
  back_hello="Selamat datang kembali. Pemeriksaan terakhir Anda pada {d}, dengan {s} poin.",
  hist_confirm="Hapus seluruh riwayat pemeriksaan? Tidak bisa dibatalkan.",
  sample_banner="Ini hasil untuk program contoh. Hanya untuk latihan, jadi tidak dikirim ke pengelola dan tidak tersimpan di riwayat.",
  card_done="Kartu hasil tersimpan.",
  card_sample="Uji coba contoh",
  hist_none="Tanpa nama")
)

UXP['tw'] = dict(
 page=dict(
  hero_sub="請上傳您做的程式。我們會從安全、可靠、易用、易維護、易移植十四個面向，靜靜地為您讀一遍。",
  trust_line="不呼叫 AI · 相同程式碼得到相同分數 · 分析在這個瀏覽器內進行",
  upload_title="上傳程式",
  opt_info="填寫程式名稱與提交者（選填）",
  try_sample="先用範例體驗",
  sample_hint="範例僅供練習，不會傳送給營運者，也不會留在紀錄中。",
  how_title="我們如何閱讀您的程式",
  how1_t="上傳", how1_d="上傳 HTML、JS、Python 等程式檔或 ZIP。文件與圖片不在檢查範圍。",
  how2_t="閱讀", how2_d="我們會讀程式碼，並盡可能在隔離的視窗中實際執行。所有分析都只在這個瀏覽器內進行。",
  how3_t="評分", how3_d="十四個項目、滿分 100 分，只根據程式碼中找到的事實。相同的程式碼永遠得到相同的分數。",
  how4_t="說明", how4_d="除了分數，也會告訴您做得好的地方、接下來可以做的事，以及依據的行號。改好後再上傳，看看分數怎麼提高。",
  rules_link="查看完整評分標準",
  tab_sum="結果摘要", tab_rep="分析報告", tab_rules="評分標準",
  card_btn="儲存結果卡",
  hist_title="我的檢查紀錄",
  hist_sub="只儲存在這個瀏覽器中。改好再上傳，就能看到分數的變化。",
  hist_clear="清除紀錄"),
 ui=dict(
  back_hello="歡迎回來。上次檢查是在{d}，得到 {s} 分。",
  hist_confirm="要清除所有檢查紀錄嗎？無法復原。",
  sample_banner="這是範例程式的結果。僅供練習，因此不會傳送給營運者，也不會留在檢查紀錄中。",
  card_done="已儲存結果卡。",
  card_sample="範例體驗",
  hist_none="未命名")
)

# English (India) edition: same wording as the U.S. edition (2026-11-07)
import copy
UXP['in'] = copy.deepcopy(UXP['en'])
UXP['sg'] = copy.deepcopy(UXP['en'])
UXP['ph'] = copy.deepcopy(UXP['en'])
