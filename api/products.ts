/* eslint-disable @typescript-eslint/no-explicit-any */

import { fallbackCatalog, getCatalog } from "./_lib/catalog.js";
import { json, method } from "./_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["GET"])) return;
  const products = await getCatalog();
  json(res, 200, {
    products: products.filter((product) => product.isAvailable !== false),
    usingFallback: products === fallbackCatalog,
  });
}
