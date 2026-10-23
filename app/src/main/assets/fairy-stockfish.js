"use strict";
/* Dedicated worker bootstrap for fairy-stockfish-nnue.wasm@1.1.12.
 * Generated upstream core (fairy-stockfish-core.js), stockfish.wasm and
 * stockfish.worker.js must be present in the same assets directory.
 */
let engine=null;
const pending=[];
let failed=false;
self.onmessage=e=>{
 const cmd=String(e.data||"");
 if(failed){self.postMessage("info string Fairy-Stockfish initialization failed");return;}
 if(engine)engine.postMessage(cmd);
 else pending.push(cmd);
};
(async()=>{
 try{
  importScripts("fairy-stockfish-core.js");
  const factory=self.Stockfish;
  if(typeof factory!=="function")throw Error("Stockfish factory unavailable");
  engine=await factory({locateFile:file=>file});
  if(typeof engine.addMessageListener==="function")engine.addMessageListener(line=>self.postMessage(String(line)));
  else throw Error("Engine does not expose addMessageListener");
  for(const cmd of pending.splice(0))engine.postMessage(cmd);
 }catch(e){
  failed=true;
  self.postMessage("info string Fairy-Stockfish init error: "+String(e?.message||e));
  throw e;
 }
})();
