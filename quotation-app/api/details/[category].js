// GET /api/details/:category -> products in one category (Spring: GET /details/{category})
import { handle, toProduct } from "../_lib.js";

export default function handler(req, res) {
    return handle(req, res, ["GET"], async (products) => {
        const docs = await products.find({ category: String(req.query.category) }).toArray();
        return res.status(200).json(docs.map(toProduct));
    });
}
