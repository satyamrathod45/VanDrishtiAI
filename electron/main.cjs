const { app, BrowserWindow, ipcMain, dialog, protocol, net, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    title: "VanDrishti AI — Wildlife Monitoring & Tiger Re-ID",
    backgroundColor: "#0d1512",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true
    }
  });

  // Clean menu in production
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  // Graceful show once ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    // Try local dev server on port 5173, then 5174, then fallback to built files
    mainWindow.loadURL("http://localhost:5173").catch(() => {
      mainWindow.loadURL("http://localhost:5174").catch(() => {
        mainWindow.loadURL("app://-/index.html");
      });
    });
  } else {
    mainWindow.loadURL("app://-/index.html");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Register custom protocol handler for production
app.whenReady().then(() => {
  protocol.handle("app", (request) => {
    const parsedUrl = new URL(request.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);
    if (pathname === "/" || pathname === "") {
      pathname = "/index.html";
    }

    const distPath = path.join(__dirname, "../dist");
    let filePath = path.join(distPath, pathname);

    // If exact file doesn't exist, fall back to index.html for SPA routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distPath, "index.html");
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ============================================================================
// IPC Handlers for Native Desktop Capabilities
// ============================================================================

// 1. Native Folder / SD Card Picker Dialog
ipcMain.handle("dialog:open-directory", async () => {
  if (!mainWindow) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Camera Trap SD Card or Image Folder",
    properties: ["openDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const selectedPath = result.filePaths[0];
  try {
    const entries = fs.readdirSync(selectedPath, { withFileTypes: true });
    const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp"]);
    const files = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExtensions.has(ext)) {
          const fullPath = path.join(selectedPath, entry.name);
          const stats = fs.statSync(fullPath);
          files.push({
            name: entry.name,
            fullPath: fullPath,
            size: stats.size,
            lastModified: stats.mtimeMs
          });
        }
      }
    }

    return {
      canceled: false,
      folderPath: selectedPath,
      files: files
    };
  } catch (err) {
    return { canceled: false, folderPath: selectedPath, error: err.message, files: [] };
  }
});

// 2. Read Image on Disk as Base64 Data URL (bypasses web security/CORS for local files)
ipcMain.handle("fs:read-image-data-url", async (event, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return { success: false, error: "File does not exist: " + filePath };
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
    };
    const mime = mimeMap[ext] || "image/jpeg";
    const data = fs.readFileSync(filePath);
    return { success: true, dataUrl: `data:${mime};base64,${data.toString("base64")}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 3. Save Extracted Crops Directly to Local Disk
ipcMain.handle("crops:save", async (event, { crops = [] }) => {
  try {
    const baseDir = app.isPackaged
      ? path.join(app.getPath("userData"), "crops")
      : path.resolve(process.cwd(), "crops");

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    let savedCount = 0;
    for (const crop of crops) {
      if (crop.cropFilename && crop.cropDataUrl) {
        const base64Data = crop.cropDataUrl.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const outPath = path.join(baseDir, crop.cropFilename);
        fs.writeFileSync(outPath, buffer);
        savedCount++;
      }
    }

    return { success: true, savedCount, folder: baseDir };
  } catch (err) {
    console.error("[IPC] Failed to save crops:", err);
    return { success: false, error: err.message };
  }
});

// 3. App metadata
ipcMain.handle("app:get-info", () => {
  return {
    name: "VanDrishti AI",
    version: app.getVersion(),
    platform: process.platform,
    userDataPath: app.getPath("userData"),
    isPackaged: app.isPackaged
  };
});
