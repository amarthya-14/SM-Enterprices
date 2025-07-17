import { useContext, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./CartContext";

export default function CartPage() {
    const { cart, allProducts, incrementItem, decrementItem } = useContext(CartContext);
    const navigate = useNavigate();
    const componentRef = useRef();

    const [discount, setDiscount] = useState(0);
    const [quotationTitle, setQuotationTitle] = useState("Quotation for Home Theatre 7.1.4");
    const [includeKordz, setIncludeKordz] = useState(false);
    const [kordzPrice, setKordzPrice] = useState("");

    // Convert cart to items, excluding Kordz for the main table
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
    function numberToWords(n) {
        const a = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
            "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
            "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
        ];
        const b = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty",
            "Sixty", "Seventy", "Eighty", "Ninety"
        ];

        if ((n = n.toString()).length > 9) return "Overflow";
        let num = ('000000000' + n).substr(-9).match(/.{1,3}/g);
        let str = '';
        let i = 0;

        const units = ["Crore", "Lakh", "Thousand", "Hundred", ""];
        for (; i < 5; i++) {
            let n = parseInt(num[i]);
            if (n) {
                let h = Math.floor(n / 100);
                let rem = n % 100;
                let word = "";
                if (h) word += a[h] + " Hundred ";
                if (rem < 20) word += a[rem];
                else word += b[Math.floor(rem / 10)] + (rem % 10 ? " " + a[rem % 10] : "");
                str += word + " " + units[i] + " ";
            }
        }
        return str.trim() + " Rupees Only";
    }


    // Create separate Kordz item if selected
    let kordzItem = null;
    if (includeKordz && !isNaN(parseFloat(kordzPrice))) {
        kordzItem = {
            key: "kordz-cables",
            sNo: cartItems.length + 1, // Continue S.No from products table
            name: "Kordz-Cables and Accessories",
            description:
                "Kordz 4K Supported HDMI cable (10 mtrs.), Kordz 16Gauge Speaker cable, Subwoofer Cable, Universal projector ceiling mount bracket, UPS, Stabilizer, Apple TV",
            price: parseFloat(kordzPrice),
            quantity: 1,
            totalPrice: parseFloat(kordzPrice),
            product: null,
        };
    }

    // Calculate subtotal for products excluding Kordz
    const productsSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (productsSubtotal * discount) / 100;
    const kordzTotal = kordzItem ? kordzItem.totalPrice : 0;
    const finalTotal = productsSubtotal - discountAmount + kordzTotal;

    const handleDownload = () => {
        const element = componentRef.current;
        html2pdf()
            .from(element)
            .set({
                margin: 10,
                filename: "quotation.pdf",
                html2canvas: {
                    scale: 3,
                    backgroundColor: "#ffffff",
                },
                jsPDF: {
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4",
                },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            })
            .save();
    };

    const handleDiscountChange = (e) => {
        const value = parseFloat(e.target.value);
        setDiscount(isNaN(value) ? 0 : value);
    };

    if (cartItems.length === 0 && !kordzItem) {
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
                        <div className="cart-counter">
                            <button onClick={() => decrementItem(item.product, item.product.category)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => incrementItem(item.product, item.product.category)}>+</button>
                        </div>
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

                <button className="checkout-button" onClick={handleDownload}>
                    Download PDF
                </button>
                <button className="back-button" onClick={() => navigate("/")}>
                    Back to Products
                </button>
            </div>

            {/* Hidden printable component */}
            <div style={{ display: "none" }}>
                <div
                    ref={componentRef}
                    style={{
                        padding: "40px",
                        fontFamily: "'Poppins', sans-serif",
                        backgroundColor: "#121212",
                        color: "#eee",
                        maxWidth: "900px",
                        margin: "0 auto",
                        borderRadius: "10px",
                        pageBreakInside: "auto",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "25px" }}>
                        <h1
                            style={{
                                margin: "0 0 10px 0",
                                fontSize: "2.5rem",
                                color: "#d4b85e",
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 700,
                                lineHeight: "1.2",
                            }}
                        >
                            SM Enterprises
                        </h1>
                        <p style={{ margin: "10px 0", fontSize: "1rem", lineHeight: "1.6", color: "#ccc" }}>
                            D no:6/544, Jeenigala Street, Opp: Ramana Reddy Lorry Transport,<br />
                            StonehousePet, Nellore-524002.<br />
                            SPSR Nellore Dist, ContactNo: 9848430077, 9908024119
                        </p>
                        <div style={{ height: "3px", width: "80px", backgroundColor: "#d4b85e", margin: "16px auto 0", borderRadius: "2px" }} />
                        <p style={{ margin: "10px 0 0 0", fontSize: "0.95rem", textAlign: "right", color: "#bbb" }}>
                            Date: {new Date().toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                        </p>
                    </div>

                    <h2
                        style={{
                            textAlign: "center",
                            color: "#f5f5f5",
                            margin: "30px 0 20px 0",
                            fontSize: "1.5rem",
                            borderBottom: "2px solid #d4b85e",
                            display: "inline-block",
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
                            fontSize: "0.95rem",
                            tableLayout: "fixed",
                        }}
                    >
                        <thead>
                        <tr style={{ backgroundColor: "#333", color: "#d4b85e" }}>
                            <th style={{ ...headerCell, width: "8%" }}>S.No</th>
                            <th style={{ ...headerCell, width: "25%" }}>Name</th>
                            <th style={{ ...headerCell, width: "30%" }}>Description</th>
                            <th style={{ ...headerCell, width: "12%" }}>Price (₹)</th>
                            <th style={{ ...headerCell, width: "10%" }}>Qty</th>
                            <th style={{ ...headerCell, width: "15%" }}>Total (₹)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cartItems.map((item, idx) => (
                            <tr
                                key={idx}
                                style={{
                                    background: idx % 2 === 0 ? "#1f1f1f" : "#2a2a2a",
                                    pageBreakInside: "avoid",
                                }}
                            >
                                <td style={bodyCell}>{item.sNo}</td>
                                <td style={bodyCell}>{item.name}</td>
                                <td style={{ ...bodyCell, fontSize: "0.85rem" }}>{item.description}</td>
                                <td style={bodyCell}>{Math.round(item.price)}</td>
                                <td style={{ ...bodyCell, textAlign: "center" }}>{item.quantity}</td>
                                <td style={bodyCell}>{Math.round(item.totalPrice)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div style={{
                        textAlign: "right",
                        marginTop: "30px",
                        fontSize: "1rem",
                        lineHeight: "1.8",
                        color: "#eee",
                    }}>
                        <p>All Products Subtotal: ₹{productsSubtotal.toFixed(2)}</p>
                        <p>Discount ({discount}%): -₹{discountAmount.toFixed(2)}</p>
                        <p>Subtotal After Discount: ₹{(productsSubtotal - discountAmount).toFixed(2)}</p>
                    </div>

                    { kordzItem && (
                        <div
                            style={{
                                display: "flex",
                                background: kordzItem.sNo % 2 === 0 ? "#1f1f1f" : "#2a2a2a",
                                pageBreakInside: "avoid",
                            }}
                        >
                            <div style={{ ...bodyCell, width: "8%" }}>{kordzItem.sNo}</div>
                            <div style={{ ...bodyCell, width: "25%" }}>{kordzItem.name}</div>
                            <div style={{ ...bodyCell, width: "30%", fontSize: "0.85rem" }}>{kordzItem.description}</div>
                            <div style={{ ...bodyCell, width: "12%" }}>₹{Math.round(kordzItem.price)}</div>
                            <div style={{ ...bodyCell, width: "10%", textAlign: "center" }}>{kordzItem.quantity}</div>
                            <div style={{ ...bodyCell, width: "15%" }}>₹{Math.round(kordzItem.totalPrice)}</div>
                        </div>
                    )}



                    <div style={{
                        textAlign: "right",
                        marginTop: "20px",
                        fontSize: "1rem",
                        lineHeight: "1.8",
                        color: "#eee",
                    }}>
                        <p style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#d4b85e" }}>
                            Final Amount: ₹{finalTotal.toFixed(2)}
                        </p>
                    </div>

                    <hr style={{ margin: "30px 0", borderTop: "1px dashed #555" }} />
                    <p style={{
                        textAlign: "center",
                        fontStyle: "italic",
                        color: "#888",
                        marginTop: "20px",
                        fontSize: "0.95rem",
                    }}>
                        Thank you for your business! We look forward to serving you again.
                    </p>
                </div>
            </div>
        </>
    );
}

const headerCell = {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "1px solid #555",
};

const bodyCell = {
    padding: "10px",
    borderBottom: "1px solid #333",
    color: "#eee",
};