// Shared by the API functions (files starting with "_" are not routes on Vercel).
// Same data and JSON shape as the Spring Boot backend: database SM_Entraprises, collection SM.
import { MongoClient } from "mongodb";
import { createHash, timingSafeEqual } from "node:crypto";

let clientPromise; // reused while the function instance stays warm

async function collection() {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
    clientPromise ??= new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5 }).connect()
        .catch((err) => { clientPromise = undefined; throw err; });
    const client = await clientPromise;
    return client.db(process.env.MONGODB_DB || "SM_Entraprises").collection("SM");
}

// Mongo document -> the same JSON Spring returned ({ id, name, category, description, price, quantity }).
function toProduct({ _id, _class, ...rest }) {
    return { id: String(_id), ...rest };
}

const digest = (value) => createHash("sha256").update(String(value)).digest();

// Owner passcode (env OWNER_PASSCODE), sent by the owner app in the x-owner-passcode header.
function authorized(req) {
    const expected = process.env.OWNER_PASSCODE;
    if (!expected) return false;
    return timingSafeEqual(digest(req.headers["x-owner-passcode"] || ""), digest(expected));
}

export async function handle(req, res, methods, run) {
    res.setHeader("Cache-Control", "no-store");
    if (!methods.includes(req.method)) {
        res.setHeader("Allow", methods.join(", "));
        return res.status(405).json({ error: "method not allowed" });
    }
    if (!authorized(req)) {
        await new Promise((r) => setTimeout(r, 700)); // slows down passcode guessing
        return res.status(401).json({ error: "passcode required" });
    }
    try {
        return await run(await collection());
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "server error" });
    }
}

export { toProduct };
