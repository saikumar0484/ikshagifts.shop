/* eslint-disable @typescript-eslint/no-explicit-any */

import { fallbackCatalog, getCatalog, isProductCategory } from "./_lib/catalog.js";
import { json, method } from "./_lib/http.js";

export default async function handler(req: any, res: any) {
  if (!method(req, res, ["GET"])) return;
  const category = String(req.query?.category || "");
  if (category && !isProductCategory(category)) {
    json(res, 400, { error: "Unknown product category." });
    return;
  }
  const products = await getCatalog(category ? category : undefined);
  json(res, 200, {
    products: products.filter((product) => product.isAvailable !== false),
    usingFallback: products === fallbackCatalog,
  });
}
