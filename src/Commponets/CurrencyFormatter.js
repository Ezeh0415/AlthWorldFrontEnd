// utils/currencyFormatter.js
export const formatCurrency = (amount, showBalance = true) => {
  if (!showBalance) {
    return "$••••••";
  }

  const amountInDollars = amount / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInDollars);
};

export const formatCompactCurrency = (amount) => {
  const amountInDollars = amount / 100;

  if (amountInDollars >= 1000000) {
    return `$${(amountInDollars / 1000000).toFixed(1)}M`;
  }
  if (amountInDollars >= 1000) {
    return `$${(amountInDollars / 1000).toFixed(1)}K`;
  }
  return `$${amountInDollars.toFixed(0)}`;
};

export const getCurrencySymbol = () => "$";
