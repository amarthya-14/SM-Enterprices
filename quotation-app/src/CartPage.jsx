import { useContext, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";
import "./quotation.css";

export default function CartPage() {
    const { cart = {}, allProducts = {}, incrementItem, decrementItem } = useContext(CartContext) || {};
    const navigate = useNavigate();
    const componentRef = useRef();

    const [discount, setDiscount] = useState(0);
    const [quotationTitle, setQuotationTitle] = useState("Quotation for Home Theatre 7.1.4");
    const [customerName, setCustomerName] = useState("");
    const [includeKordz, setIncludeKordz] = useState(false);
    const [kordzPrice, setKordzPrice] = useState("");
    const [includePowerAmp, setIncludePowerAmp] = useState(false);
    const [powerAmpPrice, setPowerAmpPrice] = useState("");

    let cartItems = Object.entries(cart).map(([key, quantity], index) => {
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

    if (includePowerAmp && !isNaN(parseFloat(powerAmpPrice))) {
        cartItems.push({
            key: "power-amplifier",
            sNo: cartItems.length + 1,
            name: "Power Amplifier",
            description: "High-quality power amplifier suitable for home theater and stereo setups",
            price: parseFloat(powerAmpPrice),
            quantity: 1,
            totalPrice: parseFloat(powerAmpPrice),
            product: null,
        });
    }

    let kordzItem = null;
    if (includeKordz && !isNaN(parseFloat(kordzPrice))) {
        kordzItem = {
            key: "kordz-cables",
            sNo: cartItems.length + 1,
            name: "Kordz-Cables and Accessories",
            description:
                "Kordz 4K Supported HDMI cable (10 mtrs.)\nKordz 16Gauge Speaker cable\nSubwoofer Cable\nUniversal projector ceiling mount bracket\nUPS\nStabilizer\nApple TV",
            price: parseFloat(kordzPrice),
            quantity: 1,
            totalPrice: parseFloat(kordzPrice),
            product: null,
        };
    }

    const productsSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (productsSubtotal * discount) / 100;
    const kordzTotal = kordzItem ? kordzItem.totalPrice : 0;
    const finalTotal = productsSubtotal - discountAmount + kordzTotal;

    const handleDownload = async () => {
        try {
            const element = componentRef.current;
            if (!element) return;

            await new Promise((resolve) => setTimeout(resolve, 500));

            html2pdf()
                .from(element)
                .set({
                    filename: `${customerName || "untitled"}-quotation.pdf`,
                    margin: [15, 10, 15, 10],
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                    pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.avoid-break'] } // Respect CSS, avoid row splits and marked sections
                })
                .save();
        } catch (error) {
            console.error("PDF generation failed:", error);
        }
    };

    const handleDiscountChange = (e) => {
        const value = parseFloat(e.target.value);
        setDiscount(isNaN(value) ? 0 : value);
    };

    if (!cartItems.length && !kordzItem) {
        return (
            <div className="cart-page">
                <h2>Your cart is empty</h2>
                <button className="back-button" onClick={() => navigate("/")}>
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="cart-page">
                <h2>Your Cart</h2>

                {cartItems.map((item) => (
                    <div key={item.key} className="cart-item">
                        <div className="cart-item-details">
                            <p className="cart-item-name">{item.name}</p>
                            <p className="cart-item-quantity">Quantity: {item.quantity}</p>
                        </div>
                        {item.product && (
                            <div className="cart-counter">
                                <button onClick={() => decrementItem(item.product, item.product.category)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => incrementItem(item.product, item.product.category)}>+</button>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ marginTop: "20px" }}>
                    <label style={{ marginRight: "10px" }}>Discount (%):</label>
                    <input
                        type="number"
                        value={discount}
                        onChange={handleDiscountChange}
                        style={{
                            width: "120px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                </div>

                <div style={{ marginTop: "15px" }}>
                    <label style={{ marginRight: "10px" }}>Quotation Title:</label>
                    <input
                        type="text"
                        value={quotationTitle}
                        onChange={(e) => setQuotationTitle(e.target.value)}
                        style={{
                            width: "250px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                </div>

                <div style={{ marginTop: "15px" }}>
                    <label style={{ marginRight: "10px" }}>Customer Name:</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        style={{
                            width: "250px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                        }}
                    />
                </div>

                <div style={{ marginTop: "15px" }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={includeKordz}
                            onChange={(e) => {
                                setIncludeKordz(e.target.checked);
                                if (!e.target.checked) setKordzPrice("");
                            }}
                            style={{ marginRight: "10px" }}
                        />
                        Add Kordz Cables and Accessories
                    </label>
                    {includeKordz && (
                        <div style={{ marginTop: "10px" }}>
                            <label style={{ marginRight: "10px" }}>Price (₹):</label>
                            <input
                                type="number"
                                value={kordzPrice}
                                onChange={(e) => setKordzPrice(e.target.value)}
                                placeholder="Enter price"
                                style={{
                                    width: "160px",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontSize: "1rem",
                                }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "15px" }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={includePowerAmp}
                            onChange={(e) => {
                                setIncludePowerAmp(e.target.checked);
                                if (!e.target.checked) setPowerAmpPrice("");
                            }}
                            style={{ marginRight: "10px" }}
                        />
                        Add Power Amplifier
                    </label>
                    {includePowerAmp && (
                        <div style={{ marginTop: "10px" }}>
                            <label style={{ marginRight: "10px" }}>Price (₹):</label>
                            <input
                                type="number"
                                value={powerAmpPrice}
                                onChange={(e) => setPowerAmpPrice(e.target.value)}
                                placeholder="Enter price"
                                style={{
                                    width: "160px",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontSize: "1rem",
                                }}
                            />
                        </div>
                    )}
                </div>

                <button className="checkout-button" onClick={handleDownload}>
                    Download PDF
                </button>
                <button className="back-button" onClick={() => navigate("/")}>
                    Back to Products
                </button>
            </div>

            <div style={{ display: "none" }}>
                <PDFQuotation
                    componentRef={componentRef}
                    cartItems={cartItems}
                    kordzItem={kordzItem}
                    productsSubtotal={productsSubtotal}
                    discount={discount}
                    discountAmount={discountAmount}
                    kordzTotal={kordzTotal}
                    finalTotal={finalTotal}
                    quotationTitle={quotationTitle}
                    customerName={customerName}
                />
            </div>
        </>
    );
}

function PDFQuotation({
                          componentRef,
                          cartItems,
                          kordzItem,
                          productsSubtotal,
                          discount,
                          discountAmount,
                          kordzTotal,
                          finalTotal,
                          quotationTitle,
                          customerName,
                      }) {
    const renderDescription = (description) => {
        return description.split("\n").map((line, index) => (
            <p key={index} style={{ margin: "2px 0" }}>{line}</p>
        ));
    };

    // Indian currency formatter
    const formatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <div
            ref={componentRef}
            style={{
                padding: "20px",
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: "#121212",
                color: "#eee",
                maxWidth: "900px",
                margin: "0 auto",
                borderRadius: "10px",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
                <h1 style={{ margin: "0 0 10px 0", fontSize: "2.5rem", color: "#d4b85e" }}>
                    SM Enterprises
                </h1>
                <p style={{ color: "#ccc", marginBottom: 0, whiteSpace: "pre-line" }}>
                    D no:6/544, Jeenigala Street, Opp: Ramana Reddy Lorry Transport,
                    StonehousePet, Nellore-524002.
                    SPSR Nellore Dist, ContactNo: 9848430077, 9908024119
                </p>
                <p style={{ fontSize: "0.95rem", textAlign: "right", color: "#bbb" }}>
                    Date: {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}
                </p>
            </div>

            {customerName && (
                <p style={{ textAlign: "left", fontSize: "1rem", color: "#ddd", marginTop: "10px", marginLeft: "20px" }}>
                    Client: <span style={{ fontWeight: "600", color: "#fff" }}>{customerName}</span>
                </p>
            )}

            {/* Table wrapper without avoid-break */}
            <div>
                <h2
                    style={{
                        textAlign: "center",
                        color: "#f5f5f5",
                        margin: "30px 0 10px 0",
                        fontSize: "1.5rem",
                        borderBottom: "2px solid #d4b85e",
                        paddingBottom: "8px",
                    }}
                >
                    {quotationTitle}
                </h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "25px",
                        fontSize: "0.9rem",
                    }}
                >
                    <thead>
                    <tr style={{ backgroundColor: "#333", color: "#d4b85e" }}>
                        <th style={headerCell}>S.No</th>
                        <th style={headerCell}>Name</th>
                        <th style={headerCell}>Description</th>
                        <th style={headerCell}>Price (₹)</th>
                        <th style={headerCell}>Qty</th>
                        <th style={headerCell}>Total (₹)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cartItems.map((item, idx) => (
                        <tr
                            key={item.key}
                            className="table-row"
                            style={{
                                background: idx % 2 === 0 ? "#1f1f1f" : "#2a2a2a",
                            }}
                        >
                            <td style={bodyCell}>{item.sNo}</td>
                            <td style={bodyCell}>{item.name}</td>
                            <td style={{ ...bodyCell, fontSize: "0.8rem" }}>
                                {renderDescription(item.description)}
                            </td>
                            <td style={bodyCell}>{Math.round(item.price)}</td>
                            <td style={{ ...bodyCell, textAlign: "center" }}>{item.quantity}</td>
                            <td style={bodyCell}>{Math.round(item.totalPrice)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Removed page-break div to keep content continuous */}

            <div className="avoid-break" style={{ textAlign: "right", marginTop: "30px", fontSize: "1rem", lineHeight: "1.8" }}>
                <p>All Products Subtotal: ₹{formatter.format(productsSubtotal)}</p>
                <p>Discount ({discount}%): -₹{formatter.format(discountAmount)}</p>
                <p>Subtotal After Discount: ₹{formatter.format(productsSubtotal - discountAmount)}</p>
            </div>

            {kordzItem && (
                <table
                    className="avoid-break"
                    style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "0.9rem" }}
                >
                    <tbody>
                    <tr className="table-row" style={{ background: (cartItems.length % 2 === 0) ? "#1f1f1f" : "#2a2a2a" }}>
                        <td style={bodyCell}>{kordzItem.sNo}</td>
                        <td style={bodyCell}>{kordzItem.name}</td>
                        <td style={{ ...bodyCell, fontSize: "0.8rem" }}>
                            {renderDescription(kordzItem.description)}
                        </td>
                        <td style={bodyCell}>{Math.round(kordzItem.price)}</td>
                        <td style={{ ...bodyCell, textAlign: "center" }}>{kordzItem.quantity}</td>
                        <td style={bodyCell}>{Math.round(kordzItem.totalPrice)}</td>
                    </tr>
                    </tbody>
                </table>
            )}

            <div className="avoid-break" style={{ textAlign: "right", marginTop: "20px", fontSize: "1.2rem", fontWeight: "bold", color: "#d4b85e" }}>
                Final Amount: ₹{formatter.format(finalTotal)}
            </div>

            <hr style={{ margin: "30px 0", borderTop: "1px dashed #555" }} />
            <p style={{ textAlign: "center", fontStyle: "italic", color: "#888", marginTop: "20px" }}>
                Thank you for your business! We look forward to serving you again.
            </p>
        </div>
    );
}

const headerCell = {
    padding: "8px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "1px solid #555",
};

const bodyCell = {
    padding: "8px",
    borderBottom: "1px solid #333",
    color: "#eee",
    fontWeight: "600",
};