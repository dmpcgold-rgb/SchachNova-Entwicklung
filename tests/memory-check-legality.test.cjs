// Run: node tests/memory-check-legality.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('app/src/main/assets/chess.js','utf8');
const core=source.slice(0,source.indexOf('let premove='));
const context=vm.createContext({});
vm.runInContext(core+';var variantMode="standard";',context);
function position(fen){
 const [placement,turn]=fen.split(' '),b=Array(128).fill('.');
 placement.split('/').forEach((rank,row)=>{let col=0;for(const p of rank){if(/[1-8]/.test(p))col+=+p;else b[row*16+col++]=p;}});
 return {b,t:turn==='w'?1:-1,c:0,ep:-1,half:0,full:1};
}
function moves(s){return Array.from(vm.runInContext('legal',context)(s),m=>String.fromCharCode(97+(m[0]&7))+(8-(m[0]>>4))+String.fromCharCode(97+(m[1]&7))+(8-(m[1]>>4)));}
const checked=vm.runInContext('checked',context);
const cases=[
 ['rook check: unrelated pawn blocked','4k3/8/8/8/8/8/P3r3/4K3 w','a2a3'],
 ['bishop check: unrelated pawn blocked','4k3/8/8/8/1b6/8/P7/4K3 w','a2a3'],
 ['knight check: unrelated pawn blocked','4k3/8/8/8/8/5n2/P7/4K3 w','a2a3'],
 ['queen check: unrelated pawn blocked','4k3/8/8/8/8/8/P3q3/4K3 w','a2a3'],
 ['pawn check: unrelated pawn blocked','4k3/8/8/8/8/3p4/P7/4K3 w','a2a3'],
];
for(const [name,fen,illegal] of cases){const s=position(fen);assert(checked(s),name+' check not detected');assert(!moves(s).includes(illegal),name+' illegal move allowed');}
const free=position('4k3/8/8/8/8/8/P7/4K3 w');
assert(!checked(free));assert(moves(free).includes('a2a3'));
console.log('Memory chess check legality: 6 cases passed');
