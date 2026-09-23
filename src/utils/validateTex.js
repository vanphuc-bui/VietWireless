export const STRIPPED_TEX_COMMANDS = [
  'qquad',
  'quad',
  'cdot',
  'times',
  'frac',
  'sqrt',
  'mathrm',
  'mathbf',
  'mathcal',
  'operatorname',
  'approx',
  'Delta',
  'delta',
  'mu',
  'tau',
  'phi',
  'theta',
  'omega',
  'sigma',
  'pi',
  'ell',
  'overline',
  'hat',
  'vec',
];

function isAsciiLetter(char) {
  return Boolean(char) && /[A-Za-z]/u.test(char);
}

export function findStrippedTexCommand(tex) {
  if (typeof tex !== 'string') return null;

  for (const command of STRIPPED_TEX_COMMANDS) {
    let from = 0;
    while (from < tex.length) {
      const index = tex.indexOf(command, from);
      if (index < 0) break;

      const previous = index > 0 ? tex[index - 1] : '';
      const next = tex[index + command.length] ?? '';

      if (previous !== '\\' && !isAsciiLetter(previous) && !isAsciiLetter(next)) {
        return command;
      }

      from = index + command.length;
    }
  }

  return null;
}

export function hasRuntimeDoubleBackslashCommand(tex) {
  if (typeof tex !== 'string') return false;

  for (let index = 0; index < tex.length - 2; index += 1) {
    if (tex[index] === '\\' && tex[index + 1] === '\\' && isAsciiLetter(tex[index + 2])) {
      return true;
    }
  }

  return false;
}

export function assertValidTex(tex, context = 'MathExpr') {
  const stripped = findStrippedTexCommand(tex);
  if (stripped) {
    throw new Error(
      `${context}: suspicious TeX command "${stripped}" lost its backslash. Use String.raw or double escaping in source.`,
    );
  }

  if (hasRuntimeDoubleBackslashCommand(tex)) {
    throw new Error(
      `${context}: TeX contains two runtime backslashes before a command. String.raw should contain one backslash; ordinary JavaScript strings should contain two in source so runtime receives one.`,
    );
  }
}
