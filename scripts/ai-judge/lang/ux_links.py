# -*- coding: utf-8 -*-
# AI 심사실 '연결된 링크 통합 심사' 문구표 (2026-11-07).
# page = 정적 HTML 문구({{키}}로 H에 병합), ui = 브라우저 스크립트 문구(T['ui']에 병합), guide = 링크가 막혔을 때 '이렇게 풀어 주세요' 안내(T['lk']).
# 안내문은 막힌 종류마다 제목 1개 + 단계 3개로 6개 언어가 같은 모양이어야 한다(build.py가 대조한다).

UXL = {}

# ═══════════════════════ 한국어 ═══════════════════════
UXL['ko'] = dict(
 feat=["14개 항목(안전성·신뢰성·사용성·유지보수성·이식성)을 자동 점검해 100점 만점과 S·A·B·C 등급 제공", "채점 규칙 전부 공개, 같은 코드는 항상 같은 점수", "GitHub 저장소·Gist·웹 페이지에서 읽은 코드를 업로드 파일과 함께 통합 심사", "링크가 막혔을 때 원인별 해제 방법 안내", "브라우저 안에서 분석(동의 전에는 서버로 전송하지 않음), 무료"],
 page=dict(
  link_title="연결된 링크도 함께 심사 (선택)",
  link_hint="프로그램이 GitHub 저장소나 구글 앱스크립트 웹앱 등과 이어져 있다면 주소를 붙여 넣으세요. 업로드한 파일과 합쳐 하나의 프로그램으로 심사합니다.",
  link_ph="https://github.com/…  또는  https://script.google.com/macros/s/…/exec",
  link_add="링크 추가",
  links_rule="연결한 링크(GitHub·Gist·웹페이지·Apps Script 웹앱)에서 읽어 온 코드는 업로드한 파일과 합쳐서 심사합니다. 링크를 읽지 못하면 그 부분은 점수에 들어가지 않고, 심사 범위가 부분적이므로 S등급은 주지 않습니다. 분석 리포트에 푸는 방법이 나옵니다."),
 ui=dict(
  l_reading="읽는 중…", l_ok="읽음 · 파일 {n}개", l_page_ok="읽음 · 페이지 1개", l_blocked="막혀 있음", l_info="연결만 확인", l_rm="빼기",
  l_bad="https:// 로 시작하는 올바른 주소를 입력해 주세요.", l_dup="이미 추가된 링크입니다.", l_max="링크는 최대 {n}개까지 추가할 수 있습니다.",
  k_gh="GitHub 저장소", k_gist="GitHub Gist", k_gsapp="Apps Script 웹앱", k_gsedit="Apps Script 편집기", k_web="웹페이지",
  g_hint="막힌 것을 이렇게 풀어 주세요", g_after="고친 뒤에는 이 링크를 빼고 다시 추가하세요.",
  det_title="코드 안에서 발견된 링크", det_add="함께 심사",
  l_trunc="파일이 많아 앞쪽 {n}개만 읽었습니다.",
  g_links="통합 심사 범위", links_sum="업로드 파일 {a}개 · 링크 {b}개(읽음 {c}개)",
  cov_yes="링크로 함께 심사됨", cov_no="링크로 심사되지 않은 외부 연결",
  f_links_partial="연결한 링크 {n}개를 읽지 못해 심사 범위가 부분적입니다. 읽지 못한 부분은 점수에 반영되지 않았습니다. 푸는 방법은 분석 리포트 탭에 있습니다.",
  f_cap_link="읽지 못한 링크가 있어 S 대신 A로 제한했습니다.",
  rt_links="링크: {c} / {b}개 읽음"),
 guide=dict(
  gh_notfound=dict(t="GitHub 저장소를 찾을 수 없거나 비공개입니다", s=["주소의 소유자·저장소 이름 철자를 확인하세요.", "비공개 저장소라면 GitHub의 Settings → General → 맨 아래 Danger Zone → Change visibility → Make public으로 공개하세요. 공개해도 되는 코드인지 먼저 확인하고, 비밀번호·키가 들어 있으면 공개하지 마세요.", "공개하기 어렵다면 Code → Download ZIP으로 받은 파일을 업로드 칸에 올려 주세요."]),
  gh_rate=dict(t="GitHub가 잠시 요청을 막았습니다", s=["GitHub는 로그인 없이 보내는 요청을 시간당 횟수로 제한합니다. 지금 한도에 닿았습니다.", "약 한 시간 뒤에 이 링크를 빼고 다시 추가해 주세요.", "급하다면 저장소를 ZIP으로 받아 업로드하세요."]),
  gh_nocode=dict(t="읽을 수 있는 코드 파일이 없습니다", s=["저장소에 HTML·JS·Python·Apps Script 같은 코드 파일이 있는지 확인하세요.", "코드가 하위 폴더에 있다면 그 폴더 주소(…/tree/브랜치/폴더)를 넣어 주세요.", "파일이 너무 크거나 많으면 ZIP으로 올려 주세요."]),
  gs_editor=dict(t="Apps Script 편집기 링크로는 코드를 읽을 수 없습니다", s=["구글은 Apps Script 소스를 링크로 읽게 해 주지 않습니다. 심사하려면 코드를 파일로 가져와야 합니다.", "편집기에서 각 파일(.gs, .html)의 내용을 복사해 같은 이름의 파일로 저장한 뒤 업로드 칸에 올려 주세요.", "clasp를 쓰신다면 clasp clone으로 받은 폴더를 ZIP으로 올려도 됩니다."]),
  gs_login=dict(t="웹앱이 로그인 화면을 돌려주고 있습니다", s=["편집기 오른쪽 위 배포 → 배포 관리 → 연필(편집) 버튼을 누르세요.", "‘액세스 권한이 있는 사용자’를 ‘모든 사용자’로 바꾸고 배포하세요. 회사·학교 계정이면 관리자가 외부 공유를 막았을 수 있습니다.", "공개하기 어렵다면 소스(.gs)를 파일로 저장해 업로드하세요."]),
  gs_cors=dict(t="연결은 되지만 구글이 내용 읽기를 막고 있습니다", s=["이 웹앱 주소로는 연결 여부만 확인할 수 있고 코드는 읽을 수 없습니다. 오류가 아니라 구글의 보호 장치입니다.", "배포 관리에서 웹앱이 ‘모든 사용자’ 공개인지도 함께 확인하세요.", "정확한 심사를 위해 소스(.gs·.html)를 파일로 저장해 업로드 칸에 올려 주세요."]),
  gs_unreach=dict(t="웹앱에 연결하지 못했습니다", s=["주소가 …/macros/s/…/exec 형태인지 확인하세요. /dev 주소는 편집 권한이 있는 사람만 열 수 있습니다.", "광고 차단 프로그램이나 회사 보안망이 script.google.com을 막고 있는지 확인하세요.", "계속 안 되면 소스를 파일로 저장해 업로드하세요."]),
  web_cors=dict(t="이 사이트는 외부에서 읽을 수 없게 막혀 있습니다", s=["사이트가 다른 사이트에서 내용을 읽지 못하게 설정돼 있습니다(CORS). 사이트 오류가 아닙니다.", "소스를 ZIP으로 업로드하거나, 공개 GitHub 저장소에 올려 그 주소를 넣어 주세요.", "직접 운영하는 사이트라면 응답 헤더에 Access-Control-Allow-Origin: * 를 더하면 읽을 수 있습니다."]),
  web_status=dict(t="페이지가 정상 응답하지 않습니다", s=["주소가 맞는지 브라우저 새 탭에서 직접 열어 보세요.", "로그인이 필요한 페이지는 읽을 수 없습니다. 공개 주소를 넣어 주세요.", "서버가 잠시 멈춘 것일 수 있으니 조금 뒤 다시 추가해 보세요."]),
  net_fail=dict(t="연결하지 못했습니다", s=["주소 철자와 https:// 가 맞는지 확인하세요.", "인터넷 연결, 광고 차단 프로그램, 회사 보안망을 확인하세요.", "계속 안 되면 소스를 ZIP으로 올려 주세요."]))
)

# ═══════════════════════ English ═══════════════════════
UXL['en'] = dict(
 feat=["Checks 14 items (safety, reliability, usability, maintainability, portability) and gives a score out of 100 and a grade from S to C", "All scoring rules are public; the same code always gets the same score", "Reviews code read from GitHub repositories, Gists and web pages together with the uploaded files", "Explains how to unblock a link that cannot be read, by cause", "Runs in the browser (nothing is sent to a server before consent); free"],
 page=dict(
  link_title="Review linked sources too (optional)",
  link_hint="If your program is tied to a GitHub repository, a Google Apps Script web app or similar, paste the addresses. They are reviewed together with your uploaded files as one program.",
  link_ph="https://github.com/…  or  https://script.google.com/macros/s/…/exec",
  link_add="Add link",
  links_rule="Code read from linked sources (GitHub, Gist, web pages, Apps Script web apps) is reviewed together with the uploaded files. A link that cannot be read adds nothing to the score, and because the review scope is then partial, grade S is not given. The analysis report explains how to unblock it."),
 ui=dict(
  l_reading="Reading…", l_ok="Read · {n} files", l_page_ok="Read · 1 page", l_blocked="Blocked", l_info="Connection only", l_rm="Remove",
  l_bad="Enter a valid address that starts with https://.", l_dup="That link is already added.", l_max="You can add up to {n} links.",
  k_gh="GitHub repository", k_gist="GitHub Gist", k_gsapp="Apps Script web app", k_gsedit="Apps Script editor", k_web="Web page",
  g_hint="How to unblock this", g_after="After fixing it, remove this link and add it again.",
  det_title="Links found in your code", det_add="Review too",
  l_trunc="There are many files, so only the first {n} were read.",
  g_links="Combined review scope", links_sum="{a} uploaded files · {b} links ({c} read)",
  cov_yes="reviewed through a link", cov_no="external connection not reviewed through a link",
  f_links_partial="{n} linked sources could not be read, so the review scope is partial. What could not be read is not in the score. How to unblock is in the Analysis report tab.",
  f_cap_link="A linked source could not be read, so the grade was capped at A instead of S.",
  rt_links="Links: {c} of {b} read"),
 guide=dict(
  gh_notfound=dict(t="The GitHub repository was not found or is private", s=["Check the spelling of the owner and repository name in the address.", "If it is private, make it public in GitHub: Settings → General → Danger Zone at the bottom → Change visibility → Make public. First make sure the code is safe to publish, and do not publish it if it holds passwords or keys.", "If you cannot make it public, use Code → Download ZIP and upload that file above."]),
  gh_rate=dict(t="GitHub is temporarily limiting requests", s=["GitHub limits how many requests per hour it accepts without a login. The limit has been reached.", "Remove this link and add it again in about an hour.", "If you are in a hurry, download the repository as a ZIP and upload it."]),
  gh_nocode=dict(t="No readable code files were found", s=["Check that the repository has code files such as HTML, JS, Python or Apps Script.", "If the code is in a subfolder, paste that folder’s address (…/tree/branch/folder).", "If the files are too big or too many, upload a ZIP instead."]),
  gs_editor=dict(t="An Apps Script editor link cannot be read", s=["Google does not let anyone read Apps Script source through a link. To review it, the code has to come in as files.", "In the editor, copy each file (.gs, .html) into a file of the same name and upload them above.", "If you use clasp, you can upload the folder from clasp clone as a ZIP."]),
  gs_login=dict(t="The web app is returning a sign-in page", s=["In the editor, click Deploy (top right) → Manage deployments → the pencil (edit) button.", "Change “Who has access” to “Anyone” and deploy. With a work or school account, an administrator may have blocked outside sharing.", "If you cannot make it public, save the source (.gs) as files and upload them."]),
  gs_cors=dict(t="It connects, but Google blocks reading the content", s=["With this web app address we can only confirm the connection, not read the code. This is not an error; it is a Google safeguard.", "Also check in Manage deployments that the web app is open to “Anyone”.", "For an accurate review, save the source (.gs, .html) as files and upload them above."]),
  gs_unreach=dict(t="Could not connect to the web app", s=["Check that the address looks like …/macros/s/…/exec. A /dev address can be opened only by people with edit access.", "Check whether an ad blocker or a company security network is blocking script.google.com.", "If it still fails, save the source as files and upload them."]),
  web_cors=dict(t="This site is blocked from being read from outside", s=["The site is set so other sites cannot read its content (CORS). This is not a fault in the site.", "Upload the source as a ZIP, or put it in a public GitHub repository and paste that address.", "If you run the site yourself, adding the response header Access-Control-Allow-Origin: * makes it readable."]),
  web_status=dict(t="The page is not responding normally", s=["Open the address in a new browser tab to check that it is right.", "A page that needs a login cannot be read. Paste a public address.", "The server may be down for a moment, so try adding it again a little later."]),
  net_fail=dict(t="Could not connect", s=["Check the spelling and that the address starts with https://.", "Check your internet connection, ad blocker and company security network.", "If it keeps failing, upload the source as a ZIP."]))
)

# ═══════════════════════ 日本語 ═══════════════════════
UXL['ja'] = dict(
 feat=["14項目（安全性・信頼性・使いやすさ・保守性・移植性）を自動点検し、100点満点とS〜C等級を表示", "採点規則はすべて公開、同じコードは常に同じ点数", "GitHubリポジトリ・Gist・ウェブページから読み込んだコードをアップロードファイルと合わせて審査", "リンクが読めないときは原因別に解除方法を案内", "ブラウザ内で分析（同意前はサーバーへ送信しません）、無料"],
 page=dict(
  link_title="連携しているリンクも一緒に審査（任意）",
  link_hint="プログラムがGitHubリポジトリやGoogle Apps Scriptのウェブアプリなどとつながっている場合は、アドレスを貼り付けてください。アップロードしたファイルと合わせて、一つのプログラムとして審査します。",
  link_ph="https://github.com/…  または  https://script.google.com/macros/s/…/exec",
  link_add="リンクを追加",
  links_rule="連携したリンク（GitHub・Gist・ウェブページ・Apps Scriptウェブアプリ）から読み込んだコードは、アップロードしたファイルと合わせて審査します。リンクを読み込めない場合、その部分は点数に入らず、審査範囲が部分的になるためS等級は付きません。解除の方法は分析レポートに表示されます。"),
 ui=dict(
  l_reading="読み込み中…", l_ok="読み込み済み・ファイル{n}件", l_page_ok="読み込み済み・ページ1件", l_blocked="ブロックされています", l_info="接続のみ確認", l_rm="外す",
  l_bad="https:// で始まる正しいアドレスを入力してください。", l_dup="すでに追加されているリンクです。", l_max="リンクは最大{n}件まで追加できます。",
  k_gh="GitHubリポジトリ", k_gist="GitHub Gist", k_gsapp="Apps Scriptウェブアプリ", k_gsedit="Apps Scriptエディタ", k_web="ウェブページ",
  g_hint="ブロックをこのように解除してください", g_after="直したあとは、このリンクを外してもう一度追加してください。",
  det_title="コード内で見つかったリンク", det_add="一緒に審査",
  l_trunc="ファイルが多いため、先頭の{n}件だけ読み込みました。",
  g_links="統合審査の範囲", links_sum="アップロード{a}件・リンク{b}件（読み込み済み{c}件）",
  cov_yes="リンクで一緒に審査済み", cov_no="リンクで審査されていない外部接続",
  f_links_partial="連携リンク{n}件を読み込めなかったため、審査範囲が部分的です。読み込めなかった部分は点数に含まれていません。解除の方法は分析レポートのタブにあります。",
  f_cap_link="読み込めないリンクがあるため、Sの代わりにAに制限しました。",
  rt_links="リンク：{c} / {b}件読み込み"),
 guide=dict(
  gh_notfound=dict(t="GitHubリポジトリが見つからないか、非公開です", s=["アドレスの所有者名・リポジトリ名の綴りを確認してください。", "非公開の場合は、GitHubの Settings → General → 最下部の Danger Zone → Change visibility → Make public で公開してください。公開してよいコードか先に確認し、パスワードやキーが含まれる場合は公開しないでください。", "公開が難しい場合は、Code → Download ZIP で取得したファイルを上のアップロード欄に入れてください。"]),
  gh_rate=dict(t="GitHubが一時的にリクエストを制限しています", s=["GitHubは、ログインなしのリクエストを1時間あたりの回数で制限しています。今はその上限に達しています。", "約1時間後に、このリンクを外してもう一度追加してください。", "お急ぎの場合は、リポジトリをZIPで取得してアップロードしてください。"]),
  gh_nocode=dict(t="読み込めるコードファイルがありません", s=["リポジトリにHTML・JS・Python・Apps Scriptなどのコードファイルがあるか確認してください。", "コードがサブフォルダにある場合は、そのフォルダのアドレス（…/tree/ブランチ/フォルダ）を入力してください。", "ファイルが大きすぎる、または多すぎる場合は、ZIPでアップロードしてください。"]),
  gs_editor=dict(t="Apps Scriptエディタのリンクではコードを読み込めません", s=["GoogleはApps Scriptのソースをリンクで読み取らせてくれません。審査するには、コードをファイルとして取り込む必要があります。", "エディタで各ファイル（.gs、.html）の内容をコピーし、同じ名前のファイルに保存して、上のアップロード欄に入れてください。", "claspをお使いの場合は、clasp cloneで取得したフォルダをZIPにしてアップロードしても構いません。"]),
  gs_login=dict(t="ウェブアプリがログイン画面を返しています", s=["エディタ右上の デプロイ → デプロイを管理 → 鉛筆（編集）ボタンを押してください。", "「アクセスできるユーザー」を「全員」に変更してデプロイしてください。会社や学校のアカウントでは、管理者が外部共有を禁止している場合があります。", "公開が難しい場合は、ソース（.gs）をファイルとして保存してアップロードしてください。"]),
  gs_cors=dict(t="接続はできますが、Googleが内容の読み取りを制限しています", s=["このウェブアプリのアドレスでは接続の確認しかできず、コードは読み取れません。エラーではなく、Googleの保護の仕組みです。", "「デプロイを管理」で、ウェブアプリが「全員」に公開されているかも確認してください。", "正確な審査のため、ソース（.gs・.html）をファイルとして保存し、上のアップロード欄に入れてください。"]),
  gs_unreach=dict(t="ウェブアプリに接続できませんでした", s=["アドレスが …/macros/s/…/exec の形か確認してください。/dev のアドレスは編集権限のある人しか開けません。", "広告ブロックや社内のセキュリティネットワークが script.google.com をブロックしていないか確認してください。", "それでも接続できない場合は、ソースをファイルとして保存してアップロードしてください。"]),
  web_cors=dict(t="このサイトは外部から読み取れないよう制限されています", s=["このサイトは、ほかのサイトから内容を読み取れない設定になっています（CORS）。サイトの不具合ではありません。", "ソースをZIPでアップロードするか、公開GitHubリポジトリに置いてそのアドレスを入力してください。", "ご自身で運営しているサイトなら、レスポンスヘッダーに Access-Control-Allow-Origin: * を追加すると読み取れるようになります。"]),
  web_status=dict(t="ページが正常に応答していません", s=["アドレスが正しいか、ブラウザの新しいタブで直接開いて確認してください。", "ログインが必要なページは読み取れません。公開されているアドレスを入力してください。", "サーバーが一時的に止まっている可能性があります。しばらくしてからもう一度追加してください。"]),
  net_fail=dict(t="接続できませんでした", s=["アドレスの綴りと、https:// で始まっているかを確認してください。", "インターネット接続、広告ブロック、社内のセキュリティネットワークを確認してください。", "それでも接続できない場合は、ソースをZIPでアップロードしてください。"]))
)

# ═══════════════════════ Русский ═══════════════════════
UXL['ru'] = dict(
 feat=["Проверяет 14 пунктов (безопасность, надёжность, удобство, сопровождаемость, переносимость) и выставляет балл из 100 и уровень от S до C", "Все правила оценки открыты, один и тот же код всегда получает один и тот же балл", "Проверяет вместе с загруженными файлами код, прочитанный из репозиториев GitHub, Gist и веб-страниц", "Если ссылку не удалось прочитать, объясняет по причине, как снять блокировку", "Работает в браузере (до согласия ничего не отправляется на сервер), бесплатно"],
 page=dict(
  link_title="Проверить и связанные источники (необязательно)",
  link_hint="Если программа связана с репозиторием GitHub, веб-приложением Google Apps Script и т. п., вставьте адреса. Они проверяются вместе с загруженными файлами как одна программа.",
  link_ph="https://github.com/…  или  https://script.google.com/macros/s/…/exec",
  link_add="Добавить ссылку",
  links_rule="Код, прочитанный по связанным ссылкам (GitHub, Gist, веб-страницы, веб-приложения Apps Script), проверяется вместе с загруженными файлами. Ссылка, которую не удалось прочитать, не добавляет баллов, а так как охват проверки неполный, уровень S не выставляется. В отчёте анализа написано, как снять блокировку."),
 ui=dict(
  l_reading="Читаю…", l_ok="Прочитано · файлов: {n}", l_page_ok="Прочитано · 1 страница", l_blocked="Заблокировано", l_info="Только соединение", l_rm="Убрать",
  l_bad="Введите корректный адрес, начинающийся с https://.", l_dup="Эта ссылка уже добавлена.", l_max="Можно добавить не более {n} ссылок.",
  k_gh="Репозиторий GitHub", k_gist="GitHub Gist", k_gsapp="Веб-приложение Apps Script", k_gsedit="Редактор Apps Script", k_web="Веб-страница",
  g_hint="Как снять блокировку", g_after="После исправления уберите эту ссылку и добавьте её снова.",
  det_title="Ссылки, найденные в коде", det_add="Проверить тоже",
  l_trunc="Файлов много, прочитаны только первые {n}.",
  g_links="Общий охват проверки", links_sum="Загружено файлов: {a} · ссылок: {b} (прочитано: {c})",
  cov_yes="проверено через ссылку", cov_no="внешнее соединение, не проверенное через ссылку",
  f_links_partial="Не удалось прочитать связанных источников: {n}, поэтому охват проверки неполный. Непрочитанное в баллы не вошло. Как снять блокировку — на вкладке «Отчёт анализа».",
  f_cap_link="Не удалось прочитать связанный источник, поэтому уровень ограничен A вместо S.",
  rt_links="Ссылки: прочитано {c} из {b}"),
 guide=dict(
  gh_notfound=dict(t="Репозиторий GitHub не найден или закрыт", s=["Проверьте написание владельца и названия репозитория в адресе.", "Если репозиторий закрытый, откройте его: Settings → General → внизу Danger Zone → Change visibility → Make public. Сначала убедитесь, что код можно публиковать, и не публикуйте его, если в нём есть пароли или ключи.", "Если открыть нельзя, скачайте Code → Download ZIP и загрузите файл выше."]),
  gh_rate=dict(t="GitHub временно ограничивает запросы", s=["GitHub ограничивает число запросов в час без входа в аккаунт. Лимит исчерпан.", "Уберите эту ссылку и добавьте снова примерно через час.", "Если срочно — скачайте репозиторий в ZIP и загрузите."]),
  gh_nocode=dict(t="Не найдено читаемых файлов с кодом", s=["Проверьте, есть ли в репозитории файлы кода: HTML, JS, Python, Apps Script.", "Если код лежит в подпапке, вставьте адрес этой папки (…/tree/ветка/папка).", "Если файлов слишком много или они слишком большие, загрузите ZIP."]),
  gs_editor=dict(t="Ссылку на редактор Apps Script прочитать нельзя", s=["Google не позволяет читать исходный код Apps Script по ссылке. Для проверки код нужно принести файлами.", "В редакторе скопируйте содержимое каждого файла (.gs, .html) в файл с тем же именем и загрузите их выше.", "Если вы используете clasp, можно загрузить ZIP папки, полученной через clasp clone."]),
  gs_login=dict(t="Веб-приложение возвращает страницу входа", s=["В редакторе нажмите «Развернуть» (справа вверху) → «Управление развёртываниями» → карандаш (изменить).", "Смените «У кого есть доступ» на «Все» и разверните заново. В рабочем или учебном аккаунте администратор мог запретить внешний доступ.", "Если открыть нельзя, сохраните исходный код (.gs) файлами и загрузите."]),
  gs_cors=dict(t="Соединение есть, но Google не даёт читать содержимое", s=["По адресу этого веб-приложения можно лишь убедиться в соединении, а код прочитать нельзя. Это не ошибка, а защита Google.", "Проверьте также в «Управлении развёртываниями», что приложение открыто для «Всех».", "Для точной проверки сохраните исходный код (.gs, .html) файлами и загрузите выше."]),
  gs_unreach=dict(t="Не удалось подключиться к веб-приложению", s=["Проверьте, что адрес имеет вид …/macros/s/…/exec. Адрес /dev открывается только у тех, у кого есть права редактирования.", "Проверьте, не блокирует ли script.google.com блокировщик рекламы или корпоративная сеть.", "Если не получается, сохраните исходный код файлами и загрузите."]),
  web_cors=dict(t="Этот сайт закрыт для чтения извне", s=["Сайт настроен так, что другие сайты не могут читать его содержимое (CORS). Это не неисправность сайта.", "Загрузите исходный код в ZIP или выложите в открытый репозиторий GitHub и вставьте его адрес.", "Если сайт ваш, добавьте в ответ заголовок Access-Control-Allow-Origin: * — тогда его можно будет прочитать."]),
  web_status=dict(t="Страница отвечает неправильно", s=["Откройте адрес в новой вкладке браузера и проверьте, что он верный.", "Страницы, требующие входа, прочитать нельзя. Вставьте открытый адрес.", "Возможно, сервер на время недоступен — попробуйте добавить чуть позже."]),
  net_fail=dict(t="Не удалось подключиться", s=["Проверьте написание адреса и что он начинается с https://.", "Проверьте интернет, блокировщик рекламы и корпоративную сеть.", "Если не получается, загрузите исходный код в ZIP."]))
)

# ═══════════════════════ Bahasa Indonesia ═══════════════════════
UXL['id'] = dict(
 feat=["Memeriksa 14 butir (keamanan, keandalan, kemudahan pakai, kemudahan perawatan, portabilitas) dan memberi nilai dari 100 serta tingkat S–C", "Semua aturan penilaian terbuka; kode yang sama selalu mendapat nilai yang sama", "Menilai kode dari repositori GitHub, Gist, dan halaman web bersama berkas yang diunggah", "Menjelaskan cara membuka tautan yang tidak bisa dibaca, menurut penyebabnya", "Berjalan di peramban (tidak ada yang dikirim ke server sebelum persetujuan), gratis"],
 page=dict(
  link_title="Nilai juga sumber yang tertaut (opsional)",
  link_hint="Jika program Anda terhubung ke repositori GitHub, aplikasi web Google Apps Script, atau sejenisnya, tempelkan alamatnya. Semuanya dinilai bersama berkas yang diunggah sebagai satu program.",
  link_ph="https://github.com/…  atau  https://script.google.com/macros/s/…/exec",
  link_add="Tambah tautan",
  links_rule="Kode yang dibaca dari tautan (GitHub, Gist, halaman web, aplikasi web Apps Script) dinilai bersama berkas yang diunggah. Tautan yang tidak bisa dibaca tidak menambah nilai, dan karena cakupan penilaian jadi sebagian, tingkat S tidak diberikan. Laporan analisis menjelaskan cara membukanya."),
 ui=dict(
  l_reading="Membaca…", l_ok="Terbaca · {n} berkas", l_page_ok="Terbaca · 1 halaman", l_blocked="Terblokir", l_info="Hanya sambungan", l_rm="Hapus",
  l_bad="Masukkan alamat yang benar yang diawali https://.", l_dup="Tautan itu sudah ditambahkan.", l_max="Anda dapat menambah maksimal {n} tautan.",
  k_gh="Repositori GitHub", k_gist="GitHub Gist", k_gsapp="Aplikasi web Apps Script", k_gsedit="Editor Apps Script", k_web="Halaman web",
  g_hint="Cara membuka blokirnya", g_after="Setelah diperbaiki, hapus tautan ini lalu tambahkan lagi.",
  det_title="Tautan yang ditemukan di kode", det_add="Nilai juga",
  l_trunc="Berkasnya banyak, jadi hanya {n} yang pertama dibaca.",
  g_links="Cakupan penilaian terpadu", links_sum="{a} berkas diunggah · {b} tautan ({c} terbaca)",
  cov_yes="dinilai lewat tautan", cov_no="sambungan luar yang tidak dinilai lewat tautan",
  f_links_partial="{n} sumber tertaut tidak bisa dibaca, jadi cakupan penilaian hanya sebagian. Yang tidak terbaca tidak masuk nilai. Cara membukanya ada di tab Laporan analisis.",
  f_cap_link="Ada sumber tertaut yang tidak terbaca, jadi tingkat dibatasi A, bukan S.",
  rt_links="Tautan: {c} dari {b} terbaca"),
 guide=dict(
  gh_notfound=dict(t="Repositori GitHub tidak ditemukan atau bersifat privat", s=["Periksa ejaan nama pemilik dan nama repositori di alamat.", "Jika privat, jadikan publik di GitHub: Settings → General → Danger Zone di bagian bawah → Change visibility → Make public. Pastikan dulu kodenya aman dipublikasikan, dan jangan dipublikasikan jika berisi kata sandi atau kunci.", "Jika tidak bisa dipublikasikan, pakai Code → Download ZIP lalu unggah berkasnya di atas."]),
  gh_rate=dict(t="GitHub sementara membatasi permintaan", s=["GitHub membatasi jumlah permintaan per jam tanpa login. Batasnya sudah tercapai.", "Hapus tautan ini dan tambahkan lagi sekitar satu jam kemudian.", "Jika mendesak, unduh repositori sebagai ZIP lalu unggah."]),
  gh_nocode=dict(t="Tidak ada berkas kode yang bisa dibaca", s=["Pastikan repositori memiliki berkas kode seperti HTML, JS, Python, atau Apps Script.", "Jika kode ada di subfolder, tempelkan alamat folder itu (…/tree/cabang/folder).", "Jika berkasnya terlalu besar atau banyak, unggah dalam bentuk ZIP."]),
  gs_editor=dict(t="Tautan editor Apps Script tidak bisa dibaca", s=["Google tidak mengizinkan sumber Apps Script dibaca lewat tautan. Untuk dinilai, kode harus dibawa sebagai berkas.", "Di editor, salin isi tiap berkas (.gs, .html) ke berkas dengan nama yang sama lalu unggah di atas.", "Jika memakai clasp, folder hasil clasp clone dapat diunggah sebagai ZIP."]),
  gs_login=dict(t="Aplikasi web mengembalikan halaman masuk", s=["Di editor, klik Deploy (kanan atas) → Manage deployments → tombol pensil (edit).", "Ubah “Who has access” menjadi “Anyone” lalu deploy. Pada akun kantor atau sekolah, administrator mungkin memblokir berbagi ke luar.", "Jika tidak bisa dipublikasikan, simpan sumber (.gs) sebagai berkas lalu unggah."]),
  gs_cors=dict(t="Tersambung, tetapi Google memblokir pembacaan isinya", s=["Dengan alamat aplikasi web ini kami hanya bisa memastikan sambungan, bukan membaca kode. Ini bukan galat, melainkan pengaman Google.", "Periksa juga di Manage deployments bahwa aplikasi web terbuka untuk “Anyone”.", "Untuk penilaian yang akurat, simpan sumber (.gs, .html) sebagai berkas lalu unggah di atas."]),
  gs_unreach=dict(t="Tidak bisa tersambung ke aplikasi web", s=["Pastikan alamatnya berbentuk …/macros/s/…/exec. Alamat /dev hanya bisa dibuka orang yang punya akses edit.", "Periksa apakah pemblokir iklan atau jaringan keamanan kantor memblokir script.google.com.", "Jika tetap gagal, simpan sumber sebagai berkas lalu unggah."]),
  web_cors=dict(t="Situs ini diblokir agar tidak bisa dibaca dari luar", s=["Situs diatur agar situs lain tidak bisa membaca isinya (CORS). Ini bukan kerusakan situs.", "Unggah sumber sebagai ZIP, atau taruh di repositori GitHub publik lalu tempelkan alamatnya.", "Jika Anda yang mengelola situs, menambahkan header respons Access-Control-Allow-Origin: * membuatnya bisa dibaca."]),
  web_status=dict(t="Halaman tidak merespons dengan normal", s=["Buka alamatnya di tab baru browser untuk memastikan benar.", "Halaman yang memerlukan login tidak bisa dibaca. Tempelkan alamat publik.", "Servernya mungkin sedang mati sebentar, coba tambahkan lagi nanti."]),
  net_fail=dict(t="Tidak bisa tersambung", s=["Periksa ejaan alamat dan pastikan diawali https://.", "Periksa koneksi internet, pemblokir iklan, dan jaringan keamanan kantor.", "Jika tetap gagal, unggah sumber sebagai ZIP."]))
)

# ═══════════════════════ 繁體中文 ═══════════════════════
UXL['tw'] = dict(
 feat=["自動檢查 14 個項目（安全性、可靠性、易用性、可維護性、可移植性），給出 100 分制分數與 S～C 等級", "評分規則全部公開，相同程式碼一定得到相同分數", "將從 GitHub 儲存庫、Gist、網頁讀取的程式碼與上傳檔案合併評審", "連結讀取不到時，依原因說明如何解除阻擋", "在瀏覽器內分析（同意前不會傳送到伺服器），免費"],
 page=dict(
  link_title="連結的來源也一併評審（選填）",
  link_hint="如果您的程式連到 GitHub 儲存庫、Google Apps Script 網頁應用程式等，請貼上網址。它們會與您上傳的檔案合在一起，當作一個程式來評審。",
  link_ph="https://github.com/…  或  https://script.google.com/macros/s/…/exec",
  link_add="新增連結",
  links_rule="從連結（GitHub、Gist、網頁、Apps Script 網頁應用程式）讀取的程式碼，會與上傳的檔案合併評審。讀取不到的連結不會計入分數，且因為評審範圍不完整，不會給 S 級。分析報告中會說明如何解除阻擋。"),
 ui=dict(
  l_reading="讀取中…", l_ok="已讀取・{n} 個檔案", l_page_ok="已讀取・1 個頁面", l_blocked="被阻擋", l_info="僅確認連線", l_rm="移除",
  l_bad="請輸入以 https:// 開頭的正確網址。", l_dup="這個連結已經加入。", l_max="最多可加入 {n} 個連結。",
  k_gh="GitHub 儲存庫", k_gist="GitHub Gist", k_gsapp="Apps Script 網頁應用程式", k_gsedit="Apps Script 編輯器", k_web="網頁",
  g_hint="請這樣解除阻擋", g_after="修正後，請先移除這個連結再重新加入。",
  det_title="在程式碼中發現的連結", det_add="一併評審",
  l_trunc="檔案很多，只讀取了前 {n} 個。",
  g_links="整合評審範圍", links_sum="上傳 {a} 個檔案・連結 {b} 個（已讀取 {c} 個）",
  cov_yes="已透過連結一併評審", cov_no="未透過連結評審的外部連線",
  f_links_partial="有 {n} 個連結的來源無法讀取，評審範圍因此不完整。讀不到的部分沒有計入分數。解除阻擋的方法在「分析報告」分頁。",
  f_cap_link="有連結來源無法讀取，因此等級限制為 A，不給 S。",
  rt_links="連結：已讀取 {c} / {b} 個"),
 guide=dict(
  gh_notfound=dict(t="找不到 GitHub 儲存庫，或它是私人的", s=["請確認網址中擁有者與儲存庫名稱的拼字。", "若是私人儲存庫，請在 GitHub 的 Settings → General → 最下方 Danger Zone → Change visibility → Make public 改為公開。請先確認程式碼可以公開；若含有密碼或金鑰，請不要公開。", "若無法公開，請用 Code → Download ZIP 下載後，把檔案上傳到上方。"]),
  gh_rate=dict(t="GitHub 暫時限制了請求", s=["GitHub 對未登入的請求有每小時次數的限制，目前已達上限。", "請在約一小時後，移除這個連結再重新加入。", "若很急，請把儲存庫下載成 ZIP 後上傳。"]),
  gh_nocode=dict(t="找不到可讀取的程式碼檔案", s=["請確認儲存庫中有 HTML、JS、Python 或 Apps Script 等程式碼檔案。", "若程式碼在子資料夾，請貼上該資料夾的網址（…/tree/分支/資料夾）。", "若檔案太大或太多，請改用 ZIP 上傳。"]),
  gs_editor=dict(t="Apps Script 編輯器的連結無法讀取程式碼", s=["Google 不允許透過連結讀取 Apps Script 的原始碼。要評審，必須把程式碼以檔案帶進來。", "在編輯器中，把每個檔案（.gs、.html）的內容複製到同名檔案，並上傳到上方。", "若您使用 clasp，也可以把 clasp clone 取得的資料夾壓縮成 ZIP 上傳。"]),
  gs_login=dict(t="網頁應用程式回傳了登入畫面", s=["在編輯器右上角點選「部署」→「管理部署作業」→ 鉛筆（編輯）按鈕。", "把「誰可以存取」改成「所有人」再部署。若是公司或學校帳號，管理員可能禁止了對外分享。", "若無法公開，請把原始碼（.gs）存成檔案後上傳。"]),
  gs_cors=dict(t="可以連線，但 Google 阻擋了內容的讀取", s=["用這個網頁應用程式的網址，只能確認有連線，無法讀取程式碼。這不是錯誤，而是 Google 的保護機制。", "也請在「管理部署作業」中確認網頁應用程式已對「所有人」開放。", "為了準確評審，請把原始碼（.gs、.html）存成檔案，上傳到上方。"]),
  gs_unreach=dict(t="無法連到網頁應用程式", s=["請確認網址形如 …/macros/s/…/exec。/dev 的網址只有具編輯權限的人才能開啟。", "請確認廣告阻擋程式或公司的資安網路沒有擋住 script.google.com。", "若仍然不行，請把原始碼存成檔案後上傳。"]),
  web_cors=dict(t="這個網站被設定成無法從外部讀取", s=["這個網站被設定成其他網站無法讀取它的內容（CORS）。這不是網站故障。", "請把原始碼用 ZIP 上傳，或放到公開的 GitHub 儲存庫再貼上該網址。", "若這是您自己經營的網站，在回應標頭加上 Access-Control-Allow-Origin: * 就能讀取。"]),
  web_status=dict(t="頁面沒有正常回應", s=["請在瀏覽器新分頁直接開啟網址，確認是否正確。", "需要登入的頁面無法讀取，請貼上公開的網址。", "伺服器可能暫時停止，請稍後再試著加入。"]),
  net_fail=dict(t="無法連線", s=["請確認網址拼字，以及是否以 https:// 開頭。", "請檢查網路連線、廣告阻擋程式與公司的資安網路。", "若仍然不行，請把原始碼用 ZIP 上傳。"]))
)

# English (India) edition: same wording as the U.S. edition (2026-11-07)
import copy
UXL['in'] = copy.deepcopy(UXL['en'])
UXL['sg'] = copy.deepcopy(UXL['en'])
UXL['ph'] = copy.deepcopy(UXL['en'])
