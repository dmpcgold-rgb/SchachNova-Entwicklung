/* SchachNova offline post-game review: Stockfish evaluates every recorded position. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const coord=i=>"abcdefgh"[i&7]+(8-(i>>4));
const notation=m=>coord(m[0])+coord(m[1])+(m[2]||"");
const review=$("reviewPanel"),launch=$("openReview"),close=$("closeReview"),progress=$("reviewProgress"),summary=$("reviewSummary"),items=$("reviewMoves"),headline=$("reviewHeadline");
let worker=null,positions=[],results=[],index=0,score=null,best="",active=false,token=0;
function fen(s){
 const rows=[];for(let r=0;r<8;r++){let row="",empty=0;for(let c=0;c<8;c++){const p=s.b[r*16+c];if(p===".")empty++;else{if(empty)row+=empty;empty=0;row+=p;}}if(empty)row+=empty;rows.push(row);}
 const castle=(s.c&1?"K":"")+(s.c&2?"Q":"")+(s.c&4?"k":"")+(s.c&8?"q":"");
 return rows.join("/")+" "+(s.t===1?"w":"b")+" "+(castle||"-")+" "+(s.ep>=0?coord(s.ep):"-")+" "+s.half+" "+s.full;
}
function label(loss,book){
 if(book)return ["Eröffnungszug","#b8b8b8"];
 if(loss<15)return ["Bester Zug","#88c85a"];
 if(loss<45)return ["Sehr gut","#82bd67"];
 if(loss<95)return ["Gut","#a5c677"];
 if(loss<170)return ["Ungenauigkeit","#eac34b"];
 if(loss<320)return ["Fehler","#f19a4e"];
 return ["Grober Fehler","#ed6660"];
}
function describe(i,loss,bestMove){
 const actual=notation(movesPlayed[i]),better=bestMove&&bestMove!=="(none)"?bestMove:"";
 if(loss<45)return "Dieser Zug hält die Stellung weitgehend stabil. "+(better&&better!==actual?"Stockfish bevorzugt "+better+"; der Unterschied ist aber klein.":"");
 if(loss<95)return "Es gibt eine etwas genauere Fortsetzung."+(better?" Stockfish empfiehlt "+better+".":"");
 if(loss<170)return "Dieser Zug verschlechtert deine Stellung messbar. Prüfe vor dem Ziehen Drohungen, ungedeckte Figuren und mögliche Schachs."+(better?" Besser war "+better+".":"");
 if(loss<320)return "Hier verliert deine Stellung deutlich an Wert. Suche zuerst nach gegnerischen taktischen Möglichkeiten und prüfe Kandidatenzüge."+(better?" Die Engine bevorzugt "+better+".":"");
 return "Dieser Zug führt zu einem großen Bewertungsverlust. Überprüfe, ob eine Figur hängt, ein Mattangriff entsteht oder eine taktische Kombination möglich ist."+(better?" Stärker war "+better+".":"");
}
function renderReview(){
 items.replaceChildren();let counts={best:0,good:0,inaccurate:0,mistake:0,blunder:0},losses=0;
 for(let i=0;i<movesPlayed.length;i++){
  const before=results[i],after=results[i+1];if(!before||!after)continue;
  const turn=positions[i].t;
  const delta=Math.max(0,Math.round((before.cp-after.cp)*turn));losses+=delta;
  const [name,color]=label(delta,false);
  if(delta<45)counts.best++;else if(delta<95)counts.good++;else if(delta<170)counts.inaccurate++;else if(delta<320)counts.mistake++;else counts.blunder++;
  const row=document.createElement("button");row.className="review-move";row.style.borderLeftColor=color;
  const num=Math.floor(i/2)+1+(i%2?"…":".");
  row.innerHTML="<strong>"+num+" "+notation(movesPlayed[i])+"</strong><span style='color:"+color+"'>"+name+"</span><small>−"+(delta/100).toFixed(2)+" Bauerneinheiten</small>";
  const explanation=document.createElement("p");explanation.textContent=describe(i,delta,before.best);explanation.hidden=true;
  row.append(explanation);row.onclick=()=>{explanation.hidden=!explanation.hidden;viewIndex=i+1;renderBoardSafely();};
  items.append(row);
 }
 const analyzed=items.children.length;
 const avg=analyzed?losses/analyzed:0;
 const accuracy=Math.max(0,Math.min(100,Math.round(100*Math.exp(-avg/240))));
 summary.textContent="Geschätzte Analysequalität: "+accuracy+"/100 · Beste Züge: "+counts.best+" · Gut: "+counts.good+" · Ungenauigkeiten: "+counts.inaccurate+" · Fehler: "+counts.mistake+" · Grobe Fehler: "+counts.blunder;
 headline.textContent="Partieanalyse abgeschlossen";
}
function renderBoardSafely(){if(typeof window.render==="function")window.render();else if(typeof render==="function")render();}
function finish(){active=false;if(worker){worker.terminate();worker=null;}progress.textContent="Alle "+movesPlayed.length+" Züge analysiert. Tippe auf einen Zug für die Erklärung.";renderReview();}
function next(t){
 if(t!==token||!active)return;
 if(index>=positions.length){finish();return;}
 score=null;best="";progress.textContent="Analysiere Stellung "+(index+1)+" von "+positions.length+" …";
 worker.postMessage("position fen "+fen(positions[index]));
 worker.postMessage("go depth 10");
}
function start(){
 if(!history||history.length<2){progress.textContent="Noch keine Züge vorhanden.";return;}
 if(variantMode!=="standard"){progress.textContent="Die Stockfish-Analyse unterstützt derzeit nur klassisches Schach.";return;}
 if(worker)worker.terminate();token++;const t=token;
 positions=history.slice();results=[];index=0;active=true;items.replaceChildren();summary.textContent="";headline.textContent="Stockfish analysiert deine Partie";
 try{worker=new Worker("stockfish-19-lite-single.js");worker.onmessage=e=>{
  if(t!==token||!active)return;const line=String(e.data);
  if(line==="uciok"){worker.postMessage("isready");return;}
  if(line==="readyok"){next(t);return;}
  if(line.startsWith("info ")&&line.includes(" score ")){
   const m=line.match(/score (cp|mate) (-?\d+)/);
   if(m){const v=Number(m[2]);score=(m[1]==="cp"?v:Math.sign(v)*10000)*positions[index].t;}
  }
  if(line.startsWith("bestmove ")){best=line.split(" ")[1];results.push({cp:score===null?(index?results[index-1].cp:0):score,best});index++;next(t);}
 };worker.onerror=()=>{active=false;progress.textContent="Stockfish konnte nicht gestartet werden. Bitte die Offline-Engine prüfen.";};worker.postMessage("uci");}
 catch(e){active=false;progress.textContent="Analyse nicht verfügbar: "+e.message;}
}
launch.onclick=()=>{review.hidden=false;start();};
close.onclick=()=>{review.hidden=true;active=false;token++;if(worker){worker.terminate();worker=null;}};
$("reviewAgain").onclick=start;
$("reviewBack").onclick=()=>{review.hidden=true;active=false;token++;if(worker){worker.terminate();worker=null;}};
})();
