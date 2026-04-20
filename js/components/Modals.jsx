// ─── Transaction Modal ────────────────────────────────────────────────────────
function TxModal({tx,accounts,categories,tags,onClose,onSave,onDelete}){
  const init=tx?._type||tx?.type||"expense";
  const prefill=tx?._prefill||{};
  const[f,setF]=useState({type:init,amount:prefill.amount||0,date:today(),description:prefill.description||"",accountId:accounts[0]?.id||"",categoryId:"",tagIds:[],ignored:false,recType:"once",repeatMonths:2,...(tx?.id?{...tx,recType:tx.recurring?"forever":"once"}:{})});
  const[catPicker,setCatPicker]=useState(false);
  const[tagPicker,setTagPicker]=useState(false);
  const[err,setErr]=useState("");
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const cats=categories.filter(c=>c.type===f.type);
  const selCat=cats.find(c=>c.id===f.categoryId);
  const selTags=(f.tagIds||[]).map(id=>tags.find(t=>t.id===id)).filter(Boolean);
  const togTag=id=>s("tagIds",f.tagIds.includes(id)?f.tagIds.filter(t=>t!==id):[...f.tagIds,id]);
  const handleSave=()=>{
    if(!f.amount||f.amount<=0){setErr("O valor deve ser maior que zero.");return;}
    if(!f.categoryId){setErr("Selecione uma categoria.");return;}
    setErr("");
    const desc=f.description||selCat?.name||"";
    const base={...f,description:desc,id:f.id||uid()};
    if(f.recType==="once"||tx?.id){onSave({...base,recurring:false});return;}
    if(f.recType==="forever"){onSave({...base,recurring:true});return;}
    const txs=Array.from({length:f.repeatMonths},(_,i)=>{const d=new Date(f.date+"T12:00:00");d.setMonth(d.getMonth()+i);return{...base,id:uid(),date:d.toISOString().slice(0,10),recurring:false};});
    onSave(txs);
  };
  return(
    <>
      <Modal title={tx?.id?"Editar transação":f.type==="income"?"Nova receita":"Nova despesa"} onClose={onClose}>
        <div className="ms"><div className="seg"><button className={`sb ${f.type==="income"?"on":""}`} style={f.type==="income"?{background:"var(--green)",color:"#fff"}:{}} onClick={()=>s("type","income")}>Receita</button><button className={`sb ${f.type==="expense"?"on":""}`} style={f.type==="expense"?{background:"var(--red)",color:"#fff"}:{}} onClick={()=>s("type","expense")}>Despesa</button></div></div>
        <Calc value={f.amount} onChange={v=>s("amount",v)} label="Valor"/>
        <div className="ms"><div className="ml">Data</div><input className="field" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
        <div className="ms"><div className="ml">Descrição</div><input className="field" value={f.description} onChange={e=>s("description",e.target.value)} placeholder="Deixe vazio para usar a categoria..."/></div>
        <div className="ms"><div className="ml">Conta</div><select className="field" value={f.accountId} onChange={e=>s("accountId",e.target.value)}><option value="">Selecionar...</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}</select></div>
        <div className="ms">
          <div className="ml">Categoria *</div>
          <div className={`pick-field ${f.categoryId?"hv":""}`} onClick={()=>setCatPicker(true)}>
            <span>{selCat?<>{selCat.icon} {selCat.name}</>:<span style={{color:"var(--muted)"}}>Selecionar...</span>}</span>
            <span style={{color:"var(--muted)",fontSize:12}}>▼</span>
          </div>
        </div>
        <div className="ms">
          <div className="ml">Tags</div>
          <div className="pick-field" onClick={()=>setTagPicker(true)}>
            {selTags.length>0?<div>{selTags.map(tg=><span key={tg.id} className="tag-p" style={{background:tg.color+"20",color:tg.color}}>{tg.name}</span>)}</div>:<span style={{color:"var(--muted)",fontSize:13}}>Selecionar tags...</span>}
            <span style={{color:"var(--muted)",fontSize:12}}>▼</span>
          </div>
        </div>
        {!tx?.id&&<div className="ms">
          <div className="ml">Recorrência</div>
          <select className="field" value={f.recType} onChange={e=>s("recType",e.target.value)}>
            <option value="once">Única</option>
            <option value="forever">Fixa (todo mês)</option>
            <option value="repeat">Repetir N meses</option>
          </select>
          {f.recType==="repeat"&&<div style={{marginTop:8}}>
            <div className="ml">Meses</div>
            <select className="field" value={f.repeatMonths} onChange={e=>s("repeatMonths",parseInt(e.target.value))}>
              {Array.from({length:98},(_,i)=><option key={i+2} value={i+2}>{i+2} meses</option>)}
            </select>
          </div>}
        </div>}
        <div className="ms"><div className="trow" style={{borderBottom:"none"}}><div><div className="tr-lbl">Ignorar</div><div className="tr-sub">Não conta nos totais</div></div><button className={`tog ${f.ignored?"on":""}`} onClick={()=>s("ignored",!f.ignored)}/></div></div>
        {err&&<div className="ms"><div className="err">⚠ {err}</div></div>}
        <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
          <button className="btn bp" onClick={handleSave}><I n="check" s={16} c="#fff"/> Salvar</button>
          {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> Excluir</button>}
        </div>
      </Modal>
      {catPicker&&<PickerModal title="Categoria" items={cats} selected={[f.categoryId]} onSelect={id=>{s("categoryId",id);setCatPicker(false);}} onClose={()=>setCatPicker(false)}/>}
      {tagPicker&&<PickerModal title="Tags" items={tags} selected={f.tagIds} multi onSelect={togTag} onClose={()=>setTagPicker(false)}/>}
    </>
  );
}

// ─── Transfer Modal ───────────────────────────────────────────────────────────
function TransferModal({tx,accounts,tags,onClose,onSave,onDelete}){
  const prefill=tx?._prefill||{};
  const[f,setF]=useState({amount:prefill.amount||0,date:today(),description:"",accountId:accounts[0]?.id||"",toAccountId:accounts[1]?.id||"",tagIds:[],...(tx?.id?tx:{})});
  const[tagPicker,setTagPicker]=useState(false);
  const[err,setErr]=useState("");
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const selTags=(f.tagIds||[]).map(id=>tags.find(t=>t.id===id)).filter(Boolean);
  const togTag=id=>s("tagIds",f.tagIds.includes(id)?f.tagIds.filter(t=>t!==id):[...f.tagIds,id]);
  const handleSave=()=>{
    if(!f.amount||f.amount<=0){setErr("O valor deve ser maior que zero.");return;}
    if(f.accountId===f.toAccountId){setErr("Origem e destino devem ser diferentes.");return;}
    setErr("");
    onSave({...f,id:f.id||uid(),type:"transfer"});
  };
  return(
    <>
      <Modal title={tx?.id?"Editar transferência":"Transferência entre contas"} onClose={onClose}>
        <Calc value={f.amount} onChange={v=>s("amount",v)} label="Valor"/>
        <div className="ms"><div className="ml">Data</div><input className="field" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
        <div className="ms"><div className="ml">De (origem)</div><select className="field" value={f.accountId} onChange={e=>s("accountId",e.target.value)}>{accounts.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}</select></div>
        <div className="ms"><div className="ml">Para (destino)</div><select className="field" value={f.toAccountId} onChange={e=>s("toAccountId",e.target.value)}>{accounts.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}</select></div>
        <div className="ms"><div className="ml">Descrição</div><input className="field" value={f.description} onChange={e=>s("description",e.target.value)} placeholder="Opcional..."/></div>
        <div className="ms">
          <div className="ml">Tags</div>
          <div className="pick-field" onClick={()=>setTagPicker(true)}>
            {selTags.length>0?<div>{selTags.map(tg=><span key={tg.id} className="tag-p" style={{background:tg.color+"20",color:tg.color}}>{tg.name}</span>)}</div>:<span style={{color:"var(--muted)",fontSize:13}}>Selecionar tags...</span>}
            <span style={{color:"var(--muted)",fontSize:12}}>▼</span>
          </div>
        </div>
        {err&&<div className="ms"><div className="err">⚠ {err}</div></div>}
        <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
          <button className="btn bp" onClick={handleSave}><I n="check" s={16} c="#fff"/> {tx?.id?"Salvar":"Transferir"}</button>
          {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> Excluir transferência</button>}
        </div>
      </Modal>
      {tagPicker&&<PickerModal title="Tags" items={tags} selected={f.tagIds} multi onSelect={togTag} onClose={()=>setTagPicker(false)}/>}
    </>
  );
}

// ─── Account Modal ────────────────────────────────────────────────────────────
function AccModal({acc,onClose,onSave,onDelete}){
  const[f,setF]=useState({name:"",type:"Conta corrente",color:"#7060c0",icon:"🏦",initialBalance:0,...acc});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <Modal title={acc?.id?"Editar conta":"Nova conta"} onClose={onClose}>
      <div className="ms"><div className="ml">Nome</div><input className="field" value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Ex: Nubank, Bradesco..."/></div>
      <div className="ms"><div className="ml">Tipo</div><select className="field" value={f.type} onChange={e=>s("type",e.target.value)}>{["Conta corrente","Conta poupança","Carteira","Investimentos","Outros"].map(t=><option key={t}>{t}</option>)}</select></div>
      <Calc value={f.initialBalance} onChange={v=>s("initialBalance",v)} label="Saldo inicial"/>
      <div className="ms"><div className="ml">Ícone</div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{ACC_ICONS.map(i=><button key={i} style={{width:40,height:40,borderRadius:10,background:"var(--bg4)",border:`2px solid ${f.icon===i?"var(--accent)":"var(--border)"}`,fontSize:18,cursor:"pointer"}} onClick={()=>s("icon",i)}>{i}</button>)}</div></div>
      <div className="ms"><div className="ml">Cor</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{COLORS.map(c=><button key={c} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${f.color===c?"#fff":"transparent"}`,transform:f.color===c?"scale(1.2)":"none",cursor:"pointer"}} onClick={()=>s("color",c)}/>)}</div></div>
      <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
        <button className="btn bp" onClick={()=>onSave({...f,id:f.id||uid()})}><I n="check" s={16} c="#fff"/> Salvar</button>
        {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> Excluir conta</button>}
      </div>
    </Modal>
  );
}

// ─── Card Modal ───────────────────────────────────────────────────────────────
function CardModal({card,onClose,onSave,onDelete}){
  const[f,setF]=useState({name:"",color:"#7060c0",limit:0,closingDay:26,dueDay:3,...card});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <Modal title={card?.id?"Editar cartão":"Novo cartão"} onClose={onClose}>
      <div className="ms"><div className="ml">Nome</div><input className="field" value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Ex: Nubank, Itaú..."/></div>
      <Calc value={f.limit} onChange={v=>s("limit",v)} label="Limite total"/>
      <div className="ms"><div className="r2"><div><div className="ml">Dia fechamento</div><input className="field" type="number" min="1" max="31" value={f.closingDay} onChange={e=>s("closingDay",parseInt(e.target.value)||1)}/></div><div><div className="ml">Dia vencimento</div><input className="field" type="number" min="1" max="31" value={f.dueDay} onChange={e=>s("dueDay",parseInt(e.target.value)||1)}/></div></div></div>
      <div className="ms"><div className="ml">Cor</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{COLORS.map(c=><button key={c} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${f.color===c?"#fff":"transparent"}`,transform:f.color===c?"scale(1.2)":"none",cursor:"pointer"}} onClick={()=>s("color",c)}/>)}</div></div>
      <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
        <button className="btn bp" onClick={()=>onSave({...f,id:f.id||uid()})}><I n="check" s={16} c="#fff"/> Salvar</button>
        {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> Excluir cartão</button>}
      </div>
    </Modal>
  );
}

// ─── Card Expense Modal ───────────────────────────────────────────────────────
function CardExpModal({exp,cards,categories,tags,month,onClose,onSave,onDelete}){
  const isEdit=!!exp?.id;
  const prefill=exp?._prefill||{};
  const[f,setF]=useState({amount:prefill.amount||0,date:today(),description:prefill.description||"",cardId:exp?._cardId||cards[0]?.id||"",categoryId:"",billingMonth:prefill.billingMonth||month,tagIds:[],ignored:false,installments:1,...(exp?.id?{...exp,installments:exp.installmentTotal||1}:{})});
  const[catPicker,setCatPicker]=useState(false);
  const[tagPicker,setTagPicker]=useState(false);
  const[err,setErr]=useState("");
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const cats=categories.filter(c=>c.type==="expense");
  const selCat=cats.find(c=>c.id===f.categoryId);
  const selTags=(f.tagIds||[]).map(id=>tags.find(t=>t.id===id)).filter(Boolean);
  const togTag=id=>s("tagIds",f.tagIds.includes(id)?f.tagIds.filter(t=>t!==id):[...f.tagIds,id]);
  const instAmt=f.installments>1?Math.round(f.amount/f.installments*100)/100:f.amount;
  const billingOpts=useMemo(()=>{const opts=[];const d=new Date();d.setMonth(d.getMonth()-3);for(let i=0;i<15;i++){const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;opts.push({k,label:mkL(k)});d.setMonth(d.getMonth()+1);}return opts;},[]);
  const handleSave=()=>{
    if(!f.amount||f.amount<=0){setErr("O valor deve ser maior que zero.");return;}
    if(!f.categoryId){setErr("Selecione uma categoria.");return;}
    setErr("");
    const desc=f.description||selCat?.name||"";
    const n=f.installments;
    if(isEdit||n<=1){onSave([{...f,description:desc,id:f.id||uid(),installmentTotal:n,installmentIndex:1}]);return;}
    const grp=uid();
    const last=Math.round((f.amount-instAmt*(n-1))*100)/100;
    const exps=Array.from({length:n},(_,i)=>({...f,description:desc,id:uid(),amount:i===n-1?last:instAmt,billingMonth:addM(f.billingMonth,i),installmentGroup:grp,installmentIndex:i+1,installmentTotal:n}));
    onSave(exps);
  };
  return(
    <>
      <Modal title={isEdit?"Editar despesa":"Nova despesa cartão"} onClose={onClose}>
        <Calc value={f.amount} onChange={v=>s("amount",v)} label="Valor total"/>
        <div className="ms"><div className="ml">Data da compra</div><input className="field" type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></div>
        <div className="ms"><div className="ml">Descrição</div><input className="field" value={f.description} onChange={e=>s("description",e.target.value)} placeholder="Deixe vazio para usar a categoria..."/></div>
        <div className="ms"><div className="ml">Cartão</div><select className="field" value={f.cardId} onChange={e=>s("cardId",e.target.value)}>{cards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="ms"><div className="ml">Fatura</div><select className="field" value={f.billingMonth} onChange={e=>s("billingMonth",e.target.value)}>{billingOpts.map(o=><option key={o.k} value={o.k}>{o.label}</option>)}</select></div>
        <div className="ms"><div className="ml">Parcelamento</div><select className="field" value={f.installments} onChange={e=>s("installments",parseInt(e.target.value))}><option value={1}>À vista</option>{Array.from({length:11},(_,i)=><option key={i+2} value={i+2}>{i+2}x de {fmt(Math.round(f.amount/(i+2)*100)/100)}</option>)}</select>{f.installments>1&&f.amount>0&&<div style={{fontSize:11,color:"var(--muted)",marginTop:5}}>{f.installments}x de {fmt(instAmt)} — a partir de {mkL(f.billingMonth)}</div>}</div>
        <div className="ms">
          <div className="ml">Categoria *</div>
          <div className={`pick-field ${f.categoryId?"hv":""}`} onClick={()=>setCatPicker(true)}>
            <span>{selCat?<>{selCat.icon} {selCat.name}</>:<span style={{color:"var(--muted)"}}>Selecionar...</span>}</span>
            <span style={{color:"var(--muted)",fontSize:12}}>▼</span>
          </div>
        </div>
        <div className="ms">
          <div className="ml">Tags</div>
          <div className="pick-field" onClick={()=>setTagPicker(true)}>
            {selTags.length>0?<div>{selTags.map(tg=><span key={tg.id} className="tag-p" style={{background:tg.color+"20",color:tg.color}}>{tg.name}</span>)}</div>:<span style={{color:"var(--muted)",fontSize:13}}>Selecionar tags...</span>}
            <span style={{color:"var(--muted)",fontSize:12}}>▼</span>
          </div>
        </div>
        <div className="ms"><div className="trow" style={{borderBottom:"none"}}><div><div className="tr-lbl">Ignorar</div><div className="tr-sub">Não conta no total da fatura</div></div><button className={`tog ${f.ignored?"on":""}`} onClick={()=>s("ignored",!f.ignored)}/></div></div>
        {err&&<div className="ms"><div className="err">⚠ {err}</div></div>}
        <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
          <button className="btn bp" onClick={handleSave}><I n="check" s={16} c="#fff"/> {f.installments>1&&!isEdit?`Salvar ${f.installments} parcelas`:"Salvar"}</button>
          {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> {exp?.installmentTotal>1?"Excluir todas as parcelas":"Excluir"}</button>}
        </div>
      </Modal>
      {catPicker&&<PickerModal title="Categoria" items={cats} selected={[f.categoryId]} onSelect={id=>{s("categoryId",id);setCatPicker(false);}} onClose={()=>setCatPicker(false)}/>}
      {tagPicker&&<PickerModal title="Tags" items={tags} selected={f.tagIds} multi onSelect={togTag} onClose={()=>setTagPicker(false)}/>}
    </>
  );
}

// ─── Pay Bill Modal ───────────────────────────────────────────────────────────
function PayBillModal({cardId,amount,accounts,onClose,onPay}){
  const[accId,setAccId]=useState(accounts[0]?.id||"");
  const[val,setVal]=useState(amount||0);
  return(
    <Modal title="Pagar fatura" onClose={onClose}>
      <Calc value={val} onChange={setVal} label="Valor a pagar"/>
      <div className="ms"><div className="ml">Debitar da conta</div><select className="field" value={accId} onChange={e=>setAccId(e.target.value)}>{accounts.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}</select></div>
      <div className="ms"><button className="btn bp" onClick={()=>val>0&&onPay(cardId,accId,val)}><I n="check" s={16} c="#fff"/> Confirmar pagamento</button></div>
    </Modal>
  );
}

// ─── Category Modal ───────────────────────────────────────────────────────────
function CatModal({cat,onClose,onSave,onDelete}){
  const[f,setF]=useState({name:"",icon:"📦",color:"#6a6a8a",type:cat?._type||"expense",...cat});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <Modal title={cat?.id?"Editar categoria":"Nova categoria"} onClose={onClose}>
      <div className="ms"><div className="seg"><button className={`sb ${f.type==="expense"?"on":""}`} style={f.type==="expense"?{background:"var(--red)",color:"#fff"}:{}} onClick={()=>s("type","expense")}>Despesa</button><button className={`sb ${f.type==="income"?"on":""}`} style={f.type==="income"?{background:"var(--green)",color:"#fff"}:{}} onClick={()=>s("type","income")}>Receita</button></div></div>
      <div className="ms"><div className="ml">Nome</div><input className="field" value={f.name} onChange={e=>s("name",e.target.value)}/></div>
      <div className="ms"><div className="ml">Ícone</div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{CAT_ICONS.map(i=><button key={i} style={{width:40,height:40,borderRadius:10,background:"var(--bg4)",border:`2px solid ${f.icon===i?"var(--accent)":"var(--border)"}`,fontSize:17,cursor:"pointer"}} onClick={()=>s("icon",i)}>{i}</button>)}</div></div>
      <div className="ms"><div className="ml">Cor</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{COLORS.map(c=><button key={c} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${f.color===c?"#fff":"transparent"}`,transform:f.color===c?"scale(1.2)":"none",cursor:"pointer"}} onClick={()=>s("color",c)}/>)}</div></div>
      <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
        <button className="btn bp" onClick={()=>onSave({...f,id:f.id||uid()})}><I n="check" s={16} c="#fff"/> Salvar</button>
        {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> Excluir</button>}
      </div>
    </Modal>
  );
}

// ─── Tag Modal ────────────────────────────────────────────────────────────────
function TagModal({tag,onClose,onSave,onDelete}){
  const[f,setF]=useState({name:"",color:"#7060c0",...tag});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <Modal title={tag?.id?"Editar tag":"Nova tag"} onClose={onClose}>
      <div className="ms"><div className="ml">Nome</div><input className="field" value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Ex: Essencial, Trabalho..."/></div>
      <div className="ms"><div className="ml">Cor</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{COLORS.map(c=><button key={c} style={{width:28,height:28,borderRadius:"50%",background:c,border:`2px solid ${f.color===c?"#fff":"transparent"}`,transform:f.color===c?"scale(1.2)":"none",cursor:"pointer"}} onClick={()=>s("color",c)}/>)}</div></div>
      <div style={{padding:"8px 20px 10px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:"var(--muted)"}}>Preview:</span><span className="tag-p" style={{background:f.color+"20",color:f.color,fontSize:12,padding:"4px 11px"}}>{f.name||"Tag"}</span></div>
      <div className="ms" style={{display:"flex",flexDirection:"column",gap:9}}>
        <button className="btn bp" onClick={()=>onSave({...f,id:f.id||uid()})}><I n="check" s={16} c="#fff"/> Salvar</button>
        {onDelete&&<button className="btn bd" onClick={()=>onDelete(f.id)}><I n="trash" s={16}/> Excluir tag</button>}
      </div>
    </Modal>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
</script>


// ─── Change / Set PIN Modal ───────────────────────────────────────────────────
function ChangePinModal({ onClose, onChanged }) {
  const hasPin = !!getStoredPin();
  const [step, setStep] = useState(hasPin ? 0 : 1); // 0=verify old, 1=new, 2=confirm
  const [pin, setPin]   = useState('');
  const [newPin, setNewPin] = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const PIN_LEN = 4;

  const labels = {
    0: 'Digite o PIN atual para confirmar',
    1: 'Digite o novo PIN (4 dígitos)',
    2: 'Confirme o novo PIN',
  };

  const val = step === 0 ? pin : step === 1 ? newPin : pin;

  const pressKey = (d) => {
    if (busy) return;
    setErr('');
    const next = val + d;
    if (next.length > PIN_LEN) return;
    if (step === 0) setPin(next);
    else if (step === 1) setNewPin(next);
    else setPin(next);
    if (next.length === PIN_LEN) setTimeout(() => evaluate(next), 80);
  };

  const evaluate = async (entered) => {
    if (step === 0) {
      setBusy(true);
      const ok = await verifyPin(entered);
      setBusy(false);
      if (ok) { setPin(''); setStep(1); }
      else { setErr('PIN incorreto'); setPin(''); }
    } else if (step === 1) {
      setStep(2); setPin('');
    } else {
      if (entered === newPin) {
        setBusy(true);
        if (newPin) await setStoredPin(newPin); else clearStoredPin();
        setBusy(false);
        onChanged();
      } else { setErr('PINs não coincidem'); setNewPin(''); setPin(''); setStep(1); }
    }
  };

  const delKey = () => {
    if (busy) return;
    setErr('');
    if (step === 0) setPin(p => p.slice(0,-1));
    else if (step === 1) setNewPin(p => p.slice(0,-1));
    else setPin(p => p.slice(0,-1));
  };

  const dots = Array.from({length:PIN_LEN},(_,i)=>(
    <div key={i} className={`pin-dot ${i<val.length?'filled':''}`}/>
  ));

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <Modal title={hasPin ? "Alterar PIN" : "Configurar PIN"} onClose={onClose}>
      <div className="ms" style={{textAlign:'center',paddingTop:8}}>
        <div style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>{labels[step]}</div>
        <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:16}}>
          {dots}
        </div>
        {(err || busy) && <div className="err" style={{marginBottom:8}}>
          {busy ? '🔐 Processando...' : '⚠ ' + err}
        </div>}
        <div className="pin-grid" style={{margin:'0 auto',maxWidth:260}}>
          {KEYS.map((k,i)=>{
            if(k==='')return <div key={i} className="pin-key empty"/>;
            if(k==='⌫')return <button key={i} className="pin-key del" onClick={delKey} disabled={busy}>{k}</button>;
            return <button key={i} className="pin-key" onClick={()=>pressKey(k)} disabled={busy}>{k}</button>;
          })}
        </div>
        {hasPin && step===0 && !busy && (
          <button className="btn bd" style={{marginTop:16}} onClick={()=>{
            if(window.confirm('Remover o PIN? Seus dados serão mantidos.')) {
              clearStoredPin(); onChanged();
            }
          }}>
            Remover PIN
          </button>
        )}
      </div>
    </Modal>
  );
}
