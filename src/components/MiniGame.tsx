"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip, CustomEase } from "gsap/all";
import confetti from "canvas-confetti";

const COMMON_MESSAGES = [
  "Mở bát nhẹ nhàng, hy vọng đây là bước đệm cho những siêu phẩm sắp tới",
  "Khởi đầu suôn sẻ! Hy vọng đây là tín hiệu cho một chuỗi may mắn sắp tới.",
  "Mở bát nhẹ nhàng, niềm vui lan tỏa. Chúc mừng bạn!",
  "Cứ tích lũy dần dần, ngày huy hoàng không còn xa đâu. Chúc mừng nhé!",
  "Vạn sự khởi đầu nan, có tấm này làm nền thì sau này đánh đâu thắng đó!"
];

const RARE_MESSAGES = [
  "Hào quang tỏa sáng rồi! Chúc mừng bạn đã sở hữu được một cực phẩm hiếm có.",
  "Đúng là báu vật! Không phải ai cũng có duyên để sở hữu tấm thẻ này đâu.",
  "Nhìn là biết đẳng cấp rồi! Chúc mừng bạn đã rinh về một siêu phẩm.",
  "Một sự bổ sung không thể chất lượng hơn. Chúc mừng bạn nhé!"
];

// Card asset images from public/card-asset
const cardImages = [
  "card-1.png", "card-2-10.png", "card-3-10.png", "card-5.png",
  "card-6.png", "card-7.png", "card-8-10.png", "card-9.png",
  "card-10.png", "card-11.png", "card-12.png", "card-13-10.png",
  "card-14.png", "card-15.png", "card-16.png", "card-17.png",
  "card-18.png", "card-19-10.png", "card-20.png", "card-21-10.png",
  "card-22.png", "rare.png"
];

const defaultCollection = cardImages.map((img, i) => ({
  image: `/card-asset/${img}`,
  title: `Member ${i + 1}`,
  name: `Member ${i + 1}`, // You can customize names here
  role: "Role",
  color: "#aa0000"
}));

const collection = defaultCollection;

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip, CustomEase);
}

const ITEMS_COUNT = 21;
const CARD_COUNT = collection.length > 0 ? collection.length : defaultCollection.length;
const cardData = collection.length > 0 ? collection : defaultCollection;

interface MiniGameProps {
  attendanceId: string;
}

export default function MiniGame({ attendanceId }: MiniGameProps) {
  const container1Ref = useRef<HTMLDivElement>(null);
  const gallery1Ref = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const gallery2Ref = useRef<HTMLDivElement>(null);
  const galleryContainer2Ref = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  
  const [isAnimation2Active, setIsAnimation2Active] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);

  interface TransformState {
    angle: number;
    targetRotation: number;
    currentRotation: number;
    targetScale: number;
    currentScale: number;
    targetX: number;
    currentX: number;
    targetY: number;
    currentY: number;
  }

  const cardsRef = useRef<HTMLDivElement[]>([]);
  const transformStateRef = useRef<TransformState[]>([]);
  const parallaxStateRef = useRef({
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    currentX: 0,
    currentY: 0,
    currentZ: 0,
  });
  const animationRef = useRef<number | null>(null);
  const currentTileRef = useRef<HTMLParagraphElement | null>(null);
  const isPreviewActiveRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);
  const skipHideActionRef = useRef<(() => void) | null>(null);
  const hideSelectedCardRef = useRef<(() => void) | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Register CustomEase
    CustomEase.create(
      "hop",
      "M0,0 C0.053, 0.604 0.157,0.72 0.293,0.837 0.435, 0.959 0.633,1 1,1"
    );

    const container1 = container1Ref.current;
    const gallery1 = gallery1Ref.current;
    const loader = loaderRef.current;
    const container2 = container2Ref.current;
    const gallery2 = gallery2Ref.current;
    const galleryContainer2 = galleryContainer2Ref.current;
    const titleContainer = titleContainerRef.current;

    if (!container1 || !gallery1 || !loader || !container2 || !gallery2 || !galleryContainer2 || !titleContainer) {
      return;
    }

    // ========== ANIMATION 1 SETUP ==========
    let isCircularLayout = false;

    // Create items for animation 1
    const createItem = () => {
      if (!gallery1) return;
      
      gallery1.innerHTML = ""; // Clear existing items
      for (let i = 0; i < ITEMS_COUNT; i++) {
        const item = document.createElement("div");
        item.classList.add("item");

        const img = document.createElement("img");
        const cardIndex = (i % CARD_COUNT) + 1;
        img.src = "/card-asset/card-front.png";
        img.alt = `Image ${i}`;

        item.appendChild(img);
        gallery1.appendChild(item);
      }
    };

    const setInitialLinearLayout = () => {
      const items = gallery1.querySelectorAll(".item");
      if (items.length === 0) return;

      const firstItem = items[0] as HTMLElement;
      const totalItemsWidth = (items.length - 1) * 30 + firstItem.offsetWidth;
      const startX = (container1.offsetWidth - totalItemsWidth) / 2;

      items.forEach((item, index) => {
        gsap.set(item, {
          left: `${startX + index * 30}px`,
          top: "150%",
          rotation: 0,
        });
      });

      gsap.to(items, {
        top: "50%",
        y: "-50%",
        duration: 1,
        ease: "hop",
        stagger: 0.03,
      });
    };

    const animateCounter = () => {
      const counterElement = loader.querySelector("p");
      if (!counterElement) return;

      let currentCount = 0;
      const updateInterval = 100; // Faster updates
      const maxDuration = 500;   // 2 seconds instead of 5
      const endValue = 100;
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < maxDuration) {
          currentCount = Math.min(
            currentCount + Math.floor(Math.random() * 30) + 5,
            endValue
          );
          counterElement.textContent = String(currentCount);
          setTimeout(updateCounter, updateInterval);
        } else {
          counterElement.textContent = String(endValue);
          gsap.to(counterElement, {
            y: -20,
            duration: 0.5,
            ease: "power3.inOut",
            delay: 0.1,
            onComplete: () => {
              animateToCircularLayout();
            },
          });
        }
      };
      updateCounter();
    };

    const setCircularLayout = () => {
      const items = gallery1.querySelectorAll(".item");
      const angleIncrement = (2 * Math.PI) / ITEMS_COUNT;
      const radius = 580;
      const centerX = container1.offsetWidth / 2;
      const centerY = container1.offsetHeight / 2;

      items.forEach((item, index) => {
        const angle = index * angleIncrement;
        const itemEl = item as HTMLElement;
        const x = centerX + radius * Math.cos(angle) - itemEl.offsetWidth / 2;
        const y = centerY + radius * Math.sin(angle) - itemEl.offsetHeight / 2;

        gsap.set(item, {
          top: `${y}px`,
          left: `${x}px`,
          rotation: angle * (180 / Math.PI),
          y: "0%",
        });
      });
    };

    const animateToCircularLayout = () => {
      const items = gallery1.querySelectorAll(".item");
      const state = Flip.getState(items);
      setCircularLayout();

      Flip.from(state, {
        duration: 2,
        ease: "hop",
        stagger: -0.03,
        onEnter: (element) => {
          gsap.to(element, {
            rotation: "+=360",
          });
        },
        onComplete: () => {
          transitionToAnimation2();
        },
      });

      isCircularLayout = !isCircularLayout;
    };

    // ========== TRANSITION FUNCTION ==========
    const transitionToAnimation2 = () => {
      gsap.to(container1, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          container1.style.display = "none";
          container2.style.pointerEvents = "auto";
          initAnimation2();
          setIsAnimation2Active(true);

          gsap.to(container2, {
            opacity: 1,
            duration: 1.5,
            ease: "power2.inOut",
          });
        },
      });
    };

    // ========== ANIMATION 2 FUNCTIONS ==========
    const initAnimation2 = () => {
      if (!gallery2 || !galleryContainer2 || !titleContainer) return;
      
      // Clear previous content
      gallery2.innerHTML = "";
      titleContainer.innerHTML = "";
      
      const cards: HTMLDivElement[] = [];
      const transformState: TransformState[] = [];
      
      let isPreviewActive = false;
      let isTransitioning = false;
      let currentTitle: HTMLParagraphElement | null = null;

      const config = {
        imageCount: 25,
        radius: 580,
        sensitivity: 500,
        effectFalloff: 250,
        cardMoveAmount: 50,
        lerpFactor: 0.15,
        isMobile: window.innerWidth < 1000,
      };

      const parallaxState = parallaxStateRef.current;
      
      // Ensure gallery has the correct base styles
      gsap.set(gallery2, {
        width: "600px",
        height: "600px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
        transform: "none"
      });
      
      // Reset gallery container styles
      gsap.set(galleryContainer2, {
        alignItems: "center",
        paddingBottom: 0
      });

      // Create cards for animation 2
      for (let i = 0; i < config.imageCount; i++) {
        const angle = (i / config.imageCount) * Math.PI * 2;
        const x = Math.cos(angle) * config.radius;
        const y = Math.sin(angle) * config.radius;
        
        // Cycle through collection
        const cardIndex = i % collection.length;
        const cardItem = collection[cardIndex];

        const card = document.createElement("div");
        card.className = "card";
        card.dataset.index = String(i);
        card.dataset.title = cardItem.title;

        // Inline styles to ensure matching reference structure
        Object.assign(card.style, {
            position: 'absolute',
            width: '45px',
            height: '60px',
            left: '50%',
            top: '50%',
            marginLeft: '-22.5px',
            marginTop: '-30px',
            borderRadius: '4px',
            transformOrigin: 'center center',
            willChange: 'transform',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'visible',
            overflow: 'hidden',
        });

        // Image
        const img = document.createElement("img");
        img.src = cardItem.image;
        Object.assign(img.style, {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backfaceVisibility: 'visible'
        });
        card.appendChild(img);

        gsap.set(card, {
          x: x,
          y: y,
          rotation: (angle * 180) / Math.PI + 90,
          transformPerspective: 800,
          transformOrigin: "center center",
        });

        gallery2.appendChild(card);
        cards.push(card);

        transformState.push({
          angle: angle,
          targetRotation: 0,
          currentRotation: 0,
          targetScale: 1,
          currentScale: 1,
          targetX: 0,
          currentX: 0,
          targetY: 0,
          currentY: 0,
        });

        card.addEventListener("click", (e) => {
          if (!isPreviewActive && !isTransitioning) {
            e.stopPropagation();
            togglePreview(parseInt(card.dataset.index || "0"));
          }
        });
      }

      cardsRef.current = cards;
      transformStateRef.current = transformState;

      function togglePreview(index: number) {
        isPreviewActive = true;
        isTransitioning = true;
        isPreviewActiveRef.current = true;
        isTransitioningRef.current = true;

        const currentTransformState = transformStateRef.current;
        const angle = currentTransformState[index].angle;
        const targetPosition = (Math.PI * 3) / 2;
        let rotationRadians = targetPosition - angle;

        if (rotationRadians > Math.PI) {
            rotationRadians -= Math.PI * 2;
        } else if (rotationRadians < -Math.PI) {
            rotationRadians += Math.PI * 2;
        }

        // Reset transforms
        currentTransformState.forEach((state) => {
            state.currentRotation = state.targetRotation = 0;
            state.currentScale = state.targetScale = 1;
            state.currentX = state.targetX = 0;
            state.currentY = state.targetY = 0;
        });

        const galleryRotation = (rotationRadians * 180) / Math.PI + 360;

        gsap.to(gallery2, {
            onStart: () => {
                cardsRef.current.forEach((card, i) => {
                    gsap.to(card, {
                        x: config.radius * Math.cos(currentTransformState[i].angle),
                        y: config.radius * Math.sin(currentTransformState[i].angle),
                        rotation: -galleryRotation,
                        scale: 1,
                        duration: 1.25,
                        ease: "power4.out",
                    });
                });
            },
            scale: 2,
            y: 1160,
            rotation: galleryRotation,
            duration: 2,
            ease: "power4.out",
            onComplete: () => {
                isTransitioning = false;
                isTransitioningRef.current = false;
            }
        });

        // Reset parallax
        gsap.to(parallaxState, {
            targetX: 0,
            targetY: 0,
            targetZ: 0,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                gsap.set(galleryContainer2, {
                    rotateX: parallaxState.currentX,
                    rotateY: parallaxState.currentY,
                    rotateZ: parallaxState.currentZ,
                    transformOrigin: "center center",
                });
            },
        });

        // Title Animation with simulated SplitText
        const titleText = cardsRef.current[index].dataset.title || "";
        const p = document.createElement("p");
        const words = titleText.split(" ");
        p.innerHTML = words.map(word => `<span class="word" style="display:inline-block; will-change:transform;">${word}</span>`).join(" ");

        Object.assign(p.style, {
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            fontSize: '36px',
            letterSpacing: '-0.05rem',
            color: '#1f1f1f',
        });
        
        if (titleContainer) {
            titleContainer.appendChild(p);
        }
        currentTitle = p;

        const wordElements = p.querySelectorAll(".word");
        gsap.set(wordElements, { y: "125%" });

        gsap.to(wordElements, {
            y: "0%",
            delay: 1.25,
            duration: 1.25,
            ease: "power4.out",
            stagger: 0.1,
        });
      }

      function resetGallery() {
        if (isTransitioning) return;
        isTransitioning = true;
        isTransitioningRef.current = true;

        if (currentTitle) {
            const wordElements = currentTitle.querySelectorAll(".word");
            gsap.to(wordElements, {
                y: "-125%",
                duration: 0.75,
                delay: 0.5,
                stagger: 0.1,
                ease: "power4.out",
                onComplete: () => {
                    if (currentTitle) {
                        currentTitle.remove();
                        currentTitle = null;
                    }
                }
            });
        }

        const viewportWidth = window.innerWidth;
        let galleryScale = 1;
        if (viewportWidth < 768) {
            galleryScale = 0.6;
        } else if (viewportWidth < 1200) {
            galleryScale = 0.8;
        }

        const currentTransformState = transformStateRef.current;
        cardsRef.current.forEach((card, i) => {
             const angle = currentTransformState[i].angle;
             gsap.to(card, {
                 rotation: (angle * 180) / Math.PI + 90,
                 duration: 2.5,
                 ease: "power4.inOut"
             });
        });

        gsap.to(gallery2, {
            scale: galleryScale,
            y: 0,
            x: 0,
            rotation: 0,
            duration: 2.5,
            ease: "power4.inOut",
            onComplete: () => {
                isPreviewActive = false;
                isTransitioning = false;
                isPreviewActiveRef.current = false;
                isTransitioningRef.current = false;
                Object.assign(parallaxState, {
                    targetX: 0,
                    targetY: 0,
                    targetZ: 0,
                    currentX: 0,
                    currentY: 0,
                    currentZ: 0,
                });
            }
        });
      }

      const handleResize = () => {
          const viewportWidth = window.innerWidth;
          config.isMobile = viewportWidth < 1000;
          
          let galleryScale = 1;
          if(viewportWidth < 768){
              galleryScale = 0.6;
          } else if(viewportWidth < 1200){
              galleryScale = 0.8;
          }
          
          if (!isPreviewActive) {
              gsap.set(gallery2, { scale: galleryScale });
          }
      };
      
      window.addEventListener("resize", handleResize);
      handleResize();

      const handleClick = () => {
        if (isPreviewActive && !isTransitioning) {
            resetGallery();
        }
      };
      
      document.addEventListener("click", handleClick);

      const handleMouseMove = (e: MouseEvent) => {
        if (isPreviewActive || isTransitioning || config.isMobile) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const percentX = (e.clientX - centerX) / centerX;
        const percentY = (e.clientY - centerY) / centerY;

        parallaxState.targetY = percentX * 15;
        parallaxState.targetX = -percentY * 15;
        parallaxState.targetZ = (percentX + percentY) * 5;

        const currentCards = cardsRef.current;
        const currentTransformState = transformStateRef.current;

        currentCards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.sensitivity && !config.isMobile) {
                const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
                const angle = currentTransformState[index].angle;
                const moveAmount = config.cardMoveAmount * flipFactor;

                currentTransformState[index].targetRotation = 180 * flipFactor;
                currentTransformState[index].targetScale = 1 + flipFactor * 0.3;
                currentTransformState[index].targetX = Math.cos(angle) * moveAmount;
                currentTransformState[index].targetY = Math.sin(angle) * moveAmount;
            } else {
                currentTransformState[index].targetRotation = 0;
                currentTransformState[index].targetScale = 1;
                currentTransformState[index].targetX = 0;
                currentTransformState[index].targetY = 0;
            }
        });
      };
      document.addEventListener("mousemove", handleMouseMove);

      function animate() {
        if (!isPreviewActive && !isTransitioning) {
            parallaxState.currentX += (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
            parallaxState.currentY += (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
            parallaxState.currentZ += (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;

            gsap.set(galleryContainer2, {
                rotateX: parallaxState.currentX,
                rotateY: parallaxState.currentY,
                rotateZ: parallaxState.currentZ,
            });

            const currentCards = cardsRef.current;
            const currentTransformState = transformStateRef.current;

            currentCards.forEach((card, index) => {
                const state = currentTransformState[index];
                state.currentRotation += (state.targetRotation - state.currentRotation) * config.lerpFactor;
                state.currentScale += (state.targetScale - state.currentScale) * config.lerpFactor;
                state.currentX += (state.targetX - state.currentX) * config.lerpFactor;
                state.currentY += (state.targetY - state.currentY) * config.lerpFactor;

                const angle = state.angle;
                const x = config.radius * Math.cos(angle);
                const y = config.radius * Math.sin(angle);

                gsap.set(card, {
                    x: x + state.currentX,
                    y: y + state.currentY,
                    rotationY: state.currentRotation,
                    scale: state.currentScale,
                    rotation: (angle * 180) / Math.PI + 90,
                    transformPerspective: 1000,
                });
            });
        }
        animationRef.current = requestAnimationFrame(animate);
      }
      
      animate();
    };

    // ========== START ANIMATION 1 ==========
    const initAnimation1 = () => {
      if (!container1 || !gallery1) {
        console.error("Animation 1 elements not found!");
        return;
      }
      createItem();
      setInitialLinearLayout();
    };

    initAnimation1();

    // Start counter animation
    gsap.to(loader.querySelector("p"), {
      y: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.2,
      onComplete: animateCounter,
    });

    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Stop confetti if running
      (confetti as any).reset && (confetti as any).reset();

      // Remove event listeners
      document.removeEventListener("mousemove", () => {});
      document.removeEventListener("click", () => {});
    };
  }, [attendanceId]);

  const newLocal = `
        /* 
           Using a specific container class for background to avoid overwriting body/html 
           if we are embedded. But for "preserve screen", we use the wrapper.
           We'll keep global reset but be careful with body.
        */
        
        .loader {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
        }

        .loader p {
          text-decoration: none;
          color: #1f1f1f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .animation1-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .animation2-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        .gallery-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center; /* Centered */
          transform-style: preserve-3d;
          perspective: 2000px;
          will-change: transform;
        }

        .gallery {
          position: relative;
          width: 1200px;
          height: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-origin: center;
          will-change: transform;
          transform-style: preserve-3d;
        }

        .card {
          position: absolute;
          width: 134px;
          height: 198px;
          left: 50%;
          top: 50%;
          margin-left: -67px;
          margin-top: -99px;
          border-radius: 10px;
          transform-origin: center center;
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: visible;
          overflow: hidden;
        }

        .card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          backface-visibility: visible;
        }

        .title-container {
          position: absolute;
          bottom: 25%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 42px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 20;
          pointer-events: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }

        .word {
          display: inline-block;
          will-change: transform;
        }

        .item {
          position: absolute;
          width: 134px;
          height: 198px;
          border-radius: 10px;
          transform-origin: center;
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: visible;
          overflow: hidden;
        }

        .item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .footer-container {
          padding: 0;
        }

        .footer-content p {
          margin: 0;
        }
      `;
  return (
    <div className="relative w-full h-screen text-[#1f1f1f] overflow-hidden bg-[url('/mini-app.png')] bg-cover bg-center bg-no-repeat">
      {/* Animation 1: Linear to Circular */}
      <div
        ref={container1Ref}
        className="animation1-container"
      >
        <div ref={loaderRef} className="loader" style={{ display: 'none' }}>
          <p>0</p>
        </div>
        <div ref={gallery1Ref} className="gallery animation1-gallery"></div>
      </div>

      {/* Animation 2: Interactive Circular Gallery */}
      <div
        ref={container2Ref}
        className="animation2-container"
        style={{ opacity: isAnimation2Active ? 1 : 0, pointerEvents: isAnimation2Active ? "auto" : "none" }}
      >
        <div ref={galleryContainer2Ref} className="gallery-container">
          <div ref={gallery2Ref} className="gallery animation2-gallery"></div>
          <div ref={titleContainerRef} className="title-container"></div>
        </div>
      </div>

      {/* Skip Button */}
      {showSkipButton && (
        <button
          onClick={() => {
            if (skipHideActionRef.current) {
              skipHideActionRef.current();
            }
          }}
          className="skip-button"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "12px 24px",
            backgroundColor: "#1f1f1f",
            color: "#e3e3db",
            border: "none",
            borderRadius: "4px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1f1f1f";
          }}
        >
          Skip
        </button>
      )}

      <footer>
        <div className="footer-container">
          <div className="footer-content">
            <p>© Customer 2h. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{newLocal}</style>
    </div>
  );
}
