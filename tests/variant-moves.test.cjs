"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("app/src/main/assets/chess.js","utf8");
const engine=source.slice(0,source.indexOf("let warnedClock=false;"));
assert.ok(engine.length>7000,"Expected chess rules core");
function evaluate(mode,body){
 const context={console};
 vm.runInNewContext(engine+"\nconst variantMode="+JSON.stringify(mode)+";const checksGiven=[0,0];const history=[];\n"+body,context);
}
const empty=()=>Array(128).fill(".");
const base=(board,turn=1,ep=-1)=>({b:board,t:turn,c:0,ep,half:0,full:1});
for(const mode of ["torpedo","berolina","hoppelpoppel"]){
 const b=empty();b[116]="K";b[4]="k";
 if(mode==="torpedo"){
  b[68]="P";const moves=evaluate(mode,`const s=${JSON.stringify(base(b))};const ms=legal(s).filter(m=>m[0]===68);if(!ms.some(m=>m[1]===36))throw Error("Torpedo pawn must double-step from e4");`);
 }else if(mode==="berolina"){
  b[100]="P";b[83]="p";
  evaluate(mode,`const s=${JSON.stringify(base(b))};const ms=legal(s).filter(m=>m[0]===100);if(!ms.some(m=>m[1]===85))throw Error("Berolina pawn must move diagonally");if(!ms.some(m=>m[1]===84))throw Error("Berolina pawn must capture straight");`);
 }else{
  b[90]="B";b[91]="N";
  evaluate(mode,`const s=${JSON.stringify(base(b))};const bm=legal(s).filter(m=>m[0]===90);const nm=legal(s).filter(m=>m[0]===91);if(!bm.some(m=>m[1]===57))throw Error("Hoppel bishop must leap like knight");if(!nm.some(m=>m[1]===74))throw Error("Hoppel knight must slide diagonally");`);
 }
}
console.log("SchachNova: pawn and Hoppel-Poppel move tests passed");
