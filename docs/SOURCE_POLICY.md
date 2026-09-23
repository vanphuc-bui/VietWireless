# VietWireless Source & Specification Policy

## 1. Thứ tự ưu tiên nguồn

Khi viết claim kỹ thuật:
1. 3GPP specification hoặc tài liệu chính thức tương ứng;
2. RFC/IEEE/ETSI hoặc tài liệu tiêu chuẩn chính thức;
3. sách giáo khoa, paper hoặc technical report có uy tín;
4. tài liệu vendor chỉ dùng cho cách triển khai/minh họa, không thay nguồn normative;
5. blog/forum chỉ dùng như secondary explanation, không làm nguồn duy nhất cho claim chuẩn.

## 2. Với 3GPP

Mỗi claim phụ thuộc standard phải xác định:
- technology/release liên quan;
- TS/TR;
- section, table hoặc figure khi thực tế có thể chỉ ra;
- claim đó là normative hay chỉ là cách diễn giải.

Sau khi nêu nguồn mới giải thích bằng ngôn ngữ VietWireless.

## 3. Không trộn ba lớp

Luôn phân biệt:

### Standard says
Điều được specification định nghĩa.

### Engineering interpretation
Cách VietWireless nối các định nghĩa để tạo mental model.

### Illustrative example
Giá trị hoặc scenario tự dựng để giải thích.

Một ví dụ số tự chọn không được trình bày như parameter bắt buộc của 3GPP.

## 4. Release discipline

Không viết “5G NR quy định...” nếu behavior thay đổi theo release mà không nêu release.

Đối với NTN, mặc định phải kiểm tra ít nhất phạm vi Release 17/18 liên quan trước khi publish. Không suy từ terrestrial NR sang NTN nếu spec có điều khoản riêng.

## 5. Secondary sources

Vendor docs, tutorials và papers rất hữu ích để:
- hiểu implementation;
- tìm cách minh họa;
- cross-check interpretation.

Nhưng nếu claim là “bit nằm ở đâu”, “UE phải làm gì”, “mapping như thế nào”, “timer/field được định nghĩa ra sao”, source cuối cùng phải quay về standard phù hợp.

## 6. Historical and factual claims

Các claim lịch sử, tên người, mốc năm, demonstration hoặc invention phải có nguồn đáng tin. Ảnh phải có provenance/license rõ.

## 7. Numerical examples

Mỗi ví dụ phải thuộc một trong ba loại:
- spec value: trích standard;
- derived value: tính từ công thức/parameter đã nêu;
- illustrative value: tự chọn để giải thích.

Label hoặc prose phải làm người đọc phân biệt được.

## 8. Source block trong bài

Bài kỹ thuật có nhiều claim chuẩn nên có một source/spec block gần cuối bài. Không cần nhồi citation sau mọi câu, nhưng claim nhạy với release hoặc bit-level mapping phải có nguồn đủ gần để truy vết.

## 9. Confidentiality

Không dùng tài liệu nội bộ, customer setup, log, screenshot, capture hoặc code không công khai để làm bằng chứng. Nếu kinh nghiệm thực tế gợi ý một ví dụ, hãy dựng lại bằng simulation hoặc nguồn công khai.
