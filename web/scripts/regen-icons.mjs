import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "../public");
const SRC = path.join(PUBLIC, "icon-source.png");

const meta = await sharp(SRC).metadata();
const SIZE = meta.width;
if (SIZE !== meta.height) throw new Error("source must be square");

// 78% center crop → G fills ~65% of final canvas, starburst stays in frame,
// neon ring reaches edges so Android's circle/squircle mask lands on the ring
// instead of leaving a dead zone.
const KEEP = Math.round(SIZE * 0.78);
const OFF = Math.round((SIZE - KEEP) / 2);

const masked = sharp(SRC).extract({ left: OFF, top: OFF, width: KEEP, height: KEEP });

await masked.clone().resize(192, 192).png().toFile(path.join(PUBLIC, "icon-192-maskable.png"));
await masked.clone().resize(512, 512).png().toFile(path.join(PUBLIC, "icon-512-maskable.png"));

// "any" purpose icons: full source (G + ring + halo + starfield). Used for
// browser tabs and any non-masked display context.
await sharp(SRC).resize(192, 192).png().toFile(path.join(PUBLIC, "icon-192.png"));
await sharp(SRC).resize(512, 512).png().toFile(path.join(PUBLIC, "icon-512.png"));

// Apple touch icon: iOS already applies its own rounded-rect mask, so we can
// use the full source here — identical to "any".
await sharp(SRC).resize(180, 180).png().toFile(path.join(PUBLIC, "apple-touch-icon.png"));

// Classic favicon (shown in browser tab on narrow viewports)
await sharp(SRC).resize(32, 32).png().toFile(path.join(PUBLIC, "favicon-32x32.png"));

console.log("regenerated all icons from icon-source.png");
