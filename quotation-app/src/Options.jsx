// Line icons for the catalogue categories (stroke follows the text colour).
const ICONS = {
    "Speakers": (
        <>
            <rect x="7" y="2.5" width="10" height="19" rx="1.5" />
            <circle cx="12" cy="7" r="1.6" />
            <circle cx="12" cy="14.5" r="3.4" />
            <circle cx="12" cy="14.5" r=".8" />
        </>
    ),
    "In-Wall Speakers": (
        <>
            <rect x="3" y="3" width="18" height="18" rx="1" strokeDasharray="2 2" />
            <rect x="6.5" y="5.5" width="11" height="13" rx="1" />
            <circle cx="12" cy="9" r="1.4" />
            <circle cx="12" cy="14.2" r="2.4" />
        </>
    ),
    "SubWoofer": (
        <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
            <circle cx="12" cy="12" r="5.5" />
            <circle cx="12" cy="12" r="2" />
        </>
    ),
    "AV Receiver": (
        <>
            <rect x="2" y="7" width="20" height="10" rx="1.5" />
            <circle cx="17" cy="12" r="2.4" />
            <path d="M5 10.5h6M5 13.5h4" />
            <path d="M4.5 17v1.5M19.5 17v1.5" />
        </>
    ),
    "Projectors": (
        <>
            <rect x="2.5" y="8" width="15" height="8" rx="2" />
            <circle cx="13" cy="12" r="2.3" />
            <path d="M17.5 10.2 21.5 8M17.5 13.8l4 2.2" />
            <path d="M5 16v1.8M15 16v1.8" />
        </>
    ),
    "Screen": (
        <>
            <path d="M2.5 4h19" />
            <rect x="4" y="4" width="16" height="11" />
            <path d="M12 15v5M8.5 20h7" />
        </>
    ),
};

export default function Options({ names, onSelect, active }) {
    return (
        <div className="categories" role="tablist" aria-label="Product categories">
            {names.map((name) => (
                <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={active === name}
                    className={`category ${active === name ? "is-active" : ""}`}
                    onClick={() => onSelect(name)}
                >
                    <svg className="category-icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>
                    <span>{name === "SubWoofer" ? "Subwoofers" : name}</span>
                </button>
            ))}
        </div>
    );
}
