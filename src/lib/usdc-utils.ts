// src/lib/usdc-utils.ts

/**
 * USDC Utility Functions
 * USDC uses 6 decimals (not 18 like ETH)
 */

/**
 * Convert USDC amount to raw units (with 6 decimals)
 * @param amount - Amount in USDC (e.g., "100" for 100 USDC)
 * @returns BigInt representing the raw USDC amount
 * @example parseUsdc("100") => 100_000_000n
 */
export function parseUsdc(amount: string): bigint {
  try {
    // Remove any commas from the input
    const cleanAmount = amount.replace(/,/g, '');

    // Split by decimal point
    const [whole, decimal = ''] = cleanAmount.split('.');

    // Pad or truncate decimals to 6 digits
    const paddedDecimals = (decimal + '000000').slice(0, 6);

    // Combine whole and decimal parts
    const rawAmount = whole + paddedDecimals;

    return BigInt(rawAmount);
  } catch (error) {
    console.error('Error parsing USDC amount:', error);
    return BigInt(0);
  }
}

/**
 * Format USDC raw units to human-readable string
 * @param amount - Raw USDC amount (with 6 decimals)
 * @param decimals - Number of decimals to display (default: 2)
 * @returns Formatted string
 * @example formatUsdc(100_000_000n) => "100.00"
 */
export function formatUsdc(amount: bigint, decimals: number = 2): string {
  try {
    const amountStr = amount.toString().padStart(7, '0'); // Ensure at least 7 digits

    const wholeLength = amountStr.length - 6;
    const whole = amountStr.slice(0, wholeLength) || '0';
    const decimal = amountStr.slice(wholeLength);

    // Truncate to desired decimal places
    const truncatedDecimal = decimal.slice(0, decimals);

    if (decimals === 0 || truncatedDecimal === '0'.repeat(decimals)) {
      return whole;
    }

    // Remove trailing zeros
    const trimmedDecimal = truncatedDecimal.replace(/0+$/, '');

    return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
  } catch (error) {
    console.error('Error formatting USDC amount:', error);
    return '0';
  }
}

/**
 * Format USDC amount with thousands separators
 * @param amount - Raw USDC amount (with 6 decimals)
 * @param decimals - Number of decimals to display (default: 2)
 * @returns Formatted string with commas
 * @example formatUsdcWithCommas(1_000_000_000n) => "1,000.00"
 */
export function formatUsdcWithCommas(amount: bigint, decimals: number = 2): string {
  const formatted = formatUsdc(amount, decimals);
  const [whole, decimal] = formatted.split('.');

  // Add thousands separators to whole part
  const wholeWithCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimal ? `${wholeWithCommas}.${decimal}` : wholeWithCommas;
}

/**
 * Check if USDC amount is valid
 * @param amount - Amount string to validate
 * @returns true if valid
 */
export function isValidUsdcAmount(amount: string): boolean {
  if (!amount || amount.trim() === '') return false;

  // Remove commas
  const cleanAmount = amount.replace(/,/g, '');

  // Check if it's a valid number
  const regex = /^\d+\.?\d*$/;
  if (!regex.test(cleanAmount)) return false;

  // Check if it has more than 6 decimal places
  const parts = cleanAmount.split('.');
  if (parts.length > 1 && parts[1].length > 6) return false;

  // Check if amount is positive
  const numAmount = parseFloat(cleanAmount);
  if (numAmount <= 0) return false;

  return true;
}

/**
 * Get minimum USDC amount (0.000001 USDC = 1 unit)
 */
export const MIN_USDC_AMOUNT = BigInt(1);

/**
 * USDC decimals constant
 */
export const USDC_DECIMALS = 6;

/**
 * Maximum USDC amount that can be handled (for safety)
 * Set to 1 trillion USDC
 */
export const MAX_USDC_AMOUNT = BigInt(1_000_000_000_000) * BigInt(10 ** USDC_DECIMALS);

/**
 * Convert ETH amount to approximate USDC amount
 * This is just for migration/reference purposes
 * @param ethAmount - Amount in ETH (18 decimals)
 * @param ethPriceInUsdc - Current ETH price in USDC (default: 3000)
 * @returns Approximate USDC amount (6 decimals)
 */
export function ethToUsdc(ethAmount: bigint, ethPriceInUsdc: number = 3000): bigint {
  // Convert ETH (18 decimals) to USDC (6 decimals)
  // ethAmount * price / 10^18 * 10^6 = ethAmount * price / 10^12
  const ethInWhole = Number(ethAmount) / 10 ** 18;
  const usdcAmount = ethInWhole * ethPriceInUsdc;
  return parseUsdc(usdcAmount.toFixed(6));
}

/**
 * Validate USDC input and return cleaned value
 * @param input - User input string
 * @returns Cleaned string or null if invalid
 */
export function cleanUsdcInput(input: string): string | null {
  if (!input || input.trim() === '') return null;

  // Remove any non-numeric characters except decimal point
  let cleaned = input.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit to 6 decimal places
  if (parts.length === 2 && parts[1].length > 6) {
    cleaned = parts[0] + '.' + parts[1].slice(0, 6);
  }

  return cleaned;
}
