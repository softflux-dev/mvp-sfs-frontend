// src/utils/formatCurrency.js — 
import { useCurrencyStore } from "../zustand/useCurrencyStore";

const build = (currency, amount, options = {}) => {
  const { showSymbol = true, decimals } = options;
  const value  = Number(amount) || 0;
  const digits = decimals ?? currency.decimals ?? 2;

  try {
    return new Intl.NumberFormat(currency.locale || "en-US", {
      style: showSymbol ? "currency" : "decimal",
      currency: currency.code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${showSymbol ? currency.symbol : ""}${value.toFixed(digits)}`;
  }
};

// Non-reactive — for utils, table column defs, PDF/export builders, etc.
export const formatCurrency = (amount, options) =>
  build(useCurrencyStore.getState().currency, amount, options);

export const getCurrencySymbol = () => useCurrencyStore.getState().currency.symbol;

// Reactive — use inside components so they re-render when currency changes
export const useFormatCurrency = () => {
  const currency = useCurrencyStore((s) => s.currency);
  return {
    currency,
    symbol: currency.symbol,
    format: (amount, options) => build(currency, amount, options),
  };
};

export const formatCurrencyForPdf = (amount, options = {}) => {
  const currency = useCurrencyStore.getState().currency;
  const digits   = options.decimals ?? currency.decimals ?? 2;
  const value    = Number(amount) || 0;

  const num = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

  return `${currency.code} ${num}`;
};