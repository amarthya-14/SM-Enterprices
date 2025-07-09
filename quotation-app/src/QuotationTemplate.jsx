import React, { forwardRef } from "react";

const QuotationTemplate = forwardRef(({ cart, allProducts, discountPercentage, quotationTitle }, ref) => {
    let total = 0;
    const today = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    const items = Object.entries(cart).map(([key, qty], index) => {
        const p = allProducts[key] || {};
        const price = parseFloat(p.price || 0);
        const totalPrice = price * qty;
        total += totalPrice;

        return (
            <tr key={key} style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ padding: "12px", textAlign: "center", color: "#333" }}>{index + 1}</td>
                <td style={{ padding: "12px", fontWeight: "500", color: "#444" }}>{p.name || "N/A"}</td>
                <td style={{ padding: "12px", opacity: 0.85, color: "#666" }}>{p.description || "N/A"}</td>
                <td style={{ padding: "12px", textAlign: "right", color: "#333" }}>{price.toLocaleString()}</td>
                <td style={{ padding: "12px", textAlign: "center", color: "#333" }}>{qty}</td>
                <td style={{ padding: "12px", textAlign: "right", color: "#333" }}>{totalPrice.toLocaleString()}</td>
            </tr>
        );
    });

    const discountAmount = (total * discountPercentage) / 100;
    const grandTotal = total - discountAmount;

    return (
        <div
            ref={ref}
            style={{
                padding: "40px",
                fontFamily: "'Poppins', sans-serif",
                color: "#333",
                backgroundColor: "#ffffff",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                borderRadius: "16px",
                maxWidth: "1000px",
                margin: "0 auto",
                border: "1px solid #e0e0e0",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(90deg, #1e1e1e, #d4b85e)",
                    padding: "20px",
                    borderRadius: "12px 12px 0 0",
                    margin: "-40px -40px 20px",
                    color: "#fff",
                    textAlign: "center",
                }}
            >
                <h1 style={{ margin: "0", fontSize: "2.5rem", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
                    SRC Enterprises
                </h1>
                <p style={{ margin: "4px 0", fontSize: "1rem", opacity: 0.9 }}>
                    D no:6/544, Jeenigala Street, Opp: Ramana Reddy Lorry Transport, Stonehouse Pet, Nellore-524002, SPSR Nellore Dist.
                </p>
                <p style={{ margin: "2px 0 8px", fontSize: "1rem", opacity: 0.9 }}>
                    Contact: 98484 30077, 99080 24119
                </p>
                <p style={{ margin: "0", fontSize: "0.95rem", fontStyle: "italic", color: "#f0f0f0" }}>
                    Date: {today}
                </p>
            </div>

            <h2
                style={{
                    textAlign: "center",
                    margin: "20px 0",
                    fontSize: "1.8rem",
                    fontWeight: "600",
                    letterSpacing: "1px",
                    color: "#1e1e1e",
                    position: "relative",
                    paddingBottom: "8px",
                }}
            >
                {quotationTitle}
                <span
                    style={{
                        content: "''",
                        position: "absolute",
                        bottom: "0",
                        left: "50%",
                        width: "60px",
                        height: "4px",
                        background: "#d4b85e",
                        transform: "translateX(-50%)",
                        borderRadius: "2px",
                    }}
                />
            </h2>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", fontSize: "1rem" }}>
                <thead>
                <tr style={{ background: "linear-gradient(90deg, #d4b85e, #bfa14c)", color: "#fff" }}>
                    <th style={{ padding: "14px", textAlign: "center" }}>S.No</th>
                    <th style={{ padding: "14px", textAlign: "left" }}>Name</th>
                    <th style={{ padding: "14px", textAlign: "left" }}>Description</th>
                    <th style={{ padding: "14px", textAlign: "right" }}>Price</th>
                    <th style={{ padding: "14px", textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "14px", textAlign: "right" }}>Total</th>
                </tr>
                </thead>
                <tbody>{items}</tbody>
            </table>

            <div
                style={{
                    marginTop: "30px",
                    textAlign: "right",
                    fontSize: "1.1rem",
                    padding: "20px",
                    background: "linear-gradient(135deg, #f9f9f9, #fff)",
                    borderRadius: "8px",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.1)",
                }}
            >
                <p style={{ margin: "8px 0", fontWeight: "500", color: "#444" }}>Subtotal: <strong>₹{total.toLocaleString()}</strong></p>
                <p style={{ margin: "8px 0", fontWeight: "500", color: "#444" }}>Discount ({discountPercentage}%): <strong>-₹{discountAmount.toLocaleString()}</strong></p>
                <h3
                    style={{
                        margin: "16px 0",
                        fontWeight: "700",
                        color: "#1e1e1e",
                        background: "linear-gradient(90deg, #d4b85e, #e8cc7a)",
                        display: "inline-block",
                        padding: "8px 20px",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(212, 184, 94, 0.3)",
                    }}
                >
                    Grand Total: ₹{grandTotal.toLocaleString()}
                </h3>
            </div>

            <p
                style={{
                    marginTop: "20px",
                    fontStyle: "italic",
                    fontSize: "1rem",
                    color: "#666",
                    position: "relative",
                    paddingBottom: "4px",
                }}
            >
                Total in Words: <strong>{grandTotal.toLocaleString()}</strong>
                <span
                    style={{
                        content: "''",
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "2px",
                        background: "linear-gradient(90deg, #d4b85e, #bfa14c)",
                        borderRadius: "1px",
                    }}
                />
            </p>

            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    border: "2px solid #d4b85e",
                    borderRadius: "8px",
                    background: "#f9fafb",
                    fontSize: "1rem",
                    color: "#444",
                }}
            >
                <p style={{ fontWeight: "600", marginBottom: "8px" }}>Terms & Conditions:</p>
                <p style={{ margin: "4px 0" }}>• 50% Advance at the time of confirmation.</p>
                <p style={{ margin: "4px 0" }}>• Quotation validity: 15 days.</p>
                <p style={{ margin: "4px 0" }}>• Prices subject to change based on availability.</p>
            </div>
        </div>
    );
});

export default QuotationTemplate;