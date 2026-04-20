// ─── PWA Install Banner ───────────────────────────────────────────────────────
function InstallBanner(){
  const[show,setShow]=useState(false);
  const[installed,setInstalled]=useState(false);

  useEffect(()=>{
    // Already installable?
    if(window.__pwaPrompt)setShow(true);
    const onInstallable=()=>setShow(true);
    const onInstalled=()=>{setShow(false);setInstalled(true);};
    document.addEventListener('pwa-installable',onInstallable);
    document.addEventListener('pwa-installed',onInstalled);
    return()=>{
      document.removeEventListener('pwa-installable',onInstallable);
      document.removeEventListener('pwa-installed',onInstalled);
    };
  },[]);

  const install=async()=>{
    if(!window.__pwaPrompt)return;
    window.__pwaPrompt.prompt();
    const{outcome}=await window.__pwaPrompt.userChoice;
    if(outcome==='accepted'){setShow(false);setInstalled(true);}
    window.__pwaPrompt=null;
  };

  if(installed)return(
    <div style={{margin:"0 16px 12px",background:"rgba(90,170,120,.12)",border:"1px solid rgba(90,170,120,.3)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:22}}>✅</span>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"var(--green)"}}>App instalado!</div><div style={{fontSize:11,color:"var(--muted)"}}>Procure o ícone 💰 na tela inicial.</div></div>
    </div>
  );

  if(!show)return null;

  return(
    <div style={{margin:"0 16px 12px",background:"linear-gradient(135deg,rgba(139,124,246,.15),rgba(139,124,246,.08))",border:"1px solid rgba(139,124,246,.35)",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:44,height:44,borderRadius:12,background:"var(--bg4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>💰</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700}}>Instalar como app</div>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Adicionar à tela inicial do Android</div>
      </div>
      <button className="btn bp bsm" style={{flexShrink:0,paddingLeft:16,paddingRight:16}} onClick={install}>Instalar</button>
    </div>
  );
}

// ─── Import Help Banner ───────────────────────────────────────────────────────
function ImportHelpBanner(){
  const[open,setOpen]=useState(false);
  const FORMATS=[
    {name:"Formato nativo",desc:"JSON exportado pelo próprio app (substitui todos os dados)",icon:"💾"},
    {name:"Mobills — Receitas",desc:"JSON com campo \"Data da Receita\" — importa como receitas",icon:"📥"},
    {name:"Mobills — Despesas",desc:"JSON com campo \"Data da Despesa\" — importa como despesas",icon:"📤"},
    {name:"Mobills — Transferências",desc:"JSON com campo \"Data da Transferência\" — importa como transferências",icon:"↔️"},
  ];
  return(
    <div style={{margin:"0 16px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",cursor:"pointer"}} onClick={()=>setOpen(p=>!p)}>
        <span style={{fontSize:16}}>📂</span>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>Formatos suportados para importação</div><div style={{fontSize:10,color:"var(--muted)"}}>Nativo + exportação do Mobills</div></div>
        <I n={open?"chevdown":"right"} s={15} c="var(--muted)"/>
      </div>
      {open&&<div style={{padding:"0 16px 14px",borderTop:"1px solid var(--border)"}}>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:10,marginTop:10}}>Você pode importar vários arquivos de uma vez. Contas, categorias e tags são criadas automaticamente se não existirem.</div>
        {FORMATS.map((f,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<FORMATS.length-1?"1px solid var(--border)":"none"}}>
            <span style={{fontSize:18,width:24,flexShrink:0,textAlign:"center"}}>{f.icon}</span>
            <div><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{f.name}</div><div style={{fontSize:11,color:"var(--muted)",marginTop:1}}>{f.desc}</div></div>
          </div>
        ))}
        <div style={{marginTop:10,padding:"8px 10px",background:"rgba(139,124,246,.08)",borderRadius:8,border:"1px solid rgba(139,124,246,.2)",fontSize:11,color:"var(--accent)"}}>
          💡 Transferências são emparelhadas pelo mesmo Id — origem e destino são detectados automaticamente.
        </div>
      </div>}
    </div>
  );
}

