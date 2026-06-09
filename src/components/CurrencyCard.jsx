import React, { useState } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'

export default function CurrencyCard({ currency }){
  const { simulateBuy, simulateSell } = useCurrency()
  const [amount,setAmount]=useState(0)

  return (
    <div style={{padding:12,background:'rgba(0,0,0,0.06)',borderRadius:10}}>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        <div>
          <div style={{fontWeight:800}}>{currency.symbol.toUpperCase()}</div>
          <div className="small">{currency.name}</div>
        </div>
        <div className="neon-text">${currency.current_price}</div>
      </div>
      <div style={{marginTop:10,display:'flex',gap:8}}>
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} style={{flex:1,padding:8,borderRadius:8}} />
        <button className="btn btn-primary" onClick={()=>simulateBuy(currency.symbol,amount)}>Comprar</button>
        <button className="btn btn-ghost" onClick={()=>simulateSell(currency.symbol,amount)}>Vender</button>
      </div>
    </div>
  )
}
