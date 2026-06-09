import React from 'react'
import { Player } from 'lottie-react'

// Drop a Lottie JSON at src/assets/city.json for best effect.
export default function AnimatedCity(){
  let animation = null
  try{ animation = require('../assets/city.json') }catch(e){ animation = null }

  return (
    <div style={{position:'fixed',inset:0,zIndex:-1,overflow:'hidden'}}>
      {animation ? (
        <Player autoplay loop src={animation} style={{width:'100%',height:'100%'}} />
      ) : (
        <div style={{width:'100%',height:'100%',background:'linear-gradient(180deg,#071426,#0b1630)'}} />
      )}
    </div>
  )
}
