/* SchachNova offline post-game review: Stockfish evaluates every recorded position. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const coord=i=>"abcdefgh"[i&7]+(8-(i>>4));
const notation=m=>coord(m[0])+coord(m[1])+(m[2]||"");
const review=$("reviewPanel"),launch=$("openReview"),close=$("closeReview"),progress=$("reviewProgress"),summary=$("reviewSummary"),items=$("reviewMoves"),headline=$("reviewHeadline");
let worker=null,positions=[],results=[],index=0,score=null,best="",active=false,token=0,reviewAt=0,playTimer=null,analysisKey="",engineDepth=0,principal=[],training=null,previewState=null,previewMove=null,lineTimer=null;
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
function drawReviewBoard(previous=-1){
 const board=$("reviewBoard");if(!board||!positions.length)return;
 const state=previewState||positions[reviewAt];if(!state)return;
 board.replaceChildren();
 const move=previewMove||(reviewAt>0?movesPlayed[reviewAt-1]:null);
 for(let j=0;j<64;j++){
  const i=(j>>3)*16+(j&7),p=state.b[i],cell=document.createElement("div");
  cell.className="review-square "+(((j>>3)+(j&7))%2?"review-dark":"review-light");
  if(move&&(i===move[0]||i===move[1]))cell.classList.add("review-highlight");
  if(p!=="."){const img=document.createElement("img");img.src="pieces/"+(p===p.toUpperCase()?"w":"b")+p.toUpperCase()+".svg";img.alt="";img.className="review-piece";cell.append(img);}
  if(training&&training.square===i){cell.style.outline="3px solid #ffda65";cell.style.outlineOffset="-3px";}
  cell.onclick=()=>trainingClick(i);board.append(cell);
 }
 if(previous>=0&&reviewAt===previous+1&&move){
  const from=(move[0]>>4)*8+(move[0]&7),to=(move[1]>>4)*8+(move[1]&7);
  const img=board.children[to]?.querySelector("img");
  if(img){const dx=((from%8)-(to%8))*100,dy=(Math.floor(from/8)-Math.floor(to/8))*100;
   img.animate([{transform:"translate("+dx+"%, "+dy+"%)"},{transform:"translate(0,0)"}],{duration:360,easing:"cubic-bezier(.2,.75,.25,1)"});}
 }
 $("reviewStep").textContent=reviewAt+" / "+movesPlayed.length;
 const i=reviewAt-1, before=results[i],after=results[i+1];
 let message="Wähle einen Zug oder starte die animierte Wiedergabe.";
 if(i>=0){const loss=before&&after&&Number.isFinite(before.cp)&&Number.isFinite(after.cp)?Math.max(0,Math.round((before.cp-after.cp)*positions[i].t)):null;
 message=loss===null?"Zug "+notation(movesPlayed[i])+" – Engine-Auswertung läuft.":label(loss,false)[0]+": "+notation(movesPlayed[i])+". "+describe(i,loss,before.best);}
 const level=$("coachDetail")?.value||"normal";
 if(level==="basic"&&i>=0&&before&&after&&Number.isFinite(before.cp)&&Number.isFinite(after.cp)){const loss=Math.max(0,Math.round((before.cp-after.cp)*positions[i].t));message=loss<95?"Gut gespielt. Achte weiter auf sichere Figuren.":"Hier lohnt es sich, nach einem besseren Zug zu suchen.";}
 if(level==="advanced"&&i>=0&&before){message+=" Engine-Empfehlung (UCI): "+(before.best||"nicht verfügbar")+".";}
 $("reviewCoachText").textContent=message;
 $("reviewPrevious").disabled=reviewAt===0;
 $("reviewNext").disabled=reviewAt>=movesPlayed.length;
}
function selectReview(n){stopLine();const previous=reviewAt;reviewAt=Math.max(0,Math.min(movesPlayed.length,n));previewState=null;previewMove=null;training=null;drawReviewBoard(previous);}
function uciLegal(s,u){if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u))return null;return legal(s).find(m=>notation(m)===u)||null;}
function stopLine(){if(lineTimer){clearTimeout(lineTimer);lineTimer=null;}}
function trainingClick(i){
 if(!training)return;
 if(training.square===null){if(training.state.b[i]!=="."&&((training.state.b[i]===training.state.b[i].toUpperCase())===(training.state.t===1))){training.square=i;drawReviewBoard();}return;}
 const attempt=coord(training.square)+coord(i),expected=training.expected;
 const valid=legal(training.state).some(m=>notation(m).slice(0,4)===attempt);if(!valid){$("reviewExerciseStatus").textContent="Dieser Zug ist nicht erlaubt.";training.square=null;drawReviewBoard();return;}
 if(attempt===expected.slice(0,4)){ $("reviewExerciseStatus").textContent="✓ Richtig! "+expected+" ist die Engine-Empfehlung.";training=null;previewState=null;previewMove=null;drawReviewBoard();return;}
 $("reviewExerciseStatus").textContent="Noch nicht richtig. Suche den stärksten Zug.";training.square=null;drawReviewBoard();
}
function beginTraining(){
 stopReplay();const i=reviewAt-1;
 if(i<0||!results[i]?.best||results[i].best==="(none)"){ $("reviewExerciseStatus").textContent="Wähle zuerst einen ausgewerteten Zug.";return;}
 training={state:positions[i],expected:results[i].best,square:null};previewState=positions[i];previewMove=null;drawReviewBoard();
 $("reviewExerciseStatus").textContent="Trainingsaufgabe: Du bist "+(positions[i].t===1?"Weiß":"Schwarz")+". Finde einen besseren Zug. Tippe zuerst auf eine Figur, dann auf ihr Zielfeld.";
}
function playBestLine(){
 stopReplay();stopLine();const i=reviewAt-1;
 if(i<0||!results[i]?.best||results[i].best==="(none)"){$("reviewExerciseStatus").textContent="Für diesen Zug liegt keine Engine-Empfehlung vor.";return;}
 const sequence=results[i].pv?.length?results[i].pv:[results[i].best];
 let state=positions[i],step=0;training=null;
 function advance(){
  if(step>=sequence.length){lineTimer=null;$("reviewExerciseStatus").textContent="Stockfish-Variante beendet ("+step+" Halbzüge).";return;}
  const u=sequence[step],m=uciLegal(state,u);
  if(!m){lineTimer=null;$("reviewExerciseStatus").textContent="Variante nach "+step+" Zügen beendet: nicht legaler Engine-Zug.";return;}
  state=apply(state,m);previewState=state;previewMove=m;drawReviewBoard();
  const from=(m[0]>>4)*8+(m[0]&7),to=(m[1]>>4)*8+(m[1]&7),img=$("reviewBoard").children[to]?.querySelector("img");
  if(img?.animate){const width=$("reviewBoard").children[to].getBoundingClientRect().width;img.animate([{transform:"translate("+((from%8)-(to%8))*width+"px,"+(Math.floor(from/8)-Math.floor(to/8))*width+"px)"},{transform:"translate(0,0)"}],{duration:330,easing:"ease-out"});}
  step++;$("reviewExerciseStatus").textContent="Stockfish-Variante: "+step+" / "+sequence.length+" · "+u;
  lineTimer=setTimeout(advance,Math.max(450,Number($("reviewSpeed")?.value||900)));
 }
 advance();
}
function stopReplay(){stopLine();if(playTimer){clearInterval(playTimer);playTimer=null;}const b=$("reviewPlay");if(b)b.textContent="▶ Abspielen";}
function renderReview(){
 items.replaceChildren();let counts={best:0,good:0,inaccurate:0,mistake:0,blunder:0},losses=0;
 for(let i=0;i<movesPlayed.length;i++){
  const before=results[i],after=results[i+1];if(!before||!after||!Number.isFinite(before.cp)||!Number.isFinite(after.cp))continue;
  const turn=positions[i].t;
  const delta=Math.max(0,Math.round((before.cp-after.cp)*turn));losses+=delta;
  const [name,color]=label(delta,false);
  if(delta<45)counts.best++;else if(delta<95)counts.good++;else if(delta<170)counts.inaccurate++;else if(delta<320)counts.mistake++;else counts.blunder++;
  const row=document.createElement("button");row.className="review-move";row.style.borderLeftColor=color;
  const num=Math.floor(i/2)+1+(i%2?"…":".");
  row.innerHTML="<strong>"+num+" "+notation(movesPlayed[i])+"</strong><span style='color:"+color+"'>"+name+"</span><small>−"+(delta/100).toFixed(2)+" Bauerneinheiten</small>";
  const explanation=document.createElement("p");explanation.textContent=describe(i,delta,before.best);explanation.hidden=true;
  row.append(explanation);row.onclick=()=>{explanation.hidden=!explanation.hidden;selectReview(i+1);review.scrollTo({top:0,behavior:"smooth"});};
  items.append(row);
 }
 const analyzed=items.children.length;
 const avg=analyzed?losses/analyzed:0;
 const accuracy=Math.max(0,Math.min(100,Math.round(100*Math.exp(-avg/240))));
 summary.textContent="Geschätzte Analysequalität: "+accuracy+"/100 · Beste Züge: "+counts.best+" · Gut: "+counts.good+" · Ungenauigkeiten: "+counts.inaccurate+" · Fehler: "+counts.mistake+" · Grobe Fehler: "+counts.blunder;
 headline.textContent="Partieanalyse abgeschlossen";
}

function renderOverview(){
 const stats=[{},{}],losses=[[],[]],labels=["Bester Zug","Sehr gut","Gut","Ungenauigkeit","Fehler","Grober Fehler"];
 for(let i=0;i<movesPlayed.length;i++){if(!results[i]||!results[i+1])continue;
  const who=i%2,loss=Math.max(0,Math.round((results[i].cp-results[i+1].cp)*positions[i].t));
  const name=label(loss,false)[0];stats[who][name]=(stats[who][name]||0)+1;losses[who].push(loss);
 }
 const accuracy=losses.map(a=>a.length?Math.round(100*Math.exp(-a.reduce((x,y)=>x+y,0)/a.length/240)):null);
 $("overviewAccuracy").innerHTML=accuracy.map((v,i)=>"<div>"+(i?"Schwarz":"Weiß")+"<strong style='display:block'>"+(v===null?"–":v+"/100")+"</strong></div>").join("");
 const table=$("overviewStats");table.replaceChildren();
 for(const labelName of labels){const name=document.createElement("span");name.textContent=labelName;table.append(name);
  for(let k=0;k<2;k++){const v=document.createElement("span");v.className="stat-value";v.textContent=String(stats[k][labelName]||0);table.append(v);}
 }
 const chart=$("overviewChart");chart.replaceChildren();
 const values=results.map(r=>Math.max(-1000,Math.min(1000,r.cp??0))),w=600,h=110;
 if(values.length>1){const ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");
 const poly=document.createElementNS(ns,"polyline");poly.setAttribute("fill","none");poly.setAttribute("stroke","#d7edcb");poly.setAttribute("stroke-width","3");
 poly.setAttribute("points",values.map((v,i)=>(i/(values.length-1)*w).toFixed(1)+","+(h/2-v/1000*(h/2-8)).toFixed(1)).join(" "));svg.setAttribute("viewBox","0 0 600 110");svg.append(poly);chart.append(svg);}
 $("overviewProgress").textContent="Alle "+movesPlayed.length+" Halbzüge ausgewertet.";
 $("overviewCoach").textContent="Die Analyse ist bereit. Sieh dir an, welche Züge gut waren und wo du dich verbessern kannst.";
 $("overviewStart").disabled=false;
}
function finish(){try{localStorage.setItem("schachnova.review.v3."+analysisKey,JSON.stringify({results,version:3}));}catch(e){console.warn("Analyse-Cache nicht gespeichert",e);}active=false;if(worker){worker.terminate();worker=null;}progress.textContent="Alle "+movesPlayed.length+" Züge analysiert. Tippe auf einen Zug für die Erklärung.";renderReview();drawReviewBoard();renderOverview();}
function next(t){
 if(t!==token||!active)return;
 if(index>=positions.length){finish();return;}
 score=null;best="";principal=[];engineDepth=0;progress.textContent="Analysiere Stellung "+(index+1)+" von "+positions.length+" …";$("overviewProgress").textContent=progress.textContent;
 worker.postMessage("position fen "+fen(positions[index]));
 worker.postMessage("go depth 10");
}
function start(){
 if(!history||history.length<2){progress.textContent="Noch keine Züge vorhanden.";return;}
 if(variantMode!=="standard"){progress.textContent="Die Stockfish-Analyse unterstützt derzeit nur klassisches Schach.";return;}
 if(worker)worker.terminate();token++;const t=token;
 positions=history.slice();results=[];index=0;reviewAt=0;active=true;drawReviewBoard();items.replaceChildren();summary.textContent="";headline.textContent="Stockfish analysiert deine Partie";
 analysisKey=movesPlayed.map(notation).join("_");
 try{const cached=JSON.parse(localStorage.getItem("schachnova.review.v3."+analysisKey)||"null");
 if(cached?.version===3&&Array.isArray(cached.results)&&cached.results.length===positions.length&&cached.results.every(r=>r.cp===null||Number.isFinite(r.cp))){results=cached.results;active=false;progress.textContent="Gespeicherte Analyse geladen.";renderReview();drawReviewBoard();renderOverview();return;}}catch(e){console.warn("Analyse-Cache beschädigt",e);}
 
 try{worker=new Worker("stockfish-19-lite-single.js");worker.onmessage=e=>{
  if(t!==token||!active)return;const line=String(e.data);
  if(line==="uciok"){worker.postMessage("isready");return;}
  if(line==="readyok"){next(t);return;}
  if(line.startsWith("info ")&&line.includes(" score ")){
   const m=line.match(/score (cp|mate) (-?\d+)/);
   if(m){const depth=Number(line.match(/\bdepth (\d+)/)?.[1]||0);if(depth>=engineDepth&&!/\bmultipv [2-9]/.test(line)){engineDepth=depth;principal=(line.match(/\bpv ([a-h][1-8][a-h][1-8][qrbn]?(?:\s+[a-h][1-8][a-h][1-8][qrbn]?)*)/)?.[1]||"").split(/\s+/).filter(Boolean);const v=Number(m[2]);score=(m[1]==="cp"?v:Math.sign(v)*10000)*positions[index].t;}}
  }
  if(line.startsWith("bestmove ")){best=line.split(" ")[1];results.push({cp:score===null?null:score,best,pv:principal.slice(),depth:engineDepth});index++;next(t);}
 };worker.onerror=()=>{active=false;progress.textContent="Stockfish konnte nicht gestartet werden. Bitte die Offline-Engine prüfen.";};worker.postMessage("uci");}
 catch(e){active=false;progress.textContent="Analyse nicht verfügbar: "+e.message;}
}
launch.onclick=()=>{stopReplay();review.hidden=true;$("reviewOverview").hidden=false;$("overviewStart").disabled=true;$("overviewProgress").textContent="Stockfish analysiert deine Partie …";$("overviewResult").textContent=ended||"Partierückblick";start();};
$("overviewStart").onclick=()=>{$("reviewOverview").hidden=true;review.hidden=false;selectReview(0);};
$("overviewClose").onclick=()=>{$("reviewOverview").hidden=true;active=false;token++;if(worker){worker.terminate();worker=null;}};
close.onclick=()=>{stopReplay();review.hidden=true;active=false;token++;if(worker){worker.terminate();worker=null;}};
$("reviewAgain").onclick=start;
$("reviewBack").onclick=()=>{stopReplay();review.hidden=true;active=false;token++;if(worker){worker.terminate();worker=null;}};
$("reviewPrevious").onclick=()=>{stopReplay();selectReview(reviewAt-1)};
$("reviewNext").onclick=()=>{stopReplay();selectReview(reviewAt+1)};
$("reviewPlay").onclick=()=>{if(playTimer){stopReplay();return;}if(reviewAt>=movesPlayed.length)selectReview(0);$("reviewPlay").textContent="⏸ Pause";playTimer=setInterval(()=>{if(reviewAt>=movesPlayed.length){stopReplay();return;}selectReview(reviewAt+1);},Number($("reviewSpeed")?.value||900));};
$("reviewBestLine")?.addEventListener("click",playBestLine);
$("reviewRetry")?.addEventListener("click",beginTraining);
$("reviewTraining")?.addEventListener("click",()=>{const i=results.findIndex((r,j)=>j<movesPlayed.length&&results[j+1]&&Number.isFinite(r.cp)&&Number.isFinite(results[j+1].cp)&&((r.cp-results[j+1].cp)*positions[j].t)>170&&r.best&&r.best!=="(none)");if(i<0){$("reviewExerciseStatus").textContent="Keine geeignete Fehleraufgabe gefunden.";return;}selectReview(i+1);beginTraining();});
$("reviewSpeed")?.addEventListener("change",()=>{if(playTimer){stopReplay();$("reviewPlay").click();}});
$("coachDetail")?.addEventListener("change",()=>drawReviewBoard());
$("coachSpeak")?.addEventListener("click",()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance($("reviewCoachText").textContent);speech.lang="de-DE";speech.rate=.95;window.speechSynthesis.speak(speech);});
$("overviewChart")?.addEventListener("click",e=>{if(!results.length)return;const rect=e.currentTarget.getBoundingClientRect(),fraction=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));$("overviewStart").click();selectReview(Math.round(fraction*movesPlayed.length));});
})();
