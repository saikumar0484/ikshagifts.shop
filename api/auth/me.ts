/* eslint-disable @typescript-eslint/no-explicit-any */

import { json, method } from "../_lib/http.js";
import { getSessionUser } from "../_lib/session.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["GET"])) return;
  json(res, 200, { user: await getSessionUser(req) });
}
