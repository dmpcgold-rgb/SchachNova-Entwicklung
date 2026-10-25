"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const html=fs.readFileSync("app/src/main/assets/index.html","utf8");
const js=fs.readFileSync("app/src/main/assets/rectangular-preview.js","utf8");
const css=fs.readFileSync("app/src/main/assets/schachnova-theme.css","utf8");
for(const name of ["game-mode-navigation.js","android-back-navigation.js"]){assert.ok(html.includes('<script src="'+name+'"></script>'));assert.ok(fs.readFileSync("app/src/main/assets/"+name,"utf8").length>100);}
assert.match(fs.readFileSync("app/src/main/assets/game-mode-navigation.js","utf8"),/function chooseMode\(value\)/);
assert.match(fs.readFileSync("app/src/main/assets/android-back-navigation.js","utf8"),/window.schachNovaGoBack=function/);
for(const name of ["appearance-preferences.js","piece-appearance.js"]){assert.ok(html.includes('<script src="'+name+'"></script>'));assert.ok(fs.readFileSync("app/src/main/assets/"+name,"utf8").length>100);}
assert.ok(html.indexOf('src="appearance-preferences.js"')<html.indexOf('src="piece-appearance.js"'));
assert.match(html,/<link rel="stylesheet" href="schachnova-theme.css">/);
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
assert.match(js,/if\(motion&&motion.to===idx\)square.classList.add\("rect-preview-motion-target"\)/);
assert.match(css,/\.rect-preview-motion-target>\.rect-piece-svg\{visibility:hidden\}/);
assert.match(js,/function clearMotion\(\)/);
assert.match(js,/motion.animation=animation/);
const classic=fs.readFileSync("app/src/main/assets/chess.js","utf8");
assert.match(classic,/function stopPieceAnimation\(\)/);
assert.match(classic,/if\(reducedMotion\)\{overlay.remove\(\);target.style.visibility="";return;\}/);
assert.match(classic,/setTimeout\(cleanup,duration\+180\)/);
assert.match(js,/clearMotion\(\);flipped=!flipped;render\(\)/);
assert.match(js,/const moving=document.createElement\("div"\)/);
assert.match(js,/moving.className="rect-preview-piece-motion"/);
assert.doesNotMatch(js,/origin.cloneNode\(true\)/);
assert.match(css,/\.rect-preview-piece-motion\{[^}]*background:transparent!important/);
assert.match(js,/rect-compound-svg/);
assert.match(js,/parts=piece.toUpperCase\(\)==="C"\?\["R","N"\]:\["B","N"\]/);
assert.match(css,/\.rect-preview-motion-target \.rect-compound-svg\{visibility:hidden\}/);
assert.match(js,/origin.querySelector\("\.rect-piece-svg, \.rect-compound-svg"\)/);
assert.match(js,/moving.append\(pieceNode.cloneNode\(true\)\)/);
assert.match(css,/\.rect-preview-piece-motion>\.rect-compound-svg/);
console.log("SchachNova: 8x8 and 10x8 piece-only animation and cleanup tests passed");
