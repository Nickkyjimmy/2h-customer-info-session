'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useScroll, useSpring, MotionValue, useMotionValue, useTransform, motion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'


const FRAME_COUNT = 240
const HERO_FRAME_PATH = '/hero-animation/{i}.webp'
const OPENING_FRAME_PATH = '/opening-animation/{i}.webp'

const Scene = ({ heroImages, openingImages, scrollYProgress }: { heroImages: HTMLImageElement[], openingImages: HTMLImageElement[], scrollYProgress: MotionValue<number> }) => {
  const heroMeshRef = useRef<THREE.Mesh>(null)
  const openingMeshRef = useRef<THREE.Mesh>(null)
  
  // Textures
  const heroTexture = useMemo(() => {
     const t = new THREE.Texture()
     t.colorSpace = THREE.SRGBColorSpace
     t.minFilter = THREE.LinearFilter
     t.magFilter = THREE.LinearFilter
     t.generateMipmaps = false
     return t
  }, [])

  const openingTexture = useMemo(() => {
     const t = new THREE.Texture()
     t.colorSpace = THREE.SRGBColorSpace
     t.minFilter = THREE.LinearFilter
     t.magFilter = THREE.LinearFilter
     t.generateMipmaps = false
     return t
  }, [])

  /* Parallax tilt removed */

  const { viewport } = useThree()
  
  // Calculate sizes
  const getSize = (imgs: HTMLImageElement[]) => {
      if (imgs.length === 0) return [1, 1] as [number, number]
      const img = imgs[0]
      const imgAspect = img.width / img.height
      const viewAspect = viewport.width / viewport.height
      let w, h
      if (imgAspect > viewAspect) {
          h = viewport.height
          w = h * imgAspect
      } else {
          w = viewport.width
          h = w / imgAspect
      }
      return [w, h] as [number, number]
  }

  const heroSize = useMemo(() => getSize(heroImages), [viewport, heroImages])
  const openingSize = useMemo(() => getSize(openingImages), [viewport, openingImages])

  useFrame(() => {
    const progress = scrollYProgress.get()

    // --- HERO ANIMATION (0 - 0.5) ---
    // Transition point: 0.45 -> 0.55 (Zoom In)
    const TRANSITION_START = 0.45
    const TRANSITION_END = 0.55
    const HERO_END = 0.5

    if (heroMeshRef.current && heroImages.length > 0) {
        // Map progress 0 -> HERO_END to frames
        // We clamp frame update to stop at end of sequence
        const heroProg = Math.min(1, progress / HERO_END)
        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.floor(heroProg * (FRAME_COUNT - 1)))
        )
        const img = heroImages[frameIndex]
        if (img && img.complete && heroTexture.image !== img) {
            heroTexture.image = img
            heroTexture.needsUpdate = true
        }

        // Zoom Transition
        if (progress > TRANSITION_START) {
            const t = Math.max(0, (progress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START))
            const easeT = t * t * t // Cubic ease
            heroMeshRef.current.position.z = THREE.MathUtils.lerp(0, 10, easeT);
            (heroMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - easeT 
        } else {
            heroMeshRef.current.position.z = 0;
            (heroMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 1
        }
    }

    // --- OPENING ANIMATION (0.5 - 1.0) ---
    const OPENING_START = 0.5
    
    if (openingMeshRef.current && openingImages.length > 0) {
        if (progress > OPENING_START) {
            openingMeshRef.current.visible = true
            
            // Map progress 0.5 -> 1.0 to frames
            const openingProg = (progress - OPENING_START) / (1 - OPENING_START)
             const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.max(0, Math.floor(openingProg * (FRAME_COUNT - 1)))
            )
            const img = openingImages[frameIndex]
            if (img && img.complete && openingTexture.image !== img) {
                openingTexture.image = img
                openingTexture.needsUpdate = true
            }
            
            // Fade in just in case
            // openingMeshRef.current.material.opacity = Math.min(1, (progress - OPENING_START) * 10)
        } else {
            openingMeshRef.current.visible = false
        }
    }
  })

  return (
    <>
        <mesh ref={heroMeshRef}>
            <planeGeometry args={[heroSize[0], heroSize[1]]} />
            <meshBasicMaterial map={heroTexture} toneMapped={false} transparent />
        </mesh>
        <mesh ref={openingMeshRef} position={[0,0,0]}> {/* At Z=0 to cover viewport correctly */}
            <planeGeometry args={[openingSize[0], openingSize[1]]} />
            <meshBasicMaterial map={openingTexture} toneMapped={false} transparent />
        </mesh>
    </>
  )
}

export default function KeyboardScroll({ onLoadComplete, onProgress }: { onLoadComplete?: () => void, onProgress?: (p: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [heroImages, setHeroImages] = useState<HTMLImageElement[]>([])
  const [openingImages, setOpeningImages] = useState<HTMLImageElement[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  // Slower spring for smoother long scroll
  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.8,
    damping: 30,
    stiffness: 45,
    restDelta: 0.0001
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Optimized progressive image loading
  useEffect(() => {
    const loadedHero: HTMLImageElement[] = new Array(FRAME_COUNT)
    const loadedOpening: HTMLImageElement[] = new Array(FRAME_COUNT)
    let loadedCount = 0
    const TOTAL_FRAMES = FRAME_COUNT * 2
    const INITIAL_LOAD_COUNT = 40 // Broadened initial load

    const updateProgress = () => {
      loadedCount++
      const progress = Math.round((loadedCount / TOTAL_FRAMES) * 100)
      onProgress?.(progress)
      
      if (loadedCount === TOTAL_FRAMES) {
        setIsLoaded(true)
        onLoadComplete?.()
      }
    }

    const loadImage = (index: number, type: 'hero' | 'opening') => {
      return new Promise<void>((resolve) => {
          const img = new Image()
          const paddedNumber = index.toString().padStart(5, '0')
          const pathTemplate = type === 'hero' ? HERO_FRAME_PATH : OPENING_FRAME_PATH
          const path = pathTemplate.replace('{i}', paddedNumber)
          
          img.onload = async () => {
            try { await img.decode() } catch (e) {}
            // Assign to array
            if (type === 'hero') loadedHero[index - 1] = img
            else loadedOpening[index - 1] = img
            
            updateProgress()
            resolve()
          }
          img.onerror = () => {
            console.error(`Failed to load ${type} frame ${index}`)
            updateProgress()
            resolve()
          }
          
          img.src = path
      })
    }

    const loadAll = async () => {
      // Priority: Hero & Opening First 20 frames
      const priorityTasks = []
      for (let i = 1; i <= 20; i++) {
          priorityTasks.push(loadImage(i, 'hero'))
          priorityTasks.push(loadImage(i, 'opening'))
      }
      await Promise.all(priorityTasks)

      // Background loading
      const batchSize = 20
      for (let i = 21; i <= FRAME_COUNT; i += batchSize) {
        const batch = []
        for (let j = i; j < Math.min(i + batchSize, FRAME_COUNT + 1); j++) {
            batch.push(loadImage(j, 'hero'))
            batch.push(loadImage(j, 'opening'))
        }
        await Promise.all(batch)
        // Shorter delay since we are batching efficiently
        await new Promise(r => setTimeout(r, 10))
      }
    }

    loadAll()
    setHeroImages(loadedHero)
    setOpeningImages(loadedOpening)
  }, [])
  
  return (
    <div ref={containerRef} className="relative h-[600vh]">
      <div className="sticky top-0 h-screen w-full" style={{ willChange: 'transform' }}>
        {isLoaded && (
          <div className="absolute inset-0 z-20 pointer-events-none"></div>
        )}
        {isLoaded ? (
             <Canvas 
                gl={{ antialias: false, powerPreference: "high-performance", stencil: false, depth: false }} 
                camera={{ position: [0, 0, 5], fov: 35 }}
                className="w-full h-full"
                dpr={isMobile ? [1, 1] : [1, 1.5]}
                flat
            >
                <Scene heroImages={heroImages} openingImages={openingImages} scrollYProgress={smoothProgress} />
            </Canvas>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black"></div>
        )}
      </div>
    </div>
  )
}
