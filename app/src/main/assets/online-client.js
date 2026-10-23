"use strict";
/* SchachNova online transport. Requires a compatible authoritative game server. */
(function(){
 let socket=null,room=null,role=null,revision=0,connected=false;
 const listeners=new Set();
 const emit=(type,data={})=>{for(const fn of listeners){try{fn({type,...data});}catch(e){console.error(e);}}};
 const validRoom=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{6,40}$/.test(s);
 const validMove=s=>typeof s==="string"&&/^[a-h][1-8][a-h][1-8][qrbnk]?$/.test(s);
 const api={
  get state(){return {room,role,revision,connected};},
  subscribe(fn){if(typeof fn!=="function")throw Error("Listener erforderlich");listeners.add(fn);return ()=>listeners.delete(fn);},
  connect(url){
   if(typeof url!=="string"||!/^wss:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(url))throw Error("Nur sichere wss://-Serveradressen sind erlaubt");
   if(socket){socket.close();socket=null;}connected=false;room=null;role=null;revision=0;
   const ws=new WebSocket(url);socket=ws;
   ws.onopen=()=>{if(socket!==ws)return;connected=true;emit("connected");};
   ws.onclose=()=>{if(socket!==ws)return;connected=false;emit("disconnected");};
   ws.onerror=()=>{if(socket===ws)emit("error",{message:"Verbindung zum Spielserver fehlgeschlagen"});};
   ws.onmessage=e=>{
    if(socket!==ws||typeof e.data!=="string"||e.data.length>32768)return;
    let msg;try{msg=JSON.parse(e.data);}catch(_){return;}
    if(!msg||typeof msg!=="object"||typeof msg.type!=="string")return;
    if(msg.type==="joined"&&validRoom(msg.room)&&["white","black","spectator"].includes(msg.role)&&Number.isSafeInteger(msg.revision)&&msg.revision>=0){room=msg.room;role=msg.role;revision=msg.revision;emit("joined",{room,role,revision,variant:msg.variant});}
    else if(msg.type==="state"&&room&&msg.room===room&&Number.isSafeInteger(msg.revision)&&msg.revision>=revision&&Array.isArray(msg.moves)&&msg.moves.length<=2000&&msg.moves.every(validMove)){revision=msg.revision;emit("state",{moves:msg.moves,revision,variant:msg.variant,status:msg.status});}
    else if(msg.type==="rejected"){emit("rejected",{reason:String(msg.reason||"Zug abgelehnt").slice(0,160)});}
    else if(msg.type==="opponent_joined"||msg.type==="opponent_left")emit(msg.type);
   };
  },
  join(code,variant){if(!connected||!socket)throw Error("Keine Serververbindung");if(!validRoom(code))throw Error("Ungültiger Raumcode");if(!window.SchachNovaVariants?.[variant])throw Error("Unbekannte Variante");socket.send(JSON.stringify({type:"join",room:code,variant}));},
  move(uci){if(!connected||!room||role==="spectator")throw Error("Keine aktive Spielerpartie");if(!validMove(uci))throw Error("Ungültiges Zugformat");socket.send(JSON.stringify({type:"move",room,revision,uci}));},
  leave(){if(socket&&connected&&room)socket.send(JSON.stringify({type:"leave",room}));room=null;role=null;revision=0;},
  disconnect(){if(socket)socket.close();socket=null;connected=false;room=null;role=null;revision=0;}
 };
 window.SchachNovaOnline=Object.freeze(api);
})();
