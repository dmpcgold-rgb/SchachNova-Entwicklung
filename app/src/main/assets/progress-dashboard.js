/* SchachNova local performance dashboard: no server or online rating claims. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const archiveKey="schachnova.completed.v1",progressKey="schachnova.progress.v1";
function read(key){try{const a=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(a)?a:[]}catch(_){return []}}
function show(){
 const panel=$("progressDashboard"),out=$("progressDashboardContent"),summary=$("progressDashboardSummary");if(!panel)return;
 const games=read(archiveKey),reviews=read(progressKey).sort((a,b)=>a.timestamp-b.timestamp);
 const analyzed=reviews.filter(r=>Number.isFinite(r.white)||Number.isFinite(r.black));
 summary.textContent=games.length+" gespeicherte Partien · "+analyzed.length+" ausgewertete Analysen · rein lokale Trainingsstatistik (keine offizielle Elo).";
 out.replaceChildren();
 if(!analyzed.length){out.textContent="Noch keine abgeschlossenen Stockfish-Analysen gespeichert. Analysiere eine Partie, um deine Entwicklung zu sehen.";panel.hidden=false;panel.scrollIntoView({behavior:"smooth"});return;}
 const recent=analyzed.slice(-20);
 const white=recent.filter(x=>Number.isFinite(x.white)),black=recent.filter(x=>Number.isFinite(x.black));
 const avg=a=>a.length?Math.round(a.reduce((n,x)=>n+x,0)/a.length):null;
 const p=document.createElement("p");p.textContent="Letzte "+recent.length+" Analysen · Weiß: "+(avg(white.map(x=>x.white))??"–")+"/100 · Schwarz: "+(avg(black.map(x=>x.black))??"–")+"/100";out.append(p);
 const ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox","0 0 600 190");svg.style.cssText="width:100%;max-height:220px;background:#162922;border-radius:12px";
 for(const [field,color] of [["white","#e6f2df"],["black","#f7ae66"]]){
  const line=document.createElementNS(ns,"polyline");line.setAttribute("fill","none");line.setAttribute("stroke",color);line.setAttribute("stroke-width","3");
  line.setAttribute("points",recent.map((r,i)=>Number.isFinite(r[field])?(25+i*550/Math.max(1,recent.length-1))+","+(165-r[field]*1.4):null).filter(Boolean).join(" "));svg.append(line);
 }
 out.append(svg);
 const legend=document.createElement("p");legend.textContent="Helle Linie: Weiß · Orange Linie: Schwarz · 0–100: geschätzte Analysequalität";out.append(legend);
 const errors=document.createElement("p");errors.textContent="Ungenauigkeiten und Fehler in den letzten Analysen: "+recent.reduce((n,r)=>n+(r.errors||0),0);out.append(errors);
 panel.hidden=false;panel.scrollIntoView({behavior:"smooth"});
}
window.schachnovaRecordReview=function(data){
 try{const entries=read(progressKey),id=data.id;if(entries.some(x=>x.id===id))return;entries.push({...data,timestamp:Date.now()});localStorage.setItem(progressKey,JSON.stringify(entries.slice(-300)));}catch(e){console.warn("Fortschritt nicht gespeichert",e);}
};
$("progressDashboardOpen")?.addEventListener("click",show);
$("progressDashboardClose")?.addEventListener("click",()=>{$("progressDashboard").hidden=true;});
})();