import Options from "./Options";
import { useContext, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import { CartContext } from "./CartContext";

export default function Create() {
    const { cart, addItem, incrementItem, decrementItem, setAllProducts, getCompositeKey } = useContext(CartContext);
    const products = [
        "Speakers",
        "In-Wall Speakers",
        "SubWoofer",
        "AV Receiver",
        "Projectors",
        "Screen",

    ];

    const [mode, setMode] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const componentRef = useRef();

    // Acoustics State
    const [acoustics, setAcoustics] = useState({
        wall: { checked: false, sft: "", price: "" },
        ceiling: { checked: false, sft: "", price: "" },
        flooring: { checked: false, sft: "", price: "" },
    });

    async function fetchProductsByCategory(category) {
        try {
            setError(null);
            setCurrentCategory(category);
            setSelectedProducts([]);
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/details/${encodeURIComponent(category)}`
            );
            if (!Array.isArray(res.data)) throw new Error("Expected array");
            setSelectedProducts(res.data);

            setAllProducts((prev) => {
                const updated = { ...prev };
                res.data.forEach((prod) => {
                    const compositeKey = getCompositeKey(prod, category);
                    updated[compositeKey] = { ...prod, category, originalId: prod._id };
                });
                return updated;
            });
        } catch (error) {
            setError(`Failed to load products for ${category}`);
            setSelectedProducts([]);
        }
    }

    function handleAddItem(item, category) {
        if (isAdding) return;
        setIsAdding(true);
        addItem(item, category);
        setTimeout(() => setIsAdding(false), 300);
    }

    function handleChangeAcoustics(type, field, value) {
        setAcoustics((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    }

    function downloadAcousticsPDF() {
        const selected = Object.entries(acoustics).filter(([_, data]) => data.checked);
        if (selected.length === 0) return alert("Please select at least one item.");

        let total = 0;
        const rows = selected.map(([type, data], i) => {
            const { sft, price } = data;
            const totalPrice = parseFloat(sft) * parseFloat(price);
            total += totalPrice;
            return `
            <tr>
                <td style="padding: 8px; text-align: center; vertical-align: middle;">${i + 1}</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle;">${type.charAt(0).toUpperCase() + type.slice(1)} Acoustics</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle;">${sft}</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle;">${price}</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle;">${totalPrice.toFixed(2)}</td>
            </tr>
        `;
        });

        const dateStr = new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        const content = `
        <div style="padding: 20px; font-family: 'Poppins', sans-serif; background-color: #121212; color: #eee; max-width: 900px; margin: 0 auto; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="margin: 0 0 10px 0; font-size: 2.5rem; color: #d4b85e; font-family: 'Playfair Display', serif; font-weight: 700; line-height: 1.2;">
                    SM Enterprises
                </h1>
                <p style="margin: 10px 0; font-size: 1rem; line-height: 1.6; color: #ccc;">
                    D no:6/544, Jeenigala Street, Opp: Ramana Reddy Lorry Transport,<br />
                    StonehousePet, Nellore-524002.<br />
                    SPSR Nellore Dist, ContactNo: 9848430077, 9908024119
                </p>
                <div style="height: 3px; width: 80px; background-color: #d4b85e; margin: 16px auto 0; border-radius: 2px;"></div>
                <p style="margin: 10px 0 0 0; font-size: 0.95rem; text-align: right; color: #bbb;">
                    Date: ${dateStr}
                </p>
            </div>

            <h2 style="text-align: left; color: #eee; margin-bottom: 20px; border-bottom: 2px solid #d4b85e; display: inline-block; padding-bottom: 5px;">Acoustics Quotation</h2>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #eee;">
                <thead>
                    <tr>
                        <th style="padding: 8px; text-align: center; color: #d4b85e;">S.No</th>
                        <th style="padding: 8px; text-align: center; color: #d4b85e;">Description</th>
                        <th style="padding: 8px; text-align: center; color: #d4b85e;">SFT</th>
                        <th style="padding: 8px; text-align: center; color: #d4b85e;">Price</th>
                        <th style="padding: 8px; text-align: center; color: #d4b85e;">Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join("")}
                    <tr>
                        <td colspan="4" style="padding: 12px; text-align: right; color: #d4b85e; font-weight: 900; font-size: 18px; border-top: 2px solid #d4b85e; text-transform: uppercase; letter-spacing: 0.5px;">Final Amount:</td>
                        <td style="padding: 12px; text-align: center; color: #d4b85e; font-weight: 900; font-size: 18px; border-top: 2px solid #d4b85e;">₹ ${total.toLocaleString("en-IN")}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        html2pdf().from(content).set({
            margin: 0.5,
            filename: "acoustics-quotation.pdf",
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        }).save();
    }

    return (
        <>
            <div className="top-buttons">
                <button className="create" onClick={() => setMode("quotation")}>Create Quotation</button>
                <button className="create" onClick={() => setMode("acoustics")}>Create Acoustics</button>
            </div>

            {/* Quotation Mode */}
            {mode === "quotation" && (
                <>
                    <Options names={products} onSelect={fetchProductsByCategory} />
                    {error && <p className="error-message">{error}</p>}
                    {selectedProducts.length > 0 && (
                        <div className="product-details">
                            <h2>Products in {currentCategory}</h2>
                            {selectedProducts.map((item) => {
                                const compositeKey = getCompositeKey(item, currentCategory);
                                return (
                                    <div key={compositeKey} className="product-card">
                                        <h3>{item.name || "Unknown Product"}</h3>
                                        {cart[compositeKey] ? (
                                            <div className="counter">
                                                <button onClick={() => decrementItem(item, currentCategory)}>-</button>
                                                <span>{cart[compositeKey]}</span>
                                                <button onClick={() => incrementItem(item, currentCategory)}>+</button>
                                            </div>
                                        ) : (
                                            <button
                                                className="add-btn"
                                                onClick={() => handleAddItem(item, currentCategory)}
                                                disabled={isAdding}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Acoustics Mode */}
            {mode === "acoustics" && (
                <div className="acoustics-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {["wall", "ceiling", "flooring"].map((type) => (
                        <div key={type} className="acoustic-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '300px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <input
                                    type="checkbox"
                                    checked={acoustics[type].checked}
                                    onChange={(e) => handleChangeAcoustics(type, "checked", e.target.checked)}
                                    style={{ marginRight: '10px' }}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1)} Acoustics
                            </label>
                            {acoustics[type].checked && (
                                <div className="inputs" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '8px' }}>
                                    <input
                                        type="number"
                                        placeholder="SFT"
                                        value={acoustics[type].sft}
                                        onChange={(e) => handleChangeAcoustics(type, "sft", e.target.value)}
                                        style={{ marginBottom: '8px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={acoustics[type].price}
                                        onChange={(e) => handleChangeAcoustics(type, "price", e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={downloadAcousticsPDF}
                        className="download-pdf"
                        style={{ width: '300px', textAlign: 'center', marginTop: '16px' }}
                    >
                        Download Acoustics PDF
                    </button>
                </div>
            )}
        </>
    );
}