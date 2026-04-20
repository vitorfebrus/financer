// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dash({accounts,balances,totalBal,monthIncome,monthExpense,monthTx,monthCardExps,month,navMo,cards,cardTotals,categories,tags,open,handleNotifImport,exportData,importData}){
  const fileRef=useRef();

  // Pie: regular expenses + card expenses
  const pieData=useMemo(()=>{
    const bycat={};
    monthTx.filter(t=>t.type==="expense"&&!t.ignored).forEach(t=>{
      const cat=categories.find(c=>c.id===t.categoryId);
      const k=cat?.id||"other";
      if(!bycat[k])bycat[k]={label:cat?.name||"Outros",color:cat?.color||"#6a6a8a",value:0};
      bycat[k].value+=(t.amount??0);
    });
    monthCardExps.filter(e=>!e.ignored).forEach(e=>{
      const cat=categories.find(c=>c.id===e.categoryId);
      const k=cat?.id||"other";
      if(!bycat[k])bycat[k]={label:cat?.name||"Sem categoria",color:cat?.color||"#6a6a8a",value:0};
      bycat[k].value+=(e.amount??0);
    });
    return Object.values(bycat).sort((a,b)=>b.value-a.value).slice(0,7);
  },[monthTx,monthCardExps,categories]);

  const totalCardExp=monthCardExps.filter(e=>!e.ignored).reduce((s,e)=>s+(e.amount??0),0);

  return(
    <div>
      <div className="hd">
        <h1>💰 Finanças</h1>
        <div style={{display:"flex",gap:8}}>
          <input ref={fileRef} type="file" accept=".json" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(f=>importData(f));e.target.value="";}}/>
          <button className="btn bs bsm" style={{width:"auto",gap:5}} onClick={()=>fileRef.current.click()}><I n="import" s={14}/>Importar</button>
          <button className="btn bs bsm" style={{width:"auto",gap:5}} onClick={exportData}><I n="export" s={14}/>Exportar</button>
        </div>
      </div>
      <div className="mn"><button className="mn-btn" onClick={()=>navMo(-1)}><I n="left" s={15}/></button><span className="mn-lbl">{mkL(month)}</span><button className="mn-btn" onClick={()=>navMo(1)}><I n="right" s={15}/></button></div>
      <div className="hero">
        <div className="hero-lbl">Saldo total</div>
        <div className="hero-val">{fmt(totalBal)}</div>
        <div className="chips">
          <div className="chip"><div className="chip-lbl">↑ Receitas</div><div className="chip-val green">{fmt(monthIncome)}</div></div>
          <div className="chip"><div className="chip-lbl">↓ Despesas</div><div className="chip-val red">{fmt(monthExpense+totalCardExp)}</div></div>
          <div className="chip"><div className="chip-lbl">= Balanço</div><div className="chip-val" style={{color:monthIncome-(monthExpense+totalCardExp)>=0?"var(--green)":"var(--red)"}}>{fmt(monthIncome-(monthExpense+totalCardExp))}</div></div>
        </div>
      </div>

      <InstallBanner/>
      <ImportHelpBanner/>
      <NotifImporter onImport={handleNotifImport}/>

      {pieData.length>0&&<div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:16,margin:"0 16px 14px",padding:"16px 4px 14px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.5,padding:"0 16px 12px"}}>Despesas por categoria</div>
        <div className="pie-wrap">
          <DonutChart data={pieData}/>
          <div className="pie-legend">{pieData.map((d,i)=>(
            <div key={i} className="pie-leg-item">
              <div className="pie-leg-dot" style={{background:d.color}}/>
              <div style={{flex:1,color:"var(--text)",fontWeight:600,fontSize:11,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.label}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",whiteSpace:"nowrap",marginLeft:4}}>{fmt(d.value)}</div>
            </div>
          ))}</div>
        </div>
      </div>}

      {accounts.length>0&&<><div className="sec"><h2>Contas</h2></div>{accounts.map(a=>(
        <div className="ac" key={a.id} onClick={()=>open("account",a)}>
          <div className="ac-ico" style={{background:a.color+"25"}}>{a.icon||"🏦"}</div>
          <div style={{flex:1}}><div className="ac-name">{a.name}</div><div className="ac-type">{a.type}</div></div>
          <div className="ac-bal" style={{color:(balances[a.id]??0)>=0?"var(--green)":"var(--red)"}}>{fmt(balances[a.id])}</div>
        </div>
      ))}</>}

      {cards.length>0&&<><div className="sec"><h2>Cartões</h2></div>{cards.map(c=>{
        const used=cardTotals[c.id]?.[month]??0;const pct=c.limit>0?Math.min(100,(used/c.limit)*100):0;
        return(
          <div className="ccv" key={c.id} style={{background:`linear-gradient(135deg,${c.color},color-mix(in srgb,${c.color} 45%,#000))`}} onClick={()=>open("card",c)}>
            <div className="ccv-name">{c.name}</div><div className="ccv-sub">{fmt(used)} / {fmt(c.limit)}</div>
            <div className="prog"><div className="prog-f" style={{width:pct+"%"}}/></div>
            <div className="ccv-dates"><div><div className="ccv-dl">Fechamento</div><div className="ccv-dv">Dia {c.closingDay}</div></div><div><div className="ccv-dl">Vencimento</div><div className="ccv-dv">Dia {c.dueDay}</div></div><div><div className="ccv-dl">Disponível</div><div className="ccv-dv">{fmt(c.limit-used)}</div></div></div>
          </div>
        );
      })}</>}

      {accounts.length===0&&cards.length===0&&<div className="empty"><div className="empty-ico">💎</div><h3>Bem-vindo!</h3><p>Toque no + para adicionar sua primeira conta ou cartão.</p></div>}
    </div>
  );
}

// ─── Transactions Page ────────────────────────────────────────────────────────

function TxPage({monthTx,monthCardExps,accounts,categories,tags,cards,month,navMo,monthIncome,monthExpense,open}){
  const[filters,setFilters]=useState(EMPTY_FILTERS);
  const[filterOpen,setFilterOpen]=useState(false);

  const activeFilterCount=useMemo(()=>[
    filters.type!=="all",filters.search,filters.accounts.length,filters.tags.length,
    filters.cats.length,filters.showIgnored,filters.onlyFixed,filters.onlyCard
  ].filter(Boolean).length,[filters]);

  const allItems=useMemo(()=>{
    const txItems=monthTx.map(t=>({...t,_source:"tx"}));
    const ceItems=monthCardExps.map(e=>{
      const card=cards.find(c=>c.id===e.cardId);
      return{...e,type:"expense",_source:"card",_cardName:card?.name||"Cartão"};
    });
    return[...txItems,...ceItems].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  },[monthTx,monthCardExps,cards]);

  const filtered=useMemo(()=>allItems.filter(t=>{
    if(filters.type==="income"&&t.type!=="income")return false;
    if(filters.type==="expense"&&(t.type!=="expense"))return false;
    if(filters.type==="transfer"&&t.type!=="transfer")return false;
    if(filters.onlyCard&&t._source!=="card")return false;
    if(filters.onlyFixed&&!t.recurring)return false;
    if(!filters.showIgnored&&t.ignored)return false;
    if(filters.search&&!(t.description||"").toLowerCase().includes(filters.search.toLowerCase()))return false;
    if(filters.accounts.length>0){
      const accOk=filters.accounts.includes(t.accountId)||filters.accounts.includes(t.toAccountId);
      if(!accOk)return false;
    }
    if(filters.tags.length>0&&!(t.tagIds||[]).some(id=>filters.tags.includes(id)))return false;
    if(filters.cats.length>0&&!filters.cats.includes(t.categoryId))return false;
    return true;
  }),[allItems,filters]);

  const grouped=useMemo(()=>{
    const g={};filtered.forEach(t=>{const k=t.date;if(!g[k])g[k]=[];g[k].push(t);});
    return Object.entries(g).sort(([a],[b])=>b.localeCompare(a));
  },[filtered]);

  // Filtered totals
  const filtIncome=filtered.filter(t=>t.type==="income"&&!t.ignored).reduce((s,t)=>s+(t.amount??0),0);
  const filtExpense=filtered.filter(t=>(t.type==="expense"||t._source==="card")&&!t.ignored).reduce((s,t)=>s+(t.amount??0),0);

  const activeFilterLabels=useMemo(()=>{
    const l=[];
    if(filters.type!=="all")l.push({key:"type",label:filters.type==="income"?"Receitas":filters.type==="expense"?"Despesas":"Transferências"});
    if(filters.onlyCard)l.push({key:"onlyCard",label:"Cartão"});
    if(filters.onlyFixed)l.push({key:"onlyFixed",label:"Fixas"});
    if(filters.showIgnored)l.push({key:"showIgnored",label:"Ignoradas"});
    if(filters.search)l.push({key:"search",label:`"${filters.search}"`});
    if(filters.accounts.length)l.push({key:"accounts",label:`${filters.accounts.length} conta(s)`});
    if(filters.tags.length)l.push({key:"tags",label:`${filters.tags.length} tag(s)`});
    if(filters.cats.length)l.push({key:"cats",label:`${filters.cats.length} cat.`});
    return l;
  },[filters]);

  const clearFilter=(key)=>setFilters(p=>({...p,[key]:EMPTY_FILTERS[key]}));

  return(
    <div>
      <div className="hd">
        <h1>Transações</h1>
        <button className="btn bs bsm" style={{width:"auto",gap:5,position:"relative"}} onClick={()=>setFilterOpen(true)}>
          <I n="filter" s={15}/>Filtros
          {activeFilterCount>0&&<span className="filter-badge">{activeFilterCount}</span>}
        </button>
      </div>
      <div className="mn"><button className="mn-btn" onClick={()=>navMo(-1)}><I n="left" s={15}/></button><span className="mn-lbl">{mkL(month)}</span><button className="mn-btn" onClick={()=>navMo(1)}><I n="right" s={15}/></button></div>

      {/* Summary — shows filtered totals if filters active */}
      <div className="srow">
        <div className="sc">
          <div className="sc-lbl">{activeFilterCount>0?"↑ Filtrado":"↑ Receitas"}</div>
          <div className="sc-val green">{fmt(activeFilterCount>0?filtIncome:monthIncome)}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">{activeFilterCount>0?"↓ Filtrado":"↓ Despesas"}</div>
          <div className="sc-val red">{fmt(activeFilterCount>0?filtExpense:(monthExpense+monthCardExps.filter(e=>!e.ignored).reduce((s,e)=>s+(e.amount??0),0)))}</div>
        </div>
        <div className="sc">
          <div className="sc-lbl">Balanço</div>
          <div className="sc-val" style={{color:(activeFilterCount>0?(filtIncome-filtExpense):(monthIncome-monthExpense))>=0?"var(--green)":"var(--red)"}}>{fmt(activeFilterCount>0?filtIncome-filtExpense:monthIncome-monthExpense)}</div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterLabels.length>0&&<div className="af-bar">
        <span style={{fontSize:10,color:"var(--muted)",fontWeight:700}}>FILTROS:</span>
        {activeFilterLabels.map(({key,label})=>(
          <span key={key} className="af-chip" onClick={()=>clearFilter(key)}>{label} <span className="af-chip-x">×</span></span>
        ))}
        <span className="af-chip" style={{background:"rgba(208,96,96,.1)",borderColor:"rgba(208,96,96,.3)",color:"var(--red)"}} onClick={()=>setFilters(EMPTY_FILTERS)}>Limpar tudo ×</span>
      </div>}

      {grouped.length===0&&<div className="empty"><div className="empty-ico">📋</div><h3>Nenhuma transação</h3><p>Ajuste os filtros ou adicione transações.</p></div>}
      {grouped.map(([date,txs])=>(
        <div key={date}>
          <div className="tg">{fmtD(date)}</div>
          {txs.map(t=>(
            <TxRow key={(t._source==="card"?"ce_":"")+t.id+(t._virt?"_v":"")}
              tx={t} accounts={accounts} categories={categories} tags={tags}
              cardName={t._source==="card"?t._cardName:null}
              onPress={()=>{
                if(t._source==="card")open("cardexp",t);
                else if(t._virt)return;
                else if(t.type==="transfer")open("transfer",t);
                else open("tx",t);
              }}/>
          ))}
        </div>
      ))}

      {filterOpen&&<FilterModal filters={filters} setFilters={setFilters} accounts={accounts} categories={categories} tags={tags} onClose={()=>setFilterOpen(false)}/>}
    </div>
  );
}

// ─── Cards Page ───────────────────────────────────────────────────────────────
function CardsPage({cards,cardExp,cardTotals,categories,tags,month,navMo,open,accounts,payBill}){
  const[sel,setSel]=useState(null);
  return(
    <div>
      <div className="hd"><h1>Cartões</h1></div>
      <div className="mn"><button className="mn-btn" onClick={()=>navMo(-1)}><I n="left" s={15}/></button><span className="mn-lbl">{mkL(month)}</span><button className="mn-btn" onClick={()=>navMo(1)}><I n="right" s={15}/></button></div>
      {cards.length===0&&<div className="empty"><div className="empty-ico">💳</div><h3>Nenhum cartão</h3><p>Adicione seu cartão de crédito.</p></div>}
      {cards.map(c=>{
        const used=cardTotals[c.id]?.[month]??0;const pct=c.limit>0?Math.min(100,(used/c.limit)*100):0;
        const exps=cardExp.filter(e=>e.cardId===c.id&&e.billingMonth===month).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
        return(
          <div key={c.id}>
            <div className="ccv" style={{background:`linear-gradient(135deg,${c.color},color-mix(in srgb,${c.color} 45%,#000))`}} onClick={()=>setSel(sel===c.id?null:c.id)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div className="ccv-name">{c.name}</div><div className="ccv-sub">{fmt(used)} de {fmt(c.limit)}</div></div>
                <button style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:7,padding:"4px 10px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={e=>{e.stopPropagation();open("card",c);}}>Editar</button>
              </div>
              <div className="prog"><div className="prog-f" style={{width:pct+"%"}}/></div>
              <div className="ccv-dates"><div><div className="ccv-dl">Fechamento</div><div className="ccv-dv">Dia {c.closingDay}</div></div><div><div className="ccv-dl">Vencimento</div><div className="ccv-dv">Dia {c.dueDay}</div></div></div>
            </div>
            {sel===c.id&&(
              <div style={{margin:"0 16px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"var(--muted)"}}>DESPESAS DA FATURA</span>
                  <div style={{display:"flex",gap:8}}>
                    {used>0&&<button className="btn bgreen bsm" onClick={()=>open("paybill",{cardId:c.id,amount:used})}><I n="pay" s={13} c="var(--green)"/> Pagar</button>}
                    <button className="btn bp bsm" onClick={()=>open("cardexp",{_cardId:c.id})}>+ Despesa</button>
                  </div>
                </div>
                {exps.length===0&&<div style={{padding:"18px",textAlign:"center",color:"var(--muted)",fontSize:12}}>Nenhuma despesa nesta fatura</div>}
                {exps.map(e=>{
                  const cat=categories.find(cat=>cat.id===e.categoryId);
                  const eTags=(e.tagIds||[]).map(id=>tags.find(t=>t.id===id)).filter(Boolean);
                  return(
                    <div key={e.id} className={`ti ${e.ignored?"ign":""}`} onClick={()=>open("cardexp",e)}>
                      <div className="ti-ico" style={{background:(cat?.color||"#d06060")+"25"}}>{cat?.icon||"💳"}</div>
                      <div className="ti-info">
                        <div className="ti-name">{e.description||cat?.name||"—"}{e.installmentTotal>1&&<span className="badge" style={{background:"rgba(112,96,192,.18)",color:"#9080e0"}}>({e.installmentIndex}/{e.installmentTotal})</span>}</div>
                        <div className="ti-meta">{cat?.name||""} · {fmtD(e.date)}</div>
                        {eTags.length>0&&<div>{eTags.map(tg=><span key={tg.id} className="tag-p" style={{background:tg.color+"20",color:tg.color}}>{tg.name}</span>)}</div>}
                      </div>
                      <div style={{textAlign:"right"}}><div className="ti-amt red">-{fmt(e.amount)}</div>{e.ignored&&<div className="badge bg-ign">Ignorado</div>}</div>
                    </div>
                  );
                })}
                <div style={{padding:"11px 16px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:"var(--muted)"}}>Total</span>
                  <span style={{fontSize:15,fontWeight:800,fontFamily:"var(--mono)",color:"var(--red)"}}>{fmt(used)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Accounts Page ────────────────────────────────────────────────────────────
function AccPage({accounts,balances,open}){
  const total=Object.values(balances).reduce((s,v)=>s+v,0);
  return(
    <div>
      <div className="hd"><h1>Contas</h1></div>
      <div className="hero"><div className="hero-lbl">Patrimônio total</div><div className="hero-val">{fmt(total)}</div></div>
      {accounts.length===0&&<div className="empty"><div className="empty-ico">🏦</div><h3>Nenhuma conta</h3></div>}
      {accounts.map(a=>(
        <div className="ac" key={a.id} onClick={()=>open("account",a)}>
          <div className="ac-ico" style={{background:a.color+"25"}}>{a.icon||"🏦"}</div>
          <div style={{flex:1}}><div className="ac-name">{a.name}</div><div className="ac-type">{a.type}</div></div>
          <div className="ac-bal" style={{color:(balances[a.id]??0)>=0?"var(--green)":"var(--red)"}}>{fmt(balances[a.id])}</div>
        </div>
      ))}
    </div>
  );
}

// ─── More Page ────────────────────────────────────────────────────────────────
function MorePage({categories,tags,open,onChangePIN}){
  const[tab,setTab]=useState("exp");
  const cats=categories.filter(c=>c.type===(tab==="exp"?"expense":"income"));
  return(
    <div>
      <div className="hd">
        <h1>Categorias & Tags</h1>
        <button className="btn bs bsm" style={{width:"auto"}} onClick={onChangePIN}>🔐 PIN</button>
      </div>
      <div style={{padding:"0 16px 12px"}}><div className="seg"><button className={`sb ${tab==="exp"?"on":""}`} style={tab==="exp"?{background:"var(--red)",color:"#fff"}:{}} onClick={()=>setTab("exp")}>Despesas</button><button className={`sb ${tab==="inc"?"on":""}`} style={tab==="inc"?{background:"var(--green)",color:"#fff"}:{}} onClick={()=>setTab("inc")}>Receitas</button><button className={`sb ${tab==="tags"?"on":""}`} style={tab==="tags"?{background:"var(--accent)",color:"#fff"}:{}} onClick={()=>setTab("tags")}>Tags</button></div></div>
      {tab!=="tags"?(
        <div style={{padding:"0 16px"}}>
          {cats.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>open("category",c)}><div style={{width:38,height:38,borderRadius:11,background:c.color+"25",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{c.icon}</div><div style={{flex:1,fontSize:13,fontWeight:600}}>{c.name}</div><div style={{width:11,height:11,borderRadius:"50%",background:c.color}}/></div>))}
          <button className="btn bs" style={{marginTop:14}} onClick={()=>open("category",{_type:tab==="exp"?"expense":"income"})}><I n="plus" s={16}/> Nova categoria</button>
        </div>
      ):(
        <div style={{padding:"0 16px"}}>
          {tags.map(tg=>(<div key={tg.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>open("tag",tg)}><span className="tag-p" style={{background:tg.color+"20",color:tg.color,fontSize:12,padding:"4px 11px"}}>{tg.name}</span></div>))}
          <button className="btn bs" style={{marginTop:14}} onClick={()=>open("tag",null)}><I n="plus" s={16}/> Nova tag</button>
        </div>
      )}
    </div>
  );
}

