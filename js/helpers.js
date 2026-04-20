// ─── helpers ──────────────────────────────────────────────────────────────────
const uid=()=>Math.random().toString(36).slice(2,10);
const fmt=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v??0);
const fmtD=d=>new Date(d+"T12:00:00").toLocaleDateString("pt-BR");
const today=()=>new Date().toISOString().slice(0,10);
const cmk=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
const mkL=k=>{if(!k)return"";const[y,m]=k.split("-");return new Date(y,m-1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});};
const addM=(mk,n)=>{const[y,m]=mk.split("-").map(Number);const d=new Date(y,m-1+n);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;};
const diffM=(a,b)=>{const[ay,am]=a.split("-").map(Number);const[by,bm]=b.split("-").map(Number);return(by-ay)*12+(bm-am);};
const evalE=s=>{try{const c=String(s).replace(/,/g,".").replace(/÷/g,"/").replace(/×/g,"*").replace(/[^0-9+\-*/().]/g,"");if(!c)return null;const r=Function('"use strict";return('+c+")")();return isFinite(r)?Math.round(r*100)/100:null;}catch{return null;}};

