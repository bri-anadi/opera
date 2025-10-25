// Token selector component for multi-token support
'use client'

import { SUPPORTED_TOKENS, TokenSymbol, TOKEN_SYMBOLS } from '@/lib/token-config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TokenSelectorProps {
  value: TokenSymbol;
  onValueChange: (value: TokenSymbol) => void;
  disabled?: boolean;
  label?: string;
  showIcon?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function TokenSelector({
  value,
  onValueChange,
  disabled = false,
  label,
  showDescription = false,
  className = ''
}: TokenSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="font-medium">{value}</span>
              <span className="text-muted-foreground">- {SUPPORTED_TOKENS[value].name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TOKEN_SYMBOLS.map((symbol) => {
            const token = SUPPORTED_TOKENS[symbol];
            return (
              <SelectItem key={symbol} value={symbol}>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{symbol}</span>
                      <span className="text-muted-foreground text-sm">- {token.name}</span>
                    </div>
                    {showDescription && (
                      <span className="text-xs text-muted-foreground">{token.description}</span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// Compact version for inline use
export function TokenSelectorCompact({
  value,
  onValueChange,
  disabled = false,
}: {
  value: TokenSymbol;
  onValueChange: (value: TokenSymbol) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{value}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TOKEN_SYMBOLS.map((symbol) => {
          return (
            <SelectItem key={symbol} value={symbol}>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{symbol}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
