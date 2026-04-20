// ─── Default empty filter state (shared between FilterModal and TxPage) ─────────
const EMPTY_FILTERS = {
  type: 'all', search: '', accounts: [], tags: [],
  cats: [], showIgnored: false, onlyFixed: false, onlyCard: false
};

// ─── FilterModal (transactions) ───────────────────────────────────────────────
function FilterModal({filters,setFilters,accounts,categories,tags,onClose}){
  const[f,setF]=useState({...filters});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const togArr=(k,id)=>s(k,f[k].includes(id)?f[k].filter(x=>x!==id):[...f[k],id]);
  const activeCount=[
    f.type!=="all",f.search,f.accounts.length,f.tags.length,f.cats.length,f.showIgnored,f.onlyFixed,f.onlyCard
  ].filter(Boolean).length;
  const reset=()=>setF({type:"all",search:"",accounts:[],tags:[],cats:[],showIgnored:false,onlyFixed:false,onlyCard:false});
  const apply=()=>{setFilters(f);onClose();};
  return(
    <Modal title={<span>Filtros {activeCount>0&&<span className="filter-badge">{activeCount}</span>}</span>} onClose={onClose}>
      {/* Type */}
      <div className="ms">
        <div className="ml">Tipo</div>
        <div className="seg">
          {[["all","Todas"],["income","Receitas"],["expense","Despesas"],["transfer","Transf."]].map(([v,l])=>(
            <button key={v} className={`sb ${f.type===v?"on":""}`} style={f.type===v?{background:"var(--accent)",color:"#fff"}:{}} onClick={()=>s("type",v)}>{l}</button>
          ))}
        </div>
      </div>
      {/* Quick toggles */}
      <div className="ms">
        <div className="trow"><div><div className="tr-lbl">Somente cartão</div></div><button className={`tog ${f.onlyCard?"on":""}`} onClick={()=>s("onlyCard",!f.onlyCard)}/></div>
        <div className="trow"><div><div className="tr-lbl">Somente fixas</div></div><button className={`tog ${f.onlyFixed?"on":""}`} onClick={()=>s("onlyFixed",!f.onlyFixed)}/></div>
        <div className="trow" style={{borderBottom:"none"}}><div><div className="tr-lbl">Mostrar ignoradas</div></div><button className={`tog ${f.showIgnored?"on":""}`} onClick={()=>s("showIgnored",!f.showIgnored)}/></div>
      </div>
      {/* Search */}
      <div className="ms">
        <div className="ml">Buscar texto</div>
        <input className="field" value={f.search} onChange={e=>s("search",e.target.value)} placeholder="Buscar descrição..."/>
      </div>
      {/* Accounts */}
      {accounts.length>0&&<div className="ms">
        <div className="ml">Contas {f.accounts.length>0&&<span className="filter-badge">{f.accounts.length}</span>}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {accounts.map(a=>{
            const on=f.accounts.includes(a.id);
            return <button key={a.id} className="fchip" style={on?{borderColor:a.color,background:a.color+"15",color:a.color}:{}} onClick={()=>togArr("accounts",a.id)}>{a.icon} {a.name}</button>;
          })}
        </div>
      </div>}
      {/* Tags */}
      {tags.length>0&&<div className="ms">
        <div className="ml">Tags {f.tags.length>0&&<span className="filter-badge">{f.tags.length}</span>}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {tags.map(tg=>{
            const on=f.tags.includes(tg.id);
            return <button key={tg.id} className="fchip" style={on?{borderColor:tg.color,background:tg.color+"15",color:tg.color}:{}} onClick={()=>togArr("tags",tg.id)}>{tg.name}</button>;
          })}
        </div>
      </div>}
      {/* Categories */}
      <div className="ms">
        <div className="ml">Categorias {f.cats.length>0&&<span className="filter-badge">{f.cats.length}</span>}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {categories.map(c=>{
            const on=f.cats.includes(c.id);
            return <button key={c.id} className="fchip" style={on?{borderColor:c.color,background:c.color+"15",color:c.color}:{}} onClick={()=>togArr("cats",c.id)}>{c.icon} {c.name}</button>;
          })}
        </div>
      </div>
      {/* Actions */}
      <div className="ms" style={{display:"flex",gap:10}}>
        <button className="btn bs" style={{flex:1}} onClick={reset}><I n="reset" s={16}/> Limpar</button>
        <button className="btn bp" style={{flex:2}} onClick={apply}><I n="check" s={16} c="#fff"/> Aplicar</button>
      </div>
    </Modal>
  );
}

