// GET /api/details -> every product (Spring: GET /details)
import { handle, toProduct } from "../_lib.js";

export default function handler(req, res) {
    return handle(req, res, ["GET"], async (products) => {
        const docs = await products.find().toArray();
        return res.status(200).json(docs.map(toProduct));
    });
}
