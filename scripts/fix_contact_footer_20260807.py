from pathlib import Path
import os
import fitz

PDF = Path('现场管理.pdf')
CSS = Path('site-interactive-hover-contrast-v1.css')
CONTACT = '官网 qilylean.com  |  微信 Qily259  |  电话 134 5001 4003  |  邮箱 admin@qilylean.com'
MARKER = 'QILY-OFFICIAL-CONTACT-HOVER-CONTRAST-20260807'


def rewrite_pdf():
    if not PDF.exists():
        raise RuntimeError('现场管理.pdf not found')

    doc = fitz.open(PDF)
    original_pages = len(doc)
    cjk = fitz.Font(fontname='china-s')
    rewritten = []
    missing = []

    for page in doc:
        w, h = page.rect.width, page.rect.height
        hits = page.search_for('qilylean.com')
        if not hits:
            missing.append(page.number + 1)
            continue

        # 页脚网址应为本页最靠下的 qilylean.com；避免误改正文中的网址。
        anchor = max(hits, key=lambda r: r.y0)
        if anchor.y0 < h * 0.70:
            missing.append(page.number + 1)
            continue

        # 仅清理左下页脚联系信息带，不触碰右侧页码和正文。
        x0 = max(2.0, min(anchor.x0 - 3.0, w * 0.035))
        x1 = w * 0.80
        y0 = max(0.0, anchor.y0 - max(2.0, anchor.height * 0.45))
        y1 = min(h, anchor.y1 + max(2.0, anchor.height * 0.55))
        band = fitz.Rect(x0, y0, x1, y1)
        page.add_redact_annot(band, fill=(1, 1, 1))
        page.apply_redactions()

        available = max(20.0, x1 - x0 - 3.0)
        unit = max(1.0, cjk.text_length(CONTACT, fontsize=1.0))
        fit_size = available / unit
        size = max(4.2, min(7.6, fit_size, max(4.2, anchor.height * 0.86)))
        baseline = min(y1 - 0.6, anchor.y1 + 0.2)
        page.insert_text(
            fitz.Point(x0 + 1.5, baseline),
            CONTACT,
            fontname='china-s',
            fontsize=size,
            color=(0.035, 0.25, 0.30),
            overlay=True,
        )
        rewritten.append(page.number + 1)

    if missing:
        raise RuntimeError(f'Footer website anchor missing/unsafe on pages: {missing[:30]}')

    tmp = PDF.with_suffix('.pdf.qilytmp')
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    doc.close()
    os.replace(tmp, PDF)

    check = fitz.open(PDF)
    if len(check) != original_pages:
        raise RuntimeError(f'Page count changed: {original_pages} -> {len(check)}')

    bad = []
    for page in check:
        h = page.rect.height
        bottom = page.get_text('text', clip=fitz.Rect(0, h * 0.70, page.rect.width, h)) or ''
        required = ('官网', 'qilylean.com', '微信', 'Qily259', '电话', '134 5001 4003', '邮箱', 'admin@qilylean.com')
        if not all(token in bottom for token in required):
            bad.append(page.number + 1)
    if bad:
        check.close()
        raise RuntimeError(f'Footer validation failed on pages: {bad[:30]}')

    out = Path('/tmp/qily-contact-preview')
    out.mkdir(parents=True, exist_ok=True)
    samples = sorted(set([0, min(7, len(check) - 1), len(check) - 1]))
    for idx in samples:
        pix = check[idx].get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
        pix.save(out / f'page-{idx + 1:03d}.png')
    pages = len(check)
    check.close()
    print(f'PDF_CONTACT_OK pages={pages} rewritten={len(rewritten)} samples={[i+1 for i in samples]}')


def rewrite_css():
    if not CSS.exists():
        raise RuntimeError('site-interactive-hover-contrast-v1.css not found')
    text = CSS.read_text(encoding='utf-8')
    if MARKER in text:
        print('HOVER_CONTRAST_ALREADY_PRESENT')
        return

    block = '''

/* QILY-OFFICIAL-CONTACT-HOVER-CONTRAST-20260807
   官网与企业邮箱属于关键联系入口：Hover / Focus / Active 必须保持高对比度与清晰字迹。 */
a[href="https://qilylean.com"],
a[href="https://qilylean.com/"],
a[href^="mailto:admin@qilylean.com"]{
  opacity:1 !important;
  text-shadow:none !important;
}
a[href="https://qilylean.com"]:hover,
a[href="https://qilylean.com"]:focus-visible,
a[href="https://qilylean.com/"]:hover,
a[href="https://qilylean.com/"]:focus-visible,
a[href^="mailto:admin@qilylean.com"]:hover,
a[href^="mailto:admin@qilylean.com"]:focus-visible{
  color:#ffffff !important;
  -webkit-text-fill-color:#ffffff !important;
  background:#0b5662 !important;
  border-color:#063f49 !important;
  opacity:1 !important;
  text-shadow:none !important;
  text-decoration-color:#ffe39b !important;
  outline:3px solid #ffe39b !important;
  outline-offset:2px !important;
  box-shadow:0 9px 24px rgba(6,63,73,.28) !important;
}
a[href="https://qilylean.com"]:hover *,
a[href="https://qilylean.com"]:focus-visible *,
a[href="https://qilylean.com/"]:hover *,
a[href="https://qilylean.com/"]:focus-visible *,
a[href^="mailto:admin@qilylean.com"]:hover *,
a[href^="mailto:admin@qilylean.com"]:focus-visible *{
  color:#ffffff !important;
  -webkit-text-fill-color:#ffffff !important;
  opacity:1 !important;
}
a[href="https://qilylean.com"]:active,
a[href="https://qilylean.com/"]:active,
a[href^="mailto:admin@qilylean.com"]:active{
  color:#17231e !important;
  -webkit-text-fill-color:#17231e !important;
  background:#ffe39b !important;
  border-color:#caa15f !important;
  opacity:1 !important;
  outline-color:#0b5662 !important;
}
'''
    CSS.write_text(text + block, encoding='utf-8')
    print('HOVER_CONTRAST_OK')


if __name__ == '__main__':
    rewrite_pdf()
    rewrite_css()
