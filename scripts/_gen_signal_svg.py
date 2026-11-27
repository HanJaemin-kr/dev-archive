# -*- coding: utf-8 -*-
"""Generate SVG diagrams for 08_pdm/01_signal/fft.md (sampling params)."""
import math

L, R = 55, 625          # plot x range
W = 660

def xmap(t, t0, t1):
    return L + (R - L) * (t - t0) / (t1 - t0)

def sine_poly(freq, t0, t1, cy, amp, n=300, phase=0.0):
    pts = []
    for i in range(n):
        t = t0 + (t1 - t0) * i / (n - 1)
        x = xmap(t, t0, t1)
        y = cy - amp * math.sin(2 * math.pi * freq * t + phase)
        pts.append("%.1f,%.1f" % (x, y))
    return " ".join(pts)

def axis(cy):
    return '<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="#cbd5e1" stroke-width="1"/>' % (L, cy, R, cy)

# ---------------------------------------------------------------- Figure 1: Fs
def fig_fs():
    H = 330
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    freq = 2.0
    # Panel A: high Fs
    cyA = 95
    s.append('<text x="%d" y="28" font-size="15" font-weight="700" fill="#1e293b">① 높은 Fs (촘촘하게) → 파형 그대로 복원</text>' % L)
    s.append(axis(cyA))
    s.append('<polyline points="%s" fill="none" stroke="#cbd5e1" stroke-width="2"/>' % sine_poly(freq, 0, 1, cyA, 52))
    for n in range(25):
        t = n / 24.0
        x = xmap(t, 0, 1); y = cyA - 52 * math.sin(2 * math.pi * freq * t)
        s.append('<circle cx="%.1f" cy="%.1f" r="3" fill="#2563eb"/>' % (x, y))
    # Panel B: low Fs
    cyB = 250
    s.append('<text x="%d" y="185" font-size="15" font-weight="700" fill="#1e293b">② 낮은 Fs (성기게) → 뾰족한 부분 뭉개짐 · 정보 손실</text>' % L)
    s.append(axis(cyB))
    s.append('<polyline points="%s" fill="none" stroke="#cbd5e1" stroke-width="2"/>' % sine_poly(freq, 0, 1, cyB, 52))
    recon = []
    for n in range(6):
        t = n / 5.0
        x = xmap(t, 0, 1); y = cyB - 52 * math.sin(2 * math.pi * freq * t)
        recon.append("%.1f,%.1f" % (x, y))
    s.append('<polyline points="%s" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="5,3"/>' % " ".join(recon))
    for n in range(6):
        t = n / 5.0
        x = xmap(t, 0, 1); y = cyB - 52 * math.sin(2 * math.pi * freq * t)
        s.append('<circle cx="%.1f" cy="%.1f" r="4.5" fill="#ea580c"/>' % (x, y))
    s.append('<text x="%d" y="%d" font-size="12" fill="#ea580c">주황: 점만 이으면 이런 거친 파형으로 보임</text>' % (L + 250, 305))
    s.append('</svg>')
    return "".join(s)

# ---------------------------------------------------------------- Figure 2: Aliasing
def fig_alias():
    H = 250
    cy = 120
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    s.append('<text x="%d" y="28" font-size="15" font-weight="700" fill="#1e293b">앨리어싱: 실제 900Hz → 100Hz 가짜 피크로 “접힘”</text>' % L)
    s.append(axis(cy))
    # real fast wave (9 cycles) light
    s.append('<polyline points="%s" fill="none" stroke="#cbd5e1" stroke-width="1.6"/>' % sine_poly(9, 0, 1, cy, 70, n=500))
    # alias slow wave: -sin(2pi*1*t) -> passes through samples, red
    s.append('<polyline points="%s" fill="none" stroke="#dc2626" stroke-width="2.5"/>' % sine_poly(1, 0, 1, cy, 70, n=200, phase=math.pi))
    # sample dots Fs=10
    for n in range(10):
        t = n / 10.0
        x = xmap(t, 0, 1); y = cy - 70 * math.sin(2 * math.pi * 9 * t)
        s.append('<circle cx="%.1f" cy="%.1f" r="4.5" fill="#1e293b"/>' % (x, y))
    s.append('<text x="%d" y="%d" font-size="12.5" fill="#94a3b8">— 실제 신호 900Hz</text>' % (L + 5, H - 42))
    s.append('<text x="%d" y="%d" font-size="12.5" fill="#dc2626" font-weight="700">— 샘플이 만들어낸 가짜 파형 100Hz</text>' % (L + 5, H - 24))
    s.append('<text x="%d" y="%d" font-size="12.5" fill="#1e293b">● 샘플링 지점 (Fs=1000Hz)</text>' % (L + 320, H - 33))
    s.append('</svg>')
    return "".join(s)

# ---------------------------------------------------------------- Figure 3: resolution
def fig_res():
    H = 300
    fmin, fmax = 60, 150
    def fx(f):
        return L + (R - L) * (f - fmin) / (fmax - fmin)
    def spec_poly(peaks, base):
        pts = []
        f = fmin
        while f <= fmax + 0.001:
            y = 0.0
            for mu, sig, amp in peaks:
                y += amp * math.exp(-((f - mu) ** 2) / (2 * sig * sig))
            pts.append("%.1f,%.1f" % (fx(f), base - y))
            f += 0.5
        return " ".join(pts)
    s = ['<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" style="max-width:100%%;height:auto;font-family:sans-serif">' % (W, H)]
    s.append('<rect x="0" y="0" width="%d" height="%d" rx="8" fill="#ffffff" stroke="#e2e8f0"/>' % (W, H))
    # markers for true freqs
    for base in (135, 285):
        for fpk in (100, 112):
            s.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>' % (fx(fpk), base - 100, fx(fpk), base))
    # Panel A low N (merged)
    baseA = 135
    s.append('<text x="%d" y="28" font-size="15" font-weight="700" fill="#1e293b">① 낮은 N (Δf 큼) → 두 피크가 하나로 뭉침</text>' % L)
    s.append(axis(baseA))
    s.append('<polyline points="%s" fill="none" stroke="#2563eb" stroke-width="2.5"/>' % spec_poly([(106, 8.5, 95)], baseA))
    # Panel B high N (separated)
    baseB = 285
    s.append('<text x="%d" y="180" font-size="15" font-weight="700" fill="#1e293b">② 높은 N (Δf 작음) → 두 피크 선명히 분리</text>' % L)
    s.append(axis(baseB))
    s.append('<polyline points="%s" fill="none" stroke="#2563eb" stroke-width="2.5"/>' % spec_poly([(100, 1.4, 95), (112, 1.4, 78)], baseB))
    for base in (baseA, baseB):
        s.append('<text x="%.1f" y="%d" font-size="11" fill="#64748b" text-anchor="middle">100Hz</text>' % (fx(100), base + 16))
        s.append('<text x="%.1f" y="%d" font-size="11" fill="#64748b" text-anchor="middle">112Hz</text>' % (fx(112), base + 16))
    s.append('</svg>')
    return "".join(s)

with open("scripts/_signal_svgs.txt", "w", encoding="utf-8") as f:
    f.write("=== FIG1 ===\n" + fig_fs() + "\n\n=== FIG2 ===\n" + fig_alias() + "\n\n=== FIG3 ===\n" + fig_res() + "\n")
print("done")
