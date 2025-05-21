export class AsciiAnimation {
    constructor(ui) {
        this.ui = ui;
        this.interval = null;
        this.currentFrame = 0;
        this.frames = [
            "[ ■ □ □ □ □ □ □ □ □ □ ]",
            "[ □ ■ □ □ □ □ □ □ □ □ ]",
            "[ □ □ ■ □ □ □ □ □ □ □ ]",
            "[ □ □ □ ■ □ □ □ □ □ □ ]",
            "[ □ □ □ □ ■ □ □ □ □ □ ]",
            "[ □ □ □ □ □ ■ □ □ □ □ ]",
            "[ □ □ □ □ □ □ ■ □ □ □ ]",
            "[ □ □ □ □ □ □ □ ■ □ □ ]",
            "[ □ □ □ □ □ □ □ □ ■ □ ]",
            "[ □ □ □ □ □ □ □ □ □ ■ ]",
            "[ □ □ □ □ □ □ □ □ ■ □ ]",
            "[ □ □ □ □ □ □ □ ■ □ □ ]",
            "[ □ □ □ □ □ □ ■ □ □ □ ]",
            "[ □ □ □ □ □ ■ □ □ □ □ ]",
            "[ □ □ □ □ ■ □ □ □ □ □ ]",
            "[ □ □ □ ■ □ □ □ □ □ □ ]",
            "[ □ □ ■ □ □ □ □ □ □ □ ]",
            "[ □ ■ □ □ □ □ □ □ □ □ ]",
            //"[ ■ □ □ □ □ □ □ □ □ □ ]"
        ];
    }

    start() {
        this.interval = setInterval(() => {
            this.ui.domElements.asciiAnimationDiv.textContent = this.frames[this.currentFrame];
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 150);
    }

    stop() {
        if(this.interval){
            clearInterval(this.interval);
            this.interval = null;
            this.ui.domElements.asciiAnimationDiv.textContent = "";
        }
    }
}

export class MatrixAnimation {
    constructor(ui) {
        this.ui = ui;

        this.matrix = {
            scene: null,
            camera: null,
            renderer: null,
            points: null,
            animationId: null,
        };
    }

    start() {
        const dom = this.ui.domElements;
        const matrix = this.matrix;

        // Clear previous canvas if any
        if (dom.matrixCanvas != null) {  
            while (dom.matrixCanvas.firstChild) {
                dom.matrixCanvas.removeChild(dom.matrixCanvas.firstChild);
            }
        }


        // Start Animation
        try {
            // Initialize Three.js scene
            matrix.scene = new THREE.Scene();
            matrix.scene.background = new THREE.Color(0x000502);

            const width = dom.matrixCanvas.clientWidth || 400;
            const height = dom.matrixCanvas.clientHeight || 400;

            // Initialize Camera
            matrix.camera = new THREE.PerspectiveCamera(
                75,
                width / height,
                0.1,
                1000
            );
            matrix.camera.position.z = 5;

            // Initialize Renderer
            matrix.renderer = new THREE.WebGLRenderer({
                antialias: true,
            });
            matrix.renderer.setSize(width, height);
            dom.matrixCanvas.appendChild(matrix.renderer.domElement);

            // Initialize Geometry
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const numPoints = 5000;
            for (let i = 0; i < numPoints; i++) {
                vertices.push(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
            }
            geometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(vertices, 3)
            )

            // Initialize Material
            const matrixColorCSS = this.ui.getCssVariable("--matrix-color") || "#00ff41";
            const material = new THREE.PointsMaterial({
                color: matrixColorCSS,
                size: 0.05,
                transparent: true,
                opacity: 0.7,
                sizeAttenuation: true,
            });

            // Initialize Points
            matrix.points = new THREE.Points(geometry, material);
            matrix.scene.add(matrix.points);

            // Initialize Ambient Light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            matrix.scene.add(ambientLight);

            // Animation Function
            function animate() {
                if (matrix.animationId)
                    cancelAnimationFrame(matrix.animationId);
                matrix.animationId = requestAnimationFrame(animate);
                if (matrix.points) {
                    matrix.points.rotation.x += 0.001;
                    matrix.points.rotation.y += 0.002;
                }
                if (matrix.renderer && matrix.scene && matrix.camera) {
                    matrix.renderer.render(
                        matrix.scene,
                        matrix.camera
                    );
                }
            }
            animate();

            // Resize Observer
            const resizeObserver = new ResizeObserver((entries) => {
                console.log("Resizing matrix");
                for (let entry of entries) {
                    if (entry.target === dom.matrixCanvas && dom.matrixDetails.open) {
                        const width = dom.matrixCanvas.clientWidth || 400;
                        const height = dom.matrixCanvas.clientHeight > 50 ?
                            dom.matrixCanvas.clientHeight : 400;
                        matrix.renderer.setSize(width, height);
                        matrix.camera.aspect = width / height;
                        matrix.camera.updateProjectionMatrix();
                    }
                }
            });

            resizeObserver.observe(dom.matrixCanvas);

        } catch (error) {
            console.error("Error initializing matrix viewer:", error);
        }
    }

    stop() {
        const dom = this.ui.domElements;
        const matrix = this.matrix;

        while (dom.matrixCanvas.firstChild) {
            dom.matrixCanvas.removeChild(dom.matrixCanvas.firstChild);
        }
    }
}