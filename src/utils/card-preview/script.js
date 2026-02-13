import gsap from "gsap";
import SplitText from "gsap/SplitText";





document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(SplitText);

    const gallery = document.querySelector(".gallery");
    const galleryContainer = document.querySelector(".gallery-container");
    const titleContainer = document.querySelector(".title-container");

    const cards = []
    const transformState = []

    let currentTitle = null;
    let isPreviewActive = false;
    let isTransitining = false;

    const config = {
        imgCount: 25,
        radius: 275,
        sensitivity: 500,
        effectFalloff: 250,
        cardMoveAmount: 50,
        lerpFactor: 0.15,
        isMobile: window.innerWidth < 1000,

    }

    const parallaxState = {
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        currentX: 0,
        currentY: 0,
        currentZ: 0,
    };

    for (let i = 0; i < config.imgCount; i++) {
        const angle = (i/config.imgCount) * Math.PI * 2;
        const x = Math.cos(angle) * config.radius;
        const y = Math.sin(angle) * config.radius;
        const cardIndex = i % 20;

        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = i;
        card.dataset.title = collection[cardIndex].title;

        const img = document.createElement("img");
        img.src = collection[cardIndex].img;
        card.appendChild(img);
        

        gsap.set(card,{
            x,
            y,
            rotation: (angle * 180)/Math.PI + 90,
            transformPerspective: 800,
            transformOrigin: "center center",
        })


        gallery.appendChild(card);
        cards.push(card);
        transformState.push({
            currentRotation: 0,
            targetRotation: 0,
            currentX: 0,
            targetX: 0,
            currentY: 0,
            targetY: 0,
            currentScale:1,
            targetScale:1,
            angle
        });

        card.addEventListener("click", (e) => {
            if(!isPreviewActive && !isTransitining){
                togglePreview(parseInt(card.dataset.index));
                e.stopPropagation();
            }

            
        })

        function togglePreview(index){
            isPreviewActive = true;
            isTransitining = true;
            
            const angle = transformState[index].angle;
            const targetPostion = (Math.PI * 3)/2;
            let rotationRadians = targetPostion - angle;

            if (rotationRadians > Math.PI){
                rotationRadians -= Math.PI * 2;
            }
            else if (rotationRadians < -Math.PI){
                rotationRadians += Math.PI * 2;
            }

            transformState.forEach((state)=> {
                state.currentRotation = state.targetRotation = 0;
                state.currentScale = state.targetScale = 1;
                state.currentX = state.targetX = 0;
                state.currentY = state.targetY = 0;
            });

            gsap.to(gallery, {
                onStart: () => {
                    cards.forEach((card, i)=> {
                        gsap.to(card, {
                            x: config.radius * Math.cos(transformState[i].angle),
                            y: config.radius * Math.sin(transformState[i].angle),
                            rotation: 0,
                            scale: 1,
                            duration: 1.25,
                            ease: "power4.out",
                        })
                    })
                },
                scale: 5,
                y: 1300,
                rotation: (rotationRadians * 180)/ Math.PI + 360,
                duration: 2,
                ease: "power4.out",
                onComplete: () => {
                    isTransitining = false;
                }
            });

            gsap.to(parallaxState, {
                targetX: 0,
                targetY: 0,
                targetZ: 0,
                duration: 0.5,
                ease: "power2.out",
                onUpdate: () => {
                    gsap.set(galleryContainer, {
                        rotateX: parallaxState.currentX,
                        rotateY: parallaxState.currentY,
                        rotateZ: parallaxState.currentZ,
                        transformOrigin: "center center",

                    });
                },

            });

            const titleText = cards[index].dataset.title;
            const p = document.createElement("p");
            p.textContent = titleText;
            titleContainer.appendChild(p);
            currentTitle = p;
            const splitText = new SplitText(p, {
                type: "words",
                wordsClass: "word",
            });

            const words = splitText.words;
            
            gsap.set(words, { y: "125%"});

            gsap.to(words, {
                y: "0%",
                delay: 1.25,
                duration: 1.25,
                ease: "power4.out",
                stagger: 0.1,
            });

        }

    }

    function resetGallery(){
        if(isTransitining) return;

        isTransitining = true;
        
        if (currentTitle){
            const words = currentTitle.querySelectorAll(".word");
            gsap.to(words, {
                y: "-125%",
                duration: 0.75,
                delay: 0.5,
                stagger: 0.1,
                ease: "power4.out",
                onComplete: () => {
                    currentTitle.remove();
                    currentTitle = null;
                }
            });
        }
        const viewportWidth = window.innerWidth;
        let galleryScale = 1;

                
        if(viewportWidth < 768){
            galleryScale = 0.6;
        } else if(viewportWidth < 1200){
            galleryScale = 0.8;
        }

        gsap.to(gallery, {
            scale: galleryScale,
            y: 0,
            x: 0,
            rotation: 0,
            duration: 2.5,
            ease: "power4.inOut",
            onComplete: () => {
                isPreviewActive = false;
                isTransitining = false;
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

    function handleResize(){
        const viewportWidth = window.innerWidth;
        config.isMobile = viewportWidth < 1000;

        let galleryScale = 1;
        if(viewportWidth < 768){
            galleryScale = 0.6;
        } else if(viewportWidth < 1200){
            galleryScale = 0.8;
        }

        gsap.set(gallery, {
            scale: galleryScale,
        });

        if (!isPreviewActive){
            parallaxState.targetX = 0;
            parallaxState.targetY = 0;
            parallaxState.targetZ = 0;
            parallaxState.currentX = 0;
            parallaxState.currentY = 0;
            parallaxState.currentZ = 0;

            transformState.forEach((state)=> {
                state.currentRotation = state.targetRotation = 0;
                state.currentScale = state.targetScale = 1;
                state.currentX = state.targetX = 0;
                state.currentY = state.targetY = 0;
            });
        }

    }
    window.addEventListener("resize", handleResize);
    handleResize();

    document.addEventListener("click", () => {
        if(isPreviewActive && !isTransitining){
            resetGallery();
        }
    });

    document.addEventListener("mousemove", (e) => {
        if(isPreviewActive|| isTransitining || config.isMobile) return;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const percentX = (e.clientX - centerX) /centerX;
        const percentY = (e.clientY - centerY) / centerY;

        parallaxState.targetY = percentX * 15;
        parallaxState.targetX = -percentY * 15;
        parallaxState.targetZ = (percentX+percentY) * 5;


        cards.forEach((card, index) => {
            const rect = card.getBoundingClientRect();
            
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.sensitivity && !config.isMobile){
                const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
                const angle = transformState[index].angle;
                const moveAmount = config.cardMoveAmount * flipFactor;

                transformState[index].targetRotation = 180 * flipFactor;
                transformState[index].targetScale = 1 + flipFactor * 0.3;
                transformState[index].targetX = Math.cos(angle) * moveAmount;
                transformState[index].targetY = Math.sin(angle) * moveAmount;
                
            } else {
                transformState[index].targetRotation = 0;
                transformState[index].targetScale = 1;
                transformState[index].targetX = 0;
                transformState[index].targetY = 0;
            }

            
        });
    });

    function animate(){
        if(!isPreviewActive && !isTransitining) {
            parallaxState.currentX += (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
            parallaxState.currentY += (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
            parallaxState.currentZ += (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;

            gsap.set(galleryContainer, {
                rotateX: parallaxState.currentX,
                rotateY: parallaxState.currentY,
                rotateZ: parallaxState.currentZ,
            });

            cards.forEach((card, index) => {
                const state = transformState[index];
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
                    z: state.currentZ,
                    rotationY: state.currentRotation,
                    scale: state.currentScale,
                    rotation: (angle * 180/Math.PI + 90),
                    transformPerspective: 1000,
                });
            });
        };

        requestAnimationFrame(animate);
    }
    animate();
});
