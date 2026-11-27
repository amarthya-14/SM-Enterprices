import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { CartContext } from "./CartContext";

export default function Header() {
    const { cart } = useContext(CartContext);
    const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    return (
        <header className="topbar ui">
            <div className="topbar-inner">
                <Link to="/" className="brand" aria-label="SM Enterprises, home">
                    <span className="monogram" aria-hidden="true">SM</span>
                    <span className="brand-text">
                        <span className="brand-name">SM Enterprises</span>
                        <span className="brand-sub">Home Cinema &amp; Acoustics</span>
                    </span>
                </Link>
                <nav className="nav" aria-label="Main">
                    <NavLink to="/" end className="nav-link nav-catalogue">Catalogue</NavLink>
                    <NavLink to="/cart" className="nav-link">
                        Quotation
                        {count > 0 && <span className="badge" aria-label={`${count} items`}>{count}</span>}
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
