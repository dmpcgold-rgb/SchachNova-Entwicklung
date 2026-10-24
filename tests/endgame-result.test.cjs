// Run with: node tests/endgame-result.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app/src/main/assets/training.js'), 'utf8');
const start = source.indexOf('function endgameResult(){');
const end = source.indexOf('\nfunction finishTraining(', start);
assert(start >= 0 && end > start, 'Endgame result function not found');
const expression = source.slice(start, end) + '\nreturn endgameResult();';
function evaluate({moves = [[1,2]], check = false, pieces = ['K','k','Q'], half = 0, turn = 1, kind = 'mate', material = false} = {}) {
 const state = {b: pieces, half, t: turn};
 const active = {data: {kind}};
 return Function('state', 'active', 'legal', 'checked', 'insufficient', expression)(
  state, active, () => moves, () => check, () => material
 );
}
assert.match(evaluate({moves: [], check: true, turn: -1}), /geschafft.*Schwarz ist schachmatt/i);
assert.match(evaluate({moves: [], check: true, turn: 1}), /verloren.*Weiß ist schachmatt/i);
assert.match(evaluate({moves: [], check: false}), /Patt/);
assert.match(evaluate({pieces: ['K','k'], material: true}), /Remis.*unzureichenden Materials/);
assert.match(evaluate({half: 150}), /75-Züge-Regel/);
assert.match(evaluate({kind: 'promotion', pieces: ['K','k']}), /Freibauer ist nicht mehr vorhanden/);
assert.match(evaluate({kind: 'promotion', pieces: ['K','k','Q']}), /Geschafft/);
assert.equal(evaluate(), '');
console.log('8 endgame result checks passed');
