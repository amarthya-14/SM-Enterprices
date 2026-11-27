// POST /api/details/add -> saves a product and returns it (Spring: POST /details/add)
import { handle, toProduct } from "../_lib.js";

export default function handler(req, res) {
    return handle(req, res, ["POST"], async (products) => {
        const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
        const name = String(b.name ?? "").trim();
        const category = String(b.category ?? "").trim();
        const price = Number(b.price);
        if (!name || !category || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ error: "name, category and a valid price are required" });
        }
        const doc = {
            name,
            category,
            description: String(b.description ?? ""),
            price,
            quantity: Number.isInteger(Number(b.quantity)) ? Number(b.quantity) : 0,
            _class: "com.codecademy.sm_entraprises.Product_Details", // same as documents Spring saves
        };
        const { insertedId } = await products.insertOne(doc);
        return res.status(200).json(toProduct({ _id: insertedId, ...doc }));
    });
}
