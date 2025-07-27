/* tslint:disable */
/* eslint-disable */
export function wasm_start(): void;
export function main_init(): void;
export function is_worker(): boolean;
export function rayon_thread_count(): number;
export function init_threads(n: number): Promise<any>;
export function compile_check(code: string, width: number, height: number): CompileInfo;
export function initThreadPool(num_threads: number): Promise<any>;
export function wbg_rayon_start_worker(receiver: number): void;
export class CompileInfo {
  private constructor();
  free(): void;
  readonly ok: boolean;
  readonly message: string;
}
export class Renderer {
  free(): void;
  constructor(code: string, width: number, height: number);
  /**
   * Prepare heavy scene evaluation once (runs ShapeZ::execute).
   */
  prepare(): boolean;
  /**
   * Returns a human-readable summary for the last `execute()` call, e.g.
   * "compiled X voxels in Ys". Empty until `prepare()` runs.
   */
  exec_summary(): string;
  set_target_samples(target: number): void;
  current_samples(): number;
  target_samples(): number;
  progress(): number;
  /**
   * Add N path-trace samples (SPP). Returns true if target reached.
   */
  step_samples(n: number): boolean;
  step(n: number): boolean;
  /**
   * Returns a displayable RGBA8 buffer (tonemapped + gamma) with len=w*h*4
   */
  frame_rgba(): Uint8Array;
  readonly width: number;
  readonly height: number;
}
export class wbg_rayon_PoolBuilder {
  private constructor();
  free(): void;
  mainJS(): string;
  numThreads(): number;
  receiver(): number;
  build(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly wasm_start: () => void;
  readonly main_init: () => void;
  readonly is_worker: () => number;
  readonly rayon_thread_count: () => number;
  readonly init_threads: (a: number) => any;
  readonly __wbg_compileinfo_free: (a: number, b: number) => void;
  readonly compileinfo_ok: (a: number) => number;
  readonly compileinfo_message: (a: number) => [number, number];
  readonly compile_check: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_renderer_free: (a: number, b: number) => void;
  readonly renderer_new: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly renderer_prepare: (a: number) => number;
  readonly renderer_exec_summary: (a: number) => [number, number];
  readonly renderer_set_target_samples: (a: number, b: number) => void;
  readonly renderer_current_samples: (a: number) => number;
  readonly renderer_target_samples: (a: number) => number;
  readonly renderer_progress: (a: number) => number;
  readonly renderer_width: (a: number) => number;
  readonly renderer_height: (a: number) => number;
  readonly renderer_step_samples: (a: number, b: number) => number;
  readonly renderer_step: (a: number, b: number) => number;
  readonly renderer_frame_rgba: (a: number) => [number, number];
  readonly __wbg_wbg_rayon_poolbuilder_free: (a: number, b: number) => void;
  readonly wbg_rayon_poolbuilder_mainJS: (a: number) => any;
  readonly wbg_rayon_poolbuilder_numThreads: (a: number) => number;
  readonly wbg_rayon_poolbuilder_receiver: (a: number) => number;
  readonly wbg_rayon_poolbuilder_build: (a: number) => void;
  readonly wbg_rayon_start_worker: (a: number) => void;
  readonly initThreadPool: (a: number) => any;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number, c?: number) => void;
  readonly __wbindgen_start: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number }} module - Passing `SyncInitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number } | SyncInitInput, memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number }} module_or_path - Passing `InitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number } | InitInput | Promise<InitInput>, memory?: WebAssembly.Memory): Promise<InitOutput>;
