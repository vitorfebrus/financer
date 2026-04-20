// ─── FAB ──────────────────────────────────────────────────────────────────────
function FabMenu({tab,open}){
  const[show,setShow]=useState(false);
  const opts=tab==="cards"?[["Nova despesa cartão","cardexp","#d06060"],["Novo cartão","card","#7060c0"]]:tab==="accounts"?[["Nova conta","account","#5aaa78"]]:tab==="more"?null:[["Nova receita","tx:income","#5aaa78"],["Nova despesa","tx:expense","#d06060"],["Transferência","transfer","#4a7fb5"]];
  if(!opts)return null;
  if(opts.length===1)return <button className="fab" onClick={()=>open(opts[0][1])}><I n="plus" s={21} c="#fff"/></button>;
  return(
    <>
      {show&&<div className="fab-menu">{opts.map(([lb,type,color],i)=>(
        <button key={i} className="btn bs bsm" style={{borderColor:color,color,borderWidth:1.5,paddingLeft:14,paddingRight:14}} onClick={()=>{setShow(false);const[t,sub]=type.split(":");open(t,sub?{_type:sub}:null);}}>
          {lb}
        </button>
      ))}</div>}
      <button className="fab" onClick={()=>setShow(p=>!p)} style={{transform:`translateX(calc(-50% + 136px)) rotate(${show?45:0}deg)`,transition:"transform .22s"}}><I n="plus" s={21} c="#fff"/></button>
    </>
  );
}

// ─── TxRow ────────────────────────────────────────────────────────────────────
function TxRow({tx,accounts,categories,tags,cardName,onPress}){
  const cat=categories.find(c=>c.id===tx.categoryId);
  const acc=accounts.find(a=>a.id===tx.accountId);
  const txTags=(tx.tagIds||[]).map(id=>tags.find(t=>t.id===id)).filter(Boolean);
  const isInc=tx.type==="income",isTrf=tx.type==="transfer";
  const color=isTrf?"#4a7fb5":isInc?"#5aaa78":"#d06060";
  const sign=isInc||isTrf?"+":"-";
  return(
    <div className={`ti ${tx.ignored?"ign":""}`} onClick={onPress}>
      <div className="ti-ico" style={{background:(cat?.color||color)+"25"}}>{isTrf?"↔️":cat?.icon||(isInc?"💰":"💸")}</div>
      <div className="ti-info">
        <div className="ti-name">{tx.description||(isTrf?"Transferência":cat?.name||"—")}{tx.recurring&&<span className="badge bg-rec">Fixa</span>}{cardName&&<span className="badge bg-cc">{cardName}</span>}</div>
        <div className="ti-meta">{cardName?`Fatura · ${fmtD(tx.date)}`:(acc?.name||"")+(cat&&!isTrf?` · ${cat.name}`:"")}</div>
        {txTags.length>0&&<div style={{marginTop:2}}>{txTags.map(tg=><span key={tg.id} className="tag-p" style={{background:tg.color+"20",color:tg.color}}>{tg.name}</span>)}</div>}
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div className="ti-amt" style={{color}}>{sign}{fmt(tx.amount)}</div>
        {tx.ignored&&<div className="badge bg-ign">Ignorado</div>}
      </div>
    </div>
  );
}


