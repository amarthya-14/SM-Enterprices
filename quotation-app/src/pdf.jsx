// The printed quotations (home theatre and acoustics), rendered off-screen and turned into an A4 PDF.
//
// Made for colour photocopies: they go to customers as colour xerox copies, so
//  - all text is dark (nothing lighter than #555) and at least 9.5 px,
//  - the accent is a deep antique gold (#8a6a1f) that still reads as gold on a copier, instead of
//    the light #d4b85e that washes out,
//  - no gradients, shadows or large tinted areas; thin rules and one light tint for the table header.
// Inline styles throughout: html2canvas renders them reliably, and the app's own CSS can't leak in.
import logo from "./assets/sm-logo-pdf.png";
import { BUSINESS, TERMS, ACOUSTIC_MATERIALS, rupees, plain, amountInWords } from "./pdfData";

const INK = "#1b1814";
const MUTED = "#4f4942";
const GOLD = "#8a6a1f";
const RULE = "#cbbd9c";
const TINT = "#f3ecdc";
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const LINING = { fontVariantNumeric: "lining-nums" }; // clear, full-height figures in the serif
const SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";

// ---------- building blocks ----------
const page = {
    width: "100%", // html2pdf lays the page out at the A4 printable width (190 mm)
    boxSizing: "border-box",
    padding: "6px 8px",
    background: "#ffffff",
    color: INK,
    fontFamily: SANS,
    fontSize: "12px",
    lineHeight: 1.5,
};

function Letterhead({ docTitle, meta }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "12px", borderBottom: `2px solid ${GOLD}` }}>
            <img src={logo} alt="" style={{ width: "68px", height: "68px", flex: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: "30px", fontWeight: 600, lineHeight: 1.05, color: INK }}>{BUSINESS.name}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "2.4px", textTransform: "uppercase", color: GOLD, marginTop: "4px" }}>
                    {BUSINESS.tagline}
                </div>
                <div style={{ fontSize: "10px", color: MUTED, marginTop: "6px", lineHeight: 1.45, maxWidth: "380px" }}>
                    {BUSINESS.address}
                    <br />Phone: {BUSINESS.phones}
                </div>
            </div>
            <div style={{ textAlign: "right", flex: "none" }}>
                <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: GOLD }}>{docTitle}</div>
                <table style={{ marginTop: "8px", marginLeft: "auto", borderCollapse: "collapse", fontSize: "10.5px" }}>
                    <tbody>
                        <MetaRow label="Ref" value={meta.ref} />
                        <MetaRow label="Date" value={meta.date} />
                        <MetaRow label="Valid until" value={meta.validUntil} />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MetaRow({ label, value }) {
    return (
        <tr>
            <td style={{ padding: "1px 10px 1px 0", color: MUTED, textAlign: "right" }}>{label}</td>
            <td style={{ padding: "1px 0", fontWeight: 600, color: INK, textAlign: "right", whiteSpace: "nowrap" }}>{value}</td>
        </tr>
    );
}

function PreparedFor({ customerName, title }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", margin: "14px 0 10px" }}>
            <div>
                {customerName ? (
                    <>
                        <div style={{ fontSize: "9.5px", fontWeight: 600, letterSpacing: "1.6px", textTransform: "uppercase", color: MUTED }}>Prepared for</div>
                        <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "2px" }}>{customerName}</div>
                    </>
                ) : null}
                <div style={{ fontFamily: SERIF, fontSize: "23px", fontWeight: 600, lineHeight: 1.15, marginTop: customerName ? "8px" : 0, ...LINING }}>{title}</div>
            </div>
        </div>
    );
}

const th = {
    padding: "8px 8px",
    background: TINT,
    color: INK,
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    borderTop: `1.5px solid ${GOLD}`,
    borderBottom: `1.5px solid ${GOLD}`,
    textAlign: "left",
};
const td = { padding: "7px 8px", borderBottom: `1px solid ${RULE}`, verticalAlign: "top", fontSize: "12px" };
const num = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

function ItemsTable({ columns, children }) {
    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    {columns.map((c) => (
                        <th key={c.label} style={{ ...th, ...(c.numeric ? num : null), width: c.width }}>{c.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    );
}

function Description({ text }) {
    const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return null;
    return (
        <div style={{ marginTop: "3px", fontSize: "10.5px", lineHeight: 1.45, color: MUTED }}>
            {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
    );
}

function TotalLine({ label, value, strong, accent }) {
    return (
        <tr>
            <td style={{ padding: "3px 14px 3px 0", color: strong ? INK : MUTED, fontWeight: strong ? 600 : 400, textAlign: "right" }}>{label}</td>
            <td style={{ padding: "3px 0", ...num, fontWeight: strong ? 600 : 500, color: accent ? GOLD : INK, minWidth: "120px" }}>{value}</td>
        </tr>
    );
}

function FinalAmount({ amount }) {
    return (
        <div className="avoid-break" style={{ marginTop: "12px", border: `1.5px solid ${GOLD}`, padding: "9px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: GOLD }}>Final amount</span>
                <span style={{ fontFamily: SANS, fontSize: "22px", fontWeight: 700, color: INK, letterSpacing: "-0.3px", ...num }}>₹ {rupees(amount)}</span>
            </div>
            <div style={{ marginTop: "4px", fontSize: "11px", color: MUTED, textAlign: "right" }}>{amountInWords(amount)}</div>
        </div>
    );
}

function Closing({ terms = TERMS, notes = null }) {
    return (
        <div className="avoid-break" style={{ marginTop: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "32px" }}>
            <div style={{ flex: 1, fontSize: "10.5px", color: MUTED }}>
                {notes}
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1.6px", textTransform: "uppercase", color: INK, marginBottom: "4px" }}>Terms &amp; conditions</div>
                {terms.map((t, i) => <div key={i} style={{ marginBottom: "2px" }}>{i + 1}. {t}</div>)}
            </div>
            <div style={{ textAlign: "center", fontSize: "11px", minWidth: "190px" }}>
                <div style={{ fontWeight: 600 }}>For {BUSINESS.name}</div>
                <div style={{ height: "40px" }} />
                <div style={{ borderTop: `1px solid ${MUTED}`, paddingTop: "4px", color: MUTED }}>Authorised signatory</div>
            </div>
        </div>
        <ThankYou />
        </div>
    );
}

function ThankYou() {
    return (
        <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: `1px solid ${RULE}`, textAlign: "center", fontSize: "11px", color: MUTED }}>
            Thank you for choosing {BUSINESS.name}. We look forward to building your cinema.
        </div>
    );
}

// ---------- home theatre quotation ----------
export function QuotationPDF({
    componentRef, meta, baseCartItems, postDiscountItems, productsSubtotal, discount, discountAmount,
    subtotalAfterDiscount, finalTotal, quotationTitle, customerName,
}) {
    const columns = [
        { label: "#", width: "28px" },
        { label: "Item" },
        { label: "Qty", width: "40px", numeric: true },
        { label: "Unit price (₹)", width: "104px", numeric: true },
        { label: "Amount (₹)", width: "104px", numeric: true },
    ];
    const row = (item) => (
        <tr key={item.key} style={{ pageBreakInside: "avoid" }}>
            <td style={{ ...td, color: MUTED }}>{item.sNo}</td>
            <td style={td}>
                <div style={{ fontWeight: 600, fontSize: "12.5px" }}>{(item.name || "").trim()}</div>
                <Description text={item.description} />
            </td>
            <td style={{ ...td, ...num }}>{item.quantity}</td>
            <td style={{ ...td, ...num }}>{rupees(item.price)}</td>
            <td style={{ ...td, ...num, fontWeight: 600 }}>{rupees(item.totalPrice)}</td>
        </tr>
    );

    return (
        <div ref={componentRef} style={page}>
            <Letterhead docTitle="Quotation" meta={meta} />
            <PreparedFor customerName={customerName} title={quotationTitle} />

            <ItemsTable columns={columns}>{baseCartItems.map(row)}</ItemsTable>

            <div className="avoid-break" style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                <table style={{ borderCollapse: "collapse", fontSize: "12px" }}>
                    <tbody>
                        <TotalLine label="Equipment subtotal" value={`₹ ${rupees(productsSubtotal)}`} />
                        {discount !== 0 && (
                            <>
                                <TotalLine label={`Discount (${discount}%)`} value={`− ₹ ${rupees(discountAmount)}`} accent />
                                <TotalLine label="Equipment after discount" value={`₹ ${rupees(subtotalAfterDiscount)}`} strong />
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            {postDiscountItems.length > 0 && (
                <div className="avoid-break" style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1.6px", textTransform: "uppercase", color: MUTED, marginBottom: "6px" }}>
                        Additional items
                    </div>
                    <ItemsTable columns={columns}>{postDiscountItems.map(row)}</ItemsTable>
                </div>
            )}

            <FinalAmount amount={finalTotal} />
            <Closing />
        </div>
    );
}

// ---------- acoustics quotation ----------
export function AcousticsPDF({ componentRef, meta, rows, total, customerName }) {
    const columns = [
        { label: "#", width: "28px" },
        { label: "Description" },
        { label: "Area (SFT)", width: "92px", numeric: true },
        { label: "Rate (₹/SFT)", width: "100px", numeric: true },
        { label: "Amount (₹)", width: "112px", numeric: true },
    ];
    const half = Math.ceil(ACOUSTIC_MATERIALS.length / 2);
    const materials = (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "1.6px", textTransform: "uppercase", color: INK, marginBottom: "4px" }}>Materials used</div>
            <div style={{ display: "flex", gap: "20px" }}>
                {[ACOUSTIC_MATERIALS.slice(0, half), ACOUSTIC_MATERIALS.slice(half)].map((col, c) => (
                    <div key={c} style={{ flex: 1 }}>
                        {col.map((m) => <div key={m} style={{ marginBottom: "2px" }}>•&nbsp; {m}</div>)}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: "8px", fontWeight: 600, color: INK }}>Note: Electrical work is not included.</div>
            <div style={{ marginTop: "2px", fontStyle: "italic" }}>These materials give the best acoustic performance and a premium finish.</div>
        </div>
    );

    return (
        <div ref={componentRef} style={page}>
            <Letterhead docTitle="Quotation" meta={meta} />
            <PreparedFor customerName={customerName} title="Acoustics Quotation" />
            <ItemsTable columns={columns}>
                {rows.map((r, i) => (
                    <tr key={r.type}>
                        <td style={{ ...td, color: MUTED }}>{i + 1}</td>
                        <td style={{ ...td, fontWeight: 600, fontSize: "12.5px" }}>{r.label}</td>
                        <td style={{ ...td, ...num }}>{plain(r.sft)}</td>
                        <td style={{ ...td, ...num }}>{rupees(r.rate)}</td>
                        <td style={{ ...td, ...num, fontWeight: 600 }}>{rupees(r.amount)}</td>
                    </tr>
                ))}
            </ItemsTable>
            <FinalAmount amount={total} />
            <Closing notes={materials} />
        </div>
    );
}
