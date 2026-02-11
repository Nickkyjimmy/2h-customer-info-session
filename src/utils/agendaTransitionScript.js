import { vertexShader, fragmentShader } from "./shaders";
import * as THREE from "three";



export function initAgendaTransition(canvasElement, agendaSection) {
    if (!canvasElement || !agendaSection) {
        console.warn("Canvas or agenda section not found");
        return;
    }

    const CONFIG = {
        color: "#ebf5df",
        spread: 0.5,
        speed: 2,
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true,
        antialias: false,
    });

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255,
            }
            : { r: 0.89, g: 0.89, b: 0.89 };
    }

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    resize();
    window.addEventListener("resize", resize);

    const rgb = hexToRgb(CONFIG.color);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uProgress: { value: 0 },
            uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
            uSpread: { value: CONFIG.spread },
        },
        transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let scrollProgress = 0;

    function animate() {
        material.uniforms.uProgress.value = scrollProgress;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    // Use the existing Lenis instance from SmoothScrolling component
    const lenis = window.lenis;
    if (!lenis) {
        console.warn("Lenis instance not found. Make sure SmoothScrolling component is loaded.");
        return;
    }

    // Track scroll progress relative to agenda section
    const onScroll = ({ scroll }) => {
        const agendaSectionTop = agendaSection.offsetTop;
        const agendaSectionHeight = agendaSection.offsetHeight;
        const windowHeight = window.innerHeight;

        // Calculate when the section is leaving the viewport
        const sectionBottom = agendaSectionTop + agendaSectionHeight;
        const scrollFromSectionEnd = scroll - (sectionBottom - windowHeight);
        const maxScroll = windowHeight;

        // Progress from 0 to 1 as we scroll past the section
        const progress = Math.max(0, Math.min(1, scrollFromSectionEnd / maxScroll));
        scrollProgress = Math.min(progress * CONFIG.speed, 1.1);
    };

    lenis.on("scroll", onScroll);

    window.addEventListener("resize", () => {
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    // Cleanup function
    return () => {
        window.removeEventListener("resize", resize);
        lenis.off("scroll", onScroll);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
    };
}
