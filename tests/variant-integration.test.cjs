// Verify the Atomschach UI, game restoration and variant configuration stay aligned.
const fs=require("node:fs");
const assert=require("node:assert/strict");
const html=fs.readFileSync("app/src/main/assets/index.html","utf8");
const chess=fs.readFileSync("app/src/main/assets/chess.js","utf8");
const config=fs.readFileSync("app/src/main/assets/variant-config.js","utf8");
const bridge=fs.readFileSync("app/src/main/assets/stockfish-bridge.js","utf8");
assert.match(html,/<option value="atomic">Atomschach \(lokal, 2 Spieler\)<\/option>/,"Atomschach must be selectable");
assert.match(html,/\['atomic','antichess'\]\.includes\(variantSelectEl\.value\)/,"Unsupported variant bots must be blocked");
assert.match(html,/variantVsBotEl\.disabled=true/,"Unsupported variant bot checkbox must be disabled");
assert.match(chess,/\["standard","hill","threecheck","antichess","atomic"\]\.includes\(d\.variantMode\)/,"Atomic save restore must be allowed");
assert.match(chess,/\["standard","hill","threecheck","antichess","atomic"\]\.includes\(v\)/,"Atomic mode setter must be allowed");
assert.match(chess,/if\(variantMode==="atomic"\)\{const outcome=status\(\)/,"Finished atomic game must restore its result");
assert.match(config,/atomic:\{label:"Atomschach",uci:"atomic",local:true,bot:false\}/,"Atomic must be local-only without bot");
assert.match(bridge,/SchachNovaVariants\?\.\[variantMode\]\?\.bot===false/,"Engine bridge must enforce unsupported variant bots");
assert.match(bridge,/if\(variantMode!=="standard"\)\{setInfo\("Stockfish-Analyse für diese Variante noch nicht freigegeben"\)/,"Standard Stockfish analysis must reject variants");
assert.match(bridge,/coachEnabled&&variantMode==="standard"/,"Standard Stockfish coach must not analyze special variants");
const fairy=fs.readFileSync("app/src/main/assets/fairy-bridge.js","utf8");
assert.match(fairy,/ready=false;awaitingReady=true;for\(const cmd/,"Fairy must await variant configuration");
assert.match(bridge,/fairy\.configure\(variantMode\);fairyVariant=variantMode;return;/,"Variant search must wait for readyok");
assert.match(fairy,/for\(const cmd of window\.schachNovaVariantUciOptions\(name\)\)post\(cmd\);post\("isready"\);/,"Fairy must explicitly request readyok after variant options");
assert.match(fairy,/const completed=request;request=null;if\(completed&&uciMove\(move\)\)notify\("bestmove"/,"Fairy request must be cleared before notifying listeners");
assert.match(bridge,/catch\(e\)\{fairyRequested=false;setInfo\("Fairy-Stockfish-Start fehlgeschlagen:/,"Fairy startup failure must permit retry");
assert.match(bridge,/if\(event.type==="error"\)\{fairyReady=false;fairyVariant=null;/,"Fairy errors must invalidate variant state");
assert.match(fairy,/worker.onerror=e=>\{const failed=worker;worker=null;/,"Fairy worker errors must release failed worker");
assert.match(fairy,/failed\.terminate\(\)/,"Failed Fairy worker must be terminated");
assert.match(bridge,/worker.onerror=\(\)=>\{const failed=worker;worker=null;/,"Classical Stockfish must release failed worker");
assert.match(bridge,/botPosition=movesPlayed\.map\(notation\)\.join\(" "\)/,"Classical bot must snapshot position");
assert.match(bridge,/if\(expected!==movesPlayed\.map\(notation\)\.join\(" "\)\)return;/,"Classical bot must reject stale result");
assert.match(fairy,/catch\(e\)\{if\(worker\)\{try\{worker\.terminate\(\);\}/,"Fairy startup exception must terminate worker");
console.log("SchachNova: variant integration assertions passed");


const vm=require("node:vm");
const catalog=fs.readFileSync("app/src/main/assets/variant-catalog.js","utf8");
const review=fs.readFileSync("app/src/main/assets/game-review.js","utf8");
const context={window:{}};
vm.runInNewContext(catalog,context);
vm.runInNewContext(config,context);
const all=context.window.SchachNovaAllVariantStatuses();
const documented=context.window.SchachNovaVariantCatalog;
assert.equal(documented.length,30,"All 30 documented variants must remain available in the catalog");
for(const item of documented){
 const status=context.window.SchachNovaVariantStatus(item.id);
 assert.equal(status.documented,true,item.id+" must remain documented");
 assert.equal(status.analysisEligible,Boolean(status.localRules&&status.engineConfigured),item.id+" cannot be marked ready without rules and engine");
}
for(const id of ["standard","hill","threecheck","fivecheck","antichess","atomic"]){
 assert.equal(context.window.SchachNovaVariantStatus(id).analysisEligible,true,id+" must have a local rules/engine configuration");
}
for(const id of ["shogi","xiangqi","janggi","capablanca","crazyhouse","horde","racingkings"]){
 assert.equal(context.window.SchachNovaVariantStatus(id).analysisEligible,false,id+" must not be presented as fully playable yet");
}
assert.ok(all.length>=30,"Status API must cover the complete catalog");
assert.match(review,/SchachNovaVariantStatus\?\.\(variantMode\)\?\.analysisEligible/,"Review must check variant capability before analysis");
assert.match(review,/variant\?"fairy-stockfish\.js":"stockfish-19-lite-single\.js"/,"Review must select Fairy engine for supported variants");
assert.match(review,/Fairy-Stockfish init error/,"Review must surface missing engine assets");
console.log("SchachNova: all documented variant statuses and analysis routing checked");
