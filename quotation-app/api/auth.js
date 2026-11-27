// POST /api/auth -> 204 when the x-owner-passcode header is right, 401 otherwise.
import { handle } from "./_lib.js";

export default function handler(req, res) {
    return handle(req, res, ["POST"], async () => res.status(204).end());
}
