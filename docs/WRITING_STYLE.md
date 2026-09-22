# VietWireless Writing Style

File này là source of truth cho giọng văn của VietWireless.

## 1. Cảm giác khi đọc

VietWireless nên giống một người làm trong ngành đang ngồi chia sẻ lại cách mình hiểu một vấn đề với một người mới hơn.

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

Ưu tiên “mình” khi:
- kể lại một chỗ từng khó hiểu;
- chia sẻ cách hình dung;
- giải thích vì sao mình chọn một ví dụ.

Có thể dùng “ta” khi hai bên đang cùng nhìn một hình, waveform hoặc phép biến đổi.

Hạn chế dùng “bạn phải”, “bạn cần”, “hãy nhớ”, “đừng”.
Nếu muốn hướng người đọc, dùng cách nhẹ hơn:
- “mình thử nhìn theo cách này”;
- “ở đây có một chỗ khá dễ lẫn”;
- “nếu nối hai ý này lại”;
- “một cách mình hay hình dung là”.

## 3. Không dùng giọng dạy đời

Tránh các mẫu câu:
- “Bài học là...”
- “Điều quan trọng nhất là...”
- “Bạn phải hiểu...”
- “Đừng bắt đầu bằng...”
- “Nếu chỉ nhớ N điều...”
- “Rõ ràng là...”
- “Hiển nhiên...”

Có thể thay bằng:
- “Điều mình thấy thú vị ở đây là...”
- “Chỗ này từng làm mình khá bối rối...”
- “Nếu nhìn theo góc này...”
- “Tới đây mình có thể nối lại như sau...”
- “Có một chi tiết khá dễ lẫn...”

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
“Tới đây mình có thể nối các ý lại như sau.”

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
