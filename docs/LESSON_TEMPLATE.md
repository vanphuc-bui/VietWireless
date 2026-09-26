# New lesson template

Dùng skeleton này cho mọi bài mới từ Bài 19 trở đi. Thay metadata theo src/data/curriculum.js.

Frontmatter tối thiểu:

    const lessonMeta = {
      number: 19,
      part: 3,
      slug: 'ue-bat-nguon',
      kind: 'overview',
      specRequired: true,
    };

Trong body, đánh dấu các block bắt buộc:

    <section data-lesson-role="problem">
      ...
    </section>

    <section data-lesson-role="system-context">
      ...
    </section>

    <figure data-lesson-visual>
      ...
    </figure>

    <section data-lesson-role="example">
      ...
    </section>

    <section data-lesson-role="boundary">
      ...
    </section>

    <section data-lesson-role="implementation">
      ...
    </section>

Nếu specRequired là true:

    <section data-lesson-role="specification">
      <p>3GPP TS 38.xxx, Release 17/18, section ...</p>
      ...
    </section>

Cuối bài:

    <section data-lesson-role="recap">
      ...
    </section>

Navigation:

    <a data-lesson-nav="map" href="/hoc/#phan-3">Bản đồ học</a>
    <a data-lesson-nav="previous" href="/hoc/.../">Bài trước</a>
    <a data-lesson-nav="next" href="/hoc/.../">Bài tiếp theo</a>

## Trước khi merge

- kiểm tra terminology theo docs/TERMINOLOGY.md;
- kiểm tra source theo docs/SOURCE_POLICY.md;
- kiểm tra content/depth theo docs/CONTENT_GUIDELINES.md và docs/LESSON_CONTRACT.md;
- kiểm tra math theo docs/MATH_STYLE_GUIDE.md;
- chạy npm run check:all.

## Bố cục trình bày mặc định

Skeleton này là gợi ý composition, không bắt buộc mọi bài có đúng số section:

```astro
<article class="lesson shell">
  <header class="lesson-hero">
    <!-- map/back link, eyebrow, H1, deck ngắn -->
  </header>

  <section class="concept-block" data-lesson-role="problem">
    <!-- câu hỏi/hiện tượng, ưu tiên prose -->
  </section>

  <section class="concept-block" data-lesson-role="system-context">
    <!-- system position / state progression nếu cần -->
  </section>

  <section class="concept-block">
    <!-- intuition + visual chính -->
    <figure data-lesson-visual>...</figure>
  </section>

  <section class="concept-block" data-lesson-role="example">
    <!-- ví dụ cụ thể -->
  </section>

  <section class="concept-block" data-lesson-role="implementation">
    <!-- samples / bins / grid / receiver state -->
  </section>

  <aside data-lesson-role="boundary" class="precision-note">
    <!-- misconception / scope -->
  </aside>

  <section class="concept-block" data-lesson-role="recap">
    <!-- nối lại logic -->
  </section>

  <!-- previous / map / next -->
</article>
```

### Khi dùng flow/card

- State là card; operation/operator là connector hoặc operation node.
- Grid phải đủ tracks cho đúng số state/operator trên desktop.
- Không để browser tự đẩy RX/output sang hàng mới ngoài ý đồ.
- Card height ưu tiên theo content.
- Không tạo font-size/min-height riêng trong page nếu shared component/token đã có.
- Tablet và mobile phải có breakpoint có chủ đích.

### Review screenshot

Trước merge, chụp hoặc kiểm tra trực tiếp:
- desktop;
- tablet;
- mobile.

Nếu thấy chữ to nhỏ bất thường, khoảng trắng vô nghĩa, operator trôi, inline math xuống dòng hoặc box giống dashboard hơn tài liệu, sửa shared layout/component trước khi merge.
