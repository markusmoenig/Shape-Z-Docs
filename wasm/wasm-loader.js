window.shapezWasmModule = (async () => {
    const mod = await import('/wasm/shapezlib.js');
    await mod.default(); // initializes the WASM module
    return mod;
})();