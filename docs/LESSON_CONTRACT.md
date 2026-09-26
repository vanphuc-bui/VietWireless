# VietWireless Lesson Contract

Tài liệu này là hợp đồng xuất bản cho mọi bài kỹ thuật mới. docs/CURRICULUM.md quyết định bài nào tồn tại và thứ tự học; file này quyết định một bài phải đạt chuẩn gì trước khi merge.

## 1. Mục tiêu

Một bài VietWireless không chỉ trả lời “X là gì?”. Bài phải giúp người đọc xây được mental model đủ chắc để:
- biết vì sao khái niệm xuất hiện;
- biết nó nằm ở đâu trong end-to-end system;
- biết input/output hoặc state trước/sau;
- hiểu ít nhất một ví dụ cụ thể;
- hiểu boundary của cách giải thích;
- biết khái niệm nối sang bài nào tiếp theo.

## 2. Metadata bắt buộc cho bài mới từ Bài 19 trở đi

Trong frontmatter của page phải có object lessonMeta với các field:
- number;
- part;
- slug;
- kind;
- specRequired.

Ví dụ Bài 19 phải dùng number 19, part 3, slug ue-bat-nguon, kind overview và specRequired true.

Giá trị phải khớp src/data/curriculum.js. Không tự đặt lại số bài, tên part hoặc slug trong page.

## 3. Lesson roles bắt buộc

Các bài mới từ Bài 19 trở đi phải đánh dấu các block chính bằng data-lesson-role. Attribute này không dùng để style; nó giúp CI kiểm tra cấu trúc.

Tối thiểu phải có:
- data-lesson-role="problem"
- data-lesson-role="system-context"
- data-lesson-role="example"
- data-lesson-role="boundary"
- data-lesson-role="implementation"
- data-lesson-role="recap"

Nếu specRequired là true, phải có thêm:
- data-lesson-role="specification"

Mỗi bài phải có ít nhất một visual giải thích thật sự, đánh dấu data-lesson-visual trên figure hoặc wrapper phù hợp.

## 4. Ý nghĩa của từng role

### problem
Nêu câu hỏi hệ thống hoặc hiện tượng cần giải quyết. Không mở bài bằng định nghĩa từ điển.

### system-context
Nói rõ:
- ta đang ở bước nào trong transmitter/receiver/procedure;
- phía nhận đã biết gì;
- còn chưa biết gì;
- output của bài này sẽ được dùng ở đâu tiếp theo.

Với bài 5G NR, đây là phần đặc biệt quan trọng.

### example
Ít nhất một ví dụ số, waveform, sequence, timeline hoặc scenario cụ thể. Nếu dùng giá trị minh họa, phải nói rõ đó là ví dụ minh họa, không ngụ ý là giá trị duy nhất của standard.

### boundary
Chỉ ra ít nhất một giới hạn hoặc chỗ dễ hiểu sai. Ví dụ:
- PSS không tự cho UE toàn bộ Physical Cell ID;
- CP không “xóa multipath”;
- channel estimation không đồng nghĩa equalization.

### implementation
Nối khái niệm xuống implementation: sample, buffer, FFT bin, resource element, estimator, correlator, scheduler, state machine hoặc receiver stage.

### specification
Nêu claim nào đến từ standard, release nào, TS nào và section/table nào khi có thể. Phân biệt:
- 3GPP quy định;
- VietWireless diễn giải;
- ví dụ minh họa.

### recap
Nối lại logic đã xây, không viết checklist học thuộc. Cuối bài phải link về overview của part và tới bước hợp lý tiếp theo.

## 5. Overview lesson và deep-dive lesson

### Overview
Bài overview phải ưu tiên state progression/end-to-end flow. Không sa vào bit field, sequence formula hoặc parameter table quá sớm.

### Deep-dive
Bài deep-dive phải trả lời rõ:
1. input là gì;
2. operation/observation nào diễn ra;
3. output là gì;
4. output đó được dùng ở đâu tiếp theo;
5. khái niệm không làm được điều gì.

## 6. Depth gate

Không merge nếu bài chỉ gồm:
- định nghĩa;
- vài card;
- một công thức;
- rồi recap.

Một bài đủ sâu thường có:
- problem;
- system context;
- visual;
- ví dụ cụ thể;
- math khi cần;
- boundary/misconception;
- implementation;
- source/spec layer khi cần;
- recap và navigation.

Không dùng word count làm tiêu chuẩn.

## 7. Navigation contract

Mỗi bài mới phải có:
- link về page /hoc/ hoặc overview của part, đánh dấu data-lesson-nav="map";
- link tới bài trước, đánh dấu data-lesson-nav="previous" khi có bài trước;
- link tới bài tiếp theo, đánh dấu data-lesson-nav="next" khi có bài sau;
- không tạo dead-end nếu learning graph còn tiếp.

Anchor, số bài và slug phải khớp src/data/curriculum.js. CI kiểm tra các marker navigation này.

## 8. Visual contract

Một visual phải trả lời một câu hỏi. Trước khi thêm visual, phải có thể hoàn thành câu:

“Hình này giúp người đọc thấy ______ mà prose khó thấy.”

Không chấp nhận:
- hình generic để trang đỡ trống;
- diagram không có label;
- chữ hoặc công thức quá nhỏ trên mobile;
- dùng màu là tín hiệu duy nhất;
- animation không có reduced-motion behavior.

## 9. Interactive contract

Interactive lab phải có:
- trạng thái mặc định có ý nghĩa;
- control label rõ;
- readout giải thích thay đổi;
- fallback prose/caption để bài vẫn hiểu được nếu người đọc không tương tác;
- không để control thay thế phần giải thích.

## 10. Publish gate cho Part III–VIII

Trước merge, bắt buộc chạy:
- npm run check:writing
- npm run check:math
- npm run check:lesson
- npm run build

CI phải pass cả bốn.

## 11. Composition và bố cục lesson

Contract này áp dụng cho **mọi lesson**, kể cả các bài 1–18 dù CI metadata nghiêm ngặt hiện chỉ bắt buộc từ Bài 19.

Một bài không được thiết kế như một chuỗi card ngang hàng. Reading flow ưu tiên:

1. hero ngắn;
2. problem/system context;
3. prose + visual intuition;
4. example;
5. math/technical layer;
6. boundary;
7. implementation/system consequence;
8. recap/navigation.

Không bắt buộc mỗi mục trên thành một section riêng. Section chỉ tồn tại khi có một câu hỏi hoặc khối lập luận độc lập.

### Section contract

Mỗi section nên có **một điểm nhấn chính**:
- prose;
- một visual;
- một equation;
- hoặc một interactive.

Không để kicker, H2, H3, card title và display equation cùng cạnh tranh thị giác trong một viewport.

Nếu kicker đã nói rõ chủ đề, H2 không được chỉ lặp lại cùng câu bằng chữ lớn hơn.

### Flow contract

Với các chuỗi xử lý:
- DOM order phải là reading order;
- state/card xen kẽ connector/operator có chủ đích;
- desktop grid tracks phải đủ cho toàn chuỗi;
- không để output rơi sang hàng mới chỉ vì thiếu track;
- tablet wrap theo nhóm logic;
- mobile stack theo đúng thứ tự và xoay connector khi cần.

### Box/card contract

- Không dùng box nếu paragraph thường rõ hơn.
- Card cùng hàng và cùng loại phải nhất quán padding/border/typography.
- Height ưu tiên content-driven.
- Chỉ equal-height khi so sánh ngang thực sự cần thiết.
- Không giảm chữ để fit card; sửa grid/padding/content trước.

### Typography contract

- Noto Serif: prose và heading.
- Noto Sans: UI/metadata/label.
- KaTeX: math.
- Không page-specific font stack.
- Inline math/emphasis không tự xuống dòng do CSS.
- Text trong box không nhỏ hơn prose chỉ để tiết kiệm chỗ.

## 12. Visual QA gate

Trước merge một visual hoặc flow mới, review ở desktop, tablet và mobile.

Phải kiểm tra:
- thứ tự đọc;
- alignment của operator/arrow;
- card height và khoảng trắng;
- clipping/overflow;
- inline math;
- label tiếng Việt có đủ dấu và đúng font;
- figure/SVG annotation có đủ lớn;
- output/result có được nhận ra mà không cần dựa chỉ vào màu.

Nếu một screenshot cần người review hỏi “mũi tên này đi đâu?” hoặc “vì sao block này rơi xuống dưới?”, visual chưa đạt contract.

