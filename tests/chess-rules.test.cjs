// Regression tests for SchachNova's real game engine.
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const source=fs.readFileSync("app/src/main/assets/chess.js","utf8");
const engine=source.slice(0,source.indexOf("let history="));
assert(engine.includes("function legal("),"Chess engine boundary missing");
const suite=`
const assert=globalAssert;
const sq=x=>(8-Number(x[1]))*16+"abcdefgh".indexOf(x[0]);
const uci=m=>m&&"abcdefgh"[m[0]&7]+(8-(m[0]>>4))+"abcdefgh"[m[1]&7]+(8-(m[1]>>4))+m[2];
function play(s,move){const m=legal(s).find(x=>uci(x)===move);assert(m,"Expected legal move: "+move);return apply(s,m);}
function position(white,black,turn=1,rights=0,ep=-1){
 const b=Array(128).fill(".");
 for(const [square,piece] of Object.entries({...white,...black}))b[sq(square)]=piece;
 return {b,t:turn,c:rights,ep,half:0,full:1};
}
let s=initial();
assert.equal(legal(s).length,20,"Initial position must have 20 legal moves");
assert.equal(s.b[sq("d1")],"Q");assert.equal(s.b[sq("d8")],"q");
assert(!legal(s).some(m=>uci(m)==="e2e5"),"Illegal pawn move");
s=play(s,"e2e4");assert.equal(s.ep,sq("e3"));s=play(s,"e7e5");
s=play(s,"g1f3");s=play(s,"b8c6");s=play(s,"f1c4");
assert.equal(s.b[sq("c4")],"B");
s=initial();for(const move of ["f2f3","e7e5","g2g4","d8h4"])s=play(s,move);
assert(checked(s),"Fool's mate is check");
assert.equal(legal(s).length,0,"Fool's mate is mate");
s=position({e1:"K",h1:"R"},{e8:"k"},1,1);
assert(legal(s).some(m=>uci(m)==="e1g1"),"Kingside castling legal");
s=play(s,"e1g1");assert.equal(s.b[sq("f1")],"R");
s=position({e1:"K",e5:"P"},{e8:"k",d7:"p"},-1);
s=play(s,"d7d5");assert(legal(s).some(m=>uci(m)==="e5d6"),"En passant legal");
s=play(s,"e5d6");assert.equal(s.b[sq("d5")],".");
s=position({e1:"K",a7:"P"},{e8:"k"},1);
assert(legal(s).some(m=>uci(m)==="a7a8q"),"Promotion to queen legal");
s=play(s,"a7a8n");assert.equal(s.b[sq("a8")],"N");
s=position({a1:"K"},{h8:"k"});
assert(insufficient(s),"Bare kings are insufficient material");
console.log("SchachNova: all 15 chess rule assertions passed");
`;
vm.runInNewContext(engine+"\n"+suite,{globalAssert:assert,console},{timeout:3000});
