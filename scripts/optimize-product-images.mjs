import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.resolve("public", "product-images");
const outputDir = path.join(sourceDir, "optimized");
const widths = [320, 640, 960, 1280];

await fs.mkdir(outputDir, { recursive: true });

const files = (await fs.readdir(sourceDir)).filter((file) => /\.(jpe?g|png)$/i.test(file));

for (const file of files) {
  const input = path.join(sourceDir, file);
  const name = path.parse(file).name;

  for (const width of widths) {
    const output = path.join(outputDir, `${name}-${width}.webp`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 })
      .toFile(output);
  }
}

console.log(`Optimized ${files.length} product images into ${outputDir}`);
