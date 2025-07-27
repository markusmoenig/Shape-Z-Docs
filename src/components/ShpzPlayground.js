import React, { useEffect, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import Editor from '@monaco-editor/react';
import { setupShapezGrammar } from '../utils/loadShapezGrammar';

export default function ShpzPlayground({
  src = null,
  code = `shape Rect {\n  if inside { Color(1.0, 0.9, 0.8); }\n}`,
  height = 400,
  initialSplit = 80,      // editor pane width in percent
  autoCompile = false,    // re-check + render on edit (debounced)
  caption = '',           // toolbar label
  renderWidth = 400,
  renderHeight = 400,
  samplesPerFrame = 1,
  totalSamples = 10
}) {
  const [source, setSource] = useState(code);
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);
  const [compileMsg, setCompileMsg] = useState('Ready');
  const [progressText, setProgressText] = useState('');

  const containerRef = useRef(null);
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const isResizing = useRef(false);
  const splitKeyRef = useRef(null);

  const isBrowser = typeof window !== 'undefined';

  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const yieldToPaint = async () => {
    // rAF runs before paint; the extra setTimeout lets the browser commit the paint
    await nextFrame();
    await new Promise((r) => setTimeout(r, 0));
  };

  const applySplit = useCallback((percent) => {
    if (!leftPaneRef.current || !rightPaneRef.current) return;
    const p = Math.min(90, Math.max(10, percent));
    leftPaneRef.current.style.width = `${p}%`;
    rightPaneRef.current.style.width = `${100 - p}%`;
  }, []);

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  // Load code from a file path (served from /static) when `src` is provided
  useEffect(() => {
    if (!isBrowser) return;
    if (!src) return;

    // Stop any running render and clear canvas
    stopLoop();
    if (canvasRef.current) {
      const c = canvasRef.current;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);
    }

    let cancelled = false;
    setStatus('Loading source…');

    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${src} (${r.status})`);
        return r.text();
      })
      .then((txt) => {
        if (cancelled) return;
        setSource(txt);
        setStatus('Source loaded');
        // If autoCompile is true, the existing effect will trigger a compile
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setStatus('Load failed: ' + (err.message || err));
      });

    return () => { cancelled = true; };
  }, [src, isBrowser]);

  const drawFrame = useCallback((rgba, w, h) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (rgba && rgba.length) {
      const imgData = new ImageData(new Uint8ClampedArray(rgba), w, h);
      ctx.putImageData(imgData, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const renderProgressive = useCallback(async (mod) => {
    if (mod.Renderer && typeof mod.Renderer === 'function') {
      const r = new mod.Renderer(source, renderWidth, renderHeight);
      if (typeof r.set_target_samples === 'function') {
        try { r.set_target_samples(totalSamples >>> 0); } catch (_) { }
      }

      // Read target from renderer if available
      let tgt = totalSamples >>> 0;
      if (typeof r.target_samples === 'function') {
        try { tgt = r.target_samples(); } catch (_) { }
      }

      // Prepare once (runs execute) and capture summary for bottom-right label
      try {
        if (typeof r.prepare === 'function') {
          r.prepare();
        }
        if (typeof r.exec_summary === 'function') {
          const summary = r.exec_summary();
          if (summary) setCompileMsg(summary);
        }
      } catch (e) {
        console.error('Renderer prepare failed:', e);
        setProgressText('ERR');
        return;
      }

      // Let the UI paint the new status before we start sampling
      await yieldToPaint();
      setProgressText(`0/${tgt}`);

      const tick = () => {
        try {
          let finished = false;
          const n = (samplesPerFrame >>> 0) || 1;
          if (typeof r.step_samples === 'function') {
            finished = r.step_samples(n);
          } else if (typeof r.step === 'function') {
            finished = r.step(n);
          } else {
            throw new Error('Renderer has no step/step_samples');
          }

          const rgba = r.frame_rgba();
          drawFrame(rgba, r.width, r.height);

          let prog = 0;
          let cur = null;
          if (typeof r.progress === 'function') {
            try { prog = Math.max(0, Math.min(1, r.progress())); } catch (_) { }
          }
          if (typeof r.current_samples === 'function') {
            try { cur = r.current_samples(); } catch (_) { }
          }
          if (cur != null && tgt) {
            prog = Math.max(prog, Math.min(1, cur / tgt));
          }
          const pct = Math.round(prog * 100);
          const displayCur = cur != null ? cur : Math.round(prog * tgt);
          setProgressText(`${displayCur}/${tgt}`);

          if (!finished) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setProgressText('');
            rafRef.current = 0;
          }
        } catch (e) {
          console.error('Progressive render failed:', e);
          setProgressText('ERR');
          rafRef.current = 0;
        }
      };
      tick();
      return;
    }

    if (typeof mod.compile === 'function') {
      setStatus('Compiling…');
      const bytes = mod.compile(source);
      if (!bytes || bytes.length === 0) throw new Error('Empty byte buffer');

      const blob = new Blob([bytes], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setProgressText('');
      };
      img.onerror = () => setStatus('Render failed');
      img.src = url;
      return;
    }

    throw new Error('No rendering function found in WASM module');
  }, [source, renderWidth, renderHeight, samplesPerFrame, totalSamples, drawFrame]);

  const runCheckThenRender = useCallback(async () => {
    stopLoop();
    flushSync(() => {
      setLoading(true);
      setProgressText('Compiling Voxels…');
    });
    await yieldToPaint();
    try {
      if (!isBrowser || !window.shapezWasmModule) throw new Error('WASM not ready');
      const mod = await window.shapezWasmModule;

      if (typeof mod.compile_check === 'function') {
        setStatus('Checking…');
        const info = mod.compile_check(source, renderWidth, renderHeight);
        const ok = typeof info.ok === 'function' ? info.ok() : info.ok;
        const msg = typeof info.message === 'function' ? info.message() : info.message;
        setCompileMsg(msg || (ok ? 'OK' : 'Error'));
        if (!ok) { setProgressText(''); setLoading(false); return; }
      }

      await renderProgressive(mod);
    } catch (e) {
      console.error(e);
      setStatus(String(e.message || e));
      setProgressText('');
    } finally {
      setLoading(false);
    }
  }, [isBrowser, source, renderWidth, renderHeight, renderProgressive]);

  const runCheckOnly = useCallback(async () => {
    stopLoop();
    setProgressText('');
    try {
      if (!isBrowser || !window.shapezWasmModule) return;
      const mod = await window.shapezWasmModule;
      if (typeof mod.compile_check === 'function') {
        setStatus('Checking…');
        const info = mod.compile_check(source, renderWidth, renderHeight);
        const ok = typeof info.ok === 'function' ? info.ok() : info.ok;
        const msg = typeof info.message === 'function' ? info.message() : info.message;
        setCompileMsg(msg || (ok ? 'OK' : 'Error'));
      }
    } catch (e) {
      console.error(e);
      setStatus(String(e.message || e));
    }
  }, [isBrowser, source, renderWidth, renderHeight]);

  useEffect(() => {
    if (!isBrowser) return;
    const key = `shpz-split:${location.pathname}:${caption || 'default'}`;
    splitKeyRef.current = key;
    const saved = Number(sessionStorage.getItem(key));
    applySplit(!Number.isNaN(saved) && saved > 0 ? saved : initialSplit);
  }, [applySplit, caption, initialSplit, isBrowser]);

  useEffect(() => {
    if (!autoCompile) return;
    const t = setTimeout(() => runCheckOnly(), 350);
    return () => clearTimeout(t);
  }, [source, autoCompile, runCheckOnly]);

  const onMouseDown = () => { isResizing.current = true; };
  const onMouseMove = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    applySplit(percent);
  };
  const onMouseUp = () => {
    if (!isResizing.current) return;
    isResizing.current = false;
    if (isBrowser && splitKeyRef.current && leftPaneRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const leftRect = leftPaneRef.current.getBoundingClientRect();
      const percent = (leftRect.width / rect.width) * 100;
      sessionStorage.setItem(splitKeyRef.current, String(Math.round(percent)));
    }
  };
  const onDividerDoubleClick = () => applySplit(initialSplit);

  useEffect(() => {
    if (!isBrowser) return;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      stopLoop();
    };
  }, [isBrowser]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--ifm-color-emphasis-200, #ccc)',
        height: `${height}px`,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 6,
        fontFamily: 'var(--ifm-font-family-base)',
        background: 'var(--ifm-background-color)',
        marginBottom: '1.5rem'
      }}
    >
      {caption ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'var(--ifm-color-emphasis-100, #f7f7f7)',
            borderBottom: '1px solid var(--ifm-color-emphasis-200, #ccc)',
            fontSize: 13,
            color: 'var(--ifm-color-emphasis-700, #555)'
          }}
        >
          <span>{caption}</span>
          <span style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontVariantNumeric: 'tabular-nums',
            opacity: 0.75
          }}>
            {progressText}
          </span>
        </div>
      ) : null}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div ref={leftPaneRef} style={{ width: '50%', minWidth: '20%' }}>
          <Editor
            height="100%"
            defaultLanguage="shpz"
            value={source}
            onChange={(v) => {
              stopLoop();
              setProgressText('');
              setSource(v ?? '');
            }}
            theme="vs-dark"
            options={{
              fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false
            }}
            onMount={async (editor, monaco) => {
              try { await setupShapezGrammar(monaco, editor); }
              catch (e) { console.error('Grammar setup failed:', e); }
            }}
          />
        </div>
        <div
          onMouseDown={onMouseDown}
          onDoubleClick={onDividerDoubleClick}
          title="Drag to resize • Double‑click to reset"
          style={{ width: 6, cursor: 'col-resize', backgroundColor: 'var(--ifm-color-emphasis-200, #eee)', zIndex: 1 }}
        />
        <div
          ref={rightPaneRef}
          style={{
            width: '50%',
            minWidth: '20%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ifm-background-surface-color, #f9f9f9)'
          }}
        >
          <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--ifm-color-emphasis-100, #f0f0f0)',
          borderTop: '1px solid var(--ifm-color-emphasis-200, #ccc)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={runCheckThenRender}
            disabled={loading}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: 6,
              border: '1px solid var(--ifm-color-primary)',
              background: 'var(--ifm-color-primary)',
              color: 'white',
              fontSize: 13,
              lineHeight: 1.2,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.85 : 1,
              transition: 'opacity 120ms ease'
            }}
          >
            {loading ? 'Working…' : 'Compile & Render'}
          </button>
        </div>
        <span style={{ fontSize: 13, color: 'var(--ifm-color-emphasis-700, #555)' }}>{compileMsg}</span>
      </div>
    </div>
  );
}