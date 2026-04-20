// ─── NotifImporter ────────────────────────────────────────────────────────────
function NotifImporter({onImport}){
  const[open,setOpen]=useState(false);
  const[text,setText]=useState("");
  const[parsed,setParsed]=useState(null);
  const[selType,setSelType]=useState(null);
  useEffect(()=>{if(text.length>10){const r=parseNotif(text);setParsed(r);setSelType(r?(r.isCard?"card":r.type):null);}else{setParsed(null);setSelType(null);}},[text]);
  const handleImport=()=>{if(!parsed||!selType)return;onImport({...parsed,type:selType==="card"?"expense":selType,isCard:selType==="card"});setText("");setParsed(null);setSelType(null);setOpen(false);};
  const BANKS=[{name:"Nubank",e:"💜"},{name:"Inter",e:"🟠"},{name:"Bradesco",e:"🔴"},{name:"Itaú",e:"🟡"},{name:"C6",e:"⚫"},{name:"PicPay",e:"🟢"}];
  const TYPES=[{key:"expense",i:"📤",l:"Despesa",c:"var(--red)"},{key:"card",i:"💳",l:"Cartão",c:"#6a9ac8"},{key:"income",i:"📥",l:"Receita",c:"var(--green)"},{key:"transfer",i:"↔️",l:"Transf.",c:"var(--accent)"}];
  return(
    <div className="nb-bar">
      <div className="nb-hd" onClick={()=>setOpen(p=>!p)}>
        <div className="nb-ico">🔔</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>Importar notificação</div><div style={{fontSize:11,color:"var(--muted)"}}>Cole texto de notificação bancária</div></div>
        <I n={open?"chevdown":"right"} s={16} c="var(--muted)"/>
      </div>
      {open&&<div className="nb-body">
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:4}}>Bancos suportados:</div>
        <div className="bank-chips">{BANKS.map(b=><span key={b.name} className="bchip">{b.e} {b.name}</span>)}</div>
        <textarea className="nb-ta" placeholder={"Cole aqui o texto da notificação...\nEx: Compra de R$ 93,86 APROVADA em SHOPEE *SMARTSHOPEE para o cartão com final 9328."} value={text} onChange={e=>setText(e.target.value)}/>
        {parsed&&<div className="nb-res">
          <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",marginBottom:10}}>Identificado</div>
          <div className="nb-res-row"><span className="nb-res-lbl">Valor</span><span style={{fontFamily:"var(--mono)",fontWeight:800,color:"var(--green)"}}>{fmt(parsed.amount)}</span></div>
          <div className="nb-res-row" style={{marginBottom:0}}><span className="nb-res-lbl">Descrição</span><span style={{fontSize:13,fontWeight:600}}>{parsed.description}</span></div>
          <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",marginTop:12,marginBottom:8}}>Tipo</div>
          <div className="ntb-row">{TYPES.map(t=><button key={t.key} className={`ntb ${selType===t.key?"sel":""}`} style={selType===t.key?{borderColor:t.c,background:t.c+"15",color:t.c}:{}} onClick={()=>setSelType(t.key)}><span style={{fontSize:18}}>{t.i}</span>{t.l}</button>)}</div>
          <button className="btn bp" style={{marginTop:12}} onClick={handleImport}><I n="import" s={16} c="#fff"/> Criar transação</button>
        </div>}
        {text.length>10&&!parsed&&<div style={{marginTop:10,padding:"10px 12px",background:"rgba(208,96,96,.08)",borderRadius:10,border:"1px solid rgba(208,96,96,.2)",fontSize:12,color:"var(--red)"}}>⚠ Não foi possível identificar. Verifique o texto.</div>}
        <div style={{marginTop:12,padding:"10px 12px",background:"rgba(139,124,246,.07)",borderRadius:10,border:"1px solid rgba(139,124,246,.15)",fontSize:11,color:"var(--muted)",lineHeight:1.5}}>
          💡 No Android: pressione e segure a notificação → "Copiar" → cole aqui.
        </div>
      </div>}
    </div>
  );
}

