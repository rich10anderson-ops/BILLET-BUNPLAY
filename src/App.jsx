import React from 'react'
import Navbar from './components/Navbar'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import TradePanel from './components/TradePanel'
import CityBackground from './components/CityBackground'

export default function App(){
  return (
    <div className="app-root neon-bg">
      <Navbar />
      <div className="layout">
        <LeftPanel />
        <CityBackground />
        <main className="main-area">
          <TradePanel />
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
