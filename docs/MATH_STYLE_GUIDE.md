# VietWireless Math Style Guide

## Mục tiêu

Công thức trên VietWireless phải nhìn như toán học thật, không phải text được phóng to bằng CSS. Math rendering dùng KaTeX ở build time để có typography ổn định trên Windows, macOS và mobile, đồng thời giữ HTML/MathML cho accessibility.

## Component chuẩn

Import:

```astro
import MathExpr from '../../components/Math.astro';
```

Inline math:

```astro
<MathExpr tex="x[n] = I[n] + jQ[n]" />
```

Display math:

```astro
<MathExpr
  tex="\\mathrm{EVM}_{\\mathrm{RMS}} = \\sqrt{\\frac{\\sum_k |Y_k-X_k|^2}{\\sum_k |X_k|^2}}"
  display
/>
```

Có thể thêm class khi cần layout riêng:

```astro
<MathExpr tex="\\Delta f = 1/T_u" display class="math-compact" />
```

## Khi nào dùng inline và display

Inline:
- biến hoặc biểu thức ngắn nằm trong câu;
- relation ngắn không cần người đọc dừng lại;
- ví dụ: `x[n]`, `H[k]`, `T_u=1/\\Delta f`.

Display:
- công thức chính của section;
- công thức có phân số, tổng, căn, nhiều indices;
- bước biến đổi cần người đọc nhìn riêng;
- công thức được nhắc lại trong phần giải thích.

Không biến mọi ký hiệu thành display math. Một bài có quá nhiều box công thức sẽ làm đứt mạch đọc.

## Quy ước notation

### Scalar, vector, matrix
- scalar: `x`, `A`, `f`, `\\phi`;
- vector: `\\mathbf{x}`;
- matrix: `\\mathbf{H}`;
- complex conjugate: `x^*`;
- Hermitian: `\\mathbf{H}^{\\mathrm H}` nếu bài thật sự cần.

### Indices
- sample index: `x[n]`;
- subcarrier: `X[k]`;
- OFDM symbol: `X[k,\\ell]`;
- path index: `\\alpha_\\ell, \\tau_\\ell`.

Không trộn `m` và `\\ell` cho OFDM-symbol index trong cùng một bài nếu không có lý do.

### Functions
Dùng operator chuẩn:
- `\\sin`, `\\cos`, `\\log`, `\\exp`;
- `\\operatorname{atan2}` cho atan2;
- không viết `cos`, `sin`, `log` như biến italic.

### Complex numbers
- kỹ thuật điện dùng `j`;
- imaginary unit: `j`;
- Euler: `e^{j\\theta}`;
- magnitude: `|X[k]|`;
- squared magnitude: `|X[k]|^2`.

### Sums, fractions, roots
Dùng cấu trúc TeX thật:
- `\\sum_{n=0}^{N-1}`;
- `\\frac{a}{b}`;
- `\\sqrt{x}`.

Không dùng text Unicode kiểu `Σ`, `√(.../...)` cho công thức chính.

### Units
Đơn vị đứng upright:
- `15\\,\\mathrm{kHz}`;
- `20\\,\\mathrm{MHz}`;
- `66.7\\,\\mu\\mathrm{s}`;
- `-174\\,\\mathrm{dBm/Hz}`.

Khoảng trắng giữa số và đơn vị dùng `\\,`.

### Text trong math
- tên metric/operator: `\\mathrm{EVM}`, `\\mathrm{SNR}`, `\\mathrm{RMS}`;
- annotation ngắn: `\\text{normal CP}`;
- prose tiếng Việt dài để ngoài công thức.

## Numbering

Mặc định không đánh số công thức. Chỉ đánh số nếu bài thật sự tham chiếu lại nhiều lần theo “(1), (2), ...”. Khi đó dùng một wrapper riêng thay vì tự gõ số ở cuối TeX.

## Accessibility

KaTeX được render với output `htmlAndMathml`. Không thay công thức bằng screenshot. Nếu công thức cần diễn giải, prose ngay trước/sau phải nói bằng lời công thức đang biểu diễn điều gì.

## Responsive

Display math:
- căn giữa trên desktop;
- cho phép local horizontal scrolling nếu quá dài;
- không làm toàn page overflow;
- không scale công thức nhỏ tới mức khó đọc.

Nếu công thức quá dài trên mobile, ưu tiên viết lại bằng `aligned` hoặc tách thành hai display equations trước khi nghĩ tới giảm font-size.

## Không làm

Không dùng:
```html
<div class="some-equation">
  <span>EVM_RMS</span><b>=</b><span>√(...)</span>
</div>
```

Không dùng:
```html
x<sub>n</sub>, e<sup>jθ</sup>, Σ, √
```
để dựng công thức chính bằng HTML thủ công.

Không dùng Unicode subscript/superscript như `Tₛ`, `x²` trong source khi đó là notation toán cần render nhất quán.

## QA trước merge

- `npm run check:math`;
- `npm run check:writing`;
- `npm run build`;
- kiểm tra desktop + mobile với ít nhất một công thức dài;
- kiểm tra Windows/Chromium vì đây là nơi typography fallback từng gây lỗi dấu;
- kiểm tra mọi công thức chính có prose giải thích biến và meaning.


## Rule bắt buộc: mọi notation toán trong prose dùng MathExpr

Không chỉ công thức dài. Mọi ký hiệu mang nghĩa toán học hoặc PHY notation xuất hiện trong câu phải render bằng KaTeX.

Ví dụ đúng:
- `<MathExpr tex="N" /> samples`;
- `<MathExpr tex="I" />` và `<MathExpr tex="Q" />`;
- `<MathExpr tex="x[n]" />`;
- `<MathExpr tex="X[k]" />`;
- `<MathExpr tex="H[k]" />`;
- `<MathExpr tex="\\Delta f" />`;
- `<MathExpr tex="T_u" />`;
- `<MathExpr tex="N_{\\mathrm{CP}}" />`;
- `<MathExpr tex="15\\,\\mathrm{kHz}" />`.

Không viết cùng một đại lượng lúc thì plain text, lúc thì KaTeX. Nếu `N` đang là số samples, `N` là notation toán và phải dùng `MathExpr`.

Ngoại lệ chỉ dành cho acronym/tên khối không phải biến toán, ví dụ FFT, ADC, OFDM, SNR khi đang được dùng như tên metric/khái niệm trong prose. Khi SNR nằm trong một biểu thức toán, dùng MathExpr.

## Rule display math: mặc định không có khung

Display equation chỉ render công thức, không có border, background hoặc box mặc định.

Đúng:
```astro
<MathExpr tex="x[n] = \\frac{1}{N}\\sum_{k=0}^{N-1}X[k]e^{j2\\pi kn/N}" display />
```

Không bọc công thức đơn lẻ trong card chỉ để tạo nền hoặc viền.

Card chỉ dùng khi block đó thực sự là một đơn vị giải thích gồm label + formula + prose.

## Rule math cards: dùng một visual system trên toàn website

Math card cùng cấp độ giải thích phải dùng **một shared visual scale trên toàn site**, không chỉ đồng nhất trong cùng một grid. Không được tạo một page dùng card công thức cao 170 px, page khác 190 px, hoặc đổi formula size/padding chỉ vì dùng class khác.

Nguồn chuẩn là các CSS tokens:
- `--lesson-math-card-min-height`;
- `--lesson-math-card-padding`;
- `--lesson-math-card-gap`;
- `--lesson-math-card-label-size`;
- `--lesson-math-card-formula-min-height`;
- `--lesson-math-card-formula-size`;
- `--lesson-math-card-body-size`;
- `--lesson-math-card-label-gap`;
- `--lesson-math-card-formula-gap`.

Shared classes bắt buộc cho card có cấu trúc **label + formula + prose**:
- `.math-card-grid` hoặc `.math-grid-2`;
- `.math-card`;
- `.math-card-formula`;
- `.math-card-secondary`.

Các box so sánh hai representation, ví dụ `x(t)` với `X(f)`, cũng phải dùng `.math-card`; nếu cần dấu `=` ở giữa thì dùng layout wrapper như `.math-equivalence-grid`, không tạo một loại card mới.

Visual card có plot/SVG lớn có thể cao hơn vì nội dung, nhưng vẫn phải dùng cùng card padding, label scale và body scale. Không ép visual xuống cùng chiều cao nếu làm hình khó đọc.

Nếu một công thức dài hơn, cho nó wrap/scroll hợp lý; không tăng riêng font-size của card đó. Không hard-code một `font-size`, `padding` hoặc `min-height` mới cho math card nếu shared token đã tồn tại.


## Inline math phải hòa vào dòng chữ

Inline KaTeX không được trông như một badge hoặc một mảnh chữ tách khỏi câu:
- dùng cùng optical size với prose;
- baseline phải gần baseline của chữ thường xung quanh;
- không thêm background/border;
- không thêm margin lớn hai bên;
- kiểm tra bằng các câu có nhiều notation xen kẽ như `phase <MathExpr tex="\\phi" />`, `<MathExpr tex="I" /> và <MathExpr tex="Q" />`.

## Flow/card formula phải đủ lớn để đọc

Khi công thức là nội dung chính của một flow card, không dùng size của body text. Formula trong các flow card phải có visual weight tương đương heading nhỏ, nhưng các card cùng flow phải dùng cùng size.

## Bảng số liệu kỹ thuật

Khi dữ liệu có quan hệ hàng/cột thực sự, dùng HTML `<table>` thay vì một grid card giả-table. Header và data columns phải thẳng hàng. Mathematical values trong cell vẫn dùng `MathExpr`.


## Phạm vi áp dụng: toàn bộ website

Math rules áp dụng cho toàn bộ UI có nội dung kỹ thuật, không chỉ lesson prose:
- page titles và headings hiển thị;
- card labels/captions;
- tables;
- interactive React components;
- readouts, controls và chart labels;
- roadmap/curriculum text.

Acronym/tên công nghệ như FFT, OFDM, ADC, PBCH, 5G NR có thể là text thường. Mathematical notation như I, Q, I/Q, x[n], X[k], H[k], N, k, n, μ, Δf, φ, θ, τ, T_u, f_s, f_c phải dùng MathExpr hoặc SvgMathExpr nếu nằm trong SVG.

Math trong table phải dùng HTML table thật khi dữ liệu có quan hệ hàng/cột. Không dựng bảng bằng CSS grid nếu header và data cần alignment chính xác.

## Rule bắt buộc cho SVG, chart và visual

Không được viết notation toán trực tiếp bằng SVG `<text>`, Unicode subscript/superscript hoặc plain text. Ví dụ sai: `<text>x(t)</text>`, `<text>-f₀</text>`, `<text>θ</text>`.

Trong Astro SVG, dùng `<foreignObject>` + `<MathExpr />`. Trong React SVG, dùng `<SvgMathExpr />`. Chỉ label ngôn ngữ tự nhiên như “power”, “time”, “reference” mới được để text thường.

QA phải quét cả text node bên trong SVG; không được bỏ qua toàn bộ SVG khi kiểm tra math style.

Các dạng rất dễ sót nhưng vẫn bắt buộc dùng MathExpr: `subcarrier k`, `bin k`, `frequency f`, `sample index n`, `N useful samples`, `N-point FFT`, `I\cos(\cdot)`, `Q\sin(\cdot)`. Không chỉ các công thức có dấu `=` mới được xem là math notation.

Ký tự đơn chỉ là dữ liệu minh họa, ví dụ chữ “A” được encode thành bits trong một sơ đồ Shannon, có thể giữ text thường. Quyết định dựa trên semantics: nếu ký tự là biến toán thì KaTeX; nếu nó là nội dung/data literal thì text thường.

## Rule layout khi MathExpr nằm trong text

Không viết CSS selector kiểu `.foo span { display:block }` nếu bên trong `.foo` có thể chứa `MathExpr`, vì `MathExpr` cũng render thành `span` và sẽ bị bẻ dòng. Dùng direct-child selector như `.foo > span` hoặc target class cụ thể. Inline math phải luôn ở cùng dòng với câu khi còn đủ chỗ.


## Rule technical cards: phân loại formula / visual / metric

Không ép mọi box kỹ thuật vào cùng một chiều cao. Trước khi style một box, phải xác định nó thuộc một trong ba loại sau:

- **Formula card**: label + công thức chính + prose/công thức phụ. Dùng `.technical-card.formula-card`, với công thức chính trong `.formula-card-main` và công thức phụ trong `.formula-card-details`.
- **Visual card**: label + SVG/plot/diagram + caption. Dùng `.technical-card.visual-card` và đặt hình trong `.visual-card-figure`. Các visual card cùng cấp phải có figure area cùng scale.
- **Metric card**: label + giá trị hiện tại + công thức/notation phụ, thường nằm trong readout của interactive lab. Dùng `.metric-card-grid` + `.metric-card`, với `.metric-card-label`, `.metric-card-value`, `.metric-card-formula`.

Nguồn chuẩn cho kích thước là các token `--lesson-technical-card-*`, `--lesson-formula-card-*`, `--lesson-visual-card-*` và `--lesson-metric-card-*`. Không hard-code lại padding, min-height hoặc font-size theo từng page nếu shared token đã tồn tại.

Mục tiêu là **đồng nhất trong đúng loại card**, không phải ép formula card, visual card và metric card có cùng chiều cao. Formula phải đủ lớn để đọc; visual phải có vùng hình đủ rộng; metric phải gọn nhưng công thức phụ vẫn đọc được.

Minimum readability:
- công thức chính trong formula card không được nhỏ hơn khoảng 1.35rem trên desktop;
- công thức phụ/readout không được nhỏ tới mức phải zoom; giữ khoảng 0.88rem trở lên;
- metric value phải nổi bật hơn formula phụ;
- nếu công thức dài, ưu tiên horizontal overflow cục bộ hoặc đổi layout, không giảm riêng font-size xuống rất nhỏ.

## Rule TeX trong React/JSX

Trong JavaScript/JSX, backslash của TeX có thể bị JavaScript nuốt trước khi KaTeX nhận chuỗi. Vì vậy:

Đúng:
```jsx
<MathExpr tex={String.raw`\omega t+\phi`} />
<SvgMathExpr tex={String.raw`z(t)=Ae^{j(\omega t+\phi)}`} ... />
```

Cũng chấp nhận double escaping:
```jsx
<MathExpr tex={`\\omega t+\\phi`} />
```

Sai:
```jsx
<MathExpr tex={`\omega t+\phi`} />
```

Dạng sai có thể vẫn build nhưng render thành text như `omegat + phi`, `sqrtoperatorname...`. CI phải chặn single-backslash TeX trong JS/JSX template/string literals.

Trong SVG, `Re`, `Im`, góc, biến và biểu thức toán phải dùng `SvgMathExpr`; không quay lại `<text>Re</text>` hoặc raw TeX text.
