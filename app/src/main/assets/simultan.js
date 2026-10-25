/* SchachNova Simultan: 5–20 independent standard-chess boards against configurable bots. */
(function(){
"use strict";
const $=id=>document.getElementById(id),panel=$("simultanPanel"),count=$("simultanCount"),strength=$("simultanStrength"),grid=$("simultanGrid"),board=$("simultanBoard"),info=$("simultanInfo");
if(!panel||!count||!strength||!grid||!board)return;
let games=[],active=0,selected=-1,epoch=0,timers=new Set(),switchTimer=null,viewGeneration=0;
function cancelSwitch(){viewGeneration++;if(switchTimer!==null){clearTimeout(switchTimer);switchTimer=null;}}
function showBoard(i){cancelSwitch();active=(i+games.length)%games.length;selected=-1;draw();}
function autoNext(g,delay=2000){if(panel.hidden||games[active]!==g)return;const generation=viewGeneration;switchTimer=setTimeout(()=>{switchTimer=null;if(generation!==viewGeneration||panel.hidden||games[active]!==g)return;const next=(active+1)%games.length;if(next!==active)showBoard(next);},delay);}
function animateMove(g,m){
 if(panel.hidden||games[active]!==g)return;
 const from=board.querySelector('[data-square="'+m[0]+'"]'),to=board.querySelector('[data-square="'+m[1]+'"]');
 if(!from||!to)return;
 const piece=to.querySelector("img");if(!piece)return;
 const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
 // The destination already contains the moved piece; animate that actual SVG
 // from its source coordinates, without ever showing two copies.
 const dx=a.left-b.left,dy=a.top-b.top;
 if(!piece.animate)return;
 const animation=piece.animate([{transform:"translate("+dx+"px,"+dy+"px)"},{transform:"translate(0px,0px)"}],
  {duration:650,easing:"cubic-bezier(.2,.65,.25,1)"});
 animation.onfinish=()=>{piece.style.transform="";};
}

const files="abcdefgh",notation=m=>files[m[0]&7]+(8-(m[0]>>4))+files[m[1]&7]+(8-(m[1]>>4))+(m[2]||"");
const fresh=()=>({history:[initial()],moves:[],strength:Math.floor(Math.random()*21),humanColor:Math.random()<.5?1:-1,finished:"",thinking:false});
const state=g=>g.history[g.history.length-1];
function legalStandard(s){const saved=variantMode;try{variantMode="standard";return legal(s);}finally{variantMode=saved;}}
function applyStandard(s,m){const saved=variantMode;try{variantMode="standard";return apply(s,m);}finally{variantMode=saved;}}
function checkStandard(s){const saved=variantMode;try{variantMode="standard";return checked(s);}finally{variantMode=saved;}}
function status(g){const s=state(g),moves=legalStandard(s);if(!moves.length)return checkStandard(s)?"Schachmatt":"Patt";if(s.half>=150)return "Remis (75 Züge)";return "";}
function drawCards(){
 grid.replaceChildren();games.forEach((g,i)=>{const b=document.createElement("button");b.type="button";b.className="simultan-card"+(i===active?" active":"");b.textContent="Brett "+(i+1)+" · "+(g.finished|| (state(g).t===g.humanColor?"Du bist dran":"Bot denkt"))+" · Stärke "+g.strength;b.onclick=()=>showBoard(i);grid.append(b);});
}
function draw(){
 drawCards();
 board.replaceChildren();const g=games[active];if(!g)return;
 const s=state(g),moves=s.t===g.humanColor&&!g.finished?legalStandard(s):[],targets=moves.filter(m=>m[0]===selected).map(m=>m[1]);
 for(let j=0;j<64;j++){const i=g.humanColor===1?(j>>3)*16+(j&7):(7-(j>>3))*16+(7-(j&7)),p=s.b[i],cell=document.createElement("button");cell.type="button";cell.className="simultan-square "+(((j>>3)+(j&7))%2?"dark":"light")+(selected===i?" selected":"")+(targets.includes(i)?" target":"");if(p!=="."){const img=document.createElement("img");img.className="simultan-piece";img.src="pieces/"+(p===p.toUpperCase()?"w":"b")+p.toUpperCase()+".svg";img.alt=glyph[p];img.draggable=false;cell.append(img);}cell.dataset.square=String(i);cell.setAttribute("aria-label",files[i&7]+(8-(i>>4)));cell.onclick=()=>choose(i);board.append(cell);}
 strength.value=String(g.strength);info.textContent="Brett "+(active+1)+" von "+games.length+" · "+(g.finished|| (s.t===g.humanColor?"Du bist am Zug":"Computer überlegt"))+" · Deine Farbe: "+(g.humanColor===1?"Weiß":"Schwarz")+" · Bot-Stärke "+g.strength;
}
function choose(i){const g=games[active];if(!g||g.finished||state(g).t!==g.humanColor)return;const s=state(g);if(side(s.b[i])===g.humanColor){selected=selected===i?-1:i;draw();return;}const candidates=legalStandard(s).filter(m=>m[0]===selected&&m[1]===i);if(!candidates.length){selected=-1;draw();return;}const m=candidates.find(m=>m[2]==="q")||candidates[0];commit(g,m);}
function commit(g,m){const s=state(g),valid=legalStandard(s).find(x=>notation(x)===notation(m));if(!valid)return;const isBot=s.t!==g.humanColor;if(games[active]===g)cancelSwitch();g.history.push(applyStandard(s,valid));g.moves.push(valid);g.finished=status(g);selected=-1;if(games[active]===g){draw();animateMove(g,valid);}else{drawCards();}if((g.humanColor===1&&isBot)||(g.humanColor===-1&&!isBot))autoNext(g,g.humanColor===-1?680:2650);if(!g.finished&&state(g).t!==g.humanColor)botMove(g);}
function botMove(g){if(g.thinking)return;g.thinking=true;const stamp=epoch,expected=state(g),delay=1100+g.strength*115;const timer=setTimeout(()=>{timers.delete(timer);g.thinking=false;if(stamp!==epoch||state(g)!==expected||g.finished)return;const options=legalStandard(expected);if(!options.length){g.finished=status(g);draw();return;}const values={p:100,n:320,b:330,r:500,q:900,k:0};const ranked=options.map(m=>{const next=applyStandard(expected,m),capture=expected.b[m[1]];const reply=legalStandard(next),danger=reply.some(x=>x[1]===m[1]);const gain=capture==="."?0:values[capture.toLowerCase()]||0;const center=3.5-Math.abs((m[1]&7)-3.5);const mate=reply.length===0&&checkStandard(next)?100000:0;return {m,score:mate+gain-danger*(values[expected.b[m[0]].toLowerCase()]||0)*.6+center*8+Math.random()*Math.max(5,(21-g.strength)*35)};});ranked.sort((a,b)=>b.score-a.score);commit(g,ranked[0].m);},delay);timers.add(timer);}
function start(){cancelSwitch();epoch++;for(const t of timers)clearTimeout(t);timers.clear();games=Array.from({length:Math.min(20,Math.max(5,Number(count.value)||5))},fresh);active=0;selected=-1;panel.hidden=false;draw();for(const g of games)if(g.humanColor===-1)botMove(g);}
$("simultanOpen").addEventListener("click",()=>{panel.hidden=false;if(!games.length)start();else draw();});
$("simultanStart").addEventListener("click",start);strength.addEventListener("change",()=>{if(games[active]){games[active].strength=Number(strength.value);draw();}});
$("simultanClose").addEventListener("click",()=>{panel.hidden=true;});
$("simultanPrev").addEventListener("click",()=>{showBoard(active-1);});
$("simultanNext").addEventListener("click",()=>{showBoard(active+1);});
})();
