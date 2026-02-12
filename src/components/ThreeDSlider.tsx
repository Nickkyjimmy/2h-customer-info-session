'use client'

import React, { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';

// --- Type Definitions ---

export interface SliderItemData {
    title: string;
    num: string;
    imageUrl: string;
    data?: any;
}

interface ThreeDSliderProps {
    items: SliderItemData[];
    speedWheel?: number;
    speedDrag?: number;
    containerStyle?: CSSProperties;
    onItemClick?: (item: SliderItemData, index: number) => void;
    progress?: number; // 0 to 100
}

// --- Sub-Component: SliderItem (Pure DOM, no Motion overhead) ---

interface SliderItemProps {
    item: SliderItemData;
    index: number;
    onClick: () => void;
}

// We use forwardRef to expose the DOM element to the parent for direct manipulation
const SliderItem = React.memo(React.forwardRef<HTMLDivElement, SliderItemProps>(({ item, onClick }, ref) => {
    return (
        <div
            ref={ref}
            className="absolute top-1/2 left-1/2 cursor-pointer select-none rounded-xl 
                shadow-2xl bg-transparent transform-origin-[0%_100%] pointer-events-auto
                w-[var(--width)] h-[var(--height)]
                -mt-[calc(var(--height)/2)] -ml-[calc(var(--width)/2)]
                overflow-hidden will-change-transform"
            style={{
                '--width': 'clamp(150px, 30vw, 300px)',
                '--height': 'clamp(200px, 40vw, 400px)',
                transition: 'none', // Critical: handle animation purely via JS
                display: 'block', // Ensure initial visibility
            } as CSSProperties & { [key: string]: any }}
            onClick={onClick}
        >
            <div
                className="slider-item-content absolute inset-0 z-10 transition-opacity duration-300 ease-out will-change-opacity"
                style={{ opacity: 1 }} // Initial opacity
            >
                {/* Overlay for gradient effect */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent via-50% to-black/50"></div>

                {/* Title */}
                <div className="absolute z-10 text-white bottom-5 left-5 text-[clamp(20px,3vw,30px)] drop-shadow-md font-bold uppercase tracking-wider">
                    {item.title}
                </div>

                {/* Number */}
                <div className="absolute z-10 text-white top-2.5 left-5 text-[clamp(20px,10vw,80px)] font-black opacity-50">
                    {item.num}
                </div>

                {/* Image */}
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        </div>
    );
}));

SliderItem.displayName = 'SliderItem';

// --- Main Component: ThreeDSlider ---

const ThreeDSlider: React.FC<ThreeDSliderProps> = ({
    items,
    speedWheel = 0.05,
    speedDrag = -0.15,
    containerStyle = {},
    onItemClick,
    progress: controlledProgress,
}) => {
    // Refs for state that updates 60fps without re-renders
    const progressRef = useRef(50);
    const isControlled = typeof controlledProgress === 'number';

    // Sync controlled progress
    useEffect(() => {
        if (isControlled && controlledProgress !== undefined) {
            progressRef.current = controlledProgress;
        }
    }, [controlledProgress, isControlled]);
    const targetProgressRef = useRef(50); // For smooth damping (optional, or direct mapping)
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const isHoveringRef = useRef(false); // Ref for immediate access in loop
    const rafRef = useRef<number | null>(null);
    const isMobileRef = useRef(false);

    useEffect(() => {
        const handleResize = () => {
             isMobileRef.current = window.innerWidth < 768;
        };
        // Initial check only on client
        if (typeof window !== 'undefined') {
            handleResize();
            window.addEventListener('resize', handleResize);
        }
        return () => {
            if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Array of refs to children elements
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const numItems = items.length;

    // React state only for mounting/initialization if needed
    // We strictly avoid setState during scroll 

    // --- Animation Loop ---
    const update = useCallback(() => {
        if (!itemRefs.current.length) return;

        const progress = progressRef.current;
        const clamped = Math.max(0, Math.min(progress, 100));

        // Continuous index
        const activeFloat = clamped / 100 * (numItems - 1);

        itemRefs.current.forEach((el, index) => {
            if (!el) return;

            // Calculate relationship to active item
            const denominator = numItems > 1 ? numItems - 1 : 1;
            
            // Ratio calculation (-1 to 1 across the whole range)
            const ratio = (index - activeFloat) / denominator; // -1 (leftmost) to 1 (rightmost)

            // Using logic from snippet for visual spread
            const isMobile = isMobileRef.current;
            // Mobile: Vertical layout. Desktop: Horizontal layout.
            const tx = ratio * (isMobile ? 0 : 250); 
            const ty = ratio * (isMobile ? 180 : 40);
            const rot = ratio * (isMobile ? 5 : 45);
            
            // Or stick to snippet exactly if desired:
            // const tx = ratio * 800;
            // const ty = ratio * 200;
            // const rot = ratio * 120;
            // Let's stick closer to snippet but maybe less extreme for generic use case
            // If denominator is 10, then adjacent item is 0.1 away.
            // 0.1 * 800 = 80%. That's perfectly fine. 
            // So we use original values.
            
            const tx_snippet = ratio * 600; // Slower horizontal movement
            const ty_snippet = ratio * 150; 
            const rot_snippet = ratio * 50; // Slower rotation

            const zIndex = Math.round(numItems - Math.abs(index - activeFloat));
            // discrete z-index for stacking order
            // We need a stable z-index.
            const dist = Math.abs(index - activeFloat);
            const z = numItems - dist; // continuous z? CSS z-index needs int
            
            // Allow clicking through to items behind?
            // pointer-events is auto on items.

            // Opacity
            const opacity = 1 - (dist / numItems) * 2; // Custom fade logic

            // Optimize: simple matrix3d or individual properties
            // Individual is often faster for browser composition layers
            el.style.transform = `translate3d(${tx_snippet}%, ${ty_snippet}%, 0) rotate(${rot_snippet}deg)`;
            el.style.zIndex = Math.max(0, Math.round(z * 10)).toString(); // Higher precision z-index logic if allowed, or just round

            // Inner content opacity
            const inner = el.querySelector('.slider-item-content') as HTMLElement;
            if (inner) {
                 // Gradual fade based on distance from center (ratio)
                 // ratio is -1 to 1. 0 is center.
                 // We want 1 at center, fading to 0 at edges.
                 const distRatio = Math.abs(ratio);
                 const fade = 1 - distRatio * 1.5; // 1.5 multiplier makes it fade faster
                 inner.style.opacity = Math.max(0, Math.min(1, fade)).toFixed(2);
            }
        });

        rafRef.current = requestAnimationFrame(update);
    }, [numItems]);

    // Start loop
    useEffect(() => {
        rafRef.current = requestAnimationFrame(update);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [update]);


    // --- Interaction Handlers ---

    const handleWheel = useCallback((e: WheelEvent) => {
        if (!isHoveringRef.current) return;

        const wheelProgress = e.deltaY * speedWheel;
        const current = progressRef.current;
        const next = current + wheelProgress;

        // Check boundaries
        if ((next < 0 && e.deltaY < 0) || (next > 100 && e.deltaY > 0)) {
            // Let page scroll
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        progressRef.current = Math.max(0, Math.min(100, next));
        // No setState here! The loop picks it up.
    }, [speedWheel]);

    const getClientPos = (e: MouseEvent | TouchEvent) => {
        if ('touches' in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
        // Only trigger if clicking inside the container (already handled by event listener attachment?)
        // The event listener is global, so we need to check if target is inside
        // But for simplicity of this component which takes over interaction...
        if (!isHoveringRef.current) return;
        
        isDownRef.current = true;
        const { x, y } = getClientPos(e);
        startXRef.current = x;
        startYRef.current = y;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDownRef.current) return;

        const { x, y } = getClientPos(e);

        const isMobile = isMobileRef.current;
        const diff = isMobile
            ? (y - startYRef.current) * speedDrag // Vertical drag
            : (x - startXRef.current) * speedDrag; // Horizontal drag

        const current = progressRef.current;
        const next = Math.max(0, Math.min(100, current + diff));

        progressRef.current = next;
        startXRef.current = x;
        startYRef.current = y;
    }, [speedDrag]);

    const handleMouseUp = useCallback(() => {
        isDownRef.current = false;
    }, []);

    const handleClick = useCallback((item: SliderItemData, index: number) => {
        // Smooth scroll to this item?
        // For performance, snap or simple lerp logic could be added to the loop
        // For now, instant snap to keep it simple and responsive
        const denominator = numItems > 1 ? numItems - 1 : 1;
        progressRef.current = (index / denominator) * 100;

        if (onItemClick) onItemClick(item, index);
    }, [numItems, onItemClick]);


    const handlers = React.useMemo(() => items.map((item, index) => () => handleClick(item, index)), [items, handleClick]);

    // --- Global Listeners ---
    useEffect(() => {
        if (isControlled) return; // Disable internal control if externally controlled

        const wheelOpts: AddEventListenerOptions = { passive: false };
        
        // Attach to window/document but maybe check hover state inside handlers
        document.addEventListener('wheel', handleWheel, wheelOpts);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchstart', handleMouseDown, { passive: true });
        document.addEventListener('touchmove', handleMouseMove, { passive: true });
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchstart', handleMouseDown);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, isControlled]);

    return (
        <div
            className="three-d-slider-container relative w-full h-full overflow-hidden"
            style={containerStyle}
            onMouseEnter={() => isHoveringRef.current = true}
            onMouseLeave={() => isHoveringRef.current = false}
            onTouchStart={() => isHoveringRef.current = true}
        >
            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                {items.map((item, index) => (
                    <SliderItem
                        key={`slider-item-${index}`}
                        ref={(el) => { itemRefs.current[index] = el; }}
                        item={item}
                        index={index}
                        onClick={handlers[index]}
                    />
                ))}
            </div>
            
        </div>
    );
};

export default ThreeDSlider;
