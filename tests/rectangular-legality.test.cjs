"use strict";
const assert=require("node:assert/strict");
const rules=require("../app/src/main/assets/rectangular-rules.js");
const geo=require("../app/src/main/assets/board-geometry.js");
for(const name of ["capablanca","janus"]){
 const p=rules.initial(name),shape=geo.geometry(name);
 assert.equal(rules.inCheck(p,true),false);
 assert.equal(rules.inCheck(p,false),false);
 assert.ok(rules.legalMoves(p).length>=20);
 const from=geo.parse("e2",shape),to=geo.parse("e4",shape);
 const move=rules.legalMoves(p).find(m=>m.from===from&&m.to===to);
 assert.ok(move,"Initial double pawn advance");
 const next=rules.apply(p,move);
 assert.equal(next.turn,"b");
 assert.equal(next.board[to],"P");
 assert.equal(next.board[from],".");
 assert.equal(p.board[from],"P","Immutable original position");
}
const p=rules.initial("capablanca"),shape=geo.geometry("capablanca");
p.board.fill(".");
p.board[geo.parse("a1",shape)]="K";
p.board[geo.parse("j8",shape)]="k";
p.board[geo.parse("a8",shape)]="r";
assert.equal(rules.inCheck(p,true),true);
assert.equal(rules.legalMoves(p).some(m=>m.from===geo.parse("a1",shape)&&m.to===geo.parse("a2",shape)),false,"King cannot step into rook attack");
p.board[geo.parse("a8",shape)]=".";
assert.equal(rules.inCheck(p,true),false);
console.log("SchachNova: 10x8 check, legality and state transition tests passed");
