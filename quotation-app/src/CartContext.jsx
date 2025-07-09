import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState({});
    const [allProducts, setAllProducts] = useState({});

    const getCompositeKey = (product, category) => {
        return `${category}_${product._id}_${product.name}`;
    };

    const addItem = (product, category) => {
        const compositeKey = getCompositeKey(product, category);
        setCart((prev) => {
            if (!prev[compositeKey]) {
                return { ...prev, [compositeKey]: 1 };
            }
            return { ...prev, [compositeKey]: prev[compositeKey] + 1 };
        });

        setAllProducts((prev) => {
            if (!prev[compositeKey]) {
                return {
                    ...prev,
                    [compositeKey]: { ...product, category, originalId: product._id }
                };
            }
            return prev;
        });
    };

    const incrementItem = (product, category) => {
        const compositeKey = getCompositeKey(product, category);
        setCart((prev) => ({
            ...prev,
            [compositeKey]: (prev[compositeKey] || 0) + 1
        }));
    };

    const decrementItem = (product, category) => {
        const compositeKey = getCompositeKey(product, category);
        setCart((prev) => {
            const newCount = (prev[compositeKey] || 1) - 1;
            if (newCount <= 0) {
                const updated = { ...prev };
                delete updated[compositeKey];
                return updated;
            }
            return {
                ...prev,
                [compositeKey]: newCount
            };
        });
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                allProducts,
                setAllProducts,
                addItem,
                incrementItem,
                decrementItem,
                getCompositeKey
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
