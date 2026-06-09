import React, { useMemo, useState } from 'react'
import CurrencyCard from './CurrencyCard'
import { useCurrency } from '../providers/CurrencyProvider'

export default function TradePanel(){
  const { currencies } = useCurrency()
  const [page,setPage]=useState(1)
  const pageSize = 6

  const total = currencies.length
  const pages = Math.max(1, Math.ceil(total / pageSize))

  const visible = useMemo(()=>{
    const start=(page-1)*pageSize
    return currencies.slice(start,start+pageSize)
  },[currencies,page])

  function prev(){ setPage(p=>Math.max(1,p-1)) }
  function next(){ setPage(p=>Math.min(pages,p+1)) }

  return (
    <div className="trade-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 className="neon-text">Compra / Venta · NEXOPAY</h2>
        <div className="small">Simula operaciones</div>
      </div>
      <div className="currency-list">
        {visible.map(c=> <CurrencyCard key={c.id} currency={c} />)}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div className="small">Mostrando {visible.length} de {total}</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={prev} disabled={page<=1}>Prev</button>
          <div className="small">{page} / {pages}</div>
          <button className="btn btn-ghost" onClick={next} disabled={page>=pages}>Next</button>
        </div>
      </div>
    </div>
  )
}
