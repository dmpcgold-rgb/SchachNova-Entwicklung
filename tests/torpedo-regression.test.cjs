"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("app/src/main/assets/chess.js","utf8");
const engine=source.slice(0,source.indexOf("let premove=null"));
assert.ok(engine.length>7000,"Chess engine must be present");
function moves(board,turn,from){
 const state={b:board,t:turn,c:0,ep:-1,half:0,full:1};
 const context={console};
 vm.runInNewContext(engine+'\nconst variantMode="torpedo";const checksGiven=[0,0];const history=[];globalThis.result=legal('+JSON.stringify(state)+').filter(m=>m[0]==='+from+');',context);
 return context.result.map(m=>m[1]);
}
function board(){const b=Array(128).fill(".");b[116]="K";b[4]="k";return b;}
{
 const b=board();b[68]="P";
 assert.ok(moves(b,1,68).includes(36),"White pawn may double-step from e4");
 b[52]="p";
 assert.ok(!moves(b,1,68).includes(36),"Blocked white pawn cannot double-step");
}
{
 const b=board();b[52]="p";
 assert.ok(moves(b,-1,52).includes(84),"Black pawn may double-step from e5");
 b[68]="P";
 assert.ok(!moves(b,-1,52).includes(84),"Blocked black pawn cannot double-step");
}
console.log("Torpedo: both colors and blocked paths verified");
