// Token balance display component
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SUPPORTED_TOKENS, TOKEN_SYMBOLS, TokenSymbol } from '@/lib/token-config';
import { formatTokenWithCommas } from '@/lib/token-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TokenBalanceCardProps {
  balances: {
    [K in TokenSymbol]?: bigint;
  };
  isLoading?: boolean;
  title?: string;
  description?: string;
  showZeroBalances?: boolean;
}

export function TokenBalanceCard({
  balances,
  isLoading = false,
  title = 'Token Balances',
  description = 'Your available token balances',
  showZeroBalances = true
}: TokenBalanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : (
          <>
            {TOKEN_SYMBOLS.map((symbol) => {
              const token = SUPPORTED_TOKENS[symbol];
              const balance = balances[symbol];

              // Skip zero balances if showZeroBalances is false
              if (!showZeroBalances && (!balance || balance === BigInt(0))) {
                return null;
              }

              return (
                <div
                  key={symbol}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">
                      {formatTokenWithCommas(balance, symbol, false)}
                    </div>
                    <div className="text-xs text-muted-foreground">{symbol}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for inline display
export function TokenBalanceCompact({
  balance,
  symbol,
  isLoading = false,
}: {
  balance?: bigint;
  symbol: TokenSymbol;
  isLoading?: boolean;
  showIcon?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-6 w-32" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono font-medium">
        {formatTokenWithCommas(balance, symbol, true)}
      </span>
    </div>
  );
}

// Single token balance display
export function SingleTokenBalance({
  balance,
  symbol,
  isLoading = false,
  label,
}: {
  balance?: bigint;
  symbol: TokenSymbol;
  isLoading?: boolean;
  label?: string;
}) {
  const token = SUPPORTED_TOKENS[symbol];

  return (
    <div className="space-y-1">
      {label && <div className="text-sm text-muted-foreground">{label}</div>}
      {isLoading ? (
        <Skeleton className="h-8 w-40" />
      ) : (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-mono text-xl font-semibold">
              {formatTokenWithCommas(balance, symbol, false)}
            </div>
            <div className="text-xs text-muted-foreground">{token.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}
