/* Integration smoke test for the pinned upstream Fairy-Stockfish npm package. */
"use strict";
const path=require("node:path");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const corePath=path.resolve(process.argv[2]||"node_modules/fairy-stockfish-nnue.wasm/stockfish.js");
const factory=require(corePath);
(async()=>{
 const engine=await factory({wasmBinary:fs.readFileSync(path.join(path.dirname(corePath),"stockfish.wasm"))});
 let output=[];
 engine.addMessageListener?.(line=>output.push(String(line)));
 const command=async(value,expected,timeout=30000)=>{
  const from=output.length;
  engine.postMessage(value);
  const until=Date.now()+timeout;
  while(Date.now()<until){
   const found=output.slice(from).find(x=>x.includes(expected));
   if(found)return found;
   await new Promise(resolve=>setTimeout(resolve,50));
  }
  throw Error("UCI timeout: "+value+" => "+expected+"; output="+output.slice(-12).join(" | "));
 };
 await command("uci","uciok");
 await command("isready","readyok");
 for(const variant of ["chess","antichess","atomic","crazyhouse","horde","racingkings","3check","kingofthehill"]){
  engine.postMessage("setoption name UCI_Variant value "+variant);
  await command("isready","readyok");
  engine.postMessage("position startpos");
  const result=await command("go depth 1","bestmove ");
  assert.match(result,/bestmove\s+\S+/);
  console.log(variant+": "+result);
 }
 engine.postMessage("quit");
})().catch(error=>{console.error(error);process.exitCode=1;});
