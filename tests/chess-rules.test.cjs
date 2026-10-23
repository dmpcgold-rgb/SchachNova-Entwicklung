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
s=position({e1:"K",c1:"B"},{e8:"k",c8:"b"});assert(!insufficient(s),"Opposite-color bishops can permit mate with cooperation");
s=position({e1:"K",b1:"N"},{e8:"k",g8:"n"});assert(!insufficient(s),"Knight versus knight is not automatically dead");
s=position({e1:"K",c1:"B"},{e8:"k",c8:"b"});assert(!insufficient(s),"Bishops on opposite colors are not dead");
s=position({e1:"K",c1:"B"},{e8:"k",f8:"b"});assert(insufficient(s),"Bishops on same square color are dead");
s=initial();assert.equal(key(s),key({...s,ep:sq("e3")}),"Uncapturable en-passant target does not alter repetition identity");
// Antichess: compulsory capture, no check restriction, no castling, king promotion.
variantMode="antichess";
s=position({e1:"K",e4:"P"},{e8:"k",d5:"p"},1);
assert(legal(s).length>0);
assert(legal(s).every(m=>uci(m)==="e4d5"),"Antichess must force captures");
s=play(s,"e4d5");assert.equal(s.b[sq("d5")],"P");
s=position({e1:"K",h1:"R"},{e8:"k",e2:"r"},1,1);
assert(!legal(s).some(m=>uci(m)==="e1g1"),"No castling in antichess");
assert(legal(s).some(m=>uci(m)==="e1e2"),"Kings can be captured in antichess");
s=position({e1:"K",a7:"P"},{e8:"k"},1);
assert(legal(s).some(m=>uci(m)==="a7a8k"),"Antichess permits king promotion");
s=play(s,"a7a8k");assert.equal(s.b[sq("a8")],"K");
s=position({e1:"K",e5:"P"},{e8:"k",d7:"p"},-1);
s=play(s,"d7d5");
assert(legal(s).some(m=>uci(m)==="e5d6"),"Antichess en passant must be available");
assert(legal(s).every(m=>uci(m)==="e5d6"),"En passant capture must be compulsory");
variantMode="atomic";
s=position({e1:"K",d4:"R",c3:"B",e3:"P"},{e8:"k",d5:"n",c5:"r",e5:"p"},1);
s=play(s,"d4d5");
assert.equal(s.b[sq("d5")],".","Capturing piece explodes");
assert.equal(s.b[sq("c5")],".","Adjacent non-pawn explodes");
assert.equal(s.b[sq("e5")],"p","Adjacent pawn survives");
assert.equal(s.b[sq("c3")],"B","Distant bishop survives");
s=position({e4:"K",d4:"R"},{e8:"k",d5:"p"},1);
assert(!legal(s).some(m=>uci(m)==="d4d5"),"Self-explosion near king is illegal");
s=position({e1:"K",e2:"R"},{e8:"k",e7:"r"},1);
assert(!legal(s).some(m=>uci(m)==="e1e2"),"Atomic king cannot capture own piece");
s=position({e1:"K",e7:"R"},{e8:"k"},1);
assert(legal(s).some(m=>uci(m)==="e7e8"),"Atomic rook can capture enemy king");
s=play(s,"e7e8");
assert(!s.b.includes("k"),"Atomic king capture ends with king removed");
// Atomic en passant: the landing square is the blast centre.
s=position({a1:"K",e5:"P",c6:"B"},{h8:"k",d7:"p",e6:"n"},-1);
s=play(s,"d7d5");
assert(legal(s).some(m=>uci(m)==="e5d6"),"Atomic en passant capture is legal");
s=play(s,"e5d6");
assert.equal(s.b[sq("d6")],".","En passant capturing pawn explodes");
assert.equal(s.b[sq("d5")],".","En passant captured pawn removed");
assert.equal(s.b[sq("e6")],".","Adjacent knight explodes");
assert.equal(s.b[sq("c6")],".","Adjacent bishop explodes");
s=position({c5:"K",e5:"P"},{h8:"k",d7:"p"},-1);
s=play(s,"d7d5");
assert(!legal(s).some(m=>uci(m)==="e5d6"),"Atomic en passant cannot explode own king");
// Atomic: capturing a neighbour of the king is a win, even when the king is not on the target.
s=position({a1:"K",d7:"R"},{e8:"k",d8:"r"},1);
assert(legal(s).some(m=>uci(m)==="d7d8"),"Explosion of adjacent king must be a legal winning move");
s=play(s,"d7d8");
assert.equal(s.b[sq("e8")],".","Adjacent king must explode");
assert.equal(s.b[sq("d8")],".","Capturer must also explode");
// A capture is forbidden if the blast removes both kings.
s=position({d6:"K",d4:"R"},{e6:"k",d5:"p"},1);
assert(!legal(s).some(m=>uci(m)==="d4d5"),"Capture exploding both kings is illegal");
// Atomic castling: a king may not pass through an explosion-threatened square.
s=position({e1:"K",h1:"R"},{a8:"k"},1,1);
assert(legal(s).some(m=>uci(m)==="e1g1"),"Safe atomic kingside castling is allowed");
s=position({e1:"K",h1:"R",g2:"P"},{a8:"k",g8:"r"},1,1);
assert(!legal(s).some(m=>uci(m)==="e1g1"),"Atomic castling cannot finish beside a capturable pawn");
s=position({e1:"K",h1:"R",f2:"P"},{a8:"k",f8:"r"},1,1);
assert(!legal(s).some(m=>uci(m)==="e1g1"),"Atomic castling cannot pass through an explosion threat");
// An en-passant threat only exists when its capturing side has the move.
s=position({c4:"K",d4:"P"},{h8:"k",e4:"p"},1);
s.ep=sq("d3");
assert(!atomicKingThreat(s,1),"Opponent cannot capture en passant when not to move");
s={...s,t:-1};
assert(atomicKingThreat(s,1),"En passant blast threatens adjacent king on capturer's turn");
// Adjacent kings are permitted in atomic chess; kings may not capture.
s=position({e4:"K"},{e5:"k"},1);
assert(legal(s).some(m=>uci(m)==="e4d4"),"Adjacent atomic kings do not create conventional check");
assert(!legal(s).some(m=>uci(m)==="e4e5"),"Atomic kings may not capture each other");
// En passant: the captured pawn is removed, but adjacent pawns survive the blast.
s=position({a1:"K",e5:"P",c6:"P"},{h8:"k",d7:"p",e6:"p"},-1);
s=play(s,"d7d5");
s=play(s,"e5d6");
assert.equal(s.b[sq("c6")],"P","Adjacent white pawn survives atomic en passant");
assert.equal(s.b[sq("e6")],"p","Adjacent black pawn survives atomic en passant");
// Atomic promotions: a quiet promotion survives, a capturing promotion explodes.
s=position({a1:"K",g7:"P"},{a8:"k"},1);
s=play(s,"g7g8q");
assert.equal(s.b[sq("g8")],"Q","Quiet atomic promotion keeps promoted piece");
s=position({a1:"K",g7:"P"},{a8:"k",h8:"r"},1);
s=play(s,"g7h8q");
assert.equal(s.b[sq("h8")],".","Capturing atomic promotion explodes promoted piece");
// Atomic queenside castling: rook lands on d1, king on c1.
s=position({e1:"K",a1:"R"},{h8:"k"},1,2);
assert(legal(s).some(m=>uci(m)==="e1c1"),"Safe atomic queenside castling is legal");
s=play(s,"e1c1");
assert.equal(s.b[sq("c1")],"K","Atomic queenside king destination");
assert.equal(s.b[sq("d1")],"R","Atomic queenside rook destination");
// En passant threat geometry is symmetric for both colours.
s=position({c5:"K",d5:"P"},{h8:"k",e5:"p"},1,0,sq("d6"));
assert(atomicKingThreat(s,-1)===false,"Black king is not threatened by white en passant far away");
s=position({h1:"K",e5:"P"},{c6:"k",d5:"p"},1,0,sq("d6"));
assert(atomicKingThreat(s,-1),"White en passant explosion threatens black king on c6");
s={...s,t:-1};
assert(!atomicKingThreat(s,-1),"White en passant is not available on black's turn");
// Atomic king safety: a quiet king move into an explosion radius is illegal.
s=position({e1:"K",f2:"P"},{a8:"k",f8:"r"},1);
assert(!legal(s).some(m=>uci(m)==="e1f1"),"King cannot step beside a capturable pawn");
// Atomic king safety: an attacker cannot threaten via a capture exploding its own king.
s=position({a1:"K",b2:"P"},{c3:"k",b8:"r"},1);
assert(!atomicKingThreat(s,1),"A blast that also destroys the attacking king is not a legal threat");
// Atomic black en passant: captured white pawn lies behind landing square.
s=position({c4:"K",d4:"P"},{h8:"k",e4:"p"},-1,0,sq("d3"));
assert(atomicKingThreat(s,1),"Black en passant explosion threatens white king on c4");
s={...s,t:1};
assert(!atomicKingThreat(s,1),"Black en passant is unavailable on white's turn");
// A stale en-passant square without a capturable pawn must not create a false threat.
s=position({c4:"K"},{h8:"k",e4:"p"},-1,0,sq("d3"));
assert(!atomicKingThreat(s,1),"No en passant threat without the captured pawn");
// An enemy king in the blast radius makes the attacking capture illegal.
s=position({c4:"K",d4:"P"},{c2:"k",e4:"p"},-1,0,sq("d3"));
assert(!atomicKingThreat(s,1),"En passant cannot explode both kings");
variantMode="standard";
console.log("SchachNova: chess rule regression assertions passed");
`;
vm.runInNewContext(engine+"\n"+suite,{globalAssert:assert,console},{timeout:3000});
