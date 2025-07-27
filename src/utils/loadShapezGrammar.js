// src/utils/loadShapezGrammar.js
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { loadWASM } from 'onigasm';

export async function setupShapezGrammar(monaco, editor) {
  const wasm = await fetch('/onigasm.wasm');
  await loadWASM(await wasm.arrayBuffer());

  monaco.languages.register({ id: 'shpz' });

  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      if (scopeName === 'source.shpz') {
        const text = await fetch('/grammars/shapez.tmLanguage.json').then(r => r.text());
        return { format: 'json', content: text };
      }
      return null;
    },
  });

  const grammars = new Map([['shpz', 'source.shpz']]);

  // Correct signature: (monaco, registry, grammars, editor)
  await wireTmGrammars(monaco, registry, grammars, editor);
}