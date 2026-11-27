// The printed quotations (home theatre and acoustics), rendered off-screen and turned into an A4 PDF.
//
// Premium stationery, not a bill: a classic centred letterhead (round SM logo, SM ENTERPRISES in Cinzel,
// a gold double rule), a details strip, equipment grouped by category, and the final amount in a gold
// double frame. Ink on white with gold hairlines; the only black is the logo.
//
// Made for colour photocopies: gold is a mid-deep #a8842c used for rules and bold labels, all reading
// text is near-black, and the pale cream tints are decoration only (nothing is lost if a copier drops them).
// Page numbers are stamped on each page by savePdf() in pdfData.js.
// Inline styles throughout: html2canvas renders them reliably, and the app's own CSS can't leak in.
import logo from "./assets/sm-logo-round.png";
import { BUSINESS, TERMS, ACOUSTIC_MATERIALS, ACOUSTIC_SPECS, rupees, plain, amountInWords } from "./pdfData";

const INK = "#141414";
const BODY = "#333333";
const SOFT = "#5c5852";
const GOLD = "#a8842c";
const GOLD_LINE = "#c9a95a";
const HAIR = "#e3dccd";
const CREAM = "#fbf7ee";
const SANS = "'Poppins', 'Helvetica Neue', Arial, sans-serif";
const ROMAN = "'Cinzel', 'Trajan Pro', Georgia, serif";

const page = {
    width: "100%", // html2pdf lays the page out at the A4 printable width (190 mm)
    boxSizing: "border-box",
    padding: "4px 6px 0",
    background: "#ffffff",
    color: INK,
    fontFamily: SANS,
    fontSize: "13.5px",
    lineHeight: 1.5,
};
const smallCaps = { fontSize: "9.5px", fontWeight: 600, letterSpacing: "2.2px", textTransform: "uppercase", color: GOLD };

// A gold double rule, as on engraved stationery.
function DoubleRule({ gap = 3, margin = "0" }) {
    return (
        <div style={{ margin }}>
            <div style={{ height: "2px", background: GOLD_LINE }} />
            <div style={{ height: `${gap}px` }} />
            <div style={{ height: "1px", background: GOLD_LINE }} />
        </div>
    );
}

function Ornament() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "7px" }}>
            <div style={{ width: "46px", height: "1px", background: GOLD_LINE }} />
            <div style={{ width: "6px", height: "6px", background: GOLD, transform: "rotate(45deg)" }} />
            <div style={{ width: "46px", height: "1px", background: GOLD_LINE }} />
        </div>
    );
}

// ---------- letterhead, details, title ----------

function Letterhead() {
    return (
        <div style={{ textAlign: "center" }}>
            <img src={logo} alt="" style={{ width: "60px", height: "60px", display: "block", margin: "0 auto" }} />
            <div style={{ fontFamily: ROMAN, fontSize: "30px", fontWeight: 700, letterSpacing: "5px", color: INK, marginTop: "8px", lineHeight: 1.1 }}>
                SM ENTERPRISES
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "6px" }}>
                <div style={{ width: "36px", height: "1px", background: GOLD_LINE }} />
                <div style={{ ...smallCaps, fontSize: "10.5px", letterSpacing: "3.5px" }}>Home Cinema · Acoustics</div>
                <div style={{ width: "36px", height: "1px", background: GOLD_LINE }} />
            </div>
            <div style={{ fontSize: "11px", color: SOFT, marginTop: "8px", lineHeight: 1.55 }}>
                {BUSINESS.address}
                <br />
                <span style={{ color: INK, fontWeight: 600 }}>+91 98484 30077</span>
                <span style={{ color: GOLD, padding: "0 8px" }}>|</span>
                <span style={{ color: INK, fontWeight: 600 }}>+91 99080 24119</span>
            </div>
            <DoubleRule margin="12px 0 0" />
        </div>
    );
}

function Details({ meta, customerName }) {
    const cells = [];
    if (customerName) cells.push({ label: "Prepared For", value: customerName, wide: true });
    cells.push({ label: "Date", value: meta.date, alignRight: !!customerName });
    return (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <tbody>
                <tr>
                    {cells.map((c) => (
                        <td key={c.label} style={{
                            padding: "6px 12px", verticalAlign: "top", textAlign: c.alignRight ? "right" : "left",
                        }}>
                            <div style={smallCaps}>{c.label}</div>
                            <div style={{ fontSize: c.wide ? "14.5px" : "12.5px", fontWeight: 700, color: INK, marginTop: "2px", lineHeight: 1.3 }}>{c.value}</div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );
}

function Title({ children }) {
    return (
        <div style={{ textAlign: "center", margin: "18px 0 14px" }}>
            <div style={{ fontFamily: ROMAN, fontSize: "21px", fontWeight: 700, letterSpacing: "1.5px", color: INK, lineHeight: 1.25 }}>{children}</div>
            <Ornament />
        </div>
    );
}

// ---------- tables ----------

const th = {
    padding: "8px 8px",
    textAlign: "left",
    fontSize: "9.5px",
    fontWeight: 700,
    letterSpacing: "1.6px",
    textTransform: "uppercase",
    color: GOLD,
    borderTop: `1px solid ${GOLD_LINE}`,
    borderBottom: `1.5px solid ${GOLD_LINE}`,
    whiteSpace: "nowrap",
};
const td = {
    padding: "10px 8px",
    borderBottom: `1px solid ${HAIR}`,
    color: INK,
    fontWeight: 600,
    fontSize: "13px",
    verticalAlign: "top",
};
const right = { textAlign: "right", whiteSpace: "nowrap" };
const center = { textAlign: "center" };
const serial = (n) => String(n).padStart(2, "0");

function Description({ text }) {
    const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((line, i) => <div key={i} style={{ margin: "1px 0" }}>{line}</div>);
}

// Equipment is shown in this order, grouped, like a system rather than a list.
const GROUPS = [
    ["AV Receiver", "AV Receiver"],
    ["Power Amplifier", "Amplification"],
    ["Speakers", "Speakers"],
    ["In-Wall Speakers", "In-Wall & Ceiling Speakers"],
    ["SubWoofer", "Subwoofers"],
    ["Projectors", "Projector"],
    ["Screen", "Screen"],
];
function groupItems(items) {
    const known = new Map(GROUPS);
    const buckets = new Map();
    items.forEach((it) => {
        const cat = it.product?.category;
        const key = known.has(cat) ? cat : "__other";
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(it);
    });
    const order = [...GROUPS.map(([k]) => k), "__other"];
    const anyCategory = items.some((it) => it.product?.category);
    return order.filter((k) => buckets.has(k)).map((k) => ({
        title: anyCategory ? (known.get(k) || "Other Equipment") : null,
        items: buckets.get(k),
    }));
}

function GroupRow({ title, cols }) {
    return (
        <tr>
            <td colSpan={cols} style={{ padding: "9px 8px 5px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={{ fontFamily: ROMAN, fontSize: "11.5px", fontWeight: 700, letterSpacing: "2px", color: GOLD }}>{title.toUpperCase()}</span>
            </td>
        </tr>
    );
}

function ItemRow({ n, item }) {
    return (
        <tr>
            <td style={{ ...td, color: GOLD, fontWeight: 700 }}>{serial(n)}</td>
            <td style={{ ...td, fontWeight: 700 }}>{(item.name || "").trim()}</td>
            <td style={{ ...td, fontSize: "11.5px", fontWeight: 500, color: BODY, lineHeight: 1.45 }}>
                <Description text={item.description} />
            </td>
            <td style={{ ...td, ...right }}>{plain(Math.round(item.price))}</td>
            <td style={{ ...td, ...center }}>{item.quantity}</td>
            <td style={{ ...td, ...right, fontWeight: 700 }}>{plain(Math.round(item.totalPrice))}</td>
        </tr>
    );
}

const COLS = (
    <colgroup>
        <col style={{ width: "6%" }} />
        <col style={{ width: "24%" }} />
        <col />
        <col style={{ width: "13%" }} />
        <col style={{ width: "6%" }} />
        <col style={{ width: "14%" }} />
    </colgroup>
);

const ACOUSTIC_COLS = (
    <colgroup>
        <col style={{ width: "6%" }} />
        <col style={{ width: "20%" }} />
        <col />
        <col style={{ width: "11%" }} />
        <col style={{ width: "11%" }} />
        <col style={{ width: "15%" }} />
    </colgroup>
);

// html2pdf cuts the page wherever it falls, and it cannot move a single <tr> of a big table
// to the next page. So every row is its own little table inside an "avoid-break" block,
// which html2pdf pushes whole onto the next page instead of slicing through it.
function Block({ cols = COLS, children }) {
    return (
        <div className="avoid-break">
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                {cols}
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

// A group heading always travels with its first item, so a heading is never left alone at the bottom of a page.
function ItemGroups({ groups, start = 0 }) {
    let n = start;
    return groups.map((g, gi) => g.items.map((item, i) => (
        <Block key={item.key ?? `${gi}-${i}`}>
            {i === 0 && g.title ? <GroupRow title={g.title} cols={6} /> : null}
            <ItemRow n={++n} item={item} />
        </Block>
    )));
}

function HeadRow() {
    return (
        <tr>
            <th style={th}>No</th>
            <th style={th}>Item</th>
            <th style={th}>Specifications</th>
            <th style={{ ...th, ...right }}>Price (₹)</th>
            <th style={{ ...th, ...center }}>Qty</th>
            <th style={{ ...th, ...right }}>Amount (₹)</th>
        </tr>
    );
}

// ---------- totals, final amount, closing ----------

function Totals({ rows }) {
    return (
        <div className="avoid-break" style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <table style={{ borderCollapse: "collapse", width: "48%", fontSize: "13px" }}>
                <tbody>
                    {rows.map(({ label, value, strong }) => (
                        <tr key={label}>
                            <td style={{ padding: "6px 8px", color: strong ? INK : BODY, fontWeight: strong ? 700 : 500, borderTop: strong ? `1.5px solid ${GOLD_LINE}` : "none", borderBottom: strong ? "none" : `1px solid ${HAIR}` }}>{label}</td>
                            <td style={{ padding: "6px 8px", ...right, color: INK, fontWeight: 700, borderTop: strong ? `1.5px solid ${GOLD_LINE}` : "none", borderBottom: strong ? "none" : `1px solid ${HAIR}` }}>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FinalAmount({ amount }) {
    return (
        <div className="avoid-break" style={{ marginTop: "16px", border: `3px double ${GOLD}`, background: CREAM, padding: "12px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <div>
                    <div style={{ fontFamily: ROMAN, fontSize: "15px", fontWeight: 700, letterSpacing: "3px", color: INK }}>FINAL AMOUNT</div>
                    <div style={{ fontSize: "10px", color: SOFT, marginTop: "1px" }}>Inclusive of the items and additions listed above</div>
                </div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: INK, whiteSpace: "nowrap", letterSpacing: "-0.2px" }}>
                    <span style={{ color: GOLD }}>₹</span> {rupees(amount)}
                </div>
            </div>
            <div style={{ marginTop: "8px", paddingTop: "7px", borderTop: `1px solid ${HAIR}`, fontSize: "11.5px", fontStyle: "italic", fontWeight: 500, color: BODY }}>
                {amountInWords(amount)}
            </div>
        </div>
    );
}

function Closing({ children }) {
    return (
        <div className="avoid-break" style={{ marginTop: "18px" }}>
            {children}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "30px" }}>
                <div style={{ fontSize: "11px", color: BODY, fontWeight: 500, lineHeight: 1.6 }}>
                    <div style={{ ...smallCaps, marginBottom: "4px" }}>Terms &amp; Conditions</div>
                    {TERMS.map((t, i) => <div key={i}>{i + 1}.&nbsp; {t}</div>)}
                </div>
                <div style={{ textAlign: "center", minWidth: "200px" }}>
                    <div style={{ fontFamily: ROMAN, fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", color: INK }}>For SM ENTERPRISES</div>
                    <div style={{ height: "46px" }} />
                    <div style={{ borderTop: `1px solid ${GOLD_LINE}`, paddingTop: "4px", fontSize: "11px", color: SOFT }}>Authorised Signatory</div>
                </div>
            </div>
            <DoubleRule margin="16px 0 0" gap={2} />
            <div style={{ textAlign: "center", marginTop: "9px", fontSize: "12.5px", fontStyle: "italic", fontWeight: 500, color: INK }}>
                Thank you for your business! We look forward to serving you again.
            </div>
        </div>
    );
}

// ---------- home theatre quotation ----------

export function QuotationPDF({
    componentRef, meta, baseCartItems, postDiscountItems, productsSubtotal, discount, discountAmount,
    subtotalAfterDiscount, finalTotal, quotationTitle, customerName,
}) {
    const groups = groupItems(baseCartItems);
    const itemCount = baseCartItems.length;
    const totals = [{ label: "Equipment subtotal", value: `₹ ${rupees(productsSubtotal)}` }];
    if (discount !== 0) {
        totals.push({ label: `Discount (${discount}%)`, value: `− ₹ ${rupees(discountAmount)}` });
        totals.push({ label: "Subtotal after discount", value: `₹ ${rupees(subtotalAfterDiscount)}`, strong: true });
    }

    return (
        <div ref={componentRef} style={page}>
            <Letterhead />
            <Details meta={meta} customerName={customerName} />
            <Title>{quotationTitle}</Title>

            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                {COLS}
                <thead><HeadRow /></thead>
            </table>
            <ItemGroups groups={groups} />

            <Totals rows={totals} />

            {postDiscountItems.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                    <ItemGroups groups={[{ title: "Additional Items", items: postDiscountItems }]} start={itemCount} />
                </div>
            )}

            <FinalAmount amount={finalTotal} />
            <Closing />
        </div>
    );
}

// ---------- acoustics quotation ----------

export function AcousticsPDF({ componentRef, meta, rows, total, customerName }) {
    const half = Math.ceil(ACOUSTIC_MATERIALS.length / 2);
    return (
        <div ref={componentRef} style={page}>
            <Letterhead />
            <Details meta={meta} customerName={customerName} />
            <Title>Acoustics Quotation</Title>

            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                {ACOUSTIC_COLS}
                <thead>
                    <tr>
                        <th style={th}>No</th>
                        <th style={th}>Treatment</th>
                        <th style={th}>Specifications</th>
                        <th style={{ ...th, ...right }}>Area (SFT)</th>
                        <th style={{ ...th, ...right }}>Rate (₹)</th>
                        <th style={{ ...th, ...right }}>Amount (₹)</th>
                    </tr>
                </thead>
            </table>
            {rows.map((r, i) => (
                <Block key={r.type} cols={ACOUSTIC_COLS}>
                    <tr>
                        <td style={{ ...td, color: GOLD, fontWeight: 700 }}>{serial(i + 1)}</td>
                        <td style={{ ...td, fontWeight: 700 }}>{r.label}</td>
                        <td style={{ ...td, fontSize: "11.5px", fontWeight: 500, color: BODY, lineHeight: 1.45 }}>{ACOUSTIC_SPECS[r.type]}</td>
                        <td style={{ ...td, ...right }}>{plain(r.sft)}</td>
                        <td style={{ ...td, ...right }}>{plain(r.rate)}</td>
                        <td style={{ ...td, ...right, fontWeight: 700 }}>{rupees(r.amount)}</td>
                    </tr>
                </Block>
            ))}

            <FinalAmount amount={total} />

            <Closing>
                <div style={{ marginBottom: "18px", padding: "12px 16px", borderTop: `1px solid ${GOLD_LINE}`, borderBottom: `1px solid ${GOLD_LINE}`, fontSize: "11.5px", color: BODY, fontWeight: 500 }}>
                    <div style={{ fontFamily: ROMAN, fontSize: "11.5px", fontWeight: 700, letterSpacing: "2px", color: GOLD, marginBottom: "7px" }}>MATERIALS USED</div>
                    <div style={{ display: "flex", gap: "24px" }}>
                        {[ACOUSTIC_MATERIALS.slice(0, half), ACOUSTIC_MATERIALS.slice(half)].map((col, c) => (
                            <div key={c} style={{ flex: 1 }}>
                                {col.map((m) => (
                                    <div key={m} style={{ marginBottom: "3px", display: "flex", gap: "8px" }}>
                                        <span style={{ display: "inline-block", width: "5px", height: "5px", background: GOLD, transform: "rotate(45deg)", marginTop: "6px", flex: "none" }} />
                                        <span>{m}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: "9px", fontWeight: 700, color: INK }}>Note: Electrical work is not included.</div>
                    <div style={{ marginTop: "2px", fontStyle: "italic", color: SOFT }}>
                        The above materials ensure maximum acoustic performance and a premium finish.
                    </div>
                </div>
            </Closing>
        </div>
    );
}
