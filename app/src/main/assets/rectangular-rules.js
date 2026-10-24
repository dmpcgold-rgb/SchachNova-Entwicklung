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
  return {variant:name,width:shape.width,height:shape.height,board,turn:"w",castling:"KQkq",enPassant:null,halfmove:0,fullmove:1};
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
    else if(target==="."&&position.enPassant===to){const captured=geometry.index(x+dx,y,shape);if(position.board[captured]===(own?"p":"P"))out.push({from,to,capture:true,enPassant:true});}
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
 function attacked(position,square,byWhite){
  const shape=geometry.geometry(position.variant);
  const board=position.board;
  const targetX=square%shape.width,targetY=Math.floor(square/shape.width);
  for(let from=0;from<board.length;from++){
   const piece=board[from];if(piece==="."||upper(piece)!==byWhite)continue;
   const x=from%shape.width,y=Math.floor(from/shape.width),type=piece.toLowerCase();
   if(type==="p"){if(targetY===y+(byWhite?-1:1)&&Math.abs(targetX-x)===1)return true;continue;}
   const dirs=type==="q"?[...pieceMoves.b,...pieceMoves.r]:type==="a"||type==="j"?[...pieceMoves.b,...pieceMoves.n]:type==="c"?[...pieceMoves.r,...pieceMoves.n]:pieceMoves[type];
   if(!dirs)throw Error("Unbekannte Figur");
   for(const [dx,dy] of dirs){
    const jump=type==="n"||((type==="a"||type==="j"||type==="c")&&pieceMoves.n.some(([a,b])=>a===dx&&b===dy));
    let nx=x+dx,ny=y+dy;
    while(inside(nx,ny,shape)){
     const at=geometry.index(nx,ny,shape);
     if(at===square)return true;
     if(board[at]!=="."||jump||type==="k")break;
     nx+=dx;ny+=dy;
    }
   }
  }
  return false;
 }
 function inCheck(position,white){
  const king=position.board.indexOf(white?"K":"k");
  if(king<0)throw Error("König fehlt");
  return attacked(position,king,!white);
 }
 function apply(position,move){
  const shape=geometry.geometry(position.variant);
  const board=position.board.slice(),piece=board[move.from];
  if(!piece||piece===".")throw Error("Ungültiger Ausgangspunkt");
  const capture=board[move.to];
  if(move.castle){if(piece.toLowerCase()!=="k"||board[move.rookFrom]!==(upper(piece)?"R":"r"))throw Error("Ungültige Rochade");board[move.rookTo]=board[move.rookFrom];board[move.rookFrom]=".";}
  if(move.enPassant){const taken=move.to+(upper(piece)?shape.width:-shape.width);if(board[taken]!==(upper(piece)?"p":"P"))throw Error("Ungültiges En passant");board[taken]=".";}
  board[move.from]=".";
  const rank=Math.floor(move.to/shape.width),promotion=piece.toLowerCase()==="p"&&(rank===0||rank===shape.height-1);
  const promoteTo=move.promotion||"q";
  if(promotion&&!["q","r","b","n","a","c"].includes(promoteTo))throw Error("Ungültige Umwandlung");
  board[move.to]=promotion?(upper(piece)?promoteTo.toUpperCase():promoteTo):piece;
  const doubleStep=piece.toLowerCase()==="p"&&Math.abs(move.to-move.from)===2*shape.width;
  const enPassant=doubleStep?(move.to+move.from)/2:null;
  let castling=position.castling;
  if(piece==="K")castling=castling.replace(/[KQ]/g,"");
  if(piece==="k")castling=castling.replace(/[kq]/g,"");
  const rights=[["R",shape.height-1,shape.width-1,"K"],["R",shape.height-1,0,"Q"],["r",0,shape.width-1,"k"],["r",0,0,"q"]];
  for(const [r,rank,file,right] of rights){const sq=geometry.index(file,rank,shape);if((move.from===sq&&piece===r)||(move.to===sq&&capture===r))castling=castling.replace(right,"");}
  return {...position,board,castling,turn:position.turn==="w"?"b":"w",enPassant,
   halfmove:piece.toLowerCase()==="p"||capture!=="."||move.enPassant?0:position.halfmove+1,
   fullmove:position.fullmove+(position.turn==="b"?1:0)};
 }
 function legalMoves(position){
  const white=position.turn==="w",out=[];
  for(let from=0;from<position.board.length;from++){
   const piece=position.board[from];
   if(piece==="."||upper(piece)!==white)continue;
   for(const move of movesFrom(position,from)){
    if(!inCheck(apply(position,move),white))out.push(...promotions(position,move));
   }
  }
  return out.concat(castleMoves(position));
 }
 function castleMoves(position){
  const shape=geometry.geometry(position.variant),white=position.turn==="w",row=white?shape.height-1:0;
  const king=geometry.index(5,row,shape),piece=white?"K":"k",rook=white?"R":"r";
  if(position.board[king]!==piece||inCheck(position,white))return [];
  const results=[];
  for(const [right,rookFile,direction] of [[white?"K":"k",shape.width-1,1],[white?"Q":"q",0,-1]]){
   if(!position.castling.includes(right))continue;
   const rookSquare=geometry.index(rookFile,row,shape);
   if(position.board[rookSquare]!==rook)continue;
   const kingTarget=geometry.index(5+2*direction,row,shape),rookTarget=geometry.index(5+direction,row,shape);
   let clear=true;
   for(let file=Math.min(5,rookFile)+1;file<Math.max(5,rookFile);file++)if(position.board[geometry.index(file,row,shape)]!=="."){clear=false;break;}
   if(!clear)continue;
   for(const file of [5+direction,5+2*direction])if(attacked(position,geometry.index(file,row,shape),!white)){clear=false;break;}
   if(clear)results.push({from:king,to:kingTarget,castle:true,rookFrom:rookSquare,rookTo:rookTarget});
  }
  return results;
 }
 function promotions(position,move){
  const shape=geometry.geometry(position.variant),piece=position.board[move.from];
  const rank=Math.floor(move.to/shape.width);
  if(!piece||piece.toLowerCase()!=="p"||(rank!==0&&rank!==shape.height-1))return [move];
  return ["q","r","b","n","a","c"].map(promotion=>({...move,promotion}));
 }
 function status(position){
  const white=position.turn==="w",moves=legalMoves(position);
  if(moves.length)return {ended:false,check:inCheck(position,white),legalMoves:moves.length};
  return {ended:true,result:inCheck(position,white)?"checkmate":"stalemate",winner:inCheck(position,white)?(white?"b":"w"):null};
 }
 const api=Object.freeze({initial,movesFrom,attacked,inCheck,apply,legalMoves,promotions,status,layouts});
 root.SchachNovaRectangularRules=api;
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
