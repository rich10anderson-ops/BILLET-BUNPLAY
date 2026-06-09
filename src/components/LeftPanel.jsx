import React, { useState } from 'react'
import { useCurrency } from '../providers/CurrencyProvider'

export default function LeftPanel(){
  const { balances } = useCurrency()
  const [pinned,setPinned]=useState(false)
  const [collapsed,setCollapsed]=useState(true)

  return (
    <aside
      className={`left-panel ${collapsed ? 'collapsed' : 'expanded'}`}
      onMouseEnter={()=>{ if(!pinned) setCollapsed(false) }}
      onMouseLeave={()=>{ if(!pinned) setCollapsed(true) }}
    >
      <div className="profile" style={{justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div className="avatar">$</div>
          {!collapsed && (
            <div>
              <div style={{fontWeight:800}}>Cuenta NEXOPAY</div>
              <div className="small">Gestiona múltiples monedas</div>
            </div>
          )}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <button className="btn" onClick={()=>setPinned(p=>!p)} style={{padding:'6px 8px'}}>{pinned ? '📌' : '📎'}</button>
          <button className="btn" onClick={()=>setCollapsed(c=>!c)} style={{padding:'6px 8px'}}>{collapsed ? '›' : '‹'}</button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="menu">
            <div className="item">Dashboard</div>
            <div className="item">Administrar dinero</div>
            <div className="item">Convertir divisas</div>
            <div className="item">Invertir / Ahorro</div>
            <div className="item">Historial</div>
          </div>
          <div style={{marginTop:16}}>
            <div className="small">Balances</div>
            {Object.entries(balances).map(([k,v])=> (
              <div key={k} className="small">{k}: {v.toFixed(2)}</div>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
