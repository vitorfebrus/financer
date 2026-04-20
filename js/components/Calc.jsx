// ─── Calc component ───────────────────────────────────────────────────────────
function Calc({value,onChange,label="Valor"}){
  const[open,setOpen]=useState(false);
  const[expr,setExpr]=useState("");
  const result=useMemo(()=>expr?evalE(expr):value,[expr,value]);
  const display=result!==null?result:value;
  const press=useCallback(k=>{
    if(k==="C"){setExpr("");onChange(0);return;}
    if(k==="⌫"){setExpr(p=>{const n=p.slice(0,-1);const r=evalE(n);if(r!==null)onChange(r);else if(!n)onChange(0);return n;});return;}
    if(k==="="){onChange(Math.round((evalE(expr)??value)*100)/100);setExpr("");setOpen(false);return;}
    const ch=k===","?".":k;
    setExpr(p=>{const nxt=p+ch;const r=evalE(nxt);if(r!==null)onChange(r);return nxt;});
  },[expr,value,onChange]);
  const ROWS=[["7","8","9","÷"],["4","5","6","×"],["1","2","3","-"],["C","0","⌫","+"]];
  return(
    <div className="ms">
      <div className="ml">{label}</div>
      <div className="at" onClick={()=>setOpen(p=>!p)}>
        <span className="ac2">R$</span>
        <span className="av">{fmt(value).replace("R$","").replace(/\u00a0/g," ").trim()}</span>
        <span className="ah">{open?"▲":"▼"}</span>
      </div>
      {open&&<div className="cw">
        <div className="cd"><div className="ce">{expr||" "}</div><div className="cr">{fmt(display).replace("R$","").trim()}</div></div>
        <div className="cg">
          {ROWS.map((row,ri)=>row.map((k,ki)=>{
            const cls=k==="C"?"ck cl":k==="⌫"?"ck dl":["+","-","×","÷"].includes(k)?"ck op":"ck";
            return <button key={`${ri}-${ki}`} className={cls} onClick={()=>press(k==="÷"?"/":k==="×"?"*":k)}>{k}</button>;
          }))}
          <button className="ck" onClick={()=>press(",")}>","</button>
          <button className="ck eq s3" onClick={()=>press("=")}>=</button>
        </div>
      </div>}
    </div>
  );
}

