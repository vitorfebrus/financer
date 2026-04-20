// ─── notification parser ──────────────────────────────────────────────────────
function parseNotif(text){
  if(!text?.trim())return null;
  const t=text.trim();
  const res={amount:0,description:"",type:"expense",isCard:false};
  const r1=t.match(/[Cc]ompra de R\$\s*([\d.,]+)\s+APROVADA\s+em\s+(.+?)(?:\s+para o cartão|\s*\.|\s*$)/);
  if(r1){res.amount=parseFloat(r1[1].replace(/\./g,"").replace(",","."));res.description=r1[2].trim();res.isCard=true;return res;}
  const r2=t.match(/[Vv]oc[eê] enviou R\$\s*([\d.,]+)\s+para\s+(.+?)(?:\s+via|\s*\.|\s*$)/);
  if(r2){res.amount=parseFloat(r2[1].replace(/\./g,"").replace(",","."));res.description="PIX para "+r2[2].trim();return res;}
  const r3=t.match(/[Vv]oc[eê] recebeu R\$\s*([\d.,]+)\s+de\s+(.+?)(?:\s+via|\s*\.|\s*$)/);
  if(r3){res.amount=parseFloat(r3[1].replace(/\./g,"").replace(",","."));res.description="PIX de "+r3[2].trim();res.type="income";return res;}
  const r4=t.match(/[Dd][eé]bito de R\$\s*([\d.,]+)\s+em\s+(.+?)(?:\s*\.|\s*$)/);
  if(r4){res.amount=parseFloat(r4[1].replace(/\./g,"").replace(",","."));res.description=r4[2].trim();return res;}
  const r5=t.match(/[Cc]ompra aprovada[:\s]+R\$\s*([\d.,]+)\s+em\s+(.+?)(?:\s*\.|\s*$)/);
  if(r5){res.amount=parseFloat(r5[1].replace(/\./g,"").replace(",","."));res.description=r5[2].trim();res.isCard=true;return res;}
  const r6=t.match(/R\$\s*([\d.,]+)\s+(?:em|na|no|para)\s+(.+?)(?:\s*\.|\s*$)/i);
  if(r6){res.amount=parseFloat(r6[1].replace(/\./g,"").replace(",","."));res.description=r6[2].trim();return res;}
  const r7=t.match(/R\$\s*([\d.,]+)/);
  if(r7){res.amount=parseFloat(r7[1].replace(/\./g,"").replace(",","."));res.description=t.replace(/R\$[\d.,\s]+/g,"").slice(0,60).trim();return res;}
  return null;
}



  // ── Mobills / native format detector & converter ──────────────────────────
function parseMobillsOrNative(raw){
    // Native format: has "accounts" key at root
    if(!Array.isArray(raw)&&raw.transactions!==undefined){return{type:"native"};}
    if(!Array.isArray(raw)||raw.length===0)return null;

    const first=raw[0];
    // Detect Mobills type from field names
    const isReceita  ="Data da Receita"    in first;
    const isDespesa  ="Data da Despesa"    in first;
    const isTransfer ="Data da Transferência" in first;
    if(!isReceita&&!isDespesa&&!isTransfer)return null;

    // ── helpers ──────────────────────────────────────────────────────────────
    const parseMobillsDate=s=>{
      // "DD/MM/YYYY HH:MM:SS"
      if(!s)return today();
      const[datePart]=s.split(" ");
      const[d,m,y]=datePart.split("/");
      return`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
    };

    // Registry for new entities (keyed by name)
    const accMap={};   // name -> id
    const catMap={};   // name|type -> id
    const tagMap={};   // name -> id

    // Pre-populate with existing state
    accounts.forEach(a=>{accMap[a.name.toLowerCase()]=a.id;});
    categories.forEach(c=>{catMap[`${c.name.toLowerCase()}|${c.type}`]=c.id;});
    tags.forEach(t=>{tagMap[t.name.toLowerCase()]=t.id;});

    const newAccounts=[];
    const newCategories=[];
    const newTags=[];

    const ensureAcc=(name)=>{
      const k=name?.toLowerCase();
      if(!k)return"";
      if(!accMap[k]){
        const id=uid();
        accMap[k]=id;
        newAccounts.push({id,name,type:"Conta corrente",color:"#7060c0",icon:"🏦",initialBalance:0});
      }
      return accMap[k];
    };

    const ensureCat=(name,type)=>{
      const k=`${(name||"").toLowerCase()}|${type}`;
      if(!catMap[k]){
        const id=uid();
        catMap[k]=id;
        const PALETTE=["#c47a3a","#4a7fb5","#b55a7a","#a07830","#7060c0","#3a8a8a","#3a8a5a","#8a4a90","#5a6a7a","#6a6a8a","#3a8a5a","#5a8a30","#2a8a80","#7a8a30","#6a5aa0"];
        const color=PALETTE[newCategories.length%PALETTE.length];
        newCategories.push({id,name:name||"Outros",icon:"📦",color,type});
      }
      return catMap[k];
    };

    const ensureTag=(name)=>{
      const k=name?.toLowerCase();
      if(!k)return null;
      if(!tagMap[k]){
        const id=uid();
        tagMap[k]=id;
        const TPAL=["#4a9060","#a05050","#4a70a0","#9a7030","#7060c0","#3a8a8a"];
        newTags.push({id,name,color:TPAL[newTags.length%TPAL.length]});
      }
      return tagMap[k];
    };

    const parseTags=str=>{
      if(!str||str.trim()==="")return[];
      return str.split(/[,;]+/).map(s=>s.trim()).filter(Boolean).map(ensureTag).filter(Boolean);
    };

    const importedTx=[];

    if(isReceita){
      raw.forEach(r=>{
        const accId=ensureAcc(r["Conta"]);
        const catId=ensureCat(r["Categoria"],"income");
        const tagIds=parseTags(r["Tags"]);
        importedTx.push({
          id:uid(),_extId:`rec_${r["Id"]}`,
          type:"income",
          amount:Number(r["Valor"])||0,
          date:parseMobillsDate(r["Data da Receita"]),
          description:r["Descrição"]||"",
          accountId:accId,categoryId:catId,tagIds,
          ignored:r["Ignorada"]==="True",
          recurring:false,
        });
      });
    }

    if(isDespesa){
      // Group by Descrição+Parcelas to detect installments
      raw.forEach(r=>{
        const accId=ensureAcc(r["Conta"]);
        const catId=ensureCat(r["Categoria"],"expense");
        const tagIds=parseTags(r["Tags"]);
        const installPos=r["Posição"]||"";
        const installTotal=r["Parcelas"]||"";
        importedTx.push({
          id:uid(),_extId:`dep_${r["Id"]}`,
          type:"expense",
          amount:Number(r["Valor"])||0,
          date:parseMobillsDate(r["Data da Despesa"]),
          description:r["Descrição"]||"",
          accountId:accId,categoryId:catId,tagIds,
          ignored:r["Ignorada"]==="True",
          recurring:false,
          installmentIndex:installPos!==""?Number(installPos):undefined,
          installmentTotal:installTotal!==""?Number(installTotal):undefined,
        });
      });
    }

    if(isTransfer){
      // Group by Id — each transfer has two records: "Saída" (origin) and "Entrada" (destination)
      const grouped={};
      raw.forEach(r=>{
        const id=String(r["Id"]);
        if(!grouped[id])grouped[id]=[];
        grouped[id].push(r);
      });

      Object.entries(grouped).forEach(([extId,recs])=>{
        const saida =recs.find(r=>r["Descrição"]==="Transferência de Saída");
        const entrada=recs.find(r=>r["Descrição"]==="Transferência de Entrada");
        // Fallback: if only one record exists, use it as origin
        const origin =saida||recs[0];
        const dest   =entrada||null;

        const accId   =ensureAcc(origin["Conta"]);
        const toAccId =dest?ensureAcc(dest["Conta"]):"";
        const tagIds  =parseTags(origin["Tags"]||dest?.["Tags"]||"");
        const desc    =(origin["Observação"]||dest?.["Observação"]||"").trim()||"Transferência";

        importedTx.push({
          id:uid(),_extId:`trf_${extId}`,
          type:"transfer",
          amount:Number(origin["Valor"])||0,
          date:parseMobillsDate(origin["Data da Transferência"]),
          description:desc,
          accountId:accId,toAccountId:toAccId,tagIds,
          ignored:origin["Ignorada"]==="True",
          recurring:false,
        });
      });
    }

    return{type:"mobills",importedTx,newAccounts,newCategories,newTags,count:importedTx.length};
  }