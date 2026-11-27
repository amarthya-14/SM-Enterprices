// Data and helpers for the printed quotations (see pdf.jsx for the layout).

export const BUSINESS = {
    name: "SM Enterprises",
    tagline: "Home Cinema & Acoustics",
    address: "D No 6/544, Jeenigala Street, Opp. Ramana Reddy Lorry Transport, Stonehouse Pet, Nellore 524002, SPSR Nellore Dist.",
    phones: "98484 30077  ·  99080 24119",
};

export const TERMS = [
    "50% advance at the time of confirmation.",
    "This quotation is valid for 15 days from the date above.",
    "Prices are subject to change based on availability.",
];

const money = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plainNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
/** Money on the printed quotation always has paise, so the columns line up: 299900 -> "2,99,900.00" */
export function rupees(n) {
    return money.format(Number(n) || 0);
}
/** Quantities such as area: 420 -> "420", 1250.5 -> "1,250.5" */
export function plain(n) {
    return plainNumber.format(Number(n) || 0);
}

// ---------- amount in words, Indian system (lakh, crore) ----------
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const twoDigits = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : ""));
const threeDigits = (n) => {
    const h = Math.floor(n / 100), r = n % 100;
    return [h ? ONES[h] + " Hundred" : "", r ? twoDigits(r) : ""].filter(Boolean).join(" ");
};
function indianWords(n) {
    if (n === 0) return "Zero";
    const parts = [];
    const crore = Math.floor(n / 1e7); n %= 1e7;
    const lakh = Math.floor(n / 1e5); n %= 1e5;
    const thousand = Math.floor(n / 1000); n %= 1000;
    if (crore) parts.push(indianWords(crore) + " Crore");
    if (lakh) parts.push(twoDigits(lakh) + " Lakh");
    if (thousand) parts.push(twoDigits(thousand) + " Thousand");
    if (n) parts.push(threeDigits(n));
    return parts.join(" ");
}
/** 512713.6 -> "Rupees Five Lakh Twelve Thousand Seven Hundred Thirteen and Sixty Paise Only" */
export function amountInWords(amount) {
    const paiseTotal = Math.round(Math.max(0, Number(amount) || 0) * 100);
    const r = Math.floor(paiseTotal / 100), p = paiseTotal % 100;
    return `Rupees ${indianWords(r)}${p ? " and " + twoDigits(p) + " Paise" : ""} Only`;
}

// ---------- reference, dates ----------
const longDate = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
export function quoteMeta() {
    return { date: longDate(new Date()) };
}

export const ACOUSTIC_MATERIALS = [
    "19 mm plywood (Oswin, green ply, Sharon etc., as per customer requirement)",
    "12 mm plywood",
    "8 mm plywood",
    "8 mm HDHMR boards",
    "2×1 aluminium channels",
    "1000 GSM Recron",
    "18 mm wood wool sheets",
    "Grippers",
    "Foam, cloth, Moshi cloth, Sunmica",
    "14 mm flooring carpet with 1800 GSM pile weight",
];

// One line per treatment on the acoustics quotation, drawn from the materials list above.
export const ACOUSTIC_SPECS = {
    wall: "Fabric-finished acoustic wall panels on 2×1 aluminium channels, with 1000 GSM Recron and 18 mm wood wool sheets",
    ceiling: "Acoustic ceiling built on 19 mm plywood and 8 mm HDHMR boards, with cloth and Moshi cloth finish",
    flooring: "14 mm flooring carpet with 1800 GSM pile weight",
};

export const PDF_OPTIONS = {
    margin: [12, 10, 14, 10],
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".avoid-break"] },
};

/**
 * Renders `element` to an A4 PDF and saves it, stamping a small footer on every page:
 * "SM Enterprises · Home Cinema & Acoustics · 27 November 2026" on the left and "Page 1 of 2" on the right.
 */
export async function savePdf(html2pdf, element, filename, meta) {
    const worker = html2pdf().set({ ...PDF_OPTIONS, filename }).from(element).toPdf();
    await worker.get("pdf").then((pdf) => {
        const pages = pdf.internal.getNumberOfPages();
        const w = pdf.internal.pageSize.getWidth();
        const h = pdf.internal.pageSize.getHeight();
        for (let i = 1; i <= pages; i++) {
            pdf.setPage(i);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(110, 104, 92);
            pdf.setDrawColor(201, 169, 90);
            pdf.setLineWidth(0.2);
            pdf.line(10, h - 9.5, w - 10, h - 9.5);
            pdf.text(`SM Enterprises  ·  Home Cinema & Acoustics  ·  ${meta.date}`, 10, h - 5.5);
            pdf.text(`Page ${i} of ${pages}`, w - 10, h - 5.5, { align: "right" });
        }
    });
    await worker.save();
}
