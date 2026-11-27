import Header from './Header';
import Create from './Create';
import CartPage from './CartPage';
import Footer from './Footer';
import Lock from './Lock';
import { CartProvider } from "./CartContext.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
    return (
        <Lock>
        <CartProvider>
            <Router>
                <Header />
                <main className="page">
                    <Routes>
                        <Route path="/" element={<Create />} />
                        <Route path="/cart" element={<CartPage />} />
                    </Routes>
                </main>
                <Footer />
            </Router>
        </CartProvider>
        </Lock>
    );
}
