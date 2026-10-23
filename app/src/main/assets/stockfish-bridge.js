/* Offline UCI bridge for Stockfish 19 Lite. The bundled engine is GPL-3.0. */
(function(){
"use strict";
let worker=null,ready=false,busy=false,mode="human",strength=12,pending=null,coachEnabled=false,lastScore=null;
const info=document.getElementById("engineInfo"),bot=document.getElementById("botMode"),level=document.getElementById("botLevel"),analysis=document.getElementById("analyzeButton");
const notation=m=>"abcdefgh"[m[0]&7]+(8-(m[0]>>4))+"abcdefgh"[m[1]&7]+(8-(m[1]>>4))+(m[2]||"");
const setInfo=t=>{if(info)info.textContent=t;};
function startEngine(){
 if(worker)return;
 try{
   worker=new Worker("stockfish-19-lite-single.js");
   worker.onmessage=e=>{const line=String(e.data);if(line==="uciok"){worker.postMessage("isready");}
     if(line==="readyok"){ready=true;setInfo("Stockfish 19 bereit · offline");maybePlay();}
     if(line.startsWith("info depth")&&line.includes(" score ")){const m=line.match(/score (cp|mate) (-?\d+)/);if(m){lastScore=m[1]==="cp"?(Number(m[2])/100).toFixed(2):"Matt in "+m[2];if(pending==="analysis")setInfo("Analyse · "+lastScore); }}
     if(line.startsWith("bestmove ")){busy=false;const u=line.split(" ")[1];if(pending==="bot"){pending=null;const match=legal(current()).find(m=>notation(m)===u);if(match&&current().t===-1&&!ended&&viewIndex===history.length-1)move(match);}else{pending=null;setInfo("Stockfish empfiehlt: "+u+(lastScore!==null?" · Bewertung "+lastScore:""));} }
   };
   worker.onerror=()=>{ready=false;busy=false;setInfo("Engine konnte nicht geladen werden");};
   worker.postMessage("uci");
 }catch(e){setInfo("Engine-Start fehlgeschlagen: "+e.message);}
}
function sendPosition(){worker.postMessage("position startpos moves "+movesPlayed.slice(0,viewIndex).map(notation).join(" "));}
function maybePlay(){if(!ready||busy||mode!=="bot"||current().t!==-1||ended||viewIndex!==history.length-1)return;
 busy=true;pending="bot";worker.postMessage("setoption name Skill Level value "+strength);sendPosition();worker.postMessage("go movetime 450");}
bot.addEventListener("change",()=>{mode=bot.value;if(mode!=="human")startEngine();setInfo(mode==="human"?"Zwei Spieler · lokal":"Stockfish wird vorbereitet …");maybePlay();});
try{const saved=localStorage.getItem("schachnova.botStrength");if(saved!==null&&[...level.options].some(o=>o.value===saved))level.value=saved;}catch(e){}strength=Number(level.value);
level.addEventListener("change",()=>{strength=Number(level.value);try{localStorage.setItem("schachnova.botStrength",level.value);}catch(e){}setInfo("Bot-Stärke eingestellt: "+level.selectedOptions[0].textContent);if(worker&&ready&&!busy)worker.postMessage("setoption name Skill Level value "+strength);});
analysis.addEventListener("click",()=>{startEngine();if(!ready||busy){setInfo("Engine lädt oder ist beschäftigt");return;}busy=true;pending="analysis";sendPosition();worker.postMessage("go movetime 1100");setInfo("Stockfish analysiert …");});
const baseMove=move;move=function(m){baseMove(m);if(coachEnabled&&mode==="human"&&ready&&!busy){busy=true;pending="analysis";lastScore=null;sendPosition();worker.postMessage("go movetime 800");}maybePlay();};
const coachButton=document.getElementById("coachButton");coachButton.onclick=()=>{coachEnabled=!coachEnabled;coachButton.textContent=coachEnabled?"🟢 Coach an":"🔇 Coach";if(coachEnabled){startEngine();setInfo("Coach aktiv: Stellung nach jedem Zug analysieren");}else setInfo("Coach deaktiviert");};
const baseNew=document.getElementById("newGame").onclick;document.getElementById("newGame").onclick=()=>{if(worker)worker.postMessage("stop");busy=false;pending=null;baseNew();maybePlay();};
})();
