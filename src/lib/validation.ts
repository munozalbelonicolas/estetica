/**
 * Validation utilities for Argentine format standards
 */

/**
 * Validates an Argentine DNI (National Identity Document).
 * Valid DNI has 7 to 8 numerical digits (ranges from ~1.000.000 to 99.999.999).
 */
export function isValidArgentineDni(dni: string): boolean {
  if (!dni) return false;
  // Remove dots, spaces or hyphens
  const clean = dni.replace(/[\.\s\-]/g, '');
  if (!/^\d{7,8}$/.test(clean)) {
    return false;
  }
  const num = parseInt(clean, 10);
  return num >= 1000000 && num <= 99999999;
}

/**
 * Formats a raw DNI string into Argentine standard xx.xxx.xxx or x.xxx.xxx
 */
export function formatArgentineDni(dni: string): string {
  const clean = dni.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 4) return clean;
  if (clean.length <= 7) {
    return `${clean.slice(0, 1)}.${clean.slice(1, 4)}.${clean.slice(4)}`;
  }
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
}

/**
 * Validates an Argentine phone number.
 * Accepts:
 * - 10-digit local format with area code (e.g. 11 2345 6789, 351 456 7890, 261 412 3456)
 * - Country code +54 / +54 9 (e.g. +54 9 11 2345 6789, 5491123456789)
 * - Local mobile prefix 15 (e.g. 15 2345 6789, 11 15 2345 6789)
 */
export function isValidArgentinePhone(phone: string): boolean {
  if (!phone) return false;
  // Strip spaces, dashes, parentheses, plus signs
  let clean = phone.replace(/[\s\-\(\)\+]/g, '');

  // Remove country code prefix 549 or 54
  if (clean.startsWith('549')) {
    clean = clean.slice(3);
  } else if (clean.startsWith('54')) {
    clean = clean.slice(2);
  }

  // Remove 0 from area code if entered (e.g., 011 -> 11)
  if (clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  // Handle local mobile '15' prefix (e.g. 11 15 2345678 -> 11 2345678)
  if (clean.length === 12 && clean.slice(2, 4) === '15') {
    clean = clean.slice(0, 2) + clean.slice(4);
  } else if (clean.length === 10 && clean.startsWith('15')) {
    // 15 + 8 digits implies AMBA area code 11
    clean = '11' + clean.slice(2);
  }

  // A complete Argentine telephone with area code must have exactly 10 digits
  // First digit of area code is between 1 and 9, and not starting with 0
  return /^[1-9]\d{9}$/.test(clean);
}

/**
 * Formats a phone input gracefully for Argentine standard display (+54 9 11 xxxx-xxxx)
 */
export function formatArgentinePhone(phone: string): string {
  let clean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (clean.startsWith('549')) clean = clean.slice(3);
  else if (clean.startsWith('54')) clean = clean.slice(2);
  if (clean.startsWith('0')) clean = clean.slice(1);
  
  const limited = clean.slice(0, 10);
  if (limited.length <= 2) return limited;
  if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
}

/**
 * Validates a standard email address format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  // Standard RFC 5322 compliant regex for practical web forms
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}
