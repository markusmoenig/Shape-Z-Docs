/* tslint:disable */
/* eslint-disable */
export function compile_check(code: string, width: number, height: number): CompileInfo;
export function compile(code: string): Uint8Array;
export class CompileInfo {
  private constructor();
  free(): void;
  readonly ok: boolean;
  readonly message: string;
}
export class Renderer {
  free(): void;
  constructor(code: string, width: number, height: number);
  set_target_samples(target: number): void;
  current_samples(): number;
  target_samples(): number;
  progress(): number;
  /**
   * Preferred stepping API: add N path-trace samples (SPP)
   */
  step_samples(n: number): boolean;
  /**
   * Fallback name (the playground calls this if `step_samples` is absent)
   */
  step(n: number): boolean;
  /**
   * Returns a displayable RGBA8 buffer (tonemapped + gamma)
   */
  frame_rgba(): Uint8Array;
  readonly width: number;
  readonly height: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_compileinfo_free: (a: number, b: number) => void;
  readonly compileinfo_ok: (a: number) => number;
  readonly compileinfo_message: (a: number) => [number, number];
  readonly compile_check: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_renderer_free: (a: number, b: number) => void;
  readonly renderer_new: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly renderer_set_target_samples: (a: number, b: number) => void;
  readonly renderer_current_samples: (a: number) => number;
  readonly renderer_target_samples: (a: number) => number;
  readonly renderer_progress: (a: number) => number;
  readonly renderer_width: (a: number) => number;
  readonly renderer_height: (a: number) => number;
  readonly renderer_step_samples: (a: number, b: number) => number;
  readonly renderer_step: (a: number, b: number) => number;
  readonly renderer_frame_rgba: (a: number) => [number, number];
  readonly compile: (a: number, b: number) => [number, number, number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
