"use strict";
const assert=require("node:assert/strict");
const rules=require("../app/src/main/assets/rectangular-rules.js");
const geo=require("../app/src/main/assets/board-geometry.js");
for(const name of ["capablanca","janus"]){
 const shape=geo.geometry(name),p=rules.initial(name);
 const from=geo.parse("e2",shape),to=geo.parse("e4",shape);
 const m=rules.legalMoves(p).find(m=>m.from===from&&m.to===to);
 assert.ok(m);
 const next=rules.apply(p,m);
 assert.equal(next.enPassant,geo.parse("e3",shape));
 const board=Array(shape.squares).fill(".");
 board[geo.parse("a1",shape)]="K";board[geo.parse("j8",shape)]="k";
 board[geo.parse("e5",shape)]="P";board[geo.parse("d5",shape)]="p";
 const ep={...p,board,turn:"w",enPassant:geo.parse("d6",shape)};
 const move=rules.legalMoves(ep).find(m=>m.from===geo.parse("e5",shape)&&m.to===geo.parse("d6",shape)&&m.enPassant);
 assert.ok(move,"En passant should be legal");
 const result=rules.apply(ep,move);
 assert.equal(result.board[geo.parse("d5",shape)],".");
 assert.equal(result.board[geo.parse("d6",shape)],"P");
 board[geo.parse("e7",shape)]="P";board[geo.parse("e5",shape)]=".";board[geo.parse("d5",shape)]=".";
 const promotion={...p,board,turn:"w",enPassant:null};
 const options=rules.legalMoves(promotion).filter(m=>m.from===geo.parse("e7",shape)&&m.to===geo.parse("e8",shape));
 assert.deepEqual(options.map(m=>m.promotion).sort(),["a","b","c","n","q","r"]);
 const archbishop=rules.apply(promotion,options.find(m=>m.promotion==="a"));
 assert.equal(archbishop.board[geo.parse("e8",shape)],"A");
}
console.log("SchachNova: 10x8 en passant and promotion tests passed");
