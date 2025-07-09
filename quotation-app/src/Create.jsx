import Options from "./Options";
import { useContext, useState } from "react";
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
        "Power Amplifier"
    ];

    const [showOptions, setShowOptions] = useState(false);
    const [qutButton, setQutButton] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

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

    function handleShow() {
        setShowOptions(true);
        setQutButton(false);
    }

    function handleAddItem(item, category) {
        if (isAdding) return;
        setIsAdding(true);
        addItem(item, category);
        setTimeout(() => setIsAdding(false), 300);
    }

    return (
        <>
            {qutButton && <button className="create" onClick={handleShow}>Create Quotation</button>}

            {showOptions && <Options names={products} onSelect={fetchProductsByCategory} />}

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
    );
}
