---
sidebar_position: 6
title: Internals
---

**Shape-Z** has a manual parser which writes out an AST. The AST in turn compiles the code into a recursive byte code VM. The VM is about 15% slower than native rust code.

This is partly thanks to the fact that we only have one internal data type: `vec3`, so each operation (like a `cos`) is always executed on all 3 components. Which is fine on native as it is SIMD anyway, but it is one of the reasons the WASM code on this website is slower (because no SIMD support for WASM yet).

The VM compiles the voxels into a voxel grid which are path traced via an DDA algorithm.

I choose a CPU architecture over a GPU one because of

* The recursive nature of the language.
* The more flexible access to large chunks of memory, in my tests I rendered 30-40 gigabyte of voxels without problems.
