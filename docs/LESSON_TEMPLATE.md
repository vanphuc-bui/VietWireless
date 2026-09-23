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
