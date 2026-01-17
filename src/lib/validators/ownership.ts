export interface OwnershipEntry {
  ownerId: string;
  percentage: number;
}

export interface OwnershipValidationResult {
  valid: boolean;
  errorCode?: string;
}

export function validateOwnershipPercentages(
  entries: OwnershipEntry[]
): OwnershipValidationResult {
  if (entries.length === 0) {
    return { valid: false, errorCode: 'atLeastOneOwner' };
  }

  // Use basis points (integer) to avoid floating point issues
  // 100% = 10000 basis points
  const totalBasisPoints = entries.reduce((sum, entry) => {
    return sum + Math.round(entry.percentage * 100);
  }, 0);

  if (totalBasisPoints !== 10000) {
    const difference = (10000 - totalBasisPoints) / 100;
    return {
      valid: false,
      errorCode: difference > 0 ? 'percentageUnder100' : 'percentageOver100'
    };
  }

  // Check individual entries
  for (const entry of entries) {
    if (entry.percentage <= 0) {
      return { valid: false, errorCode: 'percentageMustBePositive' };
    }
    if (entry.percentage > 100) {
      return { valid: false, errorCode: 'percentageExceeds100' };
    }
  }

  return { valid: true };
}
