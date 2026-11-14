# -*- coding: utf-8 -*-
"""AI 심사실 7개 언어판 생성기.

  python scripts/ai-judge/build.py

template.html(+ style.css.part)에 lang/*.py의 문구표를 끼워 넣어
public/ai-judge/index.html(ko)과 public/{ja,ru,id,tw,en,in}/ai-judge/index.html을 만든다.
화면·채점 로직은 template.html 한 곳에만 있으므로, 고칠 때는 여기를 고치고 다시 실행한다.
생성된 public/**/ai-judge/index.html을 직접 고치지 말 것(다음 실행 때 덮어씀).
"""
import importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SITE = 'https://hospital-ai-lab.com'
CODES = ['ko', 'ja', 'ru', 'id', 'tw', 'en', 'in', 'sg']
HREFLANG = {'ko': 'ko', 'ja': 'ja', 'ru': 'ru', 'id': 'id', 'tw': 'zh-TW', 'en': 'en', 'in': 'en-IN', 'sg': 'en-SG'}
PATHS = {'ko': '/ai-judge/', 'ja': '/ja/ai-judge/', 'ru': '/ru/ai-judge/', 'id': '/id/ai-judge/', 'tw': '/tw/ai-judge/', 'en': '/en/ai-judge/', 'in': '/in/ai-judge/', 'sg': '/sg/ai-judge/'}


def load(code):
    spec = importlib.util.spec_from_file_location('lang_' + code, os.path.join(HERE, 'lang', code + '.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def shape(x):
    """키 구조(문자열 값은 자리표시자 집합까지)를 비교용으로 뽑는다."""
    if isinstance(x, dict):
        return {k: shape(v) for k, v in x.items()}
    if isinstance(x, list):
        return [shape(v) for v in x]
    return sorted(re.findall(r'\{(\w+)\}', x)) if isinstance(x, str) else type(x).__name__


def diff(a, b, path=''):
    out = []
    if isinstance(a, dict):
        if not isinstance(b, dict):
            return [path + ': 구조 다름']
        for k in a:
            if k not in b:
                out.append(f'{path}.{k}: 없음')
            else:
                out += diff(a[k], b[k], f'{path}.{k}')
        for k in b:
            if k not in a:
                out.append(f'{path}.{k}: 여분')
    elif isinstance(a, list):
        if not isinstance(b, list) or len(a) != len(b):
            return [f'{path}: 길이 다름']
        for i, (x, y) in enumerate(zip(a, b)):
            out += diff(x, y, f'{path}[{i}]')
    elif a != b:
        out.append(f'{path}: 자리표시자 {a} != {b}')
    return out


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def sb_key():
    s = open(os.path.join(ROOT, 'src', 'utils', 'site.ts'), encoding='utf-8').read()
    m = re.search(r"SUPABASE_ANON_KEY\s*=\s*\n?\s*'([^']+)'", s)
    if not m:
        sys.exit('SUPABASE_ANON_KEY를 site.ts에서 찾지 못했습니다')
    return m.group(1)


def contact_href(code, meta):
    # 한국어판은 문의 페이지, 나머지 언어판은 각 언어 푸터와 같이 메일 링크
    if code == 'ko':
        return meta['contact']
    s = open(os.path.join(ROOT, 'src', 'utils', 'site.ts'), encoding='utf-8').read()
    m = re.search(r"CONTACT_EMAIL\s*=\s*'([^']+)'", s)
    return 'mailto:' + m.group(1)


def load_ux():
    spec = importlib.util.spec_from_file_location('lang_ux', os.path.join(HERE, 'lang', 'ux.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.UX


def load_uxp():
    spec = importlib.util.spec_from_file_location('lang_uxp', os.path.join(HERE, 'lang', 'ux_page.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.UXP


def load_uxl():
    spec = importlib.util.spec_from_file_location('lang_uxl', os.path.join(HERE, 'lang', 'ux_links.py'))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.UXL


def main():
    base = load('ko')
    UXL = load_uxl()
    ref_uxl = shape(UXL['ko'])
    UX = load_ux()
    UXP = load_uxp()
    ref_ux = shape(UX['ko'])
    ref_uxp = shape(UXP['ko'])
    ref_h, ref_t = shape(base.H), shape(base.T)
    tpl = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
    css = open(os.path.join(HERE, 'style.css.part'), encoding='utf-8').read()
    css = re.sub(r'/\* Layout:[^*]*\*/\n', '/* Layout: upload + short questions, result in a popup, report and public rubric below */\n', css)
    key = sb_key()
    alts = ''.join(f'<link rel="alternate" hreflang="{HREFLANG[c]}" href="{SITE}{PATHS[c]}">\n' for c in CODES)
    alts += f'<link rel="alternate" hreflang="x-default" href="{SITE}/ai-judge/">'
    problems = []
    for code in (sys.argv[1:] or CODES):
        m = load(code)
        bad = diff(ref_h, shape(m.H), 'H') + diff(ref_t, shape(m.T), 'T') + (diff(ref_ux, shape(UX[code]), 'UX') if code in UX else ['UX: 문구 없음']) + (diff(ref_uxp, shape(UXP[code]), 'UXP') if code in UXP else ['UXP: 문구 없음']) + (diff(ref_uxl, shape(UXL[code]), 'UXL') if code in UXL else ['UXL: 문구 없음'])
        if bad:
            problems += [f'[{code}] {b}' for b in bad]
            continue
        meta, H, T = m.META, dict(m.H), json.loads(json.dumps(m.T))
        H.update(UXP[code]['page'])
        H.update(UXL[code]['page'])
        canon = SITE + meta['path']
        home = meta['home']
        T['consent_lines'] = [s.replace('{contact}', contact_href(code, meta)) for s in T['consent_lines']]
        T['contact_href'] = contact_href(code, meta)
        T['ux'] = UX[code]['ux']
        T['help'] = UX[code]['help']
        T['ui'] = {**UXP[code]['ui'], **UXL[code]['ui']}
        T['lk'] = UXL[code]['guide']
        site_id = f'{SITE}/#website' if code == 'ko' else f'{SITE}/#website-{code}'
        jsonld = json.dumps({
            '@context': 'https://schema.org',
            '@graph': [
                {'@type': 'WebPage', '@id': canon + '#webpage', 'url': canon, 'name': H['title'], 'description': H['desc'],
                 'inLanguage': meta['in_language'], 'isPartOf': {'@id': site_id},
                 'breadcrumb': {'@id': canon + '#breadcrumb'}, 'about': {'@id': SITE + '/#organization'}},
                {'@type': 'WebApplication', '@id': canon + '#app', 'name': H['title'], 'url': canon, 'description': H['desc'],
                 'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Any (web browser)', 'inLanguage': meta['in_language'],
                 'featureList': UXL[code]['feat'],
                 'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'},
                 'isPartOf': {'@id': site_id}, 'publisher': {'@id': SITE + '/#organization'}, 'mainEntityOfPage': {'@id': canon + '#webpage'}},
                {'@type': 'BreadcrumbList', '@id': canon + '#breadcrumb', 'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': H['crumb_home'], 'item': SITE + home},
                    {'@type': 'ListItem', 'position': 2, 'name': H['crumb_page'], 'item': canon}]},
            ]}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
        T['loc'] = meta['loc']
        # 문자 범위는 \uXXXX 이스케이프로 내보낸다(다른 언어판 파일에 한글 글자가 직접 남지 않게)
        T['rx']['msg_chars'] = ''.join(c if ord(c) < 128 else '\\u%04X' % ord(c) for c in T['rx']['msg_chars'])
        if code != 'ko' and '\\uAC00' not in T['rx']['msg_chars']:
            T['rx']['msg_chars'] += '\\uAC00-\\uD7A3'
        css_l = re.sub(r'--sans:[^\n]*', '--sans:' + meta['sans'] + ';', css)
        raw = {'alts': alts, 'jsonld': jsonld, 'font_href': esc(meta['font_href']), 'style': css_l,
               'ex_readme': H.get('ex_readme', ''), 'sb_key': key,
               'T_JSON': json.dumps(T, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')}
        vals = {k: esc(v) for k, v in H.items() if k != 'ex_readme'}
        vals.update(lang=meta['lang'], canon=canon, og_locale=meta['og_locale'], home=home)

        def sub(mo):
            k = mo.group(2)
            if mo.group(1):
                return raw[k]
            return vals[k]
        out = re.sub(r'\{\{(!?)(\w+)\}\}', sub, tpl)
        left = re.findall(r'\{\{[^}]*\}\}', out)
        if left:
            problems.append(f'[{code}] 못 채운 자리표시자: {left[:5]}')
            continue
        path = os.path.join(ROOT, 'public', *(meta['path'].strip('/').split('/')), 'index.html')
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'w', encoding='utf-8', newline='\n').write(out)
        print('wrote', os.path.relpath(path, ROOT), len(out))
    if problems:
        print('\n'.join(problems))
        sys.exit(1)


if __name__ == '__main__':
    main()
