import React, { useEffect, useState } from 'react'
import { fetchTopCurrencies } from '../services/api'

export default function RightPanel(){
  const [tickers,setTickers]=useState([])
  useEffect(()=>{
    let mounted=true
    fetchTopCurrencies().then(d=>{ if(mounted) setTickers(d.slice(0,10))})
    const id=setInterval(()=>fetchTopCurrencies().then(d=>{ if(mounted) setTickers(d.slice(0,10)) }), 15000)
    return ()=>{mounted=false;clearInterval(id)}
  },[])

  return (
    <aside className="right-panel">
      <div className="currency-feed">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="small">Mercados en vivo</div>
          <div className="small">Actualiza cada 15s</div>
        </div>
        <div style={{marginTop:8}}>
          {tickers.map(t=> (
            <div key={t.id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0'}}>
              <div>
                <div style={{fontWeight:700}}>{t.symbol.toUpperCase()}</div>
                <div className="small">{t.name}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="neon-text">${t.current_price.toLocaleString()}</div>
                <div className="small">{t.price_change_percentage_24h?.toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
