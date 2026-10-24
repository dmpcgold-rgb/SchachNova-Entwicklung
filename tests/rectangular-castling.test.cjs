"use strict";
const assert=require("node:assert/strict");
const rules=require("../app/src/main/assets/rectangular-rules.js");
const geo=require("../app/src/main/assets/board-geometry.js");
for(const name of ["capablanca","janus"]){
 const shape=geo.geometry(name),p=rules.initial(name),row=7;
 p.board.fill(".");
 p.board[geo.index(5,row,shape)]="K";
 p.board[geo.index(0,row,shape)]="R";
 p.board[geo.index(9,row,shape)]="R";
 p.board[geo.index(5,0,shape)]="k";
 const moves=rules.legalMoves(p);
 for(const toFile of [3,7])assert.ok(moves.some(m=>m.castle&&m.to===geo.index(toFile,row,shape)),name+" castling "+toFile);
 const move=moves.find(m=>m.castle&&m.to===geo.index(7,row,shape));
 const after=rules.apply(p,move);
 assert.equal(after.board[geo.index(7,row,shape)],"K");
 assert.equal(after.board[geo.index(6,row,shape)],"R");
 assert.equal(after.board[geo.index(9,row,shape)],".");
 assert.equal(after.castling.includes("K"),false);
 assert.equal(after.castling.includes("Q"),false);
 const blocked={...p,board:p.board.slice()};
 blocked.board[geo.index(6,0,shape)]="r";
 assert.ok(!rules.legalMoves(blocked).some(m=>m.castle&&m.to===geo.index(7,row,shape)),"Castling through attack forbidden");
}
console.log("SchachNova: 10x8 castling rights and attack path tests passed");
