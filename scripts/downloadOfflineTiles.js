// ============================================================
// VanDrishti AI — Pench Offline Map Tile Downloader
// ============================================================
// Downloads and bundles high-resolution OpenStreetMap/CartoDB
// tiles exclusively for Pench Tiger Reserve (Zoom 10 to 13).
// ============================================================

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TILES_DIR = path.join(__dirname, "..", "public", "tiles");

// Pench Tiger Reserve Landscape Wide Buffer Bounds (M.P. & M.H.)
const PENCH_BOUNDS = {
  south: 21.30,
  north: 22.05,
  west: 78.85,
  east: 79.80,
};

const ZOOM_LEVELS = [9, 10, 11, 12, 13];

// CartoDB Voyager (High-speed OpenStreetMap raster tiles with forest/terrain styling)
const SUBDOMAINS = ["a", "b", "c", "d"];
let subIndex = 0;

function getTileUrl(z, x, y) {
  const s = SUBDOMAINS[subIndex % SUBDOMAINS.length];
  subIndex++;
  return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

/**
 * Converts Latitude/Longitude to Slippy Map Tile Coordinates.
 */
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

/**
 * Downloads a single tile image.
 */
function fetchTile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    };

    https
      .get(url, options, (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              const size = fs.statSync(destPath).size;
              if (size < 1000) {
                fs.unlinkSync(destPath);
                resolve("too_small");
              } else {
                resolve("downloaded");
              }
            });
          });
        } else {
          file.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          resolve(`failed_${res.statusCode}`);
        }
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadPenchTiles() {
  console.log("🗺️  VanDrishti AI — Bundling Authentic Offline Map Tiles for Pench Reserve...\n");
  console.log(`📍 Pench Bounds: ${PENCH_BOUNDS.south}°N - ${PENCH_BOUNDS.north}°N | ${PENCH_BOUNDS.west}°E - ${PENCH_BOUNDS.east}°E`);
  console.log(`🔍 Zoom Levels: ${ZOOM_LEVELS.join(", ")}\n`);

  let totalTiles = 0;
  let downloadedTiles = 0;

  for (const zoom of ZOOM_LEVELS) {
    const nw = latLngToTile(PENCH_BOUNDS.north, PENCH_BOUNDS.west, zoom);
    const se = latLngToTile(PENCH_BOUNDS.south, PENCH_BOUNDS.east, zoom);

    const minX = Math.min(nw.x, se.x);
    const maxX = Math.max(nw.x, se.x);
    const minY = Math.min(nw.y, se.y);
    const maxY = Math.max(nw.y, se.y);

    const countForZoom = (maxX - minX + 1) * (maxY - minY + 1);
    console.log(`➡️ Zoom ${zoom}: X [${minX}..${maxX}], Y [${minY}..${maxY}] (${countForZoom} tiles)`);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        totalTiles++;
        const tileUrl = getTileUrl(zoom, x, y);
        const destPath = path.join(TILES_DIR, String(zoom), String(x), `${y}.png`);

        try {
          const status = await fetchTile(tileUrl, destPath);
          if (status === "downloaded") downloadedTiles++;
          await delay(35);
        } catch (err) {
          console.warn(`   ⚠️ Error tile ${zoom}/${x}/${y}:`, err.message);
        }
      }
    }
  }

  console.log("\n============================================================");
  console.log(`✅ Offline Pench Tiles Successfully Bundled!`);
  console.log(`   - Total Tiles: ${totalTiles}`);
  console.log(`   - Verified Downloaded: ${downloadedTiles}`);
  console.log(`   - Stored in: ${TILES_DIR}`);
  console.log("============================================================\n");
}

downloadPenchTiles();
