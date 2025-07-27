// static/wasm/wasm-loader.js
(async () => {
    // If another copy already started or finished, bail out
    if (globalThis.shapezWasmModule) {
        console.log('[shapez] loader: module promise already present; skipping');
        return;
    }
    if (globalThis.__shapezBooting) {
        console.log('[shapez] loader: boot already in progress; skipping');
        return;
    }
    globalThis.__shapezBooting = true;

    const here = new URL(import.meta.url);
    const jsUrl = new URL('./shapezlib.js', here).toString();
    const wasmUrl = new URL('./shapezlib_bg.wasm', here).toString();

    // console.log('[shapez] loader at', here.href);
    // console.log('[shapez] js    =', jsUrl);
    // console.log('[shapez] wasm  =', wasmUrl);

    async function ensureCOIOnce() {
        if (self.crossOriginIsolated) return true;
        if (!('serviceWorker' in navigator)) return true;
        try { await navigator.serviceWorker.ready; } catch { }
        if (self.crossOriginIsolated) return true;
        const KEY = 'coi-reloaded';
        if (!sessionStorage.getItem(KEY)) {
            sessionStorage.setItem(KEY, '1');
            console.log('[shapez] COI not active yet; reloading once…');
            location.reload();
            return false;
        }
        console.warn('[shapez] COI still false after reload; continuing single-threaded');
        return true;
    }

    const proceed = await ensureCOIOnce();
    if (!proceed) { delete globalThis.__shapezBooting; return; }

    // (Optional) quick probe
    try {
        const [pJs, pWasm] = await Promise.all([
            fetch(jsUrl, { cache: 'no-cache' }),
            fetch(wasmUrl, { cache: 'no-cache' }),
        ]);
        // console.log('[shapez] probe js  ->', pJs.status, pJs.headers.get('content-type'));
        // console.log('[shapez] probe wasm->', pWasm.status, pWasm.headers.get('content-type'));
    } catch (e) {
        console.warn('[shapez] probe failed', e);
    }

    try {
        const mod = await import(jsUrl);

        // New wasm-bindgen init API: pass a single options object
        try {
            await mod.default({ module_or_path: wasmUrl });
        } catch (e) {
            console.warn('[shapez] init(object) failed; retrying legacy init(url)', e);
            await mod.default(wasmUrl);
        }

        // Initialize rayon pool once
        if (self.crossOriginIsolated && typeof mod.initThreadPool === 'function') {
            const n = navigator.hardwareConcurrency || 4;
            await mod.initThreadPool(n);
            console.log(`[shapez] rayon initialized (${n} workers)`);
        } else {
            console.log('[shapez] running single-threaded');
        }

        // Expose the module promise exactly once
        globalThis.shapezWasmModule = Promise.resolve(mod);
        // console.log('✅ shapez WASM ready');
    } catch (e) {
        console.error('❌ shapez WASM init failed', e);
        globalThis.shapezWasmModule = Promise.reject(e);
    } finally {
        delete globalThis.__shapezBooting;
    }
})();