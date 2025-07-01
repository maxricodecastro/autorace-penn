import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class F1HeroScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.f1Model = null;
        this.isMouseDown = false;
        this.previousMouseX = 0;
        this.modelOpacity = 0;
        this.isModelLoaded = false;
        
        this.init();
        this.animate();
        this.setupControls();
        this.startTypingAnimation();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup (adjusted for right half of screen)
        const canvas = document.getElementById('three-canvas');
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(3, 1, 3.5);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);



        // Simple lighting setup
        this.setupLighting();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
                this.scene.add(directionalLight);
    }

    setupControls() {
        const canvasElement = this.renderer.domElement;
        
        canvasElement.addEventListener('mousedown', (event) => {
            this.isMouseDown = true;
            this.previousMouseX = event.clientX;
        });
        
        canvasElement.addEventListener('mousemove', (event) => {
            if (!this.isMouseDown || !this.f1Model) return;
            
            const deltaX = event.clientX - this.previousMouseX;
            this.f1Model.rotation.y += deltaX * 0.01;
            this.previousMouseX = event.clientX;
        });
        
        canvasElement.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        canvasElement.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
        });
        
        // Touch controls for mobile
        canvasElement.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                this.isMouseDown = true;
                this.previousMouseX = event.touches[0].clientX;
            }
        });
        
        canvasElement.addEventListener('touchmove', (event) => {
            if (!this.isMouseDown || !this.f1Model || event.touches.length !== 1) return;
            
            event.preventDefault();
            const deltaX = event.touches[0].clientX - this.previousMouseX;
            this.f1Model.rotation.y += deltaX * 0.01;
            this.previousMouseX = event.touches[0].clientX;
        });
        
        canvasElement.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });
        
        // Disable zoom functionality
        canvasElement.addEventListener('wheel', (event) => {
            event.preventDefault();
        });
    }

    loadF1Model() {
        const loader = new FBXLoader();
        
        loader.load(
            'uploads_files_4910989_F1.fbx',
            (object) => {
                this.f1Model = object;
                
                // Scale and position the model (positioned further right, no frame constraint)
                this.f1Model.scale.setScalar(0.002);
                this.f1Model.position.set(4, 0, 0);
                // Fix orientation - flip it right side up and show front initially
                this.f1Model.rotation.x = 0;
                this.f1Model.rotation.y = Math.PI;
                this.f1Model.rotation.z = Math.PI;

                // Apply wireframe to all materials and prepare for fade-in
                this.f1Model.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => {
                                    material.wireframe = true;
                                    material.color.setHex(0xffffff); // Subtle white wireframe
                                    material.transparent = true;
                                    material.opacity = 0;
                                });
                            } else {
                                child.material.wireframe = true;
                                child.material.color.setHex(0xffffff); // Subtle white wireframe
                                child.material.transparent = true;
                                child.material.opacity = 0;
                            }
                        }
                    }
                });

                this.scene.add(this.f1Model);
                this.isModelLoaded = true;

                // Show all elements after loading
                document.querySelector('.hero-section h1').classList.add('visible');
                document.querySelector('.hero-section p').classList.add('visible');
                document.querySelector('.buttons').classList.add('visible');
                document.querySelector('.applications-text').classList.add('visible');
            },
            (progress) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading FBX model:', error);
            }
        );
    }

    onWindowResize() {
        const canvasEl = document.getElementById('three-canvas');
        this.camera.aspect = canvasEl.clientWidth / canvasEl.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Slowly rotate the F1 model on Y axis
        if (this.f1Model) {
            this.f1Model.rotation.y += 0.0005;
        }
        
        // Fade in the model after it's loaded
        if (this.isModelLoaded && this.modelOpacity < 0.4) {
            this.modelOpacity = Math.min(0.4, this.modelOpacity + 0.01);
            this.f1Model.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => {
                                material.opacity = this.modelOpacity;
                            });
                        } else {
                            child.material.opacity = this.modelOpacity;
                        }
                    }
                }
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    startTypingAnimation() {
        const titleEl = document.getElementById('hero-title');
        const subtitleEl = document.getElementById('hero-subtitle');
        const buttonsEl = document.querySelector('.buttons');

        const titleText = titleEl.textContent;
        const subtitleText = subtitleEl.textContent;

        titleEl.textContent = '';
        subtitleEl.textContent = '';
        
        titleEl.classList.add('visible');
        subtitleEl.classList.add('visible');

        setTimeout(() => {
            this.type(titleEl, titleText, () => {
                this.type(subtitleEl, subtitleText, () => {
                    this.loadF1Model(); // Trigger model load
                    buttonsEl.classList.add('visible');
                });
            });
        }, 500);
    }

    type(element, text, callback) {
        element.innerHTML = '<span></span>';
        const textSpan = element.querySelector('span');
        let i = 0;
        const speed = 75;
        
        textSpan.classList.add('typing-cursor');
        
        const typeWriter = () => {
            if (i < text.length) {
                textSpan.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                textSpan.classList.remove('typing-cursor');
                if (callback) callback();
            }
        };
        typeWriter();
    }
}

// Initialize the scene when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new F1HeroScene();
}); 