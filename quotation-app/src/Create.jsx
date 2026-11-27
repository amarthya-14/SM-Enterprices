import Options from "./Options";
import Stepper from "./Stepper";
import { useContext, useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { CartContext } from "./CartContext";
import { apiGet } from "./api";
import { AcousticsPDF } from "./pdf";
import { quoteMeta, savePdf } from "./pdfData";
import { inr, titleCase } from "./format";

const products = [
    "Speakers",
    "In-Wall Speakers",
    "SubWoofer",
    "AV Receiver",
    "Projectors",
    "Screen",
];

const ACOUSTIC_TYPES = ["wall", "ceiling", "flooring"];

// Remembered while the app is open, so coming back from the quotation page lands where you left.
const lastView = { mode: "quotation", category: products[0] };

export default function Create() {
    const { cart, addItem, incrementItem, decrementItem, setAllProducts, getCompositeKey } = useContext(CartContext);

    const [mode, setModeState] = useState(lastView.mode);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [query, setQuery] = useState("");
    const [expanded, setExpanded] = useState({});
    const [acousticsError, setAcousticsError] = useState(null);
    const [acousticsCustomer, setAcousticsCustomer] = useState("");
    const [acousticsMeta, setAcousticsMeta] = useState(() => quoteMeta());
    const [acousticsBusy, setAcousticsBusy] = useState(false);
    const acousticsRef = useRef();

    // Acoustics State
    const [acoustics, setAcoustics] = useState({
        wall: { checked: false, sft: "", price: "" },
        ceiling: { checked: false, sft: "", price: "" },
        flooring: { checked: false, sft: "", price: "" },
    });

    function setMode(next) {
        lastView.mode = next;
        setModeState(next);
    }

    async function fetchProductsByCategory(category) {
        lastView.category = category;
        try {
            setError(null);
            setLoading(true);
            setQuery("");
            setCurrentCategory(category);
            setSelectedProducts([]);
            const data = await apiGet(`/details/${encodeURIComponent(category)}`);
            if (!Array.isArray(data)) throw new Error("Expected array");
            setSelectedProducts(data);

            setAllProducts((prev) => {
                const updated = { ...prev };
                data.forEach((prod) => {
                    const compositeKey = getCompositeKey(prod, category);
                    updated[compositeKey] = { ...prod, category, originalId: prod._id };
                });
                return updated;
            });
        } catch {
            setError(`Failed to load products for ${category}`);
            setSelectedProducts([]);
        } finally {
            setLoading(false);
        }
    }

    // Open straight onto a category instead of an empty page.
    useEffect(() => {
        if (mode === "quotation" && !currentCategory) fetchProductsByCategory(lastView.category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    function handleAddItem(item, category) {
        if (isAdding) return;
        setIsAdding(true);
        addItem(item, category);
        setTimeout(() => setIsAdding(false), 300);
    }

    function handleChangeAcoustics(type, field, value) {
        setAcousticsError(null);
        setAcoustics((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    }

    async function downloadAcousticsPDF() {
        const selected = Object.entries(acoustics).filter(([, data]) => data.checked);
        if (selected.length === 0) return setAcousticsError("Select at least one surface to quote.");
        const incomplete = selected.find(([, data]) => !(parseFloat(data.sft) > 0) || !(parseFloat(data.price) > 0));
        if (incomplete) return setAcousticsError(`Enter the area and rate for ${titleCase(incomplete[0])} Acoustics.`);

        setAcousticsBusy(true);
        const fresh = quoteMeta(); // today's date and a fresh reference number
        setAcousticsMeta(fresh);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const name = acousticsCustomer.trim();
            await savePdf(html2pdf, acousticsRef.current, name ? `${name}-acoustics-quotation.pdf` : "acoustics-quotation.pdf", fresh);
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setAcousticsBusy(false);
        }
    }

    const q = query.trim().toLowerCase();
    const visibleProducts = q
        ? selectedProducts.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q))
        : selectedProducts;

    const acousticsTotal = ACOUSTIC_TYPES.reduce((sum, type) => {
        const a = acoustics[type];
        const line = parseFloat(a.sft) * parseFloat(a.price);
        return a.checked && Number.isFinite(line) ? sum + line : sum;
    }, 0);
    const acousticsSelected = ACOUSTIC_TYPES.filter((t) => acoustics[t].checked).length;
    const acousticRows = ACOUSTIC_TYPES.filter((t) => acoustics[t].checked).map((t) => {
        const sft = parseFloat(acoustics[t].sft) || 0;
        const rate = parseFloat(acoustics[t].price) || 0;
        return { type: t, label: `${titleCase(t)} Acoustics`, sft, rate, amount: sft * rate };
    });

    return (
        <div className="ui">
            <section className="intro">
                <p className="eyebrow">Quotation studio</p>
                <h1 className="display">Create a quotation</h1>
                <p className="lede">
                    {mode === "acoustics"
                        ? "Enter the treated area and rate for each surface, then download the acoustics quotation."
                        : "Choose equipment from the catalogue, then review the quotation and download a branded PDF."}
                </p>

                <div className="segmented" role="tablist" aria-label="Quotation type">
                    <button
                        type="button" role="tab" aria-selected={mode === "quotation"}
                        className={mode === "quotation" ? "is-active" : ""}
                        onClick={() => setMode("quotation")}
                    >
                        Home Theatre
                    </button>
                    <button
                        type="button" role="tab" aria-selected={mode === "acoustics"}
                        className={mode === "acoustics" ? "is-active" : ""}
                        onClick={() => setMode("acoustics")}
                    >
                        Acoustics
                    </button>
                    <span className="segmented-thumb" data-pos={mode === "acoustics" ? 1 : 0} aria-hidden="true" />
                </div>
            </section>

            {/* Quotation Mode */}
            {mode === "quotation" && (
                <section className="catalogue">
                    <Options names={products} onSelect={fetchProductsByCategory} active={currentCategory} />

                    <div className="catalogue-head">
                        <div>
                            <h2 className="section-title">{currentCategory === "SubWoofer" ? "Subwoofers" : currentCategory}</h2>
                            <p className="muted small">
                                {loading ? "Loading products…" : error ? " " : `${selectedProducts.length} products`}
                            </p>
                        </div>
                        {selectedProducts.length > 4 && (
                            <label className="search">
                                <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={`Search ${currentCategory === "SubWoofer" ? "subwoofers" : currentCategory.toLowerCase()}`}
                                    aria-label="Search products"
                                />
                            </label>
                        )}
                    </div>

                    {error && (
                        <div className="notice notice-error" role="alert">
                            <span>{error}. Check the connection and try again.</span>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fetchProductsByCategory(currentCategory)}>Retry</button>
                        </div>
                    )}

                    {loading && (
                        <div className="product-grid" aria-hidden="true">
                            {Array.from({ length: 6 }, (_, i) => <div key={i} className="product skeleton" />)}
                        </div>
                    )}

                    {!loading && visibleProducts.length > 0 && (
                        <div className="product-grid" key={currentCategory}>
                            {visibleProducts.map((item, i) => {
                                const compositeKey = getCompositeKey(item, currentCategory);
                                const qty = cart[compositeKey];
                                const description = (item.description || "").trim();
                                const isLong = description.length > 120;
                                const open = expanded[compositeKey];
                                return (
                                    <article
                                        key={compositeKey}
                                        className={`product ${qty ? "is-added" : ""}`}
                                        style={{ "--i": Math.min(i, 12) }}
                                    >
                                        <h3 className="product-name">{(item.name || "").trim() || "Unknown Product"}</h3>
                                        {description && (
                                            <p className={`product-desc ${isLong && !open ? "is-clamped" : ""}`}>{description}</p>
                                        )}
                                        {isLong && (
                                            <button
                                                type="button" className="link-btn"
                                                onClick={() => setExpanded((prev) => ({ ...prev, [compositeKey]: !open }))}
                                            >
                                                {open ? "Show less" : "Full specifications"}
                                            </button>
                                        )}
                                        <div className="product-foot">
                                            <span className="price">{inr(item.price)}</span>
                                            {qty ? (
                                                <Stepper
                                                    value={qty}
                                                    label={item.name}
                                                    onDecrement={() => decrementItem(item, currentCategory)}
                                                    onIncrement={() => incrementItem(item, currentCategory)}
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => handleAddItem(item, currentCategory)}
                                                    disabled={isAdding}
                                                >
                                                    Add to quotation
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {!loading && !error && q && visibleProducts.length === 0 && (
                        <p className="empty-line">No products match “{query}”.</p>
                    )}
                </section>
            )}

            {/* Acoustics Mode */}
            {mode === "acoustics" && (
                <section className="panel acoustics">
                    <div className="panel-head">
                        <h2 className="section-title">Acoustic treatment</h2>
                        <p className="muted small">Area in square feet (SFT) · rate in rupees per SFT</p>
                    </div>

                    <label className="field ac-customer">
                        <span className="field-label">Customer name <span className="optional">(optional)</span></span>
                        <span className="field-control">
                            <input
                                type="text"
                                value={acousticsCustomer}
                                onChange={(e) => setAcousticsCustomer(e.target.value)}
                                placeholder="Shown on the quotation"
                            />
                        </span>
                    </label>

                    {ACOUSTIC_TYPES.map((type) => {
                        const a = acoustics[type];
                        const line = parseFloat(a.sft) * parseFloat(a.price);
                        return (
                            <div key={type} className={`ac-row ${a.checked ? "is-on" : ""}`}>
                                <label className="toggle-row">
                                    <input
                                        type="checkbox"
                                        className="switch"
                                        checked={a.checked}
                                        onChange={(e) => handleChangeAcoustics(type, "checked", e.target.checked)}
                                    />
                                    <span className="toggle-label">{titleCase(type)} Acoustics</span>
                                    {a.checked && <span className="ac-amount">{Number.isFinite(line) ? inr(line) : "—"}</span>}
                                </label>
                                {a.checked && (
                                    <div className="ac-fields">
                                        <label className="field">
                                            <span className="field-label">Area</span>
                                            <span className="field-control">
                                                <input
                                                    type="number" inputMode="decimal" min="0"
                                                    placeholder="0"
                                                    value={a.sft}
                                                    onChange={(e) => handleChangeAcoustics(type, "sft", e.target.value)}
                                                />
                                                <span className="field-unit">SFT</span>
                                            </span>
                                        </label>
                                        <label className="field">
                                            <span className="field-label">Rate</span>
                                            <span className="field-control">
                                                <span className="field-unit">₹</span>
                                                <input
                                                    type="number" inputMode="decimal" min="0"
                                                    placeholder="0"
                                                    value={a.price}
                                                    onChange={(e) => handleChangeAcoustics(type, "price", e.target.value)}
                                                />
                                                <span className="field-unit">/ SFT</span>
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {acousticsError && <p className="notice notice-error" role="alert">{acousticsError}</p>}

                    <div className="ac-total">
                        <div>
                            <span className="muted small">
                                {acousticsSelected ? `${acousticsSelected} of 3 surfaces` : "No surfaces selected"}
                            </span>
                            <div className="grand">{inr(acousticsTotal)}</div>
                        </div>
                        <button type="button" onClick={downloadAcousticsPDF} className="btn btn-gold" disabled={acousticsBusy}>
                            {acousticsBusy ? (
                                <><span className="spinner" aria-hidden="true" /> Preparing PDF…</>
                            ) : (
                                <>
                                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" /></svg>
                                    Download Acoustics PDF
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{ display: "none" }}>
                        <AcousticsPDF
                            componentRef={acousticsRef}
                            meta={acousticsMeta}
                            rows={acousticRows}
                            total={acousticsTotal}
                            customerName={acousticsCustomer.trim()}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}
