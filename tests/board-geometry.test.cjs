"use strict";
const assert=require("node:assert/strict");
const board=require("../app/src/main/assets/board-geometry.js");
const cases={standard:[8,8],capablanca:[10,8],janus:[10,8],grand:[10,10],shogi:[9,9],xiangqi:[9,10],janggi:[9,10],minishogi:[5,5],losalamos:[6,6]};
for(const [name,[width,height]] of Object.entries(cases)){
 const shape=board.geometry(name);
 assert.equal(shape.width,width);assert.equal(shape.height,height);
 assert.equal(shape.squares,width*height);
 const indices=new Set();
 for(let rank=0;rank<height;rank++)for(let file=0;file<width;file++){
  const i=board.index(file,rank,shape),coord=board.coordinates(i,shape);
  assert.equal(coord.file,file);assert.equal(coord.rank,rank);
  assert.equal(board.parse(board.algebraic(file,rank,shape),shape),i);
  indices.add(i);
 }
 assert.equal(indices.size,width*height);
 assert.throws(()=>board.index(width,0,shape),RangeError);
 assert.throws(()=>board.index(0,height,shape),RangeError);
 assert.throws(()=>board.coordinates(shape.squares,shape),RangeError);
}
assert.throws(()=>board.geometry("unsupported"),RangeError);
console.log("SchachNova: independent board geometry tests passed");
