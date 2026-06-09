import React from 'react'
import { useAuth } from '../providers/AuthProvider'

export default function Navbar(){
  const { user, login } = useAuth()
  return (
    <header className="navbar">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="brand">NEXOPAY</div>
        <div className="small">Mercados · Divisas</div>
      </div>
      <div className="nav-actions">
        <button className="btn btn-ghost">Me gusta ❤️</button>
        {!user ? (
          <>
            <button className="btn" onClick={login}>Ingresar</button>
            <button className="btn btn-primary">Registrarse</button>
          </>
        ) : (
          <div className="small">Hola, {user.name}</div>
        )}
      </div>
    </header>
  )
}
