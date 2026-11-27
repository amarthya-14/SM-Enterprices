export default function Stepper({ value, onDecrement, onIncrement, label = "item" }) {
    return (
        <div className="stepper" role="group" aria-label={`Quantity of ${label}`}>
            <button type="button" onClick={onDecrement} aria-label={value > 1 ? "Decrease quantity" : "Remove"}>
                {value > 1 ? (
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9" /></svg>
                ) : (
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" /></svg>
                )}
            </button>
            <span className="stepper-value" aria-live="polite">{value}</span>
            <button type="button" onClick={onIncrement} aria-label="Increase quantity">
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9" /></svg>
            </button>
        </div>
    );
}
