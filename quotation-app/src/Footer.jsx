import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "./CartContext";
import { inr } from "./format";

// Floating summary bar: what is in the quotation so far, and the way to review it.
export default function Footer() {
    const { cart, allProducts } = useContext(CartContext);
    const { pathname } = useLocation();

    const entries = Object.entries(cart);
    if (entries.length === 0 || pathname === "/cart") {
        return null; // nothing to review yet, or already reviewing
    }

    const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
    const subtotal = entries.reduce(
        (sum, [key, qty]) => sum + parseFloat(allProducts[key]?.price || 0) * qty, 0
    );

    return (
        <div className="summary-bar ui" role="region" aria-label="Quotation summary">
            <div className="summary-bar-inner">
                <div className="summary-bar-text">
                    <span className="summary-bar-count">{count} {count === 1 ? "item" : "items"}</span>
                    <span className="summary-bar-total">{inr(subtotal)}</span>
                </div>
                <Link to="/cart" className="btn btn-gold">
                    Review quotation
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </Link>
            </div>
        </div>
    );
}
