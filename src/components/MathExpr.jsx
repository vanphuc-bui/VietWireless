import katex from 'katex';

export default function MathExpr({ tex, display = false, className = '' }) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: true,
    strict: 'warn',
    trust: false,
    output: 'htmlAndMathml',
  });

  if (display) {
    return (
      <div
        className={`math-display ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`math-inline ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
