const fs = require('fs').promises;
const path = require('path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await walk(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || (fullPath.endsWith('.ts') && !fullPath.endsWith('.d.ts')))) {
      const code = await fs.readFile(fullPath, 'utf8');
      const result = ts.transpileModule(code, {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactNative,
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ESNext,
          importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
          allowJs: true,
          noEmitHelpers: true,
          noLib: true,
        },
        fileName: fullPath,
      });
      const outPath = fullPath.slice(0, fullPath.endsWith('.tsx') ? -4 : -3) + (fullPath.endsWith('.tsx') ? '.jsx' : '.js');
      await fs.writeFile(outPath, result.outputText, 'utf8');
      await fs.unlink(fullPath);
      console.log('converted', fullPath, '->', outPath);
    }
  }
}

walk(root).catch((err) => {
  console.error(err);
  process.exit(1);
});
