"use strict";
/* Browser test suite: invoke window.runSchachNovaVariantTests() in WebView devtools. */
window.runSchachNovaVariantTests=function(){
 const original=variantMode,results=[];
 const check=(name,condition)=>{results.push({name,pass:!!condition});if(!condition)console.error("SchachNova variant test failed:",name);};
 const idx=s=>(8-Number(s[1]))*16+"abcdefgh".indexOf(s[0]);
 const position=(pieces,t=1)=>{const s=initial();s.b.fill(".");for(const [square,piece] of Object.entries(pieces))s.b[idx(square)]=piece;s.t=t;s.c=0;s.ep=-1;return s;};
 try{
  variantMode="standard";check("Standard start: 20 legal moves",legal(initial()).length===20);
  variantMode="antichess";check("Antichess start: 20 legal moves",legal(initial()).length===20);
  const forced=position({e1:"K",e8:"k",a1:"R",a8:"r"});
  const forcedMoves=legal(forced);check("Antichess mandatory capture",forcedMoves.length===1&&forcedMoves[0][0]===idx("a1")&&forcedMoves[0][1]===idx("a8"));
  check("Antichess kings can be captured",legal(position({e1:"K",e2:"k"})).some(m=>m[1]===idx("e2")));
  check("Antichess castling disabled",!legal(initial()).some(m=>m[3]==="castle"));
  variantMode="standard";check("Standard cannot capture king",!pseudo(position({e1:"K",e2:"k"})).some(m=>m[1]===idx("e2")));
 }finally{variantMode=original;}
 return {passed:results.filter(x=>x.pass).length,total:results.length,results};
};
