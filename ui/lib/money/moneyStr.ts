// src/lib/money/moneyStr.ts
export type MoneyStr = string;

/** parse "123" -> 123n (safe) */
export function bi(v: MoneyStr | null | undefined): bigint {
  const s = String(v ?? "0").trim();
  if (!/^-?\d+$/.test(s)) return 0n;
  return BigInt(s);
}

export function addMoney(a: MoneyStr | null | undefined, b: MoneyStr | null | undefined): MoneyStr {
  return (bi(a) + bi(b)).toString();
}

export function sumMoney(values: Array<MoneyStr | null | undefined>): MoneyStr {
  let acc = 0n;
  for (const v of values) acc += bi(v);
  return acc.toString();
}

/** Render CUP assuming minor=cents (100) */
export function moneyStrToLabelCUP(minorStr: MoneyStr | null | undefined): string {
  const v = bi(minorStr);
  const neg = v < 0n;
  const x = neg ? -v : v;

  const major = (x / 100n).toString();
  const cents = (x % 100n).toString().padStart(2, "0");
  return `${neg ? "-" : ""}${major}.${cents} CUP`;
}

