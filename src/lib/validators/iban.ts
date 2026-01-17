import {
  electronicFormatIBAN,
  validateIBAN,
  ValidationErrorsIBAN
} from 'ibantools';

export interface IbanValidationResult {
  valid: boolean;
  errorCode?: string;
  formatted?: string;
}

export function validateIban(iban: string): IbanValidationResult {
  if (!iban) {
    return { valid: false, errorCode: 'ibanRequired' };
  }

  const electronic = electronicFormatIBAN(iban) || '';
  const result = validateIBAN(electronic);

  if (result.valid) {
    return { valid: true, formatted: electronic };
  }

  // Map error codes to translation keys
  const errorMap: Record<number, string> = {
    [ValidationErrorsIBAN.NoIBANProvided]: 'ibanRequired',
    [ValidationErrorsIBAN.NoIBANCountry]: 'ibanCountryInvalid',
    [ValidationErrorsIBAN.WrongBBANLength]: 'ibanLengthInvalid',
    [ValidationErrorsIBAN.WrongIBANChecksum]: 'ibanChecksumInvalid',
  };

  const errorCode = result.errorCodes?.[0];
  return {
    valid: false,
    errorCode: errorMap[errorCode] || 'ibanInvalid',
  };
}

export function formatIbanForStorage(iban: string): string {
  return electronicFormatIBAN(iban) || '';
}
