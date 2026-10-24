"use strict";
/* Isolated preview: never modifies the classic board or game state. */
(function(){
 const rules=window.SchachNovaRectangularRules,geo=window.SchachNovaBoardGeometry;
 if(!rules||!geo)return;
 function openPreview(name){
  const dialog=document.getElementById("rectPreview"),board=document.getElementById("rectPreviewBoard");
  const title=document.getElementById("rectPreviewTitle"),caption=document.getElementById("rectPreviewCaption");
  if(!dialog||!board)return;
  const state=rules.initial(name),shape=geo.geometry(name);
  title.textContent=name==="capablanca"?"Capablanca-Schach":"Janus-Schach";
  caption.textContent="10 × 8 · Vorschau der Anfangsstellung · noch nicht spielbar";
  board.style.gridTemplateColumns="repeat("+shape.width+",minmax(0,1fr))";
  board.style.aspectRatio=shape.width+"/"+shape.height;
  board.replaceChildren();
  const glyphs={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",A:"♗♘",C:"♖♘",J:"♗♘",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟",a:"♝♞",c:"♜♞",j:"♝♞"};
  for(let y=0;y<shape.height;y++)for(let x=0;x<shape.width;x++){
   const square=document.createElement("div"),piece=state.board[geo.index(x,y,shape)];
   square.className="rect-preview-square "+((x+y)%2?"rect-preview-dark":"rect-preview-light");
   square.textContent=glyphs[piece]||"";
   square.title=geo.algebraic(x,y,shape)+(piece==="."?"":": "+piece);
   square.setAttribute("aria-label",square.title);
   if(piece.toLowerCase()==="a"||piece.toLowerCase()==="c"||piece.toLowerCase()==="j")square.classList.add("rect-preview-compound");
   board.append(square);
  }
  dialog.hidden=false;
  document.getElementById("rectPreviewClose")?.focus();
 }
 document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-rect-preview]").forEach(btn=>btn.addEventListener("click",()=>openPreview(btn.dataset.rectPreview)));
  document.getElementById("rectPreviewClose")?.addEventListener("click",()=>document.getElementById("rectPreview").hidden=true);
 });
})();
