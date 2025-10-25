// Token configuration for multi-token support
export const SUPPORTED_TOKENS = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base Mainnet
      84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'   // Base Sepolia
    },
    color: 'blue',
    description: 'US Dollar stablecoin by Circle'
  },
  EURC: {
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    addresses: {
      8453: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',  // Base Mainnet
      84532: '0x808456652fdb597867f38412077A9182bf77359F'   // Base Sepolia
    },
    color: 'green',
    description: 'Euro stablecoin by Circle'
  }
} as const;

export type TokenSymbol = keyof typeof SUPPORTED_TOKENS;

export const DEFAULT_TOKEN: TokenSymbol = 'USDC';

// Helper to get all token symbols as array
export const TOKEN_SYMBOLS = Object.keys(SUPPORTED_TOKENS) as TokenSymbol[];

// Helper to check if a string is a valid token symbol
export function isValidTokenSymbol(symbol: string): symbol is TokenSymbol {
  return symbol in SUPPORTED_TOKENS;
}

// Helper to get token config with chain-specific address
export function getTokenConfig(symbol: TokenSymbol, chainId: number) {
  const token = SUPPORTED_TOKENS[symbol];
  const address = token.addresses[chainId as keyof typeof token.addresses];

  return {
    ...token,
    address: address || token.addresses[8453] // Fallback to mainnet
  };
}
