"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const chess=fs.readFileSync("app/src/main/assets/chess.js","utf8");
const start=chess.indexOf("function animateMovedPiece(m)");
const end=chess.indexOf("function choose(i)",start);
assert.ok(start>=0&&end>start,"Move animation implementation must exist");
const animation=chess.slice(start,end);
for(const fragment of [
 'const target=toCell?.querySelector(".piece-img, .blind-disk")',
 'stopPieceAnimation();',
 'position:absolute;inset:0',
 'target.style.visibility="hidden"',
 'target.style.visibility=""',
 'animation.onfinish=cleanup',
 'animation.oncancel=cleanup',
 'setTimeout(cleanup,duration+180)',
 'discRect.width+"px"',
 'discRect.height+"px"',
 'prefers-reduced-motion: reduce'
])assert.ok(animation.includes(fragment),"Animation regression: missing "+fragment);
assert.ok(!animation.includes("board.append(piece)"),"Never add a piece directly to the board grid");
console.log("SchachNova: motion overlay, blind discs and cleanup checks passed");
