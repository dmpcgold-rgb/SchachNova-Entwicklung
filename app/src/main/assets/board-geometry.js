"use strict";
/* Independent geometry for future non-8x8 variants.
 * Do not change chess.js 0x88 board indexing or the existing 8x8 UI.
 * A variant must be explicitly activated only after rules, rendering,
 * serialization and regression tests have been implemented. */
(function(root){
 const SIZES=Object.freeze({
  standard:[8,8],capablanca:[10,8],janus:[10,8],
  grand:[10,10],shogi:[9,9],xiangqi:[9,10],janggi:[9,10],
  minishogi:[5,5],losalamos:[6,6]
 });
 function geometry(name){
  const size=SIZES[name];
  if(!size)throw new RangeError("Unbekannte Brettgeometrie: "+name);
  const [width,height]=size;
  return Object.freeze({width,height,squares:width*height});
 }
 function index(file,rank,shape){
  if(!Number.isInteger(file)||!Number.isInteger(rank)||file<0||rank<0||file>=shape.width||rank>=shape.height)throw new RangeError("Feld außerhalb des Bretts");
  return rank*shape.width+file;
 }
 function coordinates(square,shape){
  if(!Number.isInteger(square)||square<0||square>=shape.squares)throw new RangeError("Ungültiger Feldindex");
  return Object.freeze({file:square%shape.width,rank:Math.floor(square/shape.width)});
 }
 function algebraic(file,rank,shape){
  index(file,rank,shape);
  if(file>=26)throw new RangeError("Brettbreite wird nicht unterstützt");
  return String.fromCharCode(97+file)+String(shape.height-rank);
 }
 function parse(square,shape){
  const match=/^([a-z])([1-9][0-9]*)$/.exec(square);
  if(!match)throw new RangeError("Ungültige Feldbezeichnung");
  const file=match[1].charCodeAt(0)-97,rank=shape.height-Number(match[2]);
  return index(file,rank,shape);
 }
 const api=Object.freeze({geometry,index,coordinates,algebraic,parse});
 root.SchachNovaBoardGeometry=api;
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
