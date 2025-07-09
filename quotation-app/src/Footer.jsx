import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "./CartContext";

export default function Footer() {
    const { cart } = useContext(CartContext);

    if (Object.keys(cart).length === 0) {
        return null; // If cart is empty, no footer button
    }

    return (
        <footer className="footer">
            <Link to="/cart" className="go-to-cart-btn">
                Go to Cart
            </Link>
        </footer>
    );
}
