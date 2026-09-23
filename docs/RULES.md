# VietWireless Rules: source of truth

Đây là entry point cho toàn bộ rule của project.

## Rule hierarchy

1. src/data/curriculum.js  
   Source of truth cho số bài, part, slug, trạng thái và thứ tự.

2. docs/CURRICULUM.md  
   Giải thích learning graph và mục tiêu của từng part.

3. docs/LESSON_CONTRACT.md  
   Hợp đồng cấu trúc/depth bắt buộc trước khi một bài mới được publish.

4. docs/TERMINOLOGY.md  
   Cách dùng tiếng Việt và thuật ngữ kỹ thuật thống nhất.

5. docs/SOURCE_POLICY.md  
   Quy tắc nguồn, 3GPP Release/TS/section và cách phân biệt standard với interpretation.

6. docs/CONTENT_GUIDELINES.md  
   Quy tắc content, visual, system accuracy, SEO và confidentiality.

7. docs/WRITING_STYLE.md  
   Giọng văn, heading, punctuation và prose.

8. docs/MATH_STYLE_GUIDE.md  
   KaTeX, notation, card taxonomy và math rendering.

## CI gates

Mọi PR phải pass:
- npm run check:writing
- npm run check:math
- npm run check:lesson
- npm run build

Có thể chạy tất cả bằng:
- npm run check:all

## Khi các rule xung đột

Ưu tiên theo thứ tự:
1. technical correctness;
2. standard/source correctness;
3. learning graph và lesson contract;
4. readability/visual consistency;
5. SEO.

Không hy sinh technical correctness để giữ một câu văn, một visual hoặc một keyword.


## TeX escape safety

Math content có TeX command phải dùng `String.raw` hoặc double escaping. Direct quoted `tex="..."` chỉ dành cho notation không cần backslash command.

`check:math` và runtime `assertValidTex()` đều phải chặn:
- command mất backslash, ví dụ `3cdot217`, `qquad`;
- single-backslash trong JavaScript string/template;
- double-backslash runtime do dùng sai `String.raw`.

### Typography contract

- Reading text dùng `STIX Two Text`; math dùng `STIX Two Math`; UI metadata dùng shared sans-serif stack.
- KaTeX chỉ parse/validate TeX; visible math output là native MathML.
- Lesson prose source of truth là `--lesson-prose-size: 1.125rem`; box content phải bám prose scale.
- Không thêm page-specific font stack hoặc page-specific math size để chữa layout.
- Mọi thay đổi typography phải pass `npm run check:math` và giữ được consistency desktop/mobile.

