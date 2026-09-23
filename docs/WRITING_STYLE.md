# VietWireless Writing Style

File này là source of truth cho giọng văn của VietWireless.

## 1. Cảm giác khi đọc

VietWireless nên giống một người làm trong ngành đang chia sẻ lại cách họ hiểu một vấn đề với người mới, thân thiện nhưng vẫn có khoảng cách chuyên nghiệp.

Không viết như giáo trình ra lệnh.
Không viết như bài marketing.
Không viết như AI đang cố tỏ ra thông thái.

Giọng văn nên:
- gần gũi;
- tò mò;
- cụ thể;
- có trải nghiệm cá nhân khi phù hợp;
- chính xác về kỹ thuật nhưng không phô trương thuật ngữ.

## 2. Cách xưng hô

Dùng “tôi” khi tác giả nói về trải nghiệm, lựa chọn hoặc cách giải thích của bản thân.

Ví dụ:
- “Tôi từng thấy phần này khá khó hình dung.”
- “Tôi chọn OFDM làm ví dụ vì nó nối trực tiếp với LTE và 5G NR.”
- “Tôi sẽ đi chậm hơn một chút ở phần này.”

Không dùng “mình” trong prose của website. Từ này tạo cảm giác thân mật quá mức so với giọng VietWireless mong muốn.

Có thể dùng “ta” khi tác giả và người đọc đang cùng quan sát một hình, waveform hoặc phép biến đổi.

Hạn chế dùng “bạn phải”, “bạn cần”, “hãy nhớ”, “đừng”.
Nếu cần hướng người đọc, dùng cách nhẹ và trực tiếp hơn:
- “ta có thể nhìn theo cách này”;
- “ở đây có một chỗ khá dễ lẫn”;
- “nếu nối hai ý này lại”;
- “một cách dễ hình dung là”.

## 3. Không dùng giọng dạy đời

Tránh các mẫu câu:
- “Bài học là...”
- “Điều quan trọng nhất là...”
- “Bạn phải hiểu...”
- “Đừng bắt đầu bằng...”
- “Nếu chỉ nhớ N điều...”
- “Rõ ràng là...”
- “Hiển nhiên...”

Có thể thay bằng cách nói trực tiếp hơn:
- “Bài học:” khi cần chốt một ý ngắn dưới timeline hoặc ví dụ;
- “Chỗ này từng làm tôi khá bối rối...” khi thật sự đang kể trải nghiệm cá nhân;
- “Nếu nhìn theo góc này...” khi đổi cách biểu diễn;
- “Tới đây ta có thể nối các ý lại như sau...” ở phần recap;
- “Có một chi tiết khá dễ lẫn...” khi cần cảnh báo kỹ thuật.

## 4. Human writing

Không ép mọi section vào cùng một công thức câu chữ.

Nên xen kẽ:
- một câu hỏi;
- một đoạn giải thích ngắn;
- một ví dụ cụ thể;
- một visual;
- một nhận xét cá nhân khi thật sự có ích.

Không lặp các câu mở đầu giống nhau ở mọi section.

Không over-explain những thứ đã nhìn thấy rõ trên hình.

Không dùng các câu sáo rỗng như “Trong thế giới ngày nay”, “Trong kỷ nguyên số”, “Có thể nói rằng”.

## 5. Dấu câu

Không dùng em dash.

Ký tự bị cấm trong prose:

`—`

Thay bằng:
- dấu phẩy;
- dấu chấm;
- dấu hai chấm;
- dấu ngoặc;
- hoặc tách thành hai câu.

Dấu nối trong các cụm như “Điện tử - Viễn thông” dùng hyphen thông thường `-`.

## 6. Thuật ngữ kỹ thuật

Không cố dịch mọi thứ sang tiếng Việt.

Có thể giữ:
- signal;
- sample;
- sampling;
- waveform;
- spectrum;
- time domain;
- frequency domain;
- I/Q;
- FFT/IFFT;
- subcarrier;
- resource grid;
- channel;
- equalization.

Lần đầu xuất hiện một thuật ngữ khó, giải thích bằng câu tự nhiên thay vì đưa định nghĩa kiểu từ điển.

## 7. Công thức và trực giác

Công thức không cần xuất hiện sớm chỉ để chứng minh bài viết “kỹ thuật”.

Thứ tự thường hợp lý:
1. câu hỏi;
2. hình dung hoặc ví dụ;
3. visual;
4. công thức;
5. implementation.

Đây là gợi ý, không phải template bắt buộc.

## 8. Recap

Không viết recap như checklist để học thuộc.

Thay vì:
“Bạn cần nhớ 5 điều sau”

ưu tiên:
“Tới đây ta có thể nối các ý lại như sau.”

## 9. Review trước khi merge

Đọc lại và tự hỏi:
- câu này nghe giống một người đang nói thật hay giống template AI?
- có chỗ nào đang ra lệnh cho người đọc không?
- có câu nào phán xét người chưa hiểu không?
- có đoạn nào dài chỉ vì muốn tỏ ra đầy đủ không?
- visual đã nói được điều này rồi thì text có thể ngắn hơn không?
- có em dash `—` không?

CI sẽ tự kiểm tra em dash trong các file nội dung.


## 10. Khoảng trắng quanh chữ nhấn mạnh và inline markup

Không để chữ dính vào phần `strong`, `em`, link hoặc inline component.

Sai:

```html
một câu hỏi đơn giản:<strong>chúng ta đang truyền gì?</strong>
```

Đúng:

```html
một câu hỏi đơn giản: <strong>chúng ta đang truyền gì?</strong>
```

Khi JSX/Astro expression làm khoảng trắng không rõ ràng, dùng khoảng trắng tường minh hoặc viết lại câu để hai phần không bị dính.

Trước khi merge, rà cả desktop và mobile. Các lỗi kiểu `là<strong>`, `</strong>và`, `:<em>` hoặc `</em>mà` phải được sửa.


### Astro và khoảng trắng qua nhiều dòng

Astro có thể bỏ whitespace ở ranh giới giữa text và inline element khi source được xuống dòng.

Ví dụ source nhìn có vẻ đúng nhưng có thể render thành chữ dính:

```astro
câu hỏi:
<strong>nội dung được nhấn mạnh</strong>
```

Khi text và `strong`, `em` hoặc `a` nằm ở hai dòng khác nhau, dùng khoảng trắng tường minh:

```astro
câu hỏi:{" "}
<strong>nội dung được nhấn mạnh</strong>
```

CI kiểm tra cả trường hợp lỗi nằm qua ranh giới dòng, không chỉ trên cùng một dòng.


## 11. Tránh các nhãn mang giọng AI

Không dùng các nhãn kiểu:
- “Điều tôi thấy thú vị:”
- “Một ý khá hay ở đây:”
- “Điểm thú vị:”
- “Điều đáng chú ý là:”
- “Và đây là chỗ mọi thứ nối lại:”

Các cụm này thường làm câu văn có cảm giác được thêm vào để tạo giọng, thay vì nói điều cần nói.

Nếu một đoạn timeline cần chốt ý, dùng đơn giản:

`Bài học:`

Sau đó viết thẳng nội dung kỹ thuật. Không cần thêm cảm xúc hoặc nhận xét dẫn đường nếu chúng không mang thêm thông tin.


## 12. Mức độ thân thiện

Giọng VietWireless thân thiện nhưng không quá gần gũi.

Tác giả dùng `tôi`, không dùng `mình`.

Ưu tiên câu trực tiếp và bình tĩnh. Không cố tạo cảm giác trò chuyện bằng các cụm quá thân mật.

Ví dụ phù hợp:

`Vì vậy tôi sẽ cố gắng đi chậm hơn một chút ở những chỗ từng làm tôi bối rối.`

Không dùng:

`Vì vậy mình muốn đi chậm hơn một chút ở những chỗ từng làm mình bối rối.`


## 13. Phân cấp tiêu đề

Không thêm một heading lớn chỉ để diễn đạt lại section label ngay phía trên.

Nếu section kicker đã đủ rõ, bắt đầu thẳng bằng nội dung hoặc một câu dẫn ngắn.

Ví dụ, sau:

`VÌ SAO TÔI VIẾT VIETWIRELESS`

không cần thêm một H2 lớn chỉ để lặp lại lý do. Có thể đi thẳng vào đoạn văn.

Khi một section có visual chính, title phụ không được lấn át visual đó. Dùng paragraph ngắn hoặc heading nhỏ hơn, để mắt người đọc tập trung vào diagram, map hoặc interactive element.

Mỗi section nên có một điểm nhấn chính, không phải nhiều tầng title cạnh tranh với nhau.


## 14. Kích thước heading trong bài học

Trong một bài học, tiêu đề bài là điểm nhấn lớn nhất.

Các section title bên trong bài không nên có kích thước gần bằng title bài. Chúng chỉ cần giúp người đọc định vị nội dung, không nên ngắt nhịp đọc hoặc cạnh tranh với diagram, plot và interactive lab.

Nếu một câu heading dài như một câu văn hoàn chỉnh, ưu tiên kích thước vừa phải. Không dùng typography quá lớn chỉ vì đó là H2.


## 15. Câu chuyển ý không cần thành section

Không biến mọi ý mới thành một section có số thứ tự, kicker và heading.

Nếu một câu chỉ có nhiệm vụ chuyển từ ý trước sang visual hoặc giải thích tiếp theo, viết nó như một paragraph bình thường.

Ví dụ:

`Miền thời gian và miền tần số chỉ là hai cách nhìn khác nhau của cùng một tín hiệu.`

Không cần thêm:

`03 · HAI CÁCH NHÌN CÙNG MỘT TÍN HIỆU`

và cũng không cần lặp lại cùng ý bằng một H2 ngay bên dưới.

Mục tiêu là giữ nhịp đọc liên tục. Chỉ tạo section mới khi thật sự có một khối nội dung độc lập.


## 16. Tiếng Việt là ngôn ngữ dẫn chuyện

Source of truth chi tiết nằm trong docs/TERMINOLOGY.md.

Trong prose và heading, ưu tiên tiếng Việt khi cách viết tự nhiên và chính xác:
- tín hiệu thay vì signal;
- thời gian thay vì time;
- tần số thay vì frequency;
- miền thời gian / miền tần số thay vì time domain / frequency domain;
- dữ liệu thay vì data;
- thông tin hệ thống thay vì system information;
- liên kết vô tuyến thay vì wireless link.

Giữ tiếng Anh cho acronym, tên channel/signal/procedure, thuật ngữ chuẩn hoặc nơi bản dịch làm mất precision.

Không viết một câu nửa Việt nửa Anh chỉ vì source gốc dùng tiếng Anh.

## 17. Viết procedure theo state transition

Đặc biệt từ Part III trở đi, prose phải cho người đọc thấy progression thay vì chỉ liệt kê tên block.

Ưu tiên cấu trúc:
- trước bước này hệ thống biết gì;
- điều gì còn chưa biết;
- operation/observation nào xảy ra;
- output là gì;
- bước tiếp theo dùng output đó như thế nào.

Ví dụ tốt không chỉ nói “UE dùng PSS để synchronization”, mà phải nói synchronization nào, PSS giúp biết được phần nào và phần nào vẫn cần SSS/PBCH.

## 18. Không dùng câu tuyệt đối khi model có boundary

Tránh các câu quá tuyệt đối như:
- “CP loại bỏ multipath”;
- “PSS cho UE biết cell ID”;
- “DMRS cho receiver biết channel”.

Ưu tiên mô tả đúng phạm vi:
- CP giúp tránh ISI giữa các OFDM symbols khi delay spread phù hợp với guard interval;
- PSS cung cấp một phần thông tin cell identity và hỗ trợ timing detection;
- DMRS cung cấp known reference symbols để receiver estimate channel trên resource liên quan.

Nếu một câu ngắn dễ tạo mental model sai, viết dài hơn một chút để giữ đúng boundary.
