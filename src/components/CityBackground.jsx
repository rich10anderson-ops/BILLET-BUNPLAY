import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

function makeGraffitiCanvas(text='NEXOPAY', w=512, h=256){
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  // background gradient
  const g = ctx.createLinearGradient(0,0,w,0)
  g.addColorStop(0,'#0ff'); g.addColorStop(0.5,'#ff00f7'); g.addColorStop(1,'#ffd700')
  ctx.fillStyle = g
  ctx.fillRect(0,0,w,h)

  // noise / paint splatters
  for(let i=0;i<120;i++){
    ctx.fillStyle = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${0.06 + Math.random()*0.2})`
    const r = 1 + Math.random()*6
    ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, r,0,Math.PI*2); ctx.fill()
  }

  // big graffiti text
  ctx.font = 'bold 80px Arial'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 12
  ctx.fillStyle = 'white'
  ctx.fillText(text, w/2, h/2 + 20)

  // overlay stroke
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.strokeText(text, w/2, h/2 + 20)
  return canvas
}

export default function CityBackground(){
  const mountRef = useRef(null)

  useEffect(()=>{
    const mount = mountRef.current
    if(!mount) return

    const w = mount.clientWidth, h = mount.clientHeight
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050615, 0.0018)

    const camera = new THREE.PerspectiveCamera(50, w/h, 1, 2500)
    camera.position.set(0, 90, 260)

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.outputEncoding = THREE.sRGBEncoding
    mount.appendChild(renderer.domElement)

    // lights
    const ambient = new THREE.AmbientLight(0x3a3f55, 0.8)
    scene.add(ambient)

    const hemi = new THREE.HemisphereLight(0x40486b, 0x0a0720, 0.4)
    scene.add(hemi)

    const movingLights = []

    // create a few neon point lights
    const neonColors = [0x00f0ff,0xff00f7,0xffd400]
    for(let i=0;i<6;i++){
      const c = neonColors[i%neonColors.length]
      const p = new THREE.PointLight(c, 1.2, 500, 2)
      p.position.set((i-3)*120, 60, -50 + (i%2)*80)
      scene.add(p); movingLights.push(p)
    }

    // ground / street with neon lane
    const groundGeo = new THREE.PlaneGeometry(2000,2000)
    const groundMat = new THREE.MeshStandardMaterial({color:0x070814, metalness:0.2, roughness:0.9})
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI/2
    ground.position.y = -2
    scene.add(ground)

    // neon road strip
    const neonGeo = new THREE.PlaneGeometry(400, 40)
    const neonMat = new THREE.MeshBasicMaterial({color:0x00f0ff, transparent:true, opacity:0.08})
    const neon = new THREE.Mesh(neonGeo, neonMat)
    neon.rotation.x = -Math.PI/2
    neon.position.set(0, -1.9, 40)
    scene.add(neon)

    // building grid (density adaptive for mobile)
    const buildingGroup = new THREE.Group()
    const boxGeo = new THREE.BoxGeometry(1,1,1)
    const isMobile = window.innerWidth < 700
    const xRange = isMobile ? 20 : 60
    const zRange = isMobile ? 6 : 12
    for(let x=-xRange;x<=xRange;x+=2){
      for(let z=-zRange;z<=zRange;z+=2){
        if(Math.random() < 0.12) continue // create gaps
        const h = 6 + Math.random()*80
        const col = 0x081024
        const mat = new THREE.MeshStandardMaterial({color:col, emissive:0x000000, metalness:0.25, roughness:0.6})
        const m = new THREE.Mesh(boxGeo, mat)
        m.scale.set(2 + Math.random()*1.5, h, 1.6 + Math.random()*1.2)
        m.position.set(x*4 + (Math.random()-0.5)*2, h/2 - 2, z*10 + (Math.random()-0.5)*6)
        buildingGroup.add(m)
      }
    }
    scene.add(buildingGroup)

    // billboards with graffiti textures
    const billboards = new THREE.Group()
    for(let i=0;i<8;i++){
      const canvas = makeGraffitiCanvas('NEXOPAY', 512, 256)
      const tex = new THREE.CanvasTexture(canvas)
      tex.encoding = THREE.sRGBEncoding
      const mat = new THREE.MeshBasicMaterial({map:tex, transparent:true})
      const geo = new THREE.PlaneGeometry(60,30)
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set((i-4)*140, 40 + Math.random()*40, -30 + (i%2)*40)
      mesh.rotation.y = Math.PI/12 + (Math.random()-0.5)*0.2
      billboards.add(mesh)
    }
    scene.add(billboards)

    // simple cars (boxes) moving along a lane
    const cars = []
    const carGeo = new THREE.BoxGeometry(6,2,3)
    for(let i=0;i<10;i++){
      const mat = new THREE.MeshStandardMaterial({color: Math.random()*0xffffff, emissive: 0x222222, metalness:0.3, roughness:0.4})
      const car = new THREE.Mesh(carGeo, mat)
      car.position.set(-200 + i*60, 0.5, 50 + (i%2)*10)
      scene.add(car); cars.push(car)
      // headlights
      const hl = new THREE.PointLight(0xfff0d5, 0.8, 80, 2)
      hl.position.set(car.position.x+3, 0.5, car.position.z-1)
      scene.add(hl)
    }

    // animate
    let t = 0
    const animate = ()=>{
      t += 0.012
      // moving neon lights
      movingLights.forEach((l,i)=>{
        l.position.x = Math.sin(t*0.6 + i)*220
        l.position.z = Math.cos(t*0.4 + i)*120
      })

      // buildings window flicker (emissive intensity)
      buildingGroup.children.forEach((b, idx)=>{
        const flick = Math.abs(Math.sin(t*(0.2 + (idx%5)*0.01) + idx))*0.5
        const colorFactor = 0.02 + flick*0.08
        b.material.emissive.setRGB(0.02*colorFactor, 0.06*colorFactor, 0.2*colorFactor)
      })

      // animate cars
      cars.forEach((c, i)=>{
        c.position.x += 1.8 + Math.sin(t + i)*0.4
        if(c.position.x > 220) c.position.x = -240
      })

      // subtle camera motion
      camera.position.x = Math.sin(t*0.06)*22
      camera.position.y = 85 + Math.sin(t*0.02)*6
      camera.lookAt(0,30,0)

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    // resize
    const handleResize = ()=>{
      const W = mount.clientWidth; const H = mount.clientHeight
      camera.aspect = W/H; camera.updateProjectionMatrix()
      renderer.setSize(W,H)
    }
    window.addEventListener('resize', handleResize)

    // cleanup
    return ()=>{
      window.removeEventListener('resize', handleResize)
      // dispose textures and renderer
      billboards.children.forEach(m=>{ if(m.material.map) m.material.map.dispose(); m.material.dispose(); m.geometry.dispose() })
      buildingGroup.children.forEach(b=>{ b.geometry.dispose(); b.material.dispose() })
      cars.forEach(c=>{ c.geometry.dispose(); c.material.dispose() })
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  },[])

  return (
    <div ref={mountRef} style={{position:'fixed',inset:0,zIndex:-2}} />
  )
}
