/* SchachNova: local finished-game archive and delayed results. */
(function(){
"use strict";
const key="schachnova.completed.v1", $=id=>document.getElementById(id);
let pending=null;
function read(){try{const v=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(v)?v:[]}catch(_){return []}}
function save(v){try{localStorage.setItem(key,JSON.stringify(v.slice(0,300)))}catch(e){console.warn("Archiv voll",e)}}
function showArchive(){
 const panel=$("archivePanel"),list=$("archiveList");if(!panel||!list)return;
 list.replaceChildren();const games=read();
 if(!games.length){list.textContent="Noch keine abgeschlossenen Partien gespeichert.";panel.hidden=false;return}
 games.forEach(g=>{
  const row=document.createElement("button");row.className="archive-entry";
  row.textContent=new Date(g.timestamp).toLocaleString("de-AT")+" · "+(g.variant==="standard"?"Klassisch":g.variant)+" · "+g.message+" · "+g.moves.length+" Halbzüge";
  row.onclick=()=>{try{
   if(!Array.isArray(g.positions)||!g.positions.length)throw Error("Zugdaten fehlen");
   history=g.positions;movesPlayed=g.moves;viewIndex=history.length-1;variantMode=g.variant||"standard";running=false;ended=g.message;
   $("archivePanel").hidden=true;$("homeScreen").hidden=true;$("gameScreen").hidden=false;
   render();$("openReview").click();
  }catch(e){alert("Partie kann nicht geöffnet werden: "+e.message)}};
  list.append(row);
 });
 panel.hidden=false;
}
window.addEventListener("schachnova:finished",e=>{
 const g=e.detail;if(!g||!g.moves?.length)return;
 const games=read(),id=JSON.stringify(g.moves)+"|"+g.timestamp;
 if(!games.some(x=>x.id===id)){games.unshift({...g,id});save(games)}
 clearTimeout(pending);
 pending=setTimeout(()=>{if(!$("gameScreen").hidden&&$("resultDialog").hidden){$("resultMessage").textContent=g.message;$("resultDialog").hidden=false}},4000);
});
document.addEventListener("DOMContentLoaded",()=>{
 const btn=$("archiveOpen"),back=$("archiveClose");
 if(btn)btn.onclick=showArchive;
 if(back)back.onclick=()=>{$("archivePanel").hidden=true};
 $("newGame")?.addEventListener("click",()=>clearTimeout(pending));
 $("backHome")?.addEventListener("click",()=>clearTimeout(pending));
});
})();
