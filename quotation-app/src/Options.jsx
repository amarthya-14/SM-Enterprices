export default function Options({names,onSelect}) {
    return (
        <div className="options">
            {names.map((name, index) => (
                <button key={index} className="option-btn" onClick={()=>onSelect(name)}>
                    {name}
                </button>  ))}
            </div>
    )
}