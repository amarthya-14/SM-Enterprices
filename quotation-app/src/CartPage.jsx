import { useContext, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import Stepper from "./Stepper";
import { inr } from "./format";
import { QuotationPDF } from "./pdf";
import { quoteMeta, PDF_OPTIONS } from "./pdfData";
import "./quotation.css";

export default function CartPage() {
    const { cart = {}, allProducts = {}, incrementItem, decrementItem } = useContext(CartContext) || {};
    const navigate = useNavigate();
    const componentRef = useRef();

    const [discountInput, setDiscountInput] = useState("0");
    const [quotationTitle, setQuotationTitle] = useState("Quotation for Home Theatre 7.1.4");
    const [customerName, setCustomerName] = useState("");
    const [includeKordz, setIncludeKordz] = useState(false);
    const [kordzPrice, setKordzPrice] = useState("");
    const [includePowerAmp, setIncludePowerAmp] = useState(false);
    const [powerAmpPrice, setPowerAmpPrice] = useState("");
    const [includeMediaPlayer, setIncludeMediaPlayer] = useState(false);
    const [mediaPlayerPrice, setMediaPlayerPrice] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [meta, setMeta] = useState(() => quoteMeta());

    const parsedDiscount = parseFloat(discountInput);
    const discount = isNaN(parsedDiscount) ? 0 : parsedDiscount;

    // Base catalog products table
    let baseCartItems = Object.entries(cart).map(([key, quantity], index) => {
        const product = allProducts[key];
        if (!product) return null;
        const price = parseFloat(product.price || 0);
        const totalPrice = price * quantity;
        return {
            key,
            sNo: index + 1,
            name: product.name,
            description: product.description || "",
            price,
            quantity,
            totalPrice,
            product,
        };
    }).filter(Boolean);

    // Dynamic array tracking items added strictly AFTER the subtotal & discount block
    let postDiscountItems = [];
    let runningSNo = baseCartItems.length + 1;

    if (includePowerAmp && !isNaN(parseFloat(powerAmpPrice))) {
        postDiscountItems.push({
            key: "power-amplifier",
            sNo: runningSNo++,
            name: "Power Amplifier(Emotiva BasX A3)",
            description: "High-quality 3-channel power amplifier suitable for home theater and stereo setups",
            price: parseFloat(powerAmpPrice),
            quantity: 1,
            totalPrice: parseFloat(powerAmpPrice)
        });
    }

    if (includeMediaPlayer && !isNaN(parseFloat(mediaPlayerPrice))) {
        postDiscountItems.push({
            key: "media-player",
            sNo: runningSNo++,
            name: "Media Player",
            description: "Premium high-resolution media player for audio and video streaming formats",
            price: parseFloat(mediaPlayerPrice),
            quantity: 1,
            totalPrice: parseFloat(mediaPlayerPrice)
        });
    }

    if (includeKordz && !isNaN(parseFloat(kordzPrice))) {
        postDiscountItems.push({
            key: "kordz-cables",
            sNo: runningSNo++,
            name: "Kordz-Cables and Accessories",
            description:
                "Kordz 4K Supported HDMI cable (10 mtrs.)\nKordz 16Gauge Speaker cable\nSubwoofer Cable\nUniversal projector ceiling mount bracket\nUPS\nStabilizer",
            price: parseFloat(kordzPrice),
            quantity: 1,
            totalPrice: parseFloat(kordzPrice)
        });
    }

    // Mathematical definitions ensuring isolated discount processing
    const productsSubtotal = baseCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (productsSubtotal * discount) / 100;
    const subtotalAfterDiscount = productsSubtotal - discountAmount;

    const postDiscountTotal = postDiscountItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalTotal = subtotalAfterDiscount + postDiscountTotal;

    const handleDownload = async () => {
        try {
            const element = componentRef.current;
            if (!element) return;
            setDownloading(true);
            setMeta(quoteMeta()); // today's date and a fresh reference number

            await new Promise((resolve) => setTimeout(resolve, 500));

            await html2pdf()
                .from(element)
                .set({ ...PDF_OPTIONS, filename: `${customerName || "untitled"}-quotation.pdf` })
                .save();
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            setDownloading(false);
        }
    };

    // Add-ons priced per quotation; they are added after the discount.
    const addOns = [
        {
            id: "kordz", label: "Kordz Cables & Accessories",
            hint: "HDMI, speaker & subwoofer cables, ceiling mount, UPS, stabilizer",
            on: includeKordz, setOn: setIncludeKordz, price: kordzPrice, setPrice: setKordzPrice,
        },
        {
            id: "amp", label: "Power Amplifier",
            hint: "Emotiva BasX A3 · 3-channel",
            on: includePowerAmp, setOn: setIncludePowerAmp, price: powerAmpPrice, setPrice: setPowerAmpPrice,
        },
        {
            id: "media", label: "Media Player",
            hint: "High-resolution audio & video streaming",
            on: includeMediaPlayer, setOn: setIncludeMediaPlayer, price: mediaPlayerPrice, setPrice: setMediaPlayerPrice,
        },
    ];

    if (!baseCartItems.length && !postDiscountItems.length) {
        return (
            <div className="ui">
                <section className="empty-state">
                    <span className="empty-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M6 3.5h9l3 3v14H6z" /><path d="M14.5 3.5v3.5H18M9 11h6M9 14.5h6M9 18h3.5" /></svg>
                    </span>
                    <h1 className="display display-sm">Your quotation is empty</h1>
                    <p className="lede">Add speakers, receivers, projectors and more from the catalogue to start a quotation.</p>
                    <button className="btn btn-gold" onClick={() => navigate("/")}>
                        Browse the catalogue
                    </button>
                </section>
            </div>
        );
    }

    const itemCount = baseCartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <div className="ui review">
                <div className="review-head">
                    <button type="button" className="link-btn back-link" onClick={() => navigate("/")}>
                        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4" /></svg>
                        Back to catalogue
                    </button>
                    <p className="eyebrow">Review</p>
                    <h1 className="display">Your quotation</h1>
                </div>

                <div className="review-grid">
                    <div className="review-main">
                        <section className="panel">
                            <div className="panel-head panel-head-row">
                                <h2 className="section-title">Equipment</h2>
                                <span className="muted small">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                            </div>
                            <ul className="line-items">
                                {baseCartItems.map((item) => (
                                    <li key={item.key} className="line-item">
                                        <div className="line-info">
                                            <p className="line-name">{(item.name || "").trim()}</p>
                                            <p className="line-meta">
                                                {item.product.category === "SubWoofer" ? "Subwoofer" : item.product.category}
                                                <span className="dot" aria-hidden="true">·</span>
                                                {inr(item.price)} each
                                            </p>
                                        </div>
                                        <Stepper
                                            value={item.quantity}
                                            label={item.name}
                                            onDecrement={() => decrementItem(item.product, item.product.category)}
                                            onIncrement={() => incrementItem(item.product, item.product.category)}
                                        />
                                        <span className="line-total">{inr(item.totalPrice)}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="panel">
                            <div className="panel-head">
                                <h2 className="section-title">Add-ons</h2>
                                <p className="muted small">Priced per project and added after the discount.</p>
                            </div>
                            {addOns.map((a) => (
                                <div key={a.id} className={`ac-row ${a.on ? "is-on" : ""}`}>
                                    <label className="toggle-row">
                                        <input
                                            type="checkbox"
                                            className="switch"
                                            checked={a.on}
                                            onChange={(e) => {
                                                a.setOn(e.target.checked);
                                                if (!e.target.checked) a.setPrice("");
                                            }}
                                        />
                                        <span className="toggle-text">
                                            <span className="toggle-label">{a.label}</span>
                                            <span className="toggle-hint">{a.hint}</span>
                                        </span>
                                    </label>
                                    {a.on && (
                                        <div className="ac-fields ac-fields-single">
                                            <label className="field">
                                                <span className="field-label">Price</span>
                                                <span className="field-control">
                                                    <span className="field-unit">₹</span>
                                                    <input
                                                        type="number" inputMode="decimal" min="0"
                                                        value={a.price}
                                                        onChange={(e) => a.setPrice(e.target.value)}
                                                        placeholder="Enter price"
                                                        autoFocus
                                                    />
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    </div>

                    <aside className="review-side">
                        <section className="panel">
                            <div className="panel-head">
                                <h2 className="section-title">Details</h2>
                            </div>
                            <div className="form-stack">
                                <label className="field">
                                    <span className="field-label">Customer name</span>
                                    <span className="field-control">
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter customer name"
                                        />
                                    </span>
                                </label>
                                <label className="field">
                                    <span className="field-label">Quotation title</span>
                                    <span className="field-control">
                                        <input
                                            type="text"
                                            value={quotationTitle}
                                            onChange={(e) => setQuotationTitle(e.target.value)}
                                        />
                                    </span>
                                </label>
                                <label className="field">
                                    <span className="field-label">Discount on equipment</span>
                                    <span className="field-control field-control-narrow">
                                        <input
                                            type="number" inputMode="decimal" min="0" max="100"
                                            value={discountInput}
                                            onChange={(e) => setDiscountInput(e.target.value)}
                                            onBlur={() => setDiscountInput(String(discount))}
                                        />
                                        <span className="field-unit">%</span>
                                    </span>
                                </label>
                            </div>
                        </section>

                        <section className="panel summary">
                            <dl className="totals">
                                <div><dt>Equipment subtotal</dt><dd>{inr(productsSubtotal)}</dd></div>
                                {discount !== 0 && (
                                    <>
                                        <div className="is-discount"><dt>Discount ({discount}%)</dt><dd>−{inr(discountAmount)}</dd></div>
                                        <div><dt>After discount</dt><dd>{inr(subtotalAfterDiscount)}</dd></div>
                                    </>
                                )}
                                {postDiscountItems.map((item) => (
                                    <div key={item.key}><dt>{item.key === "kordz-cables" ? "Kordz accessories" : item.key === "power-amplifier" ? "Power amplifier" : item.name}</dt><dd>{inr(item.totalPrice)}</dd></div>
                                ))}
                            </dl>
                            <div className="final">
                                <span>Final amount</span>
                                <strong className="grand">{inr(finalTotal)}</strong>
                            </div>
                            <button className="btn btn-gold btn-block" onClick={handleDownload} disabled={downloading}>
                                {downloading ? (
                                    <><span className="spinner" aria-hidden="true" /> Preparing PDF…</>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" /></svg>
                                        Download PDF
                                    </>
                                )}
                            </button>
                            <p className="muted small center">
                                {customerName ? `${customerName}-quotation.pdf` : "Add a customer name to label the file"}
                            </p>
                        </section>
                    </aside>
                </div>
            </div>

            <div style={{ display: "none" }}>
                <QuotationPDF
                    componentRef={componentRef}
                    meta={meta}
                    baseCartItems={baseCartItems}
                    postDiscountItems={postDiscountItems}
                    productsSubtotal={productsSubtotal}
                    discount={discount}
                    discountAmount={discountAmount}
                    subtotalAfterDiscount={subtotalAfterDiscount}
                    finalTotal={finalTotal}
                    quotationTitle={quotationTitle}
                    customerName={customerName}
                />
            </div>
        </>
    );
}
