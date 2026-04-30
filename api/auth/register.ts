/* eslint-disable @typescript-eslint/no-explicit-any */

import { json, method } from "../_lib/http.js";

export default function handler(req: any, res: any) {
  if (!method(req, res, ["POST"])) return;
  json(res, 410, {
    error: "Direct registration is disabled. Use /api/auth/request-otp and /api/auth/verify-otp.",
  });
}
