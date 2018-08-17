const compiler = require('google-closure-compiler-js').compile;
const fs = require('fs');
const source = fs.readFileSync('dist/xstream-store.js', 'utf8');

const compilerFlags = {
  jsCode: [{src: source}],
  languageIn: 'ES5',
  createSourceMap: true,
};

const output = compiler(compilerFlags);
fs.writeFileSync('dist/xstream-store.min.js', output.compiledCode, 'utf8');
fs.writeFileSync('dist/xstream-store.min.js.map', output.sourceMap, 'utf8');
