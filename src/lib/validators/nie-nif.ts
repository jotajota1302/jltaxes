import { isValid, isNIF, isNIE, normalize } from 'better-dni';

export function validateNieNif(value: string): boolean {
  if (!value) return false;
  const normalized = normalize(value);
  return isValid(normalized);
}

export function getNieNifType(value: string): 'NIF' | 'NIE' | null {
  if (!value) return null;
  const normalized = normalize(value);
  if (isNIF(normalized)) return 'NIF';
  if (isNIE(normalized)) return 'NIE';
  return null;
}

export function normalizeNieNif(value: string): string {
  return normalize(value);
}
