const whole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const paise = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 299900 -> "₹2,99,900", 512713.6 -> "₹5,12,713.60" (Indian grouping). */
export function inr(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "₹0";
    return "₹" + (Number.isInteger(Math.round(n * 100) / 100) ? whole : paise).format(n);
}

export function titleCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
