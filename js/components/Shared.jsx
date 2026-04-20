// ─── PickerModal ──────────────────────────────────────────────────────────────
function PickerModal({title,items,selected=[],multi=false,onSelect,onClose}){
  const[q,setQ]=useState("");
  const filtered=items.filter(i=>i.name.toLowerCase().includes(q.toLowerCase()));
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxHeight:"72vh"}}>
        <div className="mh"/>
        <div className="mt">{title}<button style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)"}} onClick={onClose}><I n="x" s={18}/></button></div>
        <div className="ms"><input className="field" placeholder="🔍 Buscar..." value={q} onChange={e=>setQ(e.target.value)} style={{fontSize:13}}/></div>
        {filtered.map(item=>{
          const isSel=Array.isArray(selected)?selected.includes(item.id):selected===item.id;
          return(
            <div key={item.id} className={`pl-item ${isSel?"sel":""}`} onClick={()=>onSelect(item.id)}>
              {item.icon&&<span style={{fontSize:18,width:28,textAlign:"center"}}>{item.icon}</span>}
              {!item.icon&&item.color&&<div style={{width:12,height:12,borderRadius:3,background:item.color,flexShrink:0}}/>}
              <span style={{flex:1,fontSize:14,fontWeight:600}}>{item.name}</span>
              {isSel&&<span style={{color:"var(--accent)",fontWeight:800}}>✓</span>}
            </div>
          );
        })}
        {multi&&<div className="ms" style={{marginTop:8}}><button className="btn bp" onClick={onClose}><I n="check" s={16} c="#fff"/> Confirmar</button></div>}
      </div>
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────
function DonutChart({data,size=140}){
  const total=data.reduce((s,d)=>s+d.value,0);
  if(!total)return null;
  const cx=size/2,cy=size/2,r=size*.38,ir=size*.24;
  let angle=-Math.PI/2;
  const slices=data.map(d=>{const ratio=d.value/total,sweep=ratio*2*Math.PI,start=angle;angle+=sweep;return{...d,ratio,start,sweep};});
  return(
    <svg width={size} height={size}>
      {slices.map((sl,i)=>{
        if(sl.ratio<.005)return null;
        const x1o=cx+r*Math.cos(sl.start),y1o=cy+r*Math.sin(sl.start);
        const x2o=cx+r*Math.cos(sl.start+sl.sweep),y2o=cy+r*Math.sin(sl.start+sl.sweep);
        const x1i=cx+ir*Math.cos(sl.start),y1i=cy+ir*Math.sin(sl.start);
        const x2i=cx+ir*Math.cos(sl.start+sl.sweep),y2i=cy+ir*Math.sin(sl.start+sl.sweep);
        const lg=sl.sweep>Math.PI?1:0;
        return <path key={i} d={`M${x1i},${y1i}L${x1o},${y1o}A${r},${r} 0 ${lg},1 ${x2o},${y2o}L${x2i},${y2i}A${ir},${ir} 0 ${lg},0 ${x1i},${y1i}Z`} fill={sl.color}/>;
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{fill:"var(--text)",fontSize:10,fontWeight:700}}>{data.length} cat.</text>
    </svg>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({title,onClose,children}){
  return(
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="mh"/>
        <div className="mt"><span>{title}</span><button style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)"}} onClick={onClose}><I n="x" s={19}/></button></div>
        {children}
      </div>
    </div>
  );
}

