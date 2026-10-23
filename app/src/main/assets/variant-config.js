"use strict";
/* SchachNova: zentrale Zuordnung der Varianten für Fairy-Stockfish.
 * Die Varianten werden erst freigeschaltet, wenn Regel- und Engine-Anbindung
 * einschließlich der Android-Assets vollständig getestet wurden.
 * GPLv3: https://github.com/fairy-stockfish/Fairy-Stockfish
 */
window.SchachNovaVariants=Object.freeze({
 standard:{label:"Klassisch",uci:"chess",local:true},
 hill:{label:"King of the Hill",uci:"kingofthehill",local:true},
 threecheck:{label:"Drei-Schach",uci:"3check",local:true},
 antichess:{label:"Räuberschach",uci:"antichess",local:true,bot:false},
 chess960:{label:"Schach960",uci:"chess",uciChess960:true,local:false},
 atomic:{label:"Atomschach",uci:"atomic",local:true,bot:false},
 horde:{label:"Horde",uci:"horde",local:false},
 racingkings:{label:"Racing Kings",uci:"racingkings",local:false},
 crazyhouse:{label:"Crazyhouse",uci:"crazyhouse",local:false}
});
window.schachNovaVariantUciOptions=function(name){
 const variant=window.SchachNovaVariants[name];
 if(!variant)throw new Error("Unbekannte Schachvariante: "+name);
 return ["setoption name UCI_Variant value "+variant.uci,
         "setoption name UCI_Chess960 value "+(variant.uciChess960?"true":"false"),
         "ucinewgame","isready"];
};
