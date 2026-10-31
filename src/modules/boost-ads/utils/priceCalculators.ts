const BENGALI_TO_ENGLISH_MAP: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

/**
 * Convert any Bengali digits (০-৯) in a string to standard English digits (0-9)
 */
export function normalizeDigitsToEnglish(str: string): string {
  if (!str) return '';
  return str.replace(/[০-৯]/g, (ch) => BENGALI_TO_ENGLISH_MAP[ch] || ch);
}

/**
 * Extract raw numeric value from price string (e.g. "19,000/-" -> 19000, "30k" -> 30000, "১৯,০০০" -> 19000)
 */
export function extractNumericPrice(priceStr: string): number {
  if (!priceStr) return 0;
  const normalized = normalizeDigitsToEnglish(priceStr);
  const cleaned = normalized.replace(/[^0-9]/g, '');
  const val = parseInt(cleaned, 10);
  if (isNaN(val)) return 0;
  if (val < 1000 && val > 0) return val * 1000;
  return val;
}

/**
 * Bangladeshi currency format with standard comma grouping (e.g., 1,10,000/- or 38,000/-)
 */
export function formatBdCurrency(amount: number): string {
  const str = Math.round(amount).toString();
  if (str.length <= 3) return `${str}/-`;

  const lastThree = str.substring(str.length - 3);
  const remaining = str.substring(0, str.length - 3);
  const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${formattedRemaining},${lastThree}/-`;
}

/**
 * Format number as Bangladeshi currency without "/-" or with "/-"
 * e.g. 23000 -> "23,000"
 */
export function formatBdNumber(amount: number, withSuffix: boolean = false): string {
  const str = Math.round(amount).toString();
  if (str.length <= 3) return withSuffix ? `${str}/-` : str;

  const lastThree = str.substring(str.length - 3);
  const remaining = str.substring(0, str.length - 3);
  const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const res = `${formattedRemaining},${lastThree}`;
  return withSuffix ? `${res}/-` : res;
}

/**
 * Smart Auto Calculation of Cut Price (কাটা দাম / Fake Regular Price):
 * Rules requested by Sir:
 * - Low price (e.g. 19k - 30k): 19k -> 23k (+4,000 as in screenshot), 30k -> 38k-42k (markup 8k-12k, default 10k)
 * - Mid price (60k - 70k): markup 12k - 13k (default 12,500)
 * - High price (80k - 1 lac+): markup 15k - 18k (default 16,000)
 */
export function calculateAutoCutPrice(
  actualAmount: number,
  customLow: number = 10000,
  customMid: number = 12500,
  customHigh: number = 16000
): number {
  if (actualAmount <= 0) return 0;

  let markup = customLow;
  if (actualAmount <= 22000) {
    // Matches Sir's screenshot: 19,000 -> 23,000 (+4,000)
    markup = 4000;
  } else if (actualAmount <= 35000) {
    // 30,000 -> 38,000 to 42,000 (default 10,000 markup -> 40,000)
    markup = customLow;
  } else if (actualAmount <= 75000) {
    // 60,000 - 70,000 -> +12,000 to 13,000 (default 12,500)
    markup = customMid;
  } else {
    // 80,000 to 1 lac+ -> +15,000 to 18,000 (default 16,000)
    markup = customHigh;
  }

  const cutTotal = actualAmount + markup;
  return Math.round(cutTotal / 500) * 500;
}

/**
 * Smart Price Parser from filename
 * Supports:
 * - Pure thousand numbers: "25.jpg" -> 25,000/-, "25 (1).jpg" -> 25,000/-
 * - Decimal thousands: "25.5.jpg", "25_5.jpg" -> 25,500/-
 * - Full numbers: "25000.jpg", "25,000.jpg" -> 25,000/-
 * - Words + price: "sofa 25.jpg", "bed-35.jpg", "25_sofa.jpg" -> 25,000/- / 35,000/-
 * - Explicit suffix: "25k", "25 hajar", "25tk", "25/-"
 * - Bengali digits: "২৫.jpg" -> 25,000/-
 */
export function parsePriceFromFilename(filename: string): string {
  if (!filename) return '';

  // 1. Convert Bengali digits (০-৯) to English (0-9)
  let name = normalizeDigitsToEnglish(filename);

  // 2. Remove file extension (e.g. .jpg, .jpeg, .png, .webp)
  name = name.replace(/\.[a-zA-Z0-9]+$/, '').trim();

  // 3. Remove Windows duplicate file indicators: " (1)", "(1)", " - Copy", " - Copy (2)", "_copy", etc.
  name = name.replace(/\s*\(\d+\)$/g, '');
  name = name.replace(/\(\d+\)$/g, '');
  name = name.replace(/\s*-\s*Copy(?:\s*\(\d+\))?$/gi, '');
  name = name.replace(/_Copy(?:\s*\(\d+\))?$/gi, '');
  name = name.replace(/\s*-\s*কপি(?:\s*\(\d+\))?$/gi, '');
  name = name.trim();

  // 4. Case: Pure number filename (e.g. "25", "25.5", "25_5", "120", "25000", "25,000")
  const pureNumMatch = name.match(/^(\d{1,3}(?:,\d{2,3})+|\d+(?:[._]\d+)?)$/);
  if (pureNumMatch) {
    const rawStr = pureNumMatch[1].replace(/,/g, '').replace('_', '.');
    const val = parseFloat(rawStr);
    if (!isNaN(val) && val > 0) {
      if (val < 1000) {
        // e.g. 25 -> 25000, 25.5 -> 25500, 120 -> 120000
        return formatBdCurrency(Math.round(val * 1000));
      }
      return formatBdCurrency(Math.round(val));
    }
  }

  // 5. Case: Explicit price pattern with k, hajar, hazar, tk, /-, etc. (e.g. "sofa 25k", "bed 35 hajar", "25tk")
  const explicitMatch = name.match(/(?:^|[^\d])(\d+(?:[._]\d+)?)\s*(?:k|hajar|hazar|tk|\/-)(?:[^\d]|$)/i);
  if (explicitMatch) {
    const num = parseFloat(explicitMatch[1].replace('_', '.'));
    if (!isNaN(num) && num > 0) {
      const amount = num < 1000 ? Math.round(num * 1000) : Math.round(num);
      return formatBdCurrency(amount);
    }
  }

  // 6. Case: Formatted numbers with commas (e.g. "25,000" or "1,20,000")
  const commaMatch = name.match(/\b(\d{1,3}(?:,\d{2,3})+)\b/);
  if (commaMatch) {
    const val = parseInt(commaMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(val) && val >= 1000) {
      return formatBdCurrency(val);
    }
  }

  // 7. Case: Full 4 to 6 digit numbers (e.g. "25000", "19500", "120000")
  const fullNumbers = [...name.matchAll(/(?<![a-zA-Z])\b(\d{4,6})\b(?![a-zA-Z])/g)];
  if (fullNumbers.length > 0) {
    const val = parseInt(fullNumbers[fullNumbers.length - 1][1], 10);
    if (!isNaN(val) && val >= 1000) {
      return formatBdCurrency(val);
    }
  }

  // 8. Case: Standalone 2-3 digit number (representing thousands in furniture pricing)
  // e.g. "sofa 25", "bed-35", "dining 45.5", "almirah 120", "25_sofa", "model 101 25"
  const tokenMatches = [...name.matchAll(/(?:^|[\s_#\-[\](),])(\d{1,3}(?:[._]\d{1,2})?)(?:[\s_#\-[\](),]|$)/g)];
  
  // Search from the end backwards, because prices are typically placed at the end of filenames
  for (let i = tokenMatches.length - 1; i >= 0; i--) {
    const rawToken = tokenMatches[i][1];
    const num = parseFloat(rawToken.replace('_', '.'));
    // Valid furniture price range in thousands: 5 to 499 (i.e. 5,000 to 4,99,000 BDT)
    if (!isNaN(num) && num >= 5 && num <= 499) {
      const amount = Math.round(num * 1000);
      return formatBdCurrency(amount);
    }
  }

  return '';
}

/**
 * Auto-increment model number series
 */
export function generateModelNumber(startModel: string, index: number): string {
  if (!startModel || !startModel.trim()) {
    return `M-${100 + index}`;
  }

  const match = startModel.match(/^(.*?)(\d+)([^\d]*)$/);
  if (!match) {
    return `${startModel}-${index + 1}`;
  }

  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];
  const startNum = parseInt(numStr, 10);
  const currentNum = startNum + index;

  const paddedNum = numStr.startsWith('0') && numStr.length > 1
    ? currentNum.toString().padStart(numStr.length, '0')
    : currentNum.toString();

  return `${prefix}${paddedNum}${suffix}`;
}
