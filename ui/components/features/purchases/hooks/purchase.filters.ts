// src/modules/purchases/ui/hooks/purchase.filters.ts
export type PurchaseStatusFilter = "ALL" | "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
export type PurchaseStatus =
    | "DRAFT"
    | "ORDERED"
    | "RECEIVED"
    | "CANCELLED";


export type DatePreset = "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" | "RANGE";

export type PurchaseFilters = {
    search: string;
    status: PurchaseStatusFilter;
    datePreset: DatePreset;
    from: string | null; // YYYY-MM-DD (solo RANGE)
    to: string | null;   // YYYY-MM-DD (solo RANGE)
};

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

export function toYmd(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** from/to inclusive (YYYY-MM-DD) */
export function computeDateRange(
    preset: Exclude<DatePreset, "RANGE">,
    now = new Date(),
): { from: string; to: string } {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to = toYmd(today);

    if (preset === "TODAY") return { from: to, to };

    if (preset === "LAST_7_DAYS") {
        const fromD = new Date(today);
        fromD.setDate(fromD.getDate() - 6);
        return { from: toYmd(fromD), to };
    }

    if (preset === "LAST_30_DAYS") {
        const fromD = new Date(today);
        fromD.setDate(fromD.getDate() - 29);
        return { from: toYmd(fromD), to };
    }

    // THIS_MONTH
    const fromD = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toYmd(fromD), to };
}

export const DEFAULT_PURCHASE_FILTERS: PurchaseFilters = {
    search: "",
    status: "ALL",
    datePreset: "LAST_30_DAYS",
    from: null,
    to: null,
};
