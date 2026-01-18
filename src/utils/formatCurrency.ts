export const formatDollar = (value: number) => {
    const abs = Math.abs(value);
  
    const formatted = abs.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  
    return value < 0 ? `-$${formatted}` : `$${formatted}`;
  };
  