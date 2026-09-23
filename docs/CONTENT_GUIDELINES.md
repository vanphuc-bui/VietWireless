# VietWireless Content & Visual Guidelines

## Mục tiêu

VietWireless không phải blog tin tức. Đây là knowledge platform giúp người học xây dựng mental model đúng về wireless engineering trước khi đi sâu vào 3GPP.

## Anatomy bắt buộc của một bài kỹ thuật

Lesson contract chi tiết nằm trong `docs/LESSON_CONTRACT.md`. Một bài đầy đủ phải có các lớp sau nếu khái niệm cho phép:

1. **Problem first:** bắt đầu bằng câu hỏi hoặc vấn đề thực tế.
2. **System context:** người đọc phải biết đang ở đâu trong transmitter/receiver/procedure, input hiện có và điều còn thiếu.
3. **Visual intuition:** sơ đồ, plot, animation hoặc interactive element trước phần toán nặng.
4. **Concrete example:** ít nhất một numerical example, waveform, timeline hoặc scenario cụ thể.
5. **Plain-language explanation:** giải thích bằng tiếng Việt tự nhiên; terminology theo `docs/TERMINOLOGY.md`.
6. **Math layer:** công thức chỉ xuất hiện khi người đọc đã biết mỗi đại lượng có ý nghĩa gì.
7. **Boundary / misconception:** nói rõ ít nhất một điều khái niệm không làm được hoặc chỗ dễ hiểu sai.
8. **Implementation layer:** nối khái niệm với samples, buffers, FFT bins, resource grid, estimator, state machine hoặc code.
9. **Specification layer:** khi liên quan standard, theo `docs/SOURCE_POLICY.md`.
10. **Recap + navigation:** nối lại mental model và chỉ ra bước tiếp theo trong learning graph.

## Quy tắc thuật ngữ

Source of truth là `docs/TERMINOLOGY.md`.

- Ưu tiên tiếng Việt khi tự nhiên và chính xác: tín hiệu, thời gian, tần số, miền thời gian, miền tần số, dữ liệu, thông tin hệ thống, liên kết vô tuyến.
- Giữ acronym, tên 3GPP channel/signal/procedure và các thuật ngữ ngành khi bản dịch làm mất precision.
- Lần đầu: “DMRS (Demodulation Reference Signal)”. Sau đó dùng “DMRS”.
- Không dùng một từ tiếng Anh chỉ vì code hoặc paper dùng từ đó nếu câu tiếng Việt có cách diễn đạt rõ hơn.
- Không đổi thuật ngữ giữa các bài. Nếu cần đổi site-wide, sửa `docs/TERMINOLOGY.md` trước.

## Quy tắc trực quan

- Mỗi visual phải trả lời một câu hỏi cụ thể.
- Không dùng ảnh minh họa chỉ để “cho đẹp”.
- Ưu tiên SVG/Canvas/interactive plot cho signal processing.
- Không phụ thuộc chỉ vào màu; luôn có label.
- Mobile phải đọc được mà không cần zoom ngang.
- Animation phải tôn trọng prefers-reduced-motion.

## Accuracy

- Phân biệt analog RF signal với complex baseband representation.
- FFT là một thuật toán tính DFT hiệu quả; không mô tả FFT như một phép biến đổi toán học khác với DFT.
- Time/frequency domain là hai biểu diễn của cùng signal khi điều kiện biến đổi phù hợp.
- Không nói “I và Q là hai tín hiệu độc lập” nếu đang giải thích một complex baseband sample; phải nói rõ đây là hai thành phần trực giao.
- Với 3GPP: kiểm tra đúng release, TS và section trước khi publish.

## Confidentiality

Tuyệt đối không đưa vào website:
- source code nội bộ;
- log nội bộ;
- waveform capture không được phép chia sẻ;
- test configuration độc quyền;
- tên khách hàng/đối tác từ công việc;
- tài liệu hoặc screenshot nội bộ.

Ví dụ kỹ thuật phải được dựng độc lập từ kiến thức công khai, standard công khai hoặc simulation tự xây.

## SEO nhưng không hy sinh chất lượng

- Một page = một search intent chính.
- Tránh hai URL cùng trả lời một câu hỏi.
- Title và H1 nói thẳng câu hỏi người học đang muốn hiểu.
- Internal links phải theo learning graph chứ không nhồi keyword. Learning graph chính thức nằm trong `docs/CURRICULUM.md`.
- Cornerstone page phải đủ tốt để người đọc không cần quay lại Google để hiểu khái niệm cơ bản.

## Editorial voice: một người đang chia sẻ

VietWireless nên có cảm giác như một người đã từng bối rối với cùng câu hỏi, sau đó chia sẻ lại cách họ hiểu nó.
Không viết theo giọng ra lệnh, phán xét hoặc đứng trên người đọc.

- Dùng “tôi” khi tác giả chia sẻ góc nhìn, trải nghiệm hoặc lựa chọn cá nhân. Không dùng “mình” trong prose.
- Có thể dùng “ta” khi cùng người đọc quan sát một hiện tượng, nhưng không lạm dụng.
- Ưu tiên câu hỏi tự nhiên: “FFT để làm gì?”, “vì sao lúc thì nhìn time domain, lúc lại nhìn frequency domain?”.
- Tránh các câu kiểu “bạn phải nhớ”, “đừng làm”, “điều quan trọng nhất”. Với timeline hoặc ví dụ, có thể dùng nhãn ngắn “Bài học:” để chốt một ý kỹ thuật.
- Không tạo cảm giác người đọc bị kiểm tra. Recap nên giống một đoạn nối ý hơn là danh sách điều phải thuộc.
- Khi có trải nghiệm cá nhân phù hợp, có thể kể ngắn gọn. Không thêm các nhãn kiểu “Điều tôi thấy thú vị”, “Một ý khá hay ở đây” hoặc “Điểm thú vị” chỉ để tạo giọng.
- Câu nên có độ dài tự nhiên, xen kẽ ngắn và vừa. Tránh viết đều đều theo một template.
- Giữ thuật ngữ kỹ thuật chuẩn, nhưng phần giải thích xung quanh nên là tiếng Việt đời thường, rõ và gọn.
- Xem thêm `docs/WRITING_STYLE.md` để giữ giọng văn thống nhất.

## QA trước khi merge

- Có trả lời “tại sao cần khái niệm này?” không?
- Có nói rõ system context, input hiện có và output của bước này không?
- Có ít nhất một ví dụ cụ thể thay vì chỉ định nghĩa không?
- Có chỉ ra một boundary hoặc chỗ dễ hiểu sai không?
- Visual có thật sự liên quan nội dung không?
- Mobile có overflow hoặc text/axis quá nhỏ không?
- Interactive component có fallback text không?
- Công thức và notation có nhất quán không?
- Standard claim có trace được về source/release/TS không?
- Previous/next/map navigation có khớp learning graph không?
- Có câu nào dễ khiến người mới xây mental model sai không?
- Có nội dung nào dựa trên thông tin nội bộ không?
- `npm run check:all` có pass không?


## Historical media

- Mỗi mốc lịch sử quan trọng trên homepage phải có visual thật: ảnh tư liệu, diagram hoặc video phù hợp trực tiếp với mốc đó.
- Không dùng ảnh “radio/antenna” generic cho một nhân vật hay sự kiện cụ thể.
- Ảnh ngoài phải có nguồn và license/credit ngay dưới ảnh khi cần.
- Ưu tiên public domain, CC0 hoặc nguồn có điều khoản tái sử dụng rõ ràng.
- Media lịch sử phải giúp người đọc hiểu “điều gì vừa trở nên khả thi về mặt truyền thông”, không chỉ trang trí.

## End-to-end signal chain accuracy

Khi vẽ chuỗi OFDM hiện đại:

- Information (image/voice/data) → representation/compression → bits.
- Channel coding/scrambling → modulation mapping.
- Trước IFFT, mô tả là **complex modulation symbols X[k] trên các subcarriers / frequency-domain bins**.
- Sau IFFT, mô tả là **time-domain complex I/Q samples x[n]**.
- DAC/upconversion/RF chain tạo tín hiệu RF vật lý; không gọi complex baseband trực tiếp là “sóng ngoài anten”.
- Receiver: RF/downconversion/ADC → time-domain I/Q y[n] → FFT → Y[k] → channel estimation/equalization → demapping/decoding.
- Luôn ghi rõ IFFT/FFT chain là ví dụ OFDM điển hình; không ngụ ý mọi hệ thống wireless đều dùng OFDM.


## Depth gate trước khi publish bài học

Không publish một bài chỉ mới ở mức outline.

Một bài nền tảng nên có đủ các lớp sau nếu khái niệm cho phép:
- mở bằng bài toán hoặc câu hỏi thực tế mà khái niệm đó giải quyết;
- một ví dụ số hoặc ví dụ signal cụ thể để người đọc bám theo;
- visual hoặc interactive giải thích đúng hiện tượng vừa nói;
- giải thích công thức sau khi các biến đã có ý nghĩa;
- chỉ ra ít nhất một hiểu nhầm phổ biến hoặc boundary của mental model;
- nối xuống implementation: samples, buffers, FFT bins, grid, estimator hoặc receiver stage tương ứng;
- nối lên system view: khái niệm đó nằm ở đâu trong transmitter/receiver;
- recap phải nối lại logic, không chỉ lặp lại heading.

Không dùng word count làm mục tiêu cứng. Tuy nhiên nếu một bài phức tạp như OFDM, Cyclic Prefix, resource grid hoặc channel chỉ gồm vài đoạn ngắn và nhiều card, cần xem lại liệu nó đã giải thích đủ "vì sao" và "như thế nào" hay mới chỉ liệt kê khái niệm.

Trước khi merge một cụm nhiều bài, so độ sâu giữa các bài. Không để các bài sau trở thành bản tóm tắt ngắn dần chỉ vì đang viết theo batch.


## Chuẩn viết công thức toán

Nguồn chuẩn chi tiết: `docs/MATH_STYLE_GUIDE.md`.

- Mọi notation toán trong prose dùng shared component `MathExpr` thay vì tự ghép `<sub>`, `<sup>`, ký tự Unicode như `√`, `Σ` hoặc text giả-LaTeX.
- Công thức đứng riêng dùng `<MathExpr tex="..." display />`. Công thức ngắn nằm trong câu dùng `<MathExpr tex="..." />`.
- Công thức phải được viết bằng TeX/LaTeX notation và render bằng KaTeX ở build time.
- Không dùng ảnh chứa công thức.
- Không tự dựng dấu căn, phân số, tổng, tích phân, matrix hoặc superscript/subscript bằng HTML/CSS.
- Chỉ dùng display math khi công thức là một bước lập luận đáng dừng mắt. Biến ngắn trong prose nên để inline.
- Mỗi ký hiệu phải được giải thích trước hoặc ngay sau lần xuất hiện đầu tiên.
- Giữ notation nhất quán trong cả bài: không đổi giữa `f_s`, `fₛ`, `fs` nếu đang chỉ cùng một đại lượng.
- Với vectors/matrices, dùng `\mathbf{x}`, `\mathbf{H}` khi thật sự là vector/matrix; scalar để italic mặc định.
- Với text trong công thức, dùng `\text{...}` hoặc `\mathrm{...}` đúng mục đích; không viết cả câu tiếng Việt bên trong math.
- Đơn vị để upright và có khoảng cách hợp lý, ví dụ `15\,\mathrm{kHz}`, `66.7\,\mu\mathrm{s}`.
- QA phải chạy `npm run check:math` để chặn legacy equation wrappers và raw formula markup quay trở lại.


### Quy tắc nhất quán math notation toàn bài

- Mọi biến/ký hiệu toán trong prose phải dùng `MathExpr`, kể cả một ký hiệu đơn như `N`, `I`, `Q`, `\\mu`, `\\Delta f` khi chúng mang nghĩa toán học.
- Viết `<MathExpr tex="N" /> samples`, không viết `N samples`.
- Display equation mặc định không có box, border hay background.
- Tất cả card có cấu trúc label + formula + prose phải dùng shared `.math-card` system và các `--lesson-math-card-*` tokens; không tạo kích thước card riêng theo từng page.
- Các card công thức ngang hàng phải có cùng min-height, padding, label size, formula size, body size và spacing. Box so sánh hai representation cũng dùng cùng system.
- Visual card có SVG/plot được phép cao hơn vì nội dung, nhưng padding/label/body scale phải theo shared tokens.
- Khi review một bài, kiểm tra consistency của notation **và** visual scale của math cards, không chỉ correctness của công thức.


### Math notation áp dụng cho toàn bộ UI

Quy tắc MathExpr không chỉ áp dụng trong prose. Nó áp dụng cho headings, cards, tables, interactive components, chart/readout labels và roadmap. Nếu ký hiệu là biến/toán học thì render bằng KaTeX; chỉ acronym/tên công nghệ được giữ như text thường.
- SVG/chart không được chứa plain-text math như `x(t)`, `f₀`, `θ`, `I`, `Q`; dùng `MathExpr` qua `foreignObject` hoặc `SvgMathExpr`.
- CSS không được dùng selector rộng làm `span` của `MathExpr` thành block. Với readout/card, ưu tiên direct-child selector (`> span`, `> strong`) để giữ inline math liền câu.
- Khi audit, phải quét toàn bộ page và component, không chỉ phần prose hoặc display equations.


### Card taxonomy cho nội dung kỹ thuật

- Formula card, visual card và metric/readout card là ba loại khác nhau; không dùng một min-height/font-size chung cho cả ba.
- Formula card dùng shared `.formula-card`; visual có SVG/plot dùng `.visual-card` + `.visual-card-figure`; readout dùng `.metric-card`.
- Card cùng loại và cùng cấp phải có cùng padding, label scale, body scale và hierarchy.
- Visual area phải đủ lớn để đọc axis/label mà không zoom. Không để một card có nhiều khoảng trắng chỉ vì figure quá nhỏ.
- Metric/readout formula phải đi qua `MathExpr`; trong JSX có TeX command phải dùng `String.raw` hoặc double escaping.
- Khi review interactive lab, kiểm tra cả ba trạng thái: desktop rộng, tablet/2-column và mobile/1-column. Không chấp nhận raw TeX, clipped formula hoặc text nhỏ khó đọc.


### Math size trong box phải theo purpose, không theo page

Khi thiết kế một box kỹ thuật, phải xác định math bên trong là:
- công thức chính;
- công thức phụ;
- giá trị/state trong một process flow;
- readout chính;
- readout phụ;
- hay notation trong SVG.

Mỗi loại dùng shared `--lesson-box-math-*` token. Không đặt một cỡ riêng chỉ cho một bài hoặc một component.

Các process diagram phải phân biệt rõ **state** và **operation**: state là card, operation (DAC, mixer, FFT, filter...) nằm trên arrow giữa hai state. Không xếp operation thành một card ngang hàng với state nếu điều đó làm người đọc hiểu nhầm chuỗi xử lý.


## Rule hierarchy

Entry point của toàn bộ rules là `docs/RULES.md`.

Khi có xung đột, ưu tiên:
1. technical correctness;
2. standard/source correctness;
3. lesson contract và learning graph;
4. readability/visual consistency;
5. SEO.

Không sửa technical truth chỉ để giữ một visual đẹp hoặc một keyword.

## System-state rule cho Part III–VIII

Mỗi bài procedure/PHY từ Bài 19 trở đi phải trả lời được năm câu:
1. trước bước này UE/gNB/receiver đang có thông tin gì?
2. còn thiếu gì?
3. nó quan sát, correlate, decode, estimate hoặc transmit cái gì?
4. output cụ thể là gì?
5. output đó mở khóa bước nào tiếp theo?

Nếu prose không trả lời được năm câu này, bài chưa đủ system context.

## Source discipline

Nguồn chuẩn chi tiết nằm trong `docs/SOURCE_POLICY.md`.

- Claim phụ thuộc 3GPP phải trace được về Release + TS/TR + section/table/figure khi phù hợp.
- Không dùng vendor tutorial thay source normative.
- Numerical example phải được hiểu rõ là spec value, derived value hay illustrative value.
- Với NTN phải kiểm tra điều khoản Release 17/18 liên quan, không suy trực tiếp từ terrestrial NR.

## Navigation và curriculum sync

- `src/data/curriculum.js` là source of truth machine-readable cho part, lesson number, slug, status và kind.
- Không tự hard-code một slug mới rồi cập nhật registry sau.
- Page mới xuất hiện khi status đổi từ planned sang published.
- Homepage, /hoc/ và docs/CURRICULUM.md phải dùng cùng tên part.
- Từ Bài 19 trở đi, CI kiểm tra metadata, lesson roles, visual, spec layer và navigation.

## Bilingual content

- Bản dịch tiếng Anh không được index như translation pair cho tới khi có page tương ứng thật sự.
- English page phải giữ technical meaning, notation, figure semantics và source layer tương đương bản tiếng Việt.
- Không dùng machine translation thô cho caption, spec claim hoặc formula explanation rồi publish trực tiếp.


## Box readability và visual consistency

Mọi content text và mathematical content bên trong technical box phải có optical size tương đương prose ngay bên ngoài box.

- Không thu nhỏ caption/body/formula chỉ để “vừa box”.
- Không phóng to riêng một formula để tạo hierarchy nếu có thể dùng weight, spacing hoặc layout.
- Card label/eyebrow là metadata nên có thể nhỏ hơn; heading vẫn theo heading hierarchy.
- Diagram annotation phải đủ lớn để đọc ở kích thước hiển thị thực tế trên desktop và mobile.
- Với SVG, viewBox có thể làm KaTeX nhìn nhỏ hơn CSS px; phải đánh giá optical size sau render.
- Nếu một box cần nhiều nội dung hơn, tăng diện tích box hoặc đổi layout, không giảm font-size.

Shared size source nằm trong `src/styles/global.css` qua `--lesson-prose-size` và `--lesson-box-content-size`.

## Typography system

Reading surface của VietWireless dùng typography kiểu giáo trình kỹ thuật, đồng nhất giữa chữ và toán:

- nội dung bài học/home essay: `STIX Two Text`;
- công thức: `STIX Two Math` qua native MathML;
- navigation, button, badge, eyebrow và UI metadata: sans-serif system font.

Shared source of truth nằm trong `src/styles/global.css`:

- `--font-text`;
- `--font-math`;
- `--font-ui`;
- `--article-prose-size`;
- `--lesson-prose-size`.

Body prose chuẩn là **18 px** (`1.125rem`). Inline math và display math dùng cùng optical size với prose. Nội dung giải thích, table body, callout body, card content và mathematical content trong box không được co nhỏ để vừa layout; nếu thiếu chỗ thì tăng box, đổi grid hoặc cho phép wrap/scroll phù hợp.

Không dùng `Times New Roman`, `Cambria`, `Georgia` hoặc font math cục bộ như một quyết định page-specific. Chỉ được giữ chúng ở fallback stack của shared token khi thật sự cần compatibility.



### Chỉ dùng một thang chữ nhỏ cho lesson

Coi mỗi lesson như một tài liệu kỹ thuật thống nhất, không như một dashboard gồm nhiều card.

Chỉ dùng bốn cấp chính:
- 32 px: title của bài;
- 24 px: section heading;
- 18 px: prose, equation, table body, callout body, card body, readout chính;
- 16 px: metadata như eyebrow, card label và table header.

H3/subheading mặc định 18 px + weight/spacing. Không tạo page-specific font-size. Không thu chữ trong card để “fit”. Ưu tiên whitespace, border, weight và layout để phân cấp.
