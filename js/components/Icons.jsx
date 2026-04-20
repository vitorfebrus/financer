// ─── icons ────────────────────────────────────────────────────────────────────
function I({n,s=20,c="currentColor"}){
  const p={
    home:["M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z","M9 21V12h6v9"],
    list:["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
    card:["M1 4h22v16a2 2 0 01-2 2H3a2 2 0 01-2-2V4z","M1 10h22"],
    bank:["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
    more:["M12 5v.01","M12 12v.01","M12 19v.01"],
    plus:["M12 5v14","M5 12h14"],
    left:["M15 18l-6-6 6-6"],right:["M9 18l6-6-6-6"],
    x:["M18 6L6 18","M6 6l12 12"],check:["M20 6L9 17l-5-5"],
    trash:["M3 6h18","M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6","M10 11v6","M14 11v6"],
    pay:["M12 2v20","M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"],
    import:["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
    export:["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
    filter:["M22 3H2l8 9.46V19l4 2V12.46L22 3"],
    chevdown:["M6 9l6 6 6-6"],
    transfer:["M17 1l4 4-4 4","M3 11V9a4 4 0 014-4h14","M7 23l-4-4 4-4","M21 13v2a4 4 0 01-4 4H3"],
    reset:["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8","M3 3v5h5"],
  };
  return <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{(p[n]||[]).map((d,i)=><path key={i} d={d}/>)}</svg>;
}

