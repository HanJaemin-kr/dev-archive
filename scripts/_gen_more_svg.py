# -*- coding: utf-8 -*-
"""Generate extra SVG diagrams for 08_pdm/01_signal (vibration, feature, sensor)."""
import math

def poly(pts):
    return " ".join("%.1f,%.1f" % (x, y) for x, y in pts)

out = {}

# ============================================================ A) 측정값 파형
def fig_waveform():
    W, H = 660, 300
    x0, x1 = 45, 555
    cy = 150
    N = 260
    sig = []
    for i in range(N):
        t = i / (N - 1)
        s = math.sin(2*math.pi*2*t) + 0.35*math.sin(2*math.pi*6*t + 0.5)
        sig.append(s)
    peak = max(abs(v) for v in sig)
    rms = math.sqrt(sum(v*v for v in sig) / N)
    cf = peak / rms
    sc = 105 / peak
    def X(i): return x0 + (x1 - x0) * i / (N - 1)
    def Y(v): return cy - v * sc
    ptop, pbot = Y(peak), Y(-peak)
    rtop, rbot = Y(rms), Y(-rms)
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    s.append('<text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">진동 측정값: Peak · P2P · RMS · Crest Factor</text>')
    s.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#e2e8f0" stroke-width="1"/>' % (x0, cy, x1, cy))
    # peak & rms guide lines
    for yy, col in [(ptop, '#dc2626'), (pbot, '#dc2626')]:
        s.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="%s" stroke-width="1.2" stroke-dasharray="6,3"/>' % (x0, yy, x1, yy, col))
    for yy in (rtop, rbot):
        s.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="#059669" stroke-width="1.2" stroke-dasharray="4,3"/>' % (x0, yy, x1, yy))
    # waveform
    s.append('<polyline points="%s" fill="none" stroke="#2563eb" stroke-width="2"/>' % poly([(X(i), Y(sig[i])) for i in range(N)]))
    # P2P bracket
    bx = x1 + 18
    s.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#7c3aed" stroke-width="1.5"/>' % (bx, ptop, bx, pbot))
    s.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#7c3aed" stroke-width="1.5"/>' % (bx-4, ptop, bx+4, ptop))
    s.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#7c3aed" stroke-width="1.5"/>' % (bx-4, pbot, bx+4, pbot))
    s.append('<text x="%.1f" y="%.1f" font-size="11.5" fill="#7c3aed" font-weight="700" transform="rotate(90 %.1f %.1f)">Peak-to-Peak</text>' % (bx+14, cy-32, bx+14, cy))
    # labels
    s.append('<text x="%d" y="%.1f" font-size="11.5" fill="#dc2626" font-weight="700">Peak</text>' % (x0+6, ptop-6))
    s.append('<text x="%d" y="%.1f" font-size="11.5" fill="#059669" font-weight="700">RMS</text>' % (x0+6, rtop-5))
    s.append('<text x="20" y="%d" font-size="12" fill="#334155">Crest Factor = Peak / RMS = %.2f  (정현파 ≈ 1.41 · 충격성일수록 ↑)</text>' % (H-12, cf))
    s.append('</svg>')
    return "".join(s)
out['WAVEFORM'] = fig_waveform()

# ============================================================ B) 결함별 스펙트럼
def fig_faultspectra():
    W, H = 660, 380
    def panel(px, ybase, title, stems, note=None, xmax=6.5):
        w, h = 250, 105
        p = ['<text x="%d" y="%d" font-size="12.5" font-weight="700" fill="#1e293b">%s</text>' % (px, ybase-h-10, title)]
        p.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#cbd5e1" stroke-width="1"/>' % (px, ybase, px+w, ybase))
        for o in range(1, 7):
            xx = px + w*(o/xmax)
            p.append('<text x="%.1f" y="%d" font-size="9" fill="#b6c2cf" text-anchor="middle">%dx</text>' % (xx, ybase+13, o))
        for (o, ht, col) in stems:
            xx = px + w*(o/xmax)
            p.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.6"/>' % (xx, ybase, xx, ybase-h*ht, col))
        if note:
            p.append('<text x="%d" y="%d" font-size="9.5" fill="#94a3b8">%s</text>' % (px+2, ybase-h-24, note))
        return "".join(p)
    B = '#2563eb'; R = '#dc2626'
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    s.append('<text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">결함별 특징 스펙트럼 (회전 주파수 배수 = 차수)</text>')
    # top row
    s.append(panel(45, 185, '불평형 (Unbalance)', [(1,0.95,R)]))
    s.append(panel(375, 185, '정렬 불량 (Misalignment)', [(1,0.45,B),(2,0.95,R),(3,0.35,B)]))
    # bottom row
    loose = [(0.5,0.3,B),(1,0.7,R),(1.5,0.45,B),(2,0.6,B),(2.5,0.4,B),(3,0.55,B),(3.5,0.32,B),(4,0.45,B),(4.5,0.26,B),(5,0.34,B)]
    s.append(panel(45, 355, '느슨함 (Looseness)', loose, note='0.5x·정수배 다수 하모닉'))
    bear = [(1,0.18,B),(3.4,0.28,R),(3.62,0.55,R),(3.84,0.82,R),(4.06,0.55,R),(4.28,0.3,R)]
    s.append(panel(375, 355, '베어링 결함 (Bearing)', bear, note='비동기 고주파 + 사이드밴드'))
    s.append('</svg>')
    return "".join(s)
out['FAULTSPECTRA'] = fig_faultspectra()

# ============================================================ C) 결함 진행 지표
def fig_progression():
    W, H = 660, 300
    x0, x1 = 60, 620
    yb, top = 250, 50
    h = yb - top
    def X(u): return x0 + (x1-x0)*u
    def Y(v): return yb - h*v
    def crest(u): return 0.15 + 0.82*math.exp(-((u-0.38)/0.17)**2)
    def rms(u): return 0.10 + 0.88/(1+math.exp(-13*(u-0.72)))
    n = 140
    cpts = [(X(i/(n-1)), Y(crest(i/(n-1)))) for i in range(n)]
    rpts = [(X(i/(n-1)), Y(rms(i/(n-1)))) for i in range(n)]
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    s.append('<text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">베어링 결함 진행에 따른 지표 변화</text>')
    s.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#cbd5e1" stroke-width="1"/>' % (x0, yb, x1, yb))
    s.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#cbd5e1" stroke-width="1"/>' % (x0, top, x0, yb))
    for k in range(1, 4):
        xx = X(k/4)
        s.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#eef2f6" stroke-width="1"/>' % (xx, top, xx, yb))
    for k in range(4):
        xx = X((k+0.5)/4)
        s.append('<text x="%.1f" y="%d" font-size="11" fill="#64748b" text-anchor="middle">Stage %d</text>' % (xx, yb+18, k+1))
    s.append('<polyline points="%s" fill="none" stroke="#ea580c" stroke-width="2.6"/>' % poly(cpts))
    s.append('<polyline points="%s" fill="none" stroke="#2563eb" stroke-width="2.6"/>' % poly(rpts))
    s.append('<text x="%.1f" y="%.1f" font-size="11.5" fill="#ea580c" font-weight="700">Crest / Kurtosis (조기 감지)</text>' % (X(0.30), Y(crest(0.38))-8))
    s.append('<text x="%.1f" y="%.1f" font-size="11.5" fill="#2563eb" font-weight="700">RMS / Overall (후기 급등)</text>' % (X(0.55), Y(0.55)))
    s.append('<text x="%d" y="%d" font-size="10.5" fill="#94a3b8">← 초기 미세 충격          결함 진행 →          후기 에너지 증가</text>' % (x0+8, top-6) if False else '')
    s.append('<text x="%d" y="%d" font-size="11" fill="#334155">y: 상대 크기  ·  x: 결함 진행(수명 소모) →</text>' % (x0, H-10))
    s.append('</svg>')
    return "".join(s)
out['PROGRESSION'] = fig_progression()

# ============================================================ D) Kurtosis 분포
def fig_kurtosis():
    W, H = 660, 280
    x0, x1 = 60, 620
    yb = 235
    hgt = 165
    b = 1/math.sqrt(2)
    peakv = 1/(2*b)  # laplace peak ~0.707
    sc = 150/peakv
    def X(v): return x0 + (x1-x0)*(v+4)/8
    def Y(p): return yb - p*sc
    n = 200
    norm = [(X(-4+8*i/(n-1)), Y(math.exp(-(-4+8*i/(n-1))**2/2)/math.sqrt(2*math.pi))) for i in range(n)]
    lap = [(X(-4+8*i/(n-1)), Y((1/(2*b))*math.exp(-abs(-4+8*i/(n-1))/b))) for i in range(n)]
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    s.append('<text x="20" y="26" font-size="15" font-weight="700" fill="#1e293b">Kurtosis(첨도): 정상 vs 충격성 분포</text>')
    s.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#cbd5e1" stroke-width="1"/>' % (x0, yb, x1, yb))
    s.append('<polyline points="%s" fill="none" stroke="#2563eb" stroke-width="2.6"/>' % poly(norm))
    s.append('<polyline points="%s" fill="none" stroke="#dc2626" stroke-width="2.6"/>' % poly(lap))
    s.append('<text x="%.1f" y="%d" font-size="11.5" fill="#2563eb" font-weight="700">정상 K≈3 (정규분포)</text>' % (X(0.6), 70))
    s.append('<text x="%.1f" y="%d" font-size="11.5" fill="#dc2626" font-weight="700">충격성 K&gt;4 (뾰족+꼬리 두꺼움)</text>' % (X(-3.9), 60))
    s.append('<text x="%.1f" y="%d" font-size="10" fill="#94a3b8" text-anchor="middle">꼬리(충격) 두꺼움 →</text>' % (X(2.7), yb-6))
    s.append('<text x="%d" y="%d" font-size="11" fill="#334155">x: 진폭(σ 단위)  ·  결함 충격이 잦을수록 꼬리가 두꺼워져 K 상승</text>' % (x0, H-10))
    s.append('</svg>')
    return "".join(s)
out['KURTOSIS'] = fig_kurtosis()

# ============================================================ E) 마운팅 주파수 한계
def fig_mounting():
    W = 660
    L, R = 150, 630
    fmin, fmax = 10, 15000
    lo, hi = math.log10(fmin), math.log10(fmax)
    def X(f): return L + (R-L)*(math.log10(f)-lo)/(hi-lo)
    rows = [('스터드 볼트', 10000, '#059669'),
            ('접착제', 6000, '#2563eb'),
            ('자석', 2000, '# f59e0b'.replace(' ', '')),
            ('프로브 (손)', 1000, '#dc2626')]
    H = 55 + len(rows)*38 + 28
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    s.append('<text x="20" y="28" font-size="15" font-weight="700" fill="#1e293b">마운팅 방법별 주파수 상한</text>')
    for p, lab in [(10,'10'),(100,'100'),(1000,'1k'),(10000,'10k')]:
        xx = X(p)
        s.append('<line x1="%.1f" y1="42" x2="%.1f" y2="%d" stroke="#eef2f6" stroke-width="1"/>' % (xx, xx, H-24))
        s.append('<text x="%.1f" y="%d" font-size="11" fill="#94a3b8" text-anchor="middle">%s</text>' % (xx, H-9, lab))
    y = 55
    for name, lim, col in rows:
        s.append('<text x="20" y="%d" font-size="12.5" fill="#334155">%s</text>' % (y+16, name))
        s.append('<rect x="%.1f" y="%d" width="%.1f" height="20" rx="4" fill="%s" opacity="0.85"/>' % (X(fmin), y, X(lim)-X(fmin), col))
        lab = '~%dk Hz' % (lim//1000) if lim >= 1000 else '~%d Hz' % lim
        s.append('<text x="%.1f" y="%d" font-size="10.5" fill="#ffffff" font-weight="700">%s</text>' % (X(fmin)+6, y+14, lab))
        y += 38
    s.append('</svg>')
    return "".join(s)
out['MOUNTING'] = fig_mounting()

with open('scripts/_more_svgs.txt', 'w', encoding='utf-8') as f:
    for k, v in out.items():
        f.write('=== %s ===\n%s\n\n' % (k, v))
print('done', list(out.keys()))
