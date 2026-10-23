// Verify the Atomschach UI, game restoration and variant configuration stay aligned.
const fs=require("node:fs");
const assert=require("node:assert/strict");
const html=fs.readFileSync("app/src/main/assets/index.html","utf8");
const chess=fs.readFileSync("app/src/main/assets/chess.js","utf8");
const config=fs.readFileSync("app/src/main/assets/variant-config.js","utf8");
assert.match(html,/<option value="atomic">Atomschach \(lokal, 2 Spieler\)<\/option>/,"Atomschach must be selectable");
assert.match(html,/\['atomic','antichess'\]\.includes\(variantSelectEl\.value\)/,"Unsupported variant bots must be blocked");
assert.match(html,/variantVsBotEl\.disabled=true/,"Unsupported variant bot checkbox must be disabled");
assert.match(chess,/\["standard","hill","threecheck","antichess","atomic"\]\.includes\(d\.variantMode\)/,"Atomic save restore must be allowed");
assert.match(chess,/\["standard","hill","threecheck","antichess","atomic"\]\.includes\(v\)/,"Atomic mode setter must be allowed");
assert.match(chess,/if\(variantMode==="atomic"\)\{const outcome=status\(\)/,"Finished atomic game must restore its result");
assert.match(config,/atomic:\{label:"Atomschach",uci:"atomic",local:true,bot:false\}/,"Atomic must be local-only without bot");
console.log("SchachNova: variant integration assertions passed");
