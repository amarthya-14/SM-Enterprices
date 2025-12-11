import Options from "./Options";
import { useContext, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
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

    ];

    const [mode, setMode] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const componentRef = useRef();

    // Acoustics State
    const [acoustics, setAcoustics] = useState({
        wall: { checked: false, sft: "", price: "" },
        ceiling: { checked: false, sft: "", price: "" },
        flooring: { checked: false, sft: "", price: "" },
    });

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

    function handleAddItem(item, category) {
        if (isAdding) return;
        setIsAdding(true);
        addItem(item, category);
        setTimeout(() => setIsAdding(false), 300);
    }

    function handleChangeAcoustics(type, field, value) {
        setAcoustics((prev) => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }));
    }

    function downloadAcousticsPDF() {
        const selected = Object.entries(acoustics).filter(([_, data]) => data.checked);
        if (selected.length === 0) return alert("Please select at least one item.");

        let total = 0;
        const rows = selected.map(([type, data], i) => {
            const { sft, price } = data;
            const totalPrice = parseFloat(sft) * parseFloat(price);
            total += totalPrice;
            return `
            <tr>
                <td style="padding: 8px; text-align: center; vertical-align: middle; font-weight: bold;">${i + 1}</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle; font-weight: bold;">${type.charAt(0).toUpperCase() + type.slice(1)} Acoustics</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle; font-weight: bold;">${sft}</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle; font-weight: bold;">${price}</td>
                <td style="padding: 8px; text-align: center; vertical-align: middle; font-weight: bold;">${totalPrice.toFixed(2)}</td>
            </tr>
        `;
        });

        const dateStr = new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

      const content = `
      <style>
      @media screen and (max-width: 480px) {
          h1 { font-size: 1.3rem !important; }
          p { font-size: 0.7rem !important; line-height: 1.2 !important; }
          .title { font-size: 1rem !important; margin-bottom: 10px !important; }
          table { font-size: 10px !important; }
          th, td { padding: 4px 2px !important; }
          .total-row, .total-value { font-size: 12px !important; padding: 6px !important; }
          .footer { font-size: 0.65rem !important; line-height: 1.2 !important; padding-top: 10px !important; }
          .footer h3 { font-size: 0.75rem !important; margin-bottom: 4px; }
          .footer li { font-size: 0.65rem !important; margin-bottom: 2px; }
          .date { font-size: 0.65rem !important; text-align: right !important; }
      }
      </style>

      <div style="
          width: 795px;
          max-width: 100%;
          margin: 0 auto;
          font-family: 'Poppins', sans-serif;
          background-color: #121212;
          color: #eee;
          padding: 15px;
          box-sizing: border-box;
      ">

          <!-- HEADER -->
          <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-size: 1.6rem; color: #d4b85e;">SM Enterprises</h1>
              <p style="font-size: 0.8rem; line-height: 1.4; color: #ccc;">
                  D no:6/544, Jeenigala Street, Opp: Ramana Reddy Lorry Transport,<br/>
                  StonehousePet, Nellore-524002.<br/>
                  SPSR Nellore Dist, ContactNo: 9848430077, 9908024119
              </p>
              <div style="height: 3px; width: 60px; background-color: #d4b85e; margin: 12px auto 0; border-radius: 2px;"></div>
              <p class="date" style="font-size: 0.7rem; text-align: right; color: #bbb;">
                  Date: ${dateStr}
              </p>
          </div>

          <!-- TITLE -->
          <h2 style="text-align: left; color: #eee; margin-bottom: 15px; border-bottom: 2px solid #d4b85e; display: inline-block; padding-bottom: 4px; font-size: 1.2rem;" class="title">
              Acoustics Quotation
          </h2>

          <!-- TABLE -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #eee; border: 1px solid #333;">
              <thead>
                  <tr>
                      <th style="padding: 6px 4px; text-align: center; color: #d4b85e;">S.No</th>
                      <th style="padding: 6px 4px; text-align: center; color: #d4b85e;">Description</th>
                      <th style="padding: 6px 4px; text-align: center; color: #d4b85e;">SFT</th>
                      <th style="padding: 6px 4px; text-align: center; color: #d4b85e;">Price</th>
                      <th style="padding: 6px 4px; text-align: center; color: #d4b85e;">Total Price</th>
                  </tr>
              </thead>
              <tbody>
                  ${rows.join("")}
                  <tr>
                      <td colspan="4" style="padding: 10px; text-align: right; font-weight: 900; font-size: 14px; border-top: 2px solid #d4b85e; text-transform: uppercase; letter-spacing: 0.5px; color: #d4b85e;">
                          Final Amount:
                      </td>
                      <td style="padding: 10px; text-align: center; font-weight: 900; font-size: 14px; border-top: 2px solid #d4b85e; color: #d4b85e;">
                          ₹ ${total.toLocaleString("en-IN")}
                      </td>
                  </tr>


              </tbody>
          </table>

          <!-- FOOTER -->
        <div style="
            margin-top: 4px;
            padding-top: 20px;
            border-top: 2px solid #d4b85e;
            color: #ccc;
            font-size: 0.95rem;
            line-height: 1.6;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
        ">
            <h3 style="color: #d4b85e; margin-bottom: 8px;">Materials Using:</h3>
            <ul style="margin: 0; padding-left: 18px;">
                <li>19 MM plywood (Oswin, green ply, Sharon etc., as per customer requirement)</li>
                <li>12 MM plywood</li>
                <li>8 MM plywood</li>
                <li>8 MM HDHMR Boards</li>
                <li>2*1 Aluminium Channels</li>
                <li>1000 GSM Recron</li>
                <li>18 MM Wood Wool Sheets</li>
                <li>Grippers</li>
                <li>Foam, Cloth, Sunmica, Door Handles, Door Hinges, Door Locks, Door Closure</li>
            </ul>

            <p style="margin-top: 20px; color: #bbb; font-size: 0.85rem;">
                *The above materials ensure maximum acoustic performance and premium finish.*
            </p>
        </div>
         `;

      html2pdf().from(content).set({
          margin: 0.5,
          filename: "acoustics-quotation.pdf",
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }).save();
}


    return (
        <>
            <div className="top-buttons">
                <button className="create" onClick={() => setMode("quotation")}>Create Quotation</button>
                <button className="create" onClick={() => setMode("acoustics")}>Create Acoustics</button>
            </div>

            {/* Quotation Mode */}
            {mode === "quotation" && (
                <>
                    <Options names={products} onSelect={fetchProductsByCategory} />
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
            )}

            {/* Acoustics Mode */}
            {mode === "acoustics" && (
                <div className="acoustics-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {["wall", "ceiling", "flooring"].map((type) => (
                        <div key={type} className="acoustic-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '300px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <input
                                    type="checkbox"
                                    checked={acoustics[type].checked}
                                    onChange={(e) => handleChangeAcoustics(type, "checked", e.target.checked)}
                                    style={{ marginRight: '10px' }}
                                />
                                {type.charAt(0).toUpperCase() + type.slice(1)} Acoustics
                            </label>
                            {acoustics[type].checked && (
                                <div className="inputs" style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '8px' }}>
                                    <input
                                        type="number"
                                        placeholder="SFT"
                                        value={acoustics[type].sft}
                                        onChange={(e) => handleChangeAcoustics(type, "sft", e.target.value)}
                                        style={{ marginBottom: '8px' }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={acoustics[type].price}
                                        onChange={(e) => handleChangeAcoustics(type, "price", e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={downloadAcousticsPDF}
                        className="download-pdf"
                        style={{ width: '300px', textAlign: 'center', marginTop: '16px' }}
                    >
                        Download Acoustics PDF
                    </button>
                </div>
            )}
        </>
    );
}