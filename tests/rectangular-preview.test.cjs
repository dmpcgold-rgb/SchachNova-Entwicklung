"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const html=fs.readFileSync("app/src/main/assets/index.html","utf8");
const js=fs.readFileSync("app/src/main/assets/rectangular-preview.js","utf8");
for(const name of ["capablanca","janus"]){
 assert.match(html,new RegExp('data-rect-preview="'+name+'"'));
 assert.match(js,new RegExp('rules.initial\\(name\\)'));
}
for(const script of ["board-geometry.js","rectangular-rules.js","rectangular-preview.js"])assert.ok(html.includes('<script src="'+script+'"></script>'));
assert.ok(html.indexOf('src="board-geometry.js"')<html.indexOf('src="rectangular-rules.js"'));
assert.ok(html.indexOf('src="rectangular-rules.js"')<html.indexOf('src="rectangular-preview.js"'));
assert.match(html,/rectPreview\x22 class=\x22rect-preview-panel\x22 hidden/);
assert.match(js,/board.replaceChildren\(fragment\)/);
for(const id of ["rectPreviewUndo","rectPreviewFlip","rectPreviewRestart"])assert.ok(html.includes('id="'+id+'"'));
assert.match(js,/rules.legalMoves\(position\)/);
assert.match(js,/rules.apply\(position,move\)/);
assert.doesNotMatch(js,/\b(?:localStorage|sessionStorage)\b/);
console.log("SchachNova: 10x8 preview integration tests passed");
