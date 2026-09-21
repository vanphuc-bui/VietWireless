# VietWireless Content & Visual Guidelines

## Mục tiêu

VietWireless không phải blog tin tức. Đây là knowledge platform giúp người học xây dựng mental model đúng về wireless engineering trước khi đi sâu vào 3GPP.

## Anatomy bắt buộc của một bài kỹ thuật

1. **Problem first** — bắt đầu bằng câu hỏi hoặc vấn đề thực tế.
2. **Visual intuition** — sơ đồ, plot, animation hoặc interactive element trước phần toán nặng.
3. **Plain-language explanation** — giải thích bằng tiếng Việt, giữ thuật ngữ kỹ thuật chuẩn bằng tiếng Anh.
4. **Math layer** — công thức chỉ xuất hiện khi người đọc đã biết mỗi đại lượng có ý nghĩa gì.
5. **Implementation layer** — nối khái niệm với samples, buffers, resource grid, transmitter/receiver hoặc code.
6. **Specification layer** — khi liên quan 3GPP, dẫn đúng TS/section và phân biệt rõ điều spec nói với cách diễn giải của VietWireless.
7. **Recap + next concept** — cuối bài phải cho người học biết họ vừa xây được mental model gì và nên học gì tiếp.

## Quy tắc thuật ngữ

- Lần đầu: “DMRS (Demodulation Reference Signal)”.
- Sau đó dùng “DMRS”; không dịch cứng thành thuật ngữ tiếng Việt dài và xa lạ với môi trường kỹ sư.
- Các từ nên giữ nguyên khi hợp lý: signal, sample, sampling, FFT, IFFT, I/Q, waveform, spectrum, subcarrier, resource grid, channel, equalization, timing, frequency offset.
- Tiếng Việt dùng để giải thích ý nghĩa, không dùng để che mất thuật ngữ ngành.

## Quy tắc trực quan

- Mỗi visual phải trả lời một câu hỏi cụ thể.
- Không dùng ảnh minh họa chỉ để “cho đẹp”.
- Ưu tiên SVG/Canvas/interactive plot cho signal processing.
- Màu phải có ý nghĩa nhất quán: cyan cho signal/time path, violet cho frequency/transform/alternate representation.
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
- Internal links phải theo learning graph chứ không nhồi keyword.
- Cornerstone page phải đủ tốt để người đọc không cần quay lại Google để hiểu khái niệm cơ bản.

## QA trước khi merge

- Có trả lời “tại sao cần khái niệm này?” không?
- Visual có thật sự liên quan nội dung không?
- Mobile có overflow không?
- Interactive component có fallback text không?
- Công thức và notation có nhất quán không?
- Có câu nào dễ khiến người mới xây mental model sai không?
- Có nội dung nào dựa trên thông tin nội bộ không?
