const POSITION_WEIGHTS = [13, 15, 12, 5, 4, 17, 9, 21, 3, 7, 1];
const CONTROL_LETTERS = 'MQWERTYUIOPASDFGHJKLBZX';

function charToValue(char: string): number {
  const code = char.charCodeAt(0);
  if (char >= '0' && char <= '9') {
    return parseInt(char, 10);
  }
  if (char >= 'A' && char <= 'N') {
    return code - 64; // A=1, B=2, ..., N=14
  }
  if (char > 'N') {
    return code - 63; // O=16, P=17, ..., Z=27
  }
  return 0;
}

function calculateControlDigit(sequence: string): string {
  let sum = 0;
  for (let i = 0; i < sequence.length && i < POSITION_WEIGHTS.length; i++) {
    const value = charToValue(sequence[i]);
    sum = (sum + value * POSITION_WEIGHTS[i]) % 23;
  }
  return CONTROL_LETTERS[sum];
}

export function validateCadastralReference(ref: string): boolean {
  if (!ref || ref.length !== 20) {
    return false;
  }

  const normalized = ref.toUpperCase().replace(/\s/g, '');
  if (normalized.length !== 20) {
    return false;
  }

  // Validate alphanumeric only
  if (!/^[A-Z0-9]{20}$/.test(normalized)) {
    return false;
  }

  // First control digit: positions 0-6 + 14-17
  const firstSequence = normalized.substring(0, 7) + normalized.substring(14, 18);
  const expectedFirst = calculateControlDigit(firstSequence);

  // Second control digit: positions 7-13 + 14-17
  const secondSequence = normalized.substring(7, 14) + normalized.substring(14, 18);
  const expectedSecond = calculateControlDigit(secondSequence);

  const actualControls = normalized.substring(18, 20);
  return actualControls === expectedFirst + expectedSecond;
}

export function normalizeCadastralReference(ref: string): string {
  return ref.toUpperCase().replace(/\s/g, '');
}
