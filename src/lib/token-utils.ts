// Generic token utilities for multi-token support
import { SUPPORTED_TOKENS, TokenSymbol, getTokenConfig } from './token-config';

/**
 * Parse token amount from user input to bigint with proper decimals
 * @param amount - Amount as string (e.g., "100.50")
 * @param symbol - Token symbol (USDC, EURC, etc.)
 * @returns BigInt with proper decimals
 */
export function parseToken(amount: string, symbol: TokenSymbol): bigint {
  const token = SUPPORTED_TOKENS[symbol];
  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount < 0) {
    return BigInt(0);
  }

  // Multiply by 10^decimals to get the raw amount
  const multiplier = BigInt(10 ** token.decimals);
  const wholePart = BigInt(Math.floor(numericAmount));
  const fractionalPart = numericAmount - Math.floor(numericAmount);
  const fractionalBigInt = BigInt(Math.round(fractionalPart * Number(multiplier)));

  return wholePart * multiplier + fractionalBigInt;
}

/**
 * Format token amount from bigint to human-readable string
 * @param amount - Raw token amount as bigint
 * @param symbol - Token symbol
 * @param includeSymbol - Whether to include symbol in output
 * @returns Formatted string (e.g., "100.50" or "100.50 USDC")
 */
export function formatToken(
  amount: bigint | undefined,
  symbol: TokenSymbol,
  includeSymbol: boolean = false
): string {
  if (amount === undefined || amount === null) {
    return includeSymbol ? `0.00 ${symbol}` : '0.00';
  }

  const token = SUPPORTED_TOKENS[symbol];
  const divisor = BigInt(10 ** token.decimals);

  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Pad fractional part with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(token.decimals, '0');

  // Trim trailing zeros but keep at least 2 decimal places
  let formatted = `${wholePart}.${fractionalStr}`;
  const parts = formatted.split('.');
  let decimals = parts[1];

  // Remove trailing zeros but keep at least 2 decimals
  while (decimals.length > 2 && decimals.endsWith('0')) {
    decimals = decimals.slice(0, -1);
  }

  formatted = `${parts[0]}.${decimals}`;

  return includeSymbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format token with thousands separators
 */
export function formatTokenWithCommas(
  amount: bigint | undefined,
  symbol: TokenSymbol,
  includeSymbol: boolean = true
): string {
  const formatted = formatToken(amount, symbol, false);
  const parts = formatted.split('.');
  const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const result = parts[1] ? `${wholePart}.${parts[1]}` : wholePart;

  return includeSymbol ? `${result} ${symbol}` : result;
}

/**
 * Format token with icon
 */
export function formatTokenWithIcon(
  amount: bigint | undefined,
  symbol: TokenSymbol
): string {
  const token = SUPPORTED_TOKENS[symbol];
  const formatted = formatTokenWithCommas(amount, symbol, false);
  return `${token.icon} ${formatted} ${symbol}`;
}

/**
 * Validate token amount input
 * @param amount - Amount to validate
 * @param symbol - Token symbol
 * @returns true if valid
 */
export function isValidTokenAmount(amount: string, symbol: TokenSymbol): boolean {
  const token = SUPPORTED_TOKENS[symbol];

  // Check if it's a valid number
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount < 0) {
    return false;
  }

  // Check decimal places
  const parts = amount.split('.');
  if (parts.length > 1 && parts[1].length > token.decimals) {
    return false;
  }

  return true;
}

/**
 * Clean user input for token amounts
 */
export function cleanTokenInput(input: string): string {
  // Remove any non-numeric characters except decimal point
  let cleaned = input.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned;
}

/**
 * Get minimum token amount (0.01 for 6 decimals, 0.000001 for 18 decimals, etc.)
 */
export function getMinTokenAmount(symbol: TokenSymbol): bigint {
  const token = SUPPORTED_TOKENS[symbol];
  // Minimum is 1 in the smallest unit
  return BigInt(1);
}

/**
 * Get maximum reasonable token amount (to prevent overflow)
 */
export function getMaxTokenAmount(symbol: TokenSymbol): bigint {
  // Set max to 1 trillion tokens
  return parseToken('1000000000000', symbol);
}

/**
 * Compare two token amounts
 */
export function compareTokenAmounts(a: bigint, b: bigint): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Add two token amounts
 */
export function addTokenAmounts(a: bigint, b: bigint): bigint {
  return a + b;
}

/**
 * Subtract two token amounts
 */
export function subtractTokenAmounts(a: bigint, b: bigint): bigint {
  return a - b;
}

/**
 * Check if amount is zero
 */
export function isZeroAmount(amount: bigint): boolean {
  return amount === BigInt(0);
}

/**
 * Get token icon
 */
export function getTokenIcon(symbol: TokenSymbol): string {
  return SUPPORTED_TOKENS[symbol].icon;
}

/**
 * Get token color for UI
 */
export function getTokenColor(symbol: TokenSymbol): string {
  return SUPPORTED_TOKENS[symbol].color;
}

/**
 * Get token name
 */
export function getTokenName(symbol: TokenSymbol): string {
  return SUPPORTED_TOKENS[symbol].name;
}

// Re-export for convenience
export { getTokenConfig, SUPPORTED_TOKENS, type TokenSymbol };
