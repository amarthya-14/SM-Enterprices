// Talks to the product API: Spring Boot locally (no passcode), Vercel functions in production.
const BASE = import.meta.env.VITE_BACKEND_URL;
export const OWNER_LOCK = import.meta.env.VITE_OWNER_LOCK === "1";

const KEY = "sm_owner_passcode";

export function getPasscode() {
    try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}

export function setPasscode(value) {
    try {
        if (value) localStorage.setItem(KEY, value);
        else localStorage.removeItem(KEY);
    } catch { /* private mode: stays unlocked for this visit only */ }
}

export async function apiGet(path) {
    const res = await fetch(`${BASE}${path}`, {
        headers: OWNER_LOCK ? { "x-owner-passcode": getPasscode() } : {},
    });
    if (res.status === 401) {
        setPasscode("");
        window.dispatchEvent(new Event("sm:locked"));
        throw new Error("Locked");
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function checkPasscode(code) {
    const res = await fetch(`${BASE}/auth`, { method: "POST", headers: { "x-owner-passcode": code } });
    if (res.status === 204) return true;
    if (res.status === 401) return false;
    throw new Error(`HTTP ${res.status}`);
}
