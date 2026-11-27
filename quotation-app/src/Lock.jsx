import { useEffect, useState } from "react";
import { OWNER_LOCK, checkPasscode, getPasscode, setPasscode } from "./api";

// Owner-only access: asks for the passcode once per device, then remembers it.
export default function Lock({ children }) {
    const [unlocked, setUnlocked] = useState(() => !OWNER_LOCK || Boolean(getPasscode()));
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        const relock = () => setUnlocked(false);
        window.addEventListener("sm:locked", relock);
        return () => window.removeEventListener("sm:locked", relock);
    }, []);

    if (unlocked) return children;

    async function submit(e) {
        e.preventDefault();
        if (!code.trim() || checking) return;
        setChecking(true);
        setError("");
        try {
            if (await checkPasscode(code.trim())) {
                setPasscode(code.trim());
                setUnlocked(true);
            } else {
                setError("That passcode is not right.");
            }
        } catch {
            setError("Could not reach the server. Check the connection.");
        } finally {
            setChecking(false);
        }
    }

    return (
        <div className="ui lock">
            <form className="lock-card" onSubmit={submit}>
                <span className="monogram monogram-lg" aria-hidden="true">SM</span>
                <p className="eyebrow">Owner access</p>
                <h1 className="display display-sm">Quotation Studio</h1>
                <p className="lede">Enter the passcode to open the catalogue and prices.</p>
                <label className="field">
                    <span className="field-label">Passcode</span>
                    <span className="field-control">
                        <input
                            type="password"
                            autoComplete="current-password"
                            autoFocus
                            value={code}
                            onChange={(e) => { setCode(e.target.value); setError(""); }}
                        />
                    </span>
                </label>
                {error && <p className="notice notice-error" role="alert">{error}</p>}
                <button type="submit" className="btn btn-gold btn-block" disabled={checking || !code.trim()}>
                    {checking ? <><span className="spinner" aria-hidden="true" /> Checking…</> : "Unlock"}
                </button>
            </form>
        </div>
    );
}
