// ─── Main App ─────────────────────────────────────────────────────────────────
function App(){
  const[unlocked,setUnlocked]=useState(false);
  const[pinEnabled,setPinEnabled]=useState(!!getStoredPin());
  const tab_ref = React.useRef("dash");
  const[tab,setTab]=useState("dash");
  const[month,setMonth]=useState(cmk());
  const[accounts,setAccounts]=useState([]);
  const[categories,setCategories]=useState([]);
  const[tags,setTags]=useState([]);
  const[transactions,setTransactions]=useState([]);
  const[cards,setCards]=useState([]);
  const[cardExp,setCardExp]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const[modal,setModal]=useState(null);
  const[editing,setEditing]=useState(null);
  const[toast,setToast]=useState(null);

  // Load
  useEffect(()=>{
    hydrate().then(d=>{
      if(d){
        setAccounts(d.accounts||[]);
        setCategories(d.categories?.length?d.categories:DEF_CATS);
        setTags(d.tags?.length?d.tags:DEF_TAGS);
        setTransactions(d.transactions||[]);
        setCards(d.cards||[]);
        setCardExp(d.cardExp||[]);
      }else{setCategories(DEF_CATS);setTags(DEF_TAGS);}
      setLoaded(true);
      const sp=document.getElementById("splash");
      if(sp){sp.style.opacity="0";setTimeout(()=>sp.remove(),400);}
    });
  },[]);

  useEffect(()=>{if(!loaded)return;persist({accounts,categories,tags,transactions,cards,cardExp});},[accounts,categories,tags,transactions,cards,cardExp,loaded]);

  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),2800);};

  // ── computed ──
  const balances=useMemo(()=>{
    const b={};accounts.forEach(a=>{b[a.id]=a.initialBalance??0;});
    const now=cmk();
    transactions.forEach(t=>{
      if(t.ignored)return;
      const sm=t.date?.slice(0,7);let multi=1;
      if(t.recurring){if(!sm||sm>now)return;multi=diffM(sm,now)+1;}
      const amt=(t.amount??0)*multi;
      if(t.type==="income")b[t.accountId]=(b[t.accountId]??0)+amt;
      else if(t.type==="expense")b[t.accountId]=(b[t.accountId]??0)-amt;
      else if(t.type==="transfer"){b[t.accountId]=(b[t.accountId]??0)-amt;if(t.toAccountId)b[t.toAccountId]=(b[t.toAccountId]??0)+amt;}
    });
    return b;
  },[accounts,transactions]);

  const totalBal=useMemo(()=>Object.values(balances).reduce((s,v)=>s+v,0),[balances]);

  const monthTx=useMemo(()=>transactions.flatMap(t=>{
    const sm=t.date?.slice(0,7);
    if(t.recurring)return(sm&&sm<=month)?[{...t,_virt:true}]:[];
    return sm===month?[t]:[];
  }),[transactions,month]);

  const monthIncome=useMemo(()=>monthTx.filter(t=>t.type==="income"&&!t.ignored).reduce((s,t)=>s+(t.amount??0),0),[monthTx]);
  const monthExpense=useMemo(()=>monthTx.filter(t=>t.type==="expense"&&!t.ignored).reduce((s,t)=>s+(t.amount??0),0),[monthTx]);
  const monthCardExps=useMemo(()=>cardExp.filter(e=>e.billingMonth===month),[cardExp,month]);

  const cardTotals=useMemo(()=>{
    const tot={};
    cardExp.forEach(e=>{if(!tot[e.cardId])tot[e.cardId]={};if(!tot[e.cardId][e.billingMonth])tot[e.cardId][e.billingMonth]=0;if(!e.ignored)tot[e.cardId][e.billingMonth]+=(e.amount??0);});
    return tot;
  },[cardExp]);

  const navMo=d=>setMonth(p=>addM(p,d));
  const open=(type,data=null)=>{setEditing(data);setModal(type);};
  const close=()=>{setModal(null);setEditing(null);};

  // CRUD
  const saveTx=txArr=>{
    if(Array.isArray(txArr))setTransactions(p=>[...p,...txArr]);
    else setTransactions(p=>editing?.id?p.map(x=>x.id===txArr.id?txArr:x):[...p,txArr]);
    close();
  };
  const delTx=id=>{setTransactions(p=>p.filter(x=>x.id!==id));close();};
  const saveTransfer=t=>{setTransactions(p=>editing?.id?p.map(x=>x.id===t.id?t:x):[...p,t]);close();};
  const saveAcc=a=>{setAccounts(p=>editing?.id?p.map(x=>x.id===a.id?a:x):[...p,a]);close();};
  const delAcc=id=>{setAccounts(p=>p.filter(x=>x.id!==id));setTransactions(p=>p.filter(t=>t.accountId!==id&&t.toAccountId!==id));close();};
  const saveCat=c=>{setCategories(p=>editing?.id?p.map(x=>x.id===c.id?c:x):[...p,c]);close();};
  const delCat=id=>{setCategories(p=>p.filter(x=>x.id!==id));close();};
  const saveTag=tg=>{setTags(p=>editing?.id?p.map(x=>x.id===tg.id?tg:x):[...p,tg]);close();};
  const delTag=id=>{setTags(p=>p.filter(x=>x.id!==id));close();};
  const saveCard=c=>{setCards(p=>editing?.id?p.map(x=>x.id===c.id?c:x):[...p,c]);close();};
  const delCard=id=>{setCards(p=>p.filter(x=>x.id!==id));setCardExp(p=>p.filter(e=>e.cardId!==id));close();};
  const saveCardExps=exps=>{
    setCardExp(p=>{
      if(editing?.id){const grp=editing.installmentGroup;if(grp){const ids=p.filter(e=>e.installmentGroup===grp).map(e=>e.id);return[...p.filter(e=>!ids.includes(e.id)),...exps];}return p.map(x=>x.id===exps[0].id?exps[0]:x);}
      return[...p,...exps];
    });close();
  };
  const delCardExp=id=>{const grp=cardExp.find(e=>e.id===id)?.installmentGroup;if(grp)setCardExp(p=>p.filter(e=>e.installmentGroup!==grp));else setCardExp(p=>p.filter(x=>x.id!==id));close();};
  const payBill=(cardId,accountId,amount)=>{if(!accountId||amount<=0)return;const card=cards.find(c=>c.id===cardId);setTransactions(p=>[...p,{id:uid(),type:"expense",amount,date:today(),description:`Fatura ${card?.name||"cartão"}`,accountId,categoryId:"",tagIds:[],ignored:false}]);close();};

  // Notif import
  const handleNotifImport=useCallback((parsed)=>{
    if(parsed.isCard)open("cardexp",{_cardId:cards[0]?.id||"",_prefill:{amount:parsed.amount,description:parsed.description,billingMonth:month}});
    else open("tx",{_type:parsed.type,_prefill:{amount:parsed.amount,description:parsed.description}});
  },[cards,month]);

  // ── Export JSON ──
  const exportData=()=>{
    const data={accounts,categories,tags,transactions,cards,cardExp,exportedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`financas_${today()}.json`;a.click();
    URL.revokeObjectURL(url);
    showToast("Dados exportados!");
  };

  // ── Import JSON (native + Mobills formats) ──────────────────────────────────
  const importData=(file)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        const raw=JSON.parse(e.target.result);
        const result=parseMobillsOrNative(raw);
        if(!result){showToast("Formato de JSON não reconhecido",false);return;}

        if(result.type==="native"){
          // Full replace (native export)
          if(raw.accounts)setAccounts(raw.accounts);
          if(raw.categories?.length)setCategories(raw.categories);
          if(raw.tags?.length)setTags(raw.tags);
          if(raw.transactions)setTransactions(raw.transactions);
          if(raw.cards)setCards(raw.cards);
          if(raw.cardExp)setCardExp(raw.cardExp);
          showToast(`Dados importados! ${raw.transactions?.length||0} transações.`);
          return;
        }

        // Mobills format: merge into current state
        const{importedTx,newAccounts,newCategories,newTags,count}=result;

        setAccounts(prev=>{
          const existingNames=new Set(prev.map(a=>a.name.toLowerCase()));
          const toAdd=newAccounts.filter(a=>!existingNames.has(a.name.toLowerCase()));
          return[...prev,...toAdd];
        });
        setCategories(prev=>{
          const existingNames=new Set(prev.map(c=>c.name.toLowerCase()+c.type));
          const toAdd=newCategories.filter(c=>!existingNames.has(c.name.toLowerCase()+c.type));
          return[...prev,...toAdd];
        });
        setTags(prev=>{
          const existingNames=new Set(prev.map(t=>t.name.toLowerCase()));
          const toAdd=newTags.filter(t=>!existingNames.has(t.name.toLowerCase()));
          return[...prev,...toAdd];
        });
        setTransactions(prev=>{
          const existingExtIds=new Set(prev.map(t=>t._extId).filter(Boolean));
          const toAdd=importedTx.filter(t=>!existingExtIds.has(t._extId));
          return[...prev,...toAdd];
        });
        showToast(`${count} transações importadas do Mobills!`);
      }catch(err){
        console.error(err);
        showToast("Erro ao importar: "+err.message,false);
      }
    };
    reader.readAsText(file);
  };

  const pages={
    dash:<Dash {...{accounts,balances,totalBal,monthIncome,monthExpense,monthTx,monthCardExps,month,navMo,cards,cardTotals,categories,tags,open,handleNotifImport,exportData,importData}}/>,
    tx:<TxPage {...{monthTx,monthCardExps,accounts,categories,tags,cards,month,navMo,monthIncome,monthExpense,open}}/>,
    cards:<CardsPage {...{cards,cardExp,cardTotals,categories,tags,month,navMo,open,accounts,payBill}}/>,
    accounts:<AccPage {...{accounts,balances,open}}/>,
    more:<MorePage {...{categories,tags,open,onChangePIN:()=>setModal('changepin')}}/>,
  };

  // Show PIN screen if PIN is set and not yet unlocked
  if (pinEnabled && !unlocked) {
    return (
      <div className="app">
        <AuthScreen onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  return(
    <div className="app">
      <div className="scroll">{pages[tab]}</div>

      {/* Modals */}
      {modal==="tx"       &&<TxModal       tx={editing}  accounts={accounts} categories={categories} tags={tags} onClose={close} onSave={saveTx} onDelete={editing?.id?delTx:null}/>}
      {modal==="transfer" &&<TransferModal tx={editing}  accounts={accounts} tags={tags}             onClose={close} onSave={saveTransfer} onDelete={editing?.id?(id=>{delTx(id);close();}):null}/>}
      {modal==="account"  &&<AccModal      acc={editing}                                              onClose={close} onSave={saveAcc} onDelete={editing?.id?delAcc:null}/>}
      {modal==="card"     &&<CardModal     card={editing}                                             onClose={close} onSave={saveCard} onDelete={editing?.id?delCard:null}/>}
      {modal==="cardexp"  &&<CardExpModal  exp={editing}  cards={cards} categories={categories} tags={tags} month={month} onClose={close} onSave={saveCardExps} onDelete={editing?.id?delCardExp:null}/>}
      {modal==="paybill"  &&<PayBillModal  cardId={editing?.cardId} amount={editing?.amount} accounts={accounts} onClose={close} onPay={payBill}/>}
      {modal==="category" &&<CatModal      cat={editing}                                              onClose={close} onSave={saveCat} onDelete={editing?.id?delCat:null}/>}
      {modal==="changepin" &&<ChangePinModal onClose={close} onChanged={()=>{setPinEnabled(!!getStoredPin());close();}}/>}
      {modal==="tag"      &&<TagModal      tag={editing}                                              onClose={close} onSave={saveTag} onDelete={editing?.id?delTag:null}/>}

      <FabMenu tab={tab} open={open}/>
      <nav className="nav">
        {[["dash","home","Início"],["tx","list","Transações"],["cards","card","Cartões"],["accounts","bank","Contas"],["more","more","Mais"]].map(([t,ic,lb])=>(
          <button key={t} className={`nb ${tab===t?"on":""}`} onClick={()=>setTab(t)}><I n={ic} s={20}/>{lb}</button>
        ))}
      </nav>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:toast.ok?"rgba(90,170,120,.95)":"rgba(208,96,96,.95)",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,fontFamily:"var(--font)",zIndex:500,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>{toast.ok?"✓":"✗"} {toast.msg}</div>}
    </div>
  );
}


// ─── Mount ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
