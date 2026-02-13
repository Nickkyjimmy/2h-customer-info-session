"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
// import { collection, defaultCollection } from "./_data/collection";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip, CustomEase);
}

const ITEMS_COUNT = 21;
const CARD_COUNT = ITEMS_COUNT;
const cardData = Array.from({ length: ITEMS_COUNT }, (_, i) => ({
  title: `Member ${i + 1}`,
  name: `Member ${i + 1}`,
  role: "Role",
  color: "#aa0000",
}));

export default function ShuffleCardPage() {
  const container1Ref = useRef<HTMLDivElement>(null);
  const gallery1Ref = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const gallery2Ref = useRef<HTMLDivElement>(null);
  const galleryContainer2Ref = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  
  const [isAnimation2Active, setIsAnimation2Active] = useState(false);
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

    // Helper to get card asset path
    const getCardImage = (i: number) => {
      const index = i % 21; // Ensure we stick to 0-20 range
      let fileNum = index + 1;
      if (fileNum >= 4) fileNum++; // Skip 4

      const suffixMap: Record<number, string> = {
        2: "-10",
        3: "-10",
        8: "-10",
        13: "-10",
        19: "-10",
        21: "-10"
      };

      const suffix = suffixMap[fileNum] || "";
      return `/card-asset/card-${fileNum}${suffix}.png`;
    };

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
      const updateInterval = 100;
      const maxDuration = 500;
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
            onComplete: () => {
              if (centerTextRef.current) {
                gsap.to(centerTextRef.current, {
                  opacity: 1,
                  duration: 1,
                  delay: 0.5,
                  ease: "power2.out"
                });
              }
            }
          });
        },
      });
    };

    // ========== ANIMATION 2 FUNCTIONS ==========
    const initAnimation2 = () => {
      if (!gallery2 || !galleryContainer2 || !titleContainer) return;

      const cards: HTMLDivElement[] = [];
      const transformState: TransformState[] = [];

      const config = {
        imageCount: ITEMS_COUNT,
        radius: 400,
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

        // Card front
        const cardFront = document.createElement("div");
        cardFront.className = "card-front";
        const img = document.createElement("img");
        img.src = getCardImage(i);
        img.alt = cardData[cardIndex]?.title || `Card ${cardIndex + 1}`;
        cardFront.appendChild(img);
        card.appendChild(cardFront);

        // Card back
        const cardBack = document.createElement("div");
        cardBack.className = "card-back";
        const cardColor = cardData[cardIndex]?.color || "#aa0000";
        // Set background color with inline style
        (cardBack as HTMLElement).style.setProperty("background-color", cardColor, "important");
        const nameDiv = document.createElement("div");
        nameDiv.className = "card-name";
        nameDiv.textContent = cardData[cardIndex]?.name || cardData[cardIndex]?.title || "";
        const roleDiv = document.createElement("div");
        roleDiv.className = "card-role";
        roleDiv.textContent = cardData[cardIndex]?.role || "";
        cardBack.appendChild(nameDiv);
        cardBack.appendChild(roleDiv);
        card.appendChild(cardBack);

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
        
        // Hide center text
        if (centerTextRef.current) {
          gsap.to(centerTextRef.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
          });
        }
        


        const angle = currentTransformState[index].angle;
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
          state.currentRotation = state.targetRotation = 0;
          state.currentScale = state.targetScale = 1;
          state.currentX = state.targetX = state.currentY = state.targetY = 0;
        });

        // Ensure the selected card is centered horizontally
        const selectedCard = currentCards[index];
        
        gsap.to(gallery2, {
          onStart: () => {
            currentCards.forEach((card, i) => {
              if (!card || !currentTransformState[i]) return;
              
              // Ensure card front is visible (no flip)
              const cardFront = card.querySelector(".card-front");
              const cardBack = card.querySelector(".card-back");
              if (cardFront && cardBack) {
                gsap.set(cardFront, { rotationY: 0 });
                gsap.set(cardBack, { rotationY: 180 });
              }
              
              gsap.to(card, {
                x: config.radius * Math.cos(currentTransformState[i].angle),
                y: config.radius * Math.sin(currentTransformState[i].angle),
                rotationY: 0,
                scale: 1,
                duration: 1.25,
                ease: "power4.out",
              });
            });
          },
          scale: 3,
          y: config.radius * 3 - 50, // Move gallery down to center the top card (-400 * 3 = -1200, so move +1200 - 50)
          x: 0, // Ensure horizontal centering
          rotation: currentRotation + rotationRadians * (180 / Math.PI),
          duration: 2,
          ease: "power4.out",
          onComplete: () => {
             // Align the selected card with the title
            if (selectedCard) {
              // Ensure card front is visible (no flip)
              const cardFront = selectedCard.querySelector(".card-front");
              const cardBack = selectedCard.querySelector(".card-back");
              const cardImg = selectedCard.querySelector(".card-front img");
              
              if (cardFront && cardBack) {
                gsap.set(cardFront, { 
                  rotationY: 0,
                  opacity: 1,
                  visibility: "visible",
                  zIndex: 10
                });
                gsap.set(cardBack, { 
                  rotationY: 180,
                  opacity: 0,
                  visibility: "hidden"
                });
              }
              
              // Ensure the card image is visible
              if (cardImg) {
                gsap.set(cardImg, {
                  opacity: 1,
                  visibility: "visible",
                  display: "block"
                });
              }
              
              // Ensure the card itself is visible
              gsap.set(selectedCard, {
                opacity: 1,
                visibility: "visible",
                zIndex: 1000
              });

              isTransitioningRef.current = false;
              selectedCardRef.current = selectedCard;
              // Auto hide after 3 seconds
              hideTimeoutRef.current = setTimeout(() => {
                hideSelectedCard();
              }, 3000);
            } else {
              isTransitioningRef.current = false;
            }
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
        
        // Hide the card with fade out animation
        gsap.to(card, {
          opacity: 0,
          scale: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            // Get current cards and transformState arrays
            const cards = cardsRef.current;
            const transformState = transformStateRef.current;
            
            // Find the card index in the array
            const cardIndexInArray = cards.findIndex(c => c === card);
            
            if (cardIndexInArray !== -1) {
              // Remove card from DOM
              card.remove();
              
              // Remove card from cards array
              cards.splice(cardIndexInArray, 1);
              
              // Remove from transformState array
              if (transformState[cardIndexInArray]) {
                transformState.splice(cardIndexInArray, 1);
              }
              
              // Update the refs
              cardsRef.current = cards;
              transformStateRef.current = transformState;
              
              // Recalculate positions for remaining cards
              const remainingCount = cards.length;
              if (remainingCount > 0) {
                cards.forEach((remainingCard, i) => {
                  const newAngle = (i / remainingCount) * Math.PI * 2;
                  const newX = config.radius * Math.cos(newAngle);
                  const newY = config.radius * Math.sin(newAngle);
                  
                  // Update transform state
                  if (transformState[i]) {
                    transformState[i].angle = newAngle;
                    transformState[i].targetRotation = 0;
                    transformState[i].currentRotation = 0;
                    transformState[i].targetScale = 1;
                    transformState[i].currentScale = 1;
                    transformState[i].targetX = 0;
                    transformState[i].currentX = 0;
                    transformState[i].targetY = 0;
                    transformState[i].currentY = 0;
                  }
                  
                  // Update card dataset index
                  remainingCard.dataset.index = String(i);
                  
                  // Animate to new position
                  gsap.to(remainingCard, {
                    x: newX,
                    y: newY,
                    rotation: newAngle * (180 / Math.PI) + 90,
                    duration: 0.8,
                    ease: "power2.out",
                  });
                });
              }
            } else {
              // If card not found in array, just remove from DOM
              card.remove();
            }
            
            selectedCardRef.current = null;
            isPreviewActiveRef.current = false;
            isTransitioningRef.current = false;
            
            // Reset gallery position
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
              duration: 1.5,
              ease: "power4.inOut",
            });
            
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
          },
        });
      };

      // Store functions in refs for access outside useEffect
      hideSelectedCardRef.current = hideSelectedCard;

      function resetGallery() {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;
        
        // Clear hide timeout if exists
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }


        // Flip all cards back to front
        cards.forEach((card) => {
          const cardFront = card.querySelector(".card-front");
          const cardBack = card.querySelector(".card-back");
          if (cardFront && cardBack) {
            gsap.to(cardFront, {
              rotationY: 0,
              duration: 0.6,
              ease: "power2.inOut",
            });
            gsap.to(cardBack, {
              rotationY: 180,
              duration: 0.6,
              ease: "power2.inOut",
            });
          }
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

        // Show center text again when gallery resets
        if (centerTextRef.current) {
          gsap.to(centerTextRef.current, {
            opacity: 1,
            duration: 1,
            delay: 0.5,
            ease: "power2.out"
          });
        }
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

            currentTransformState[i].targetRotation = 180 * flipFactor;
            currentTransformState[i].targetScale = 1 + flipFactor * 0.3;
            currentTransformState[i].targetX = moveAmount * Math.cos(angle);
            currentTransformState[i].targetY = moveAmount * Math.sin(angle);
          } else {
            currentTransformState[i].targetRotation = 0;
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
    // const initAnimation1 = () => {
    //   if (!container1 || !gallery1) {
    //     console.error("Animation 1 elements not found!");
    //     return;
    //   }
    //   createItem();
    //   setInitialLinearLayout();
    //   // setCircularLayout();
    // };

    // initAnimation1();

    // // Start counter animation
    // gsap.to(loader.querySelector("p"), {
    //   y: 0,
    //   duration: 1,
    //   ease: "power3.out",
    //   delay: 1,
    //   onComplete: animateCounter,
    // });

    // Skip Animation 1 - Initialize Animation 2 directly
    if (container1) container1.style.display = "none";
    if (container2) container2.style.pointerEvents = "auto";
    
    initAnimation2();
    setIsAnimation2Active(true);
    
    // Show container2 immediately
    gsap.set(container2, { opacity: 1 });
    
    // Show center text immediately
    if (centerTextRef.current) {
      gsap.set(centerTextRef.current, { opacity: 1 });
    }

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
    <div className="mini-game-v2-root relative w-full min-h-screen bg-[url('/mini-app.png')] bg-cover bg-center bg-no-repeat text-[#1f1f1f] overflow-hidden ">
      {/* Animation 1: Linear to Circular */}
      <div
        ref={container1Ref}
        className="mg-container animation1-container"
      >
        <div ref={loaderRef} className="loader" style={{ display: 'none' }}>
          <p>0</p>
        </div>
        <div ref={gallery1Ref} className="gallery animation1-gallery"></div>
      </div>

      {/* Animation 2: Interactive Circular Gallery */}
      <div
        ref={container2Ref}
        className="mg-container animation2-container"
        style={{ opacity: isAnimation2Active ? 1 : 0, pointerEvents: isAnimation2Active ? "auto" : "none" }}
      >
        <div ref={galleryContainer2Ref} className="gallery-container">
          <div ref={gallery2Ref} className="gallery animation2-gallery"></div>
        </div>
        <div ref={titleContainerRef} className="title-container"></div>
        <div ref={centerTextRef} className="center-text-container" style={{ opacity: 0 }}>
          <h1>The Unspoken Truths</h1>
          <p>Những sự thật không ai dám nói (trừ bộ thẻ này).</p>
        </div>
      </div>



      <footer>
        <div className="footer-container">
          <div className="footer-content">
            <p>© Customer2h. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        /* Scoped global styles for MiniGameV2 to support dynamic elements */

        /* Removed body/html overflow hidden to allow page scrolling */
        
        .mini-game-v2-root .loader {
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
        }

        .mini-game-v2-root .loader p {
          text-decoration: none;
          color: #1f1f1f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .mini-game-v2-root a, .mini-game-v2-root p {
          text-decoration: none;
          color: #1f1f1f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .mini-game-v2-root img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          backface-visibility: hidden;
        }

        .mini-game-v2-root nav, .mini-game-v2-root footer {
          position: absolute;
          left: 0;
          width: 100%;
          padding: 2em;
        }

        .mini-game-v2-root footer {
          bottom: 0;
        }

        .mini-game-v2-root .mg-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .mini-game-v2-root .animation1-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .mini-game-v2-root .animation2-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        .mini-game-v2-root .gallery-container {
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

        .mini-game-v2-root .gallery {
          position: relative;
          width: 600px;
          height: 600px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform-origin: center;
          will-change: transform;
        }

        .mini-game-v2-root .card {
          position: absolute;
          width: 100px;
          height: 150px;
          left: 50%;
          top: 50%;
          margin-left: -50px;
          margin-top: -75px;
          border-radius: 4px;
          transform-origin: center;
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: visible;
          overflow: hidden;
        }

        .mini-game-v2-root .card-front,
        .mini-game-v2-root .card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .mini-game-v2-root .card-front {
          z-index: 2;
          opacity: 1;
          visibility: visible;
        }

        .mini-game-v2-root .card-front img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 1;
          visibility: visible;
        }

        .mini-game-v2-root .card-back {
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 8px;
          box-sizing: border-box;
          z-index: 1;
          background-color: #aa0000;
        }

        .mini-game-v2-root .card-back img {
          display: none;
        }

        .mini-game-v2-root .card-name {
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 7px;
          line-height: 1.2;
          text-align: center;
          margin-bottom: 3px;
          letter-spacing: -0.01em;
          word-break: break-word;
          padding: 0 2px;
        }

        .mini-game-v2-root .card-role {
          color: #e3e3db;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 7px;
          line-height: 1.3;
          text-align: center;
          letter-spacing: -0.01em;
          word-break: break-word;
          padding: 0 2px;
        }

        .mini-game-v2-root .title-container {
          position: absolute;
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

        .mini-game-v2-root .title-container p {
          position: absolute;
          width: 100%;
          text-align: center;
          font-size: 36px;
          letter-spacing: -0.05em;
        }

        .mini-game-v2-root .word {
          position: absolute;
          display: inline-block;
          will-change: transform;
        }

        .mini-game-v2-root .item {
          position: absolute;
          width: 100px;
          height: 150px;
          border-radius: 4px;
          transform-origin: center;
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: visible;
          overflow: hidden;
        }

        .mini-game-v2-root .item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mini-game-v2-root .footer-container {
          padding: 0;
        }

        .mini-game-v2-root .footer-content p {
          margin: 0;
          color: #ffffff;
        }

        .mini-game-v2-root .center-text-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 5;
          pointer-events: none;
          width: 80%;
          max-width: 600px;
        }

        .mini-game-v2-root .center-text-container h1 {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 48px;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: #ffffff;
          margin: 0 0 16px 0;
        }

        .mini-game-v2-root .center-text-container p {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 18px;
          line-height: 1.5;
          color: #d1d1d1;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

