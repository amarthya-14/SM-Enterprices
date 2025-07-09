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

    const cartItems = Object.entries(cart).map(([key, quantity], index) => {
        const product = allProducts[key];
        if (!product) return null;

        const price = parseFloat(product.price || 0);
        const totalPrice = price * quantity;

        return {
            key,               // Keep the composite key
            sNo: index + 1,
            name: product.name,
            description: product.description || "",
            price,
            quantity,
            totalPrice,
            product,          // Also store full product reference
        };
    }).filter(Boolean);

    const subTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subTotal * discount) / 100;
    const finalTotal = subTotal - discountAmount;

    const handleDownload = () => {
        const element = componentRef.current;
        html2pdf()
            .from(element)
            .set({
                margin: 10,
                filename: "quotation.pdf",
                html2canvas: { scale: 2, backgroundColor: "#ffffff" },
                jsPDF: { orientation: "portrait" },
            })
            .save();
    };

    const handleDiscountChange = (e) => {
        const value = parseFloat(e.target.value);
        setDiscount(isNaN(value) ? 0 : value);
    };

    if (cartItems.length === 0) {
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
            {/* Cart UI */}
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
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "25px" }}>
                        <h1
                            style={{
                                margin: "0 0 10px 0",
                                fontSize: "2.5rem",
                                color: "#d4b85e",
                                fontFamily: "'Playfair Display', serif", // 👈 a classy display font, no weird spacing
                                fontWeight: 700,
                                lineHeight: "1.2",
                            }}
                        >
                            SM  Enterprises
                        </h1>
                        <p
                            style={{
                                margin: "10px 0",
                                fontSize: "1rem",
                                lineHeight: "1.6",
                                color: "#ccc",
                            }}
                        >
                            D no:6/544, Jeenigala Street, Opp: Ramana Reddy Lorry Transport,<br />
                             StonehousePet, Nellore-524002.<br />
                            SPSR Nellore Dist, ContactNo: 9848430077,9908024119
                        </p>
                        <div
                            style={{
                                height: "3px",
                                width: "80px",
                                backgroundColor: "#d4b85e",
                                margin: "16px auto 0",
                                borderRadius: "2px",
                            }}
                        />
                        <p
                            style={{
                                margin: "10px 0 0 0",
                                fontSize: "0.95rem",
                                textAlign: "right",
                                color: "#bbb",
                            }}
                        >
                            Date: {new Date().toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}

                        </p>

                    </div>

                    {/* Title */}
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

                    {/* Table */}
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
                                }}
                            >
                                <td style={{ ...bodyCell, padding: "8px" }}>{item.sNo}</td>
                                <td style={{ ...bodyCell, wordWrap: "break-word", padding: "8px" }}>
                                    {item.name}
                                </td>
                                <td
                                    style={{
                                        ...bodyCell,
                                        wordWrap: "break-word",
                                        fontSize: "0.85rem",
                                        padding: "8px",
                                    }}
                                >
                                    {item.description}
                                </td>
                                <td style={{ ...bodyCell, padding: "8px" }}>{Math.round(item.price)
                                }</td>
                                <td style={{ ...bodyCell, padding: "8px",textAlign: "center" }}>{item.quantity}</td>
                                <td style={{ ...bodyCell, padding: "8px" }}>{Math.round(item.totalPrice)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>




                    {/* Totals */}
                    <div
                        style={{
                            textAlign: "right",
                            marginTop: "30px",
                            fontSize: "1rem",
                            lineHeight: "1.8",
                            color: "#eee",
                        }}
                    >
                        <p>Subtotal: ₹{subTotal.toFixed(2)}</p>
                        <p>Discount ({discount}%): -₹{discountAmount.toFixed(2)}</p>
                        <p
                            style={{
                                fontWeight: "bold",
                                fontSize: "1.2rem",
                                color: "#d4b85e",
                            }}
                        >
                            Final Total: ₹{finalTotal.toFixed(2)}
                        </p>
                    </div>

                    <hr
                        style={{
                            margin: "30px 0",
                            borderTop: "1px dashed #555",
                        }}
                    />
                    <p
                        style={{
                            textAlign: "center",
                            fontStyle: "italic",
                            color: "#888",
                            marginTop: "20px",
                            fontSize: "0.95rem",
                        }}
                    >
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
