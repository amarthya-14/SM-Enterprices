import Header from './Header';
import Create from './Create';
import CartPage from './CartPage';
import Footer from './Footer';
import { CartProvider } from "./CartContext.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

export default function App() {
    return (
        <CartProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/" element={<Create />} />
                    <Route path="/cart" element={<CartPage />} />
                </Routes>
                <Footer />
            </Router>
        </CartProvider>
    );
}
