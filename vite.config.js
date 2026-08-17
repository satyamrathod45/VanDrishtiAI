import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import fs from "node:fs";
import path from "node:path";

function saveCropsDevPlugin() {
  return {
    name: "save-crops-dev-plugin",
    configureServer(server) {
      server.middlewares.use("/api/save-crops", (req, res, next) => {
        if (req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            try {
              const parsed = JSON.parse(body);
              const crops = parsed.crops || [];
              const cropsDir = path.resolve(process.cwd(), "crops");
              const publicCropsDir = path.resolve(process.cwd(), "public", "crops");

              if (!fs.existsSync(cropsDir)) fs.mkdirSync(cropsDir, { recursive: true });
              if (!fs.existsSync(publicCropsDir)) fs.mkdirSync(publicCropsDir, { recursive: true });

              let savedCount = 0;
              for (const crop of crops) {
                if (crop.cropFilename && crop.cropDataUrl) {
                  const base64Data = crop.cropDataUrl.replace(/^data:image\/\w+;base64,/, "");
                  const buffer = Buffer.from(base64Data, "base64");
                  fs.writeFileSync(path.join(cropsDir, crop.cropFilename), buffer);
                  fs.writeFileSync(path.join(publicCropsDir, crop.cropFilename), buffer);
                  savedCount++;
                }
              }

              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, savedCount, folder: cropsDir }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    saveCropsDevPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/onnxruntime-web/dist/*.wasm",
          dest: "wasm"
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ["onnxruntime-web"]
  }
});
