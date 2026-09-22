# VietWireless Content & Visual Guidelines

## Mục tiêu

VietWireless không phải blog tin tức. Đây là knowledge platform giúp người học xây dựng mental model đúng về wireless engineering trước khi đi sâu vào 3GPP.

## Anatomy bắt buộc của một bài kỹ thuật

1. **Problem first:** bắt đầu bằng câu hỏi hoặc vấn đề thực tế.
2. **Visual intuition:** sơ đồ, plot, animation hoặc interactive element trước phần toán nặng.
3. **Plain-language explanation:** giải thích bằng tiếng Việt, giữ thuật ngữ kỹ thuật chuẩn bằng tiếng Anh.
4. **Math layer:** công thức chỉ xuất hiện khi người đọc đã biết mỗi đại lượng có ý nghĩa gì.
5. **Implementation layer:** nối khái niệm với samples, buffers, resource grid, transmitter/receiver hoặc code.
6. **Specification layer:** khi liên quan 3GPP, dẫn đúng TS/section và phân biệt rõ điều spec nói với cách diễn giải của VietWireless.
7. **Recap + next concept:** cuối bài phải cho người học biết họ vừa xây được mental model gì và nên học gì tiếp.

## Quy tắc thuật ngữ

- Lần đầu: “DMRS (Demodulation Reference Signal)”.
- Sau đó dùng “DMRS”; không dịch cứng thành thuật ngữ tiếng Việt dài và xa lạ với môi trường kỹ sư.
- Các từ nên giữ nguyên khi hợp lý: signal, sample, sampling, FFT, IFFT, I/Q, waveform, spectrum, subcarrier, resource grid, channel, equalization, timing, frequency offset.
- Tiếng Việt dùng để giải thích ý nghĩa, không dùng để che mất thuật ngữ ngành.

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
- Internal links phải theo learning graph chứ không nhồi keyword.
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
- Visual có thật sự liên quan nội dung không?
- Mobile có overflow không?
- Interactive component có fallback text không?
- Công thức và notation có nhất quán không?
- Có câu nào dễ khiến người mới xây mental model sai không?
- Có nội dung nào dựa trên thông tin nội bộ không?


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
