const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const log = require("electron-log");

const ElectronStore = require("electron-store");
const Store = ElectronStore.default ?? ElectronStore;

log.transports.file.level = "info";
log.transports.console.level = "warn";
log.errorHandler.startCatching({ showDialog: false });

process.on("unhandledRejection", (err) => log.error("[unhandledRejection]", err));
process.on("uncaughtException", (err) => log.error("[uncaughtException]", err));

// ====== Persistencia cross-platform (Mac/Windows) ======
const store = new Store({ name: "neni26" });


// Guarda cosas estables (NO depende del puerto / origin)
ipcMain.handle("pos:store:get", (_e, key, fallback) => {
  if (typeof key !== "string") return fallback ?? undefined;
  return store.get(key, fallback);
});

ipcMain.handle("pos:store:set", (_e, key, value) => {
  if (typeof key !== "string") return;
  store.set(key, value);
});

ipcMain.handle("pos:store:remove", (_e, key) => {
  if (typeof key !== "string") return;
  store.delete(key);
});


ipcMain.handle("pos:terminal:get", () => store.get("terminalId", null));
ipcMain.handle("pos:terminal:set", (_e, id) => store.set("terminalId", id));

ipcMain.on("pos:isPackaged", (e) => (e.returnValue = app.isPackaged));

// ====== Single instance (Launchpad / doble click) ======
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.show();
      mainWin.focus();
    }
  });
}

// ====== Utils ======
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function getFreePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, host, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

async function waitForPort(host, port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const sock = new net.Socket();
      sock.setTimeout(600);
      sock.once("connect", () => {
        sock.destroy();
        resolve(true);
      });
      sock.once("timeout", () => {
        sock.destroy();
        resolve(false);
      });
      sock.once("error", () => resolve(false));
      sock.connect(port, host);
    });

    if (ok) return;
    await wait(120);
  }
  throw new Error(`Next server not reachable at http://${host}:${port} after ${timeoutMs}ms`);
}

async function loadUrlWithRetry(win, url, tries = 80, delayMs = 200) {
  for (let i = 0; i < tries; i++) {
    try {
      await win.loadURL(url);
      return;
    } catch (e) {
      log.warn("[loadURL retry]", { attempt: i + 1, tries, url, err: String(e?.message ?? e) });
      await wait(delayMs);
    }
  }
  await win.loadURL(url);
}

// ====== Globals ======
let mainWin = null;
let nextChild = null;

// ====== Dev / Prod loaders ======
async function loadDev(win) {
  const url = "http://localhost:3000";
  log.info("[dev] url:", url);
  await loadUrlWithRetry(win, url, 120, 200);
}

async function startNextServerProd() {
  const uiRoot = path.join(process.resourcesPath, "ui");
  const serverPath = path.join(uiRoot, "server.js");

  const bindHost = "127.0.0.1"; // donde escucha el server
  const webHost = "localhost";  // lo que usa el navegador (cookies y coherencia con API localhost)
  const port = await getFreePort(bindHost);

  log.info("[prod] uiRoot:", uiRoot);
  log.info("[prod] serverPath:", serverPath);
  log.info("[prod] bind:", `${bindHost}:${port}`);

  // Mata child anterior si existía (por seguridad)
  if (nextChild && !nextChild.killed) {
    try { nextChild.kill(); } catch { }
    nextChild = null;
  }

  nextChild = spawn(process.execPath, [serverPath], {
    cwd: uiRoot,
    env: {
      ...process.env,
      NODE_ENV: "production",
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: bindHost,
      PORT: String(port),

      // 🔥 Tu API (así no dependes del host/puerto de UI)
      API_BASE_URL: "http://localhost:4000",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  nextChild.stdout.on("data", (b) => log.info("[next]", b.toString().trimEnd()));
  nextChild.stderr.on("data", (b) => log.warn("[next]", b.toString().trimEnd()));
  nextChild.on("exit", (code, signal) => log.error("[next exit]", { code, signal }));

  // Espera al bind real
  await waitForPort(bindHost, port, 20000);
  await wait(120);

  // Retorna URL que carga la UI (localhost para “coherencia” de cookies)
  return `http://${webHost}:${port}`;
}

async function loadProd(win) {
  const url = await startNextServerProd();
  log.info("[prod] url:", url);
  await loadUrlWithRetry(win, url, 80, 250);
}

// ====== Window ======
function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: "#0b0b0d",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,

      // ✅ Persistencia de cookies/sesión estable
      partition: "persist:neni26",
    },
  });

  mainWin.once("ready-to-show", () => {
    if (!mainWin) return;
    mainWin.show();
    mainWin.focus();
  });


  mainWin.on("closed", () => {
    mainWin = null;
  });

  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWin.webContents.on("did-fail-load", (_e, code, desc, url) => {
    log.error("[did-fail-load]", { code, desc, url });
    // No matamos la app aquí; loadUrlWithRetry ya reintenta.
  });

  if (app.isPackaged) loadProd(mainWin).catch((e) => log.error("[loadProd]", e));
  else loadDev(mainWin).catch((e) => log.error("[loadDev]", e));
}

// ====== App lifecycle ======
app.whenReady().then(() => {
  createWindow();

  // ✅ CLAVE: Launchpad / dock click cuando la app está viva sin ventanas
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else {
      const w = BrowserWindow.getAllWindows()[0];
      w.show();
      w.focus();
    }
  });

});

// Si quieres comportamiento Mac “standard”, deja esto como está.
// Si quieres que cerrar ventana cierre TODO (incl. next server), usa app.quit() siempre.
app.on("window-all-closed", () => { // ✅
  if (process.platform !== "darwin") app.quit();
});

// ✅ en quit real, mata child sí o sí
app.on("before-quit", () => {
  try { if (nextChild && !nextChild.killed) nextChild.kill(); } catch { }
  nextChild = null;
});
