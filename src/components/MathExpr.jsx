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

export function SvgMathExpr({
  tex,
  x,
  y,
  width = 84,
  height = 24,
  anchor = 'start',
  className = '',
}) {
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const justifyContent = anchor === 'middle' ? 'center' : anchor === 'end' ? 'flex-end' : 'flex-start';

  return (
    <foreignObject x={left} y={y - height / 2} width={width} height={height}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className={`svg-math ${className}`.trim()}
        style={{ justifyContent }}
      >
        <MathExpr tex={tex} />
      </div>
    </foreignObject>
  );
}
