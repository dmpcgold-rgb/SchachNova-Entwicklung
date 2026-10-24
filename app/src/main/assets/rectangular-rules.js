"use strict";
/* Standalone rectangular chess-variant foundation.
 * Deliberately independent of the existing 0x88 8x8 engine.
 * No mode is unlocked until its complete rule set is verified. */
(function(root){
 const geometry=(typeof require==="function"&&typeof module!=="undefined")?require("./board-geometry.js"):root.SchachNovaBoardGeometry;
 if(!geometry)throw Error("board-geometry.js must load first");
 const layouts=Object.freeze({
  capablanca:{width:10,height:8,back:"RNBAQKCBNR",pawnRank:1},
  janus:{width:10,height:8,back:"RNBJQKJBNR",pawnRank:1}
 });
 const pieceMoves=Object.freeze({
  n:Object.freeze([[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]),
  b:Object.freeze([[1,1],[-1,1],[1,-1],[-1,-1]]),
  r:Object.freeze([[1,0],[-1,0],[0,1],[0,-1]]),
  k:Object.freeze([[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]])
 });
 const upper=x=>x===x.toUpperCase();
 const inside=(x,y,s)=>x>=0&&x<s.width&&y>=0&&y<s.height;
 function initial(name){
  const layout=layouts[name];
  if(!layout)throw new RangeError("Unbekannte Anfangsstellung");
  const shape=geometry.geometry(name),board=Array(shape.squares).fill(".");
  for(let x=0;x<shape.width;x++){
   board[geometry.index(x,0,shape)]=layout.back[x].toLowerCase();
   board[geometry.index(x,1,shape)]="p";
   board[geometry.index(x,shape.height-2,shape)]="P";
   board[geometry.index(x,shape.height-1,shape)]=layout.back[x];
  }
  return {variant:name,width:shape.width,height:shape.height,board,turn:"w",castling:"",enPassant:null,halfmove:0,fullmove:1};
 }
 function movesFrom(position,from){
  const shape=geometry.geometry(position.variant);
  if(!Array.isArray(position.board)||position.board.length!==shape.squares)throw Error("Ungültiges Brett");
  const p=position.board[from];if(!p||p===".")return [];
  const own=upper(p),x=from%shape.width,y=Math.floor(from/shape.width),type=p.toLowerCase(),out=[];
  const add=(nx,ny)=>{if(!inside(nx,ny,shape))return false;const to=geometry.index(nx,ny,shape),other=position.board[to];if(other!=="."&&upper(other)===own)return false;if(other.toLowerCase()==="k")return false;out.push({from,to,capture:other!=="."});return other==="."};
  if(type==="p"){
   const d=own?-1:1,ny=y+d;
   if(inside(x,ny,shape)&&position.board[geometry.index(x,ny,shape)]==="."){
    add(x,ny);
    const home=own?shape.height-2:1;
    if(y===home&&inside(x,y+2*d,shape)&&position.board[geometry.index(x,y+2*d,shape)]===".")add(x,y+2*d);
   }
   for(const dx of [-1,1])if(inside(x+dx,ny,shape)){
    const to=geometry.index(x+dx,ny,shape),target=position.board[to];
    if(target!=="."&&upper(target)!==own&&target.toLowerCase()!=="k")out.push({from,to,capture:true});
   }
   return out;
  }
  const directions=type==="q"?[...pieceMoves.b,...pieceMoves.r]:type==="a"?[...pieceMoves.b,...pieceMoves.n]:type==="c"?[...pieceMoves.r,...pieceMoves.n]:type==="j"?[...pieceMoves.b,...pieceMoves.n]:pieceMoves[type];
  if(!directions)throw Error("Unbekannte Figur: "+p);
  for(const [dx,dy] of directions){
   const jumping=type==="n"||((type==="a"||type==="c"||type==="j")&&pieceMoves.n.some(([nx,ny])=>nx===dx&&ny===dy));
   let nx=x+dx,ny=y+dy;
   while(inside(nx,ny,shape)){
    if(!add(nx,ny))break;
    if(jumping||type==="k")break;
    nx+=dx;ny+=dy;
   }
  }
  return out;
 }
 const api=Object.freeze({initial,movesFrom,layouts});
 root.SchachNovaRectangularRules=api;
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
