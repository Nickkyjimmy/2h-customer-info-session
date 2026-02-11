"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import confetti from "canvas-confetti";

// Mock collection data since the original file import is missing
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

export default function ShuffleCardPage() {
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

  useEffect(() => {
    if (typeof window === "undefined") return;

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
      const totalItemsWidth = (items.length - 1) * 10 + firstItem.offsetWidth;
      const startX = (container1.offsetWidth - totalItemsWidth) / 2;

      items.forEach((item, index) => {
        gsap.set(item, {
          left: `${startX + index * 10}px`,
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
      const radius = 200;
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
      
      // Clear previous content to avoid duplicates on re-render
      gallery2.innerHTML = "";
      
      const cards: HTMLDivElement[] = [];
      const transformState: TransformState[] = [];

      const config = {
        imageCount: ITEMS_COUNT,
        radius: 275,
        sensitivity: 500,
        effectFalloff: 250,
        cardMoveAmount: 50,
        lerpFactor: 0.15,
        isMobile: window.innerWidth < 1000,
      };

      const parallaxState = parallaxStateRef.current;

      // Create cards for animation 2
      for (let i = 0; i < config.imageCount; i++) {
        const angle = (i / config.imageCount) * Math.PI * 2;
        const x = config.radius * Math.cos(angle);
        const y = config.radius * Math.sin(angle);
        const cardIndex = i % cardData.length;

        const card = document.createElement("div");
        card.className = "card";
        card.dataset.index = String(i);
        card.dataset.title = cardData[cardIndex]?.title || `Card ${cardIndex + 1}`;
        card.dataset.name = cardData[cardIndex]?.name || cardData[cardIndex]?.title || "";
        card.dataset.role = cardData[cardIndex]?.role || "";
        card.dataset.color = cardData[cardIndex]?.color || "#aa0000";
        
        // Local card images for random selection
        const localCardImages = [
          "card-1.png", "card-2-10.png", "card-3-10.png", "card-5.png",
          "card-6.png", "card-7.png", "card-8-10.png", "card-9.png",
          "card-10.png", "card-11.png", "card-12.png", "card-13-10.png",
          "card-14.png", "card-15.png", "card-16.png", "card-17.png",
          "card-18.png", "card-19-10.png", "card-20.png", "card-21-10.png",
          "card-22.png", "rare.png"
        ];
        
        // Pick random card asset for this card
        const randomCardAsset = localCardImages[Math.floor(Math.random() * localCardImages.length)];
        card.dataset.cardAsset = `/card-asset/${randomCardAsset}`;

        // Card front - initially shows card-front.png
        const cardFront = document.createElement("div");
        cardFront.className = "card-front";
        cardFront.style.backgroundImage = "url('/card-asset/card-front.png')";
        cardFront.style.backgroundSize = "cover";
        cardFront.style.backgroundPosition = "center";
        cardFront.style.backgroundRepeat = "no-repeat";
        
        // Add member name (hidden initially, shown on preview)
        const nameDiv = document.createElement("div");
        nameDiv.className = "card-name";
        nameDiv.textContent = cardData[cardIndex]?.name || cardData[cardIndex]?.title || "";
        nameDiv.style.display = "none"; // Hidden initially
        cardFront.appendChild(nameDiv);
        
        card.appendChild(cardFront);

        gsap.set(card, {
          x: x,
          y: y,
          rotation: angle * (180 / Math.PI) + 90,
          transformPerspective: 800,
          transformOrigin: "center center",
          scale: 0,
          opacity: 0,
        });

        gallery2.appendChild(card);
        cards.push(card);

        transformState.push({
          angle: angle,
          targetRotation: 0, // Default to 0 (front visible - cover)
          currentRotation: 0, // Default to 0 (front visible - cover)
          targetScale: 1,
          currentScale: 1,
          targetX: 0,
          currentX: 0,
          targetY: 0,
          currentY: 0,
        });

        card.addEventListener("click", (e) => {
          if (!isPreviewActiveRef.current && !isTransitioningRef.current) {
            togglePreview(parseInt(card.dataset.index || "0"));
            e.stopPropagation();
          }
        });
      }

      cardsRef.current = cards;
      transformStateRef.current = transformState;

      // Animate cards in
      gsap.to(cards, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        stagger: 0.05,
        ease: "power3.out",
      });


      function togglePreview(index: number) {
        const currentCards = cardsRef.current;
        const currentTransformState = transformStateRef.current;
        
        if (!currentCards[index] || !currentTransformState[index]) return;
        
        isPreviewActiveRef.current = true;
        isTransitioningRef.current = true;

        const angle = currentTransformState[index].angle;
        // The rotation needed to bring the card to the front center might be different now that it's flipped?
        // No, the card position (x,y) logic is separate from rotationY.
        
        const targetPosition = (Math.PI * 3) / 2;
        
        // Get current rotation of the gallery
        const currentRotation = gsap.getProperty(gallery2, "rotation") as number || 0;
        const currentRotationRadians = (currentRotation * Math.PI) / 180;
        
        // Calculate the angle the card is currently at (accounting for gallery rotation)
        const currentCardAngle = angle + currentRotationRadians;
        
        // Calculate rotation needed to center the card
        let rotationRadians = targetPosition - currentCardAngle;

        if (rotationRadians > Math.PI) rotationRadians -= Math.PI * 2;
        else if (rotationRadians < -Math.PI) rotationRadians += Math.PI * 2;

        currentTransformState.forEach((state) => {
          state.currentScale = state.targetScale = 1;
          state.currentX = state.targetX = state.currentY = state.targetY = 0;
        });

        const selectedCard = currentCards[index];
        
        // Create centered preview container
        const previewContainer = document.createElement("div");
        previewContainer.className = "card-preview-container";
        previewContainer.style.position = "fixed";
        previewContainer.style.top = "50%";
        previewContainer.style.left = "50%";
        previewContainer.style.transform = "translate(-50%, -50%) scale(0.5)";
        previewContainer.style.zIndex = "1000";
        previewContainer.style.width = "300px";
        previewContainer.style.height = "450px";
        previewContainer.style.backgroundImage = `url('${selectedCard.dataset.cardAsset}')`;
        previewContainer.style.backgroundSize = "cover";
        previewContainer.style.backgroundPosition = "center";
        previewContainer.style.backgroundRepeat = "no-repeat";
        previewContainer.style.borderRadius = "8px";
        previewContainer.style.boxShadow = "0 10px 40px rgba(0,0,0,0.5)";
        previewContainer.style.opacity = "0";
        
        document.body.appendChild(previewContainer);
        
        // Animate preview in with delay
        gsap.to(previewContainer, {
          opacity: 1,
          scale: 1,
          delay: 1, // 1 second delay before revealing
          duration: 0.8,
          ease: "back.out(1.2)",
          onComplete: () => {
            // Trigger side cannons confetti when card is fully revealed
            const end = Date.now() + 3 * 1000; // 3 seconds
            const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

            const frame = () => {
              if (Date.now() > end) return;

              confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
              });
              confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
              });

              requestAnimationFrame(frame);
            };

            frame();
          }
        });
        
        // Store reference for cleanup
        selectedCardRef.current = selectedCard;
        (selectedCard as any).previewContainer = previewContainer;
        
        gsap.to(gallery2, {
          onStart: () => {
            currentCards.forEach((card, i) => {
              if (!card || !currentTransformState[i]) return;
              
              gsap.to(card, {
                x: config.radius * Math.cos(currentTransformState[i].angle),
                y: config.radius * Math.sin(currentTransformState[i].angle),
                scale: 1,
                duration: 1.25,
                ease: "power4.out",
              });
            });
            
            // Fade out the gallery to hide the circle
            gsap.to(gallery2, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out"
            });
          },
          scale: 5,
          y: 0,
          x: 0,
          rotation: currentRotation + rotationRadians * (180 / Math.PI),
          duration: 2,
          ease: "power4.out",
          onComplete: () => {
              // Preview stays visible - no auto-hide
              isTransitioningRef.current = false;
          },
        });

        gsap.to(parallaxState, {
          currentX: 0,
          currentY: 0,
          currentZ: 0,
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

        // Title Animation
        const titleText = currentCards[index].dataset.name || currentCards[index].dataset.title || "";
        const p = document.createElement("p");
        p.textContent = titleText;
        if (titleContainer) {
          titleContainer.appendChild(p);
        }
        currentTileRef.current = p;

        gsap.set(p, { opacity: 0, y: 20 });
        gsap.to(p, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          delay: 1.25,
          ease: "power4.out",
        });
      }

      const hideSelectedCard = () => {
        if (!selectedCardRef.current) return;
        
        const card = selectedCardRef.current;
        const previewContainer = (card as any).previewContainer;
        
        // Fade out and remove preview container
        if (previewContainer) {
          gsap.to(previewContainer, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              previewContainer.remove();
            }
          });
        }
        
        const cards = cardsRef.current;
        const cardIndex = cards.findIndex((c: HTMLDivElement) => c === card);
        const transformState = transformStateRef.current;

        // Reset gallery styling (Zoom Out)
        const viewportWidth = window.innerWidth;
        let galleryScale = 1;
        if (viewportWidth < 768) galleryScale = 0.6;
        else if (viewportWidth < 1200) galleryScale = 0.8;

        // Animate Gallery back
        gsap.to(gallery2, {
          scale: galleryScale,
          y: 0,
          x: 0,
          opacity: 1, // Fade back in
          duration: 1.5,
          ease: "power4.inOut",
          onComplete: () => {
             isTransitioningRef.current = false;
             isPreviewActiveRef.current = false;
          }
        });

        // Animate Card back to circle
        if (cardIndex !== -1 && transformState[cardIndex]) {
             const state = transformState[cardIndex];
             
             // Explicit animation
             gsap.to(card, {
                 x: config.radius * Math.cos(state.angle),
                 y: config.radius * Math.sin(state.angle),
                 scale: 1,
                 opacity: 1,
                 duration: 1,
                 ease: "power4.out"
             });
        }
        
        selectedCardRef.current = null;
        
        // Remove title
        if (currentTileRef.current) {
          gsap.to(currentTileRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power4.out",
            onComplete: () => {
              if (currentTileRef.current) {
                currentTileRef.current.remove();
                currentTileRef.current = null;
              }
            },
          });
        }
      };

      // skipHideAction removed

      // Store functions in refs for access outside useEffect
      hideSelectedCardRef.current = hideSelectedCard;
      skipHideActionRef.current = null; // Removed

      function resetGallery() {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;
        
        // Clear hide timeout if exists
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        // setShowSkipButton(false); // Removed skip button logic

        const currentTransformState = transformStateRef.current;
        currentTransformState.forEach(state => {
            state.targetRotation = 180;
        });

        // Ensure all cards are reset to Back state
        gsap.to(cardsRef.current, {
            rotationY: 180,
            duration: 0.6,
            ease: "power2.inOut",
        });

        if (currentTileRef.current) {
          gsap.to(currentTileRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.75,
            delay: 0.5,
            ease: "power4.out",
            onComplete: () => {
              if (currentTileRef.current) {
                currentTileRef.current.remove();
                currentTileRef.current = null;
              }
            },
          });
        }

        const viewportWidth = window.innerWidth;
        let galleryScale = 1;
        if (viewportWidth < 768) {
          galleryScale = 0.6;
        } else if (viewportWidth < 1200) {
          galleryScale = 0.8;
        }

        gsap.to(gallery2, {
          scale: galleryScale,
          y: 0,
          x: 0,
          rotation: 0,
          duration: 2.5,
          ease: "power4.inOut",
          onComplete: () => {
            isPreviewActiveRef.current = isTransitioningRef.current = false;
            Object.assign(parallaxState, {
              targetX: 0,
              targetY: 0,
              targetZ: 0,
              currentX: 0,
              currentY: 0,
              currentZ: 0,
            });
          },
        });
      }

      document.addEventListener("click", () => {
        if (isPreviewActiveRef.current && !isTransitioningRef.current) {
          resetGallery();
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (isPreviewActiveRef.current || isTransitioningRef.current || config.isMobile) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const percentX = (e.clientX - centerX) / centerX;
        const percentY = (e.clientY - centerY) / centerY;

        parallaxState.targetY = percentX * 15;
        parallaxState.targetX = percentY * 15;
        parallaxState.targetZ = (percentX + percentY) * 5;

        const currentCards = cardsRef.current;
        const currentTransformState = transformStateRef.current;
        
        currentCards.forEach((card, i) => {
          if (!card || !currentTransformState[i]) return;
          
          const rect = card.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.sensitivity && !config.isMobile) {
            const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
            const angle = currentTransformState[i].angle;
            const moveAmount = config.cardMoveAmount * flipFactor;

            // Flip towards front (0) as we get closer
            currentTransformState[i].targetRotation = 180 * (1 - flipFactor);
            currentTransformState[i].targetScale = 1 + flipFactor * 0.3;
            currentTransformState[i].targetX = moveAmount * Math.cos(angle);
            currentTransformState[i].targetY = moveAmount * Math.sin(angle);
          } else {
            currentTransformState[i].targetRotation = 180;
            currentTransformState[i].targetScale = 1;
            currentTransformState[i].targetX = 0;
            currentTransformState[i].targetY = 0;
          }
        });
      });

      function animate() {
        const currentCards = cardsRef.current;
        const currentTransformState = transformStateRef.current;
        
        if (!isPreviewActiveRef.current && !isTransitioningRef.current) {
          parallaxState.currentX +=
            (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
          parallaxState.currentY +=
            (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
          parallaxState.currentZ +=
            (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;
        }

        gsap.set(galleryContainer2, {
          rotateX: parallaxState.currentX,
          rotateY: parallaxState.currentY,
          rotateZ: parallaxState.currentZ,
        });

        currentCards.forEach((card, i) => {
          if (!card || !currentTransformState[i]) return;
          
          const state = currentTransformState[i];

          state.currentRotation +=
            (state.targetRotation - state.currentRotation) * config.lerpFactor;
          state.currentScale +=
            (state.targetScale - state.currentScale) * config.lerpFactor;
          state.currentX +=
            (state.targetX - state.currentX) * config.lerpFactor;
          state.currentY +=
            (state.targetY - state.currentY) * config.lerpFactor;

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

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#e3e3db] text-[#1f1f1f] overflow-hidden">
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
        </div>
        <div ref={titleContainerRef} className="title-container"></div>
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
            position: "fixed",
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

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: #e3e3db;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        html {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .loader {
          position: fixed;
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

        a, p {
          text-decoration: none;
          color: #1f1f1f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          backface-visibility: hidden;
        }

        nav, footer {
          position: absolute;
          left: 0;
          width: 100vw;
          padding: 2em;
        }

        footer {
          bottom: 0;
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
          width: 100vw;
          height: 100vh;
        }

        .animation2-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 10;
        }

        .gallery-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-style: preserve-3d;
          perspective: 2000px;
          will-change: transform;
        }

        .gallery {
          position: relative;
          width: 600px;
          height: 600px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-origin: center;
          will-change: transform;
        }

        .card {
          position: absolute;
          width: 45px;
          height: 70px;
          border-radius: 4px;
          transform-origin: center;
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: visible;
          overflow: hidden;
          top: 50%;
          left: 50%;
          margin-top: -35px;
          margin-left: -22.5px;
        }

        .card-front,
        .card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .card-front {
          z-index: 2;
          opacity: 1;
          visibility: visible;
          background-image: url('/card-asset/card-front.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .card-front img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 1;
          visibility: visible;
        }

        .card-back {
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          padding: 8px;
          box-sizing: border-box;
          z-index: 1;
          position: relative;
          background-color: #ffffff !important; /* White fallback background */
          border: 2px solid #000 !important; /* Debug border to see card boundaries */
          overflow: hidden;
          backface-visibility: visible !important; /* Override to ensure visibility */
          min-height: 70px !important; /* Force minimum height */
          opacity: 1 !important;
          visibility: visible !important;
        }

        .card-asset-img {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          z-index: 1 !important;
          display: block !important;
          opacity: 1 !important;
        }

        .card-name, .card-role {
          display: block;
          position: relative;
          z-index: 5;
          width: 100%;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }

        .title-container {
          position: fixed;
          bottom: 25%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 42px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 20;
        }

        .title-container p {
          position: absolute;
          width: 100%;
          text-align: center;
          font-size: 36px;
          letter-spacing: -0.05em;
        }

        .word {
          position: absolute;
          display: inline-block;
          will-change: transform;
        }

        .item {
          position: absolute;
          width: 45px;
          height: 70px;
          border-radius: 4px;
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
      `}</style>
    </div>
  );
}
