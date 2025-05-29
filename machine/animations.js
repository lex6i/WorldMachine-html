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

        this.pointcloud = {
            geometry: null,
            lines: [],
            points: [],
            activePoints: [],
            pointConnections: [],
            numPoints: 5000,
            defaultSize: 0.01,
            activeSize: 0.2,
            rotationX: 0,
            rotationY: 0,
        }
    }

    start() {
        const dom = this.ui.domElements;
        const matrix = this.matrix;
        const pointcloud = this.pointcloud;

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
            matrix.camera.position.z = 7;

            // Initialize Renderer
            matrix.renderer = new THREE.WebGLRenderer({
                antialias: true,
            });
            matrix.renderer.setSize(width, height);
            dom.matrixCanvas.appendChild(matrix.renderer.domElement);

            // Initialize Geometry
            this.pointcloud.geometry = new THREE.BufferGeometry();
            const geometry = this.pointcloud.geometry;
            const vertices = [];
            const numPoints = this.pointcloud.numPoints;

            const mainColor = new THREE.Color(this.ui.getCssVariable("--matrix-color") || "#00ff41");
            
            const colors = new Float32Array(numPoints * 3);
            const sizes = new Float32Array(numPoints);

            for (let i = 0; i < numPoints; i++) {
                const x = (Math.random() - 0.5) * 10;
                const y = (Math.random() - 0.5) * 10;
                const z = (Math.random() - 0.5) * 10;

                vertices.push(x, y, z);

                pointcloud.points.push(x, y, z);

                const color = mainColor;
                colors[i*3] = color.r;
                colors[i*3+1] = color.g;
                colors[i*3+2] = color.b;

                sizes[i] = this.pointcloud.defaultSize;
            }

            geometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(vertices, 3)
            );
            geometry.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(colors, 3)
            );
            geometry.setAttribute(
                "size",
                new THREE.Float32BufferAttribute(sizes, 1)
            );

            // Custom shader material
            const material = new THREE.ShaderMaterial({
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    varying vec3 vColor;
                    uniform float pixelRatio;

                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;

                    void main() {
                        gl_FragColor = vec4(vColor, 1.0);
                    }
                `,
                transparent: true
            });
            

            // Initialize Points
            matrix.points = new THREE.Points(geometry, material);
            matrix.scene.add(matrix.points);

            // Initialize Ambient Light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
            matrix.scene.add(ambientLight);

            let rotationX = 0;
            let rotationY = 0;

            // Animation Function
            function animate() {
                if (matrix.animationId)
                    cancelAnimationFrame(matrix.animationId);
                matrix.animationId = requestAnimationFrame(animate);
                if (matrix.points) {
                    rotationX += 0.001;
                    rotationY += 0.002;
                    matrix.points.rotation.x = rotationX;
                    matrix.points.rotation.y = rotationY;
                }

                if (pointcloud.lines) {
                    console.log("Updating lines");
                    for (let line of pointcloud.lines) {
                        line.rotation.x = rotationX;
                        line.rotation.y = rotationY;
                    }
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

    addLine(point1, point2, color=0xffffff) {
        const points = [];
        points.push(point1[0], point1[1], point1[2]);
        points.push(point2[0], point2[1], point2[2]);

        console.log(points);

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ color: color, linewidth: 1 });

        geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));

        const line = new THREE.Line(geometry, material);

        this.pointcloud.lines.push(line);
        this.matrix.scene.add(line);
    }

    stop() {
        const dom = this.ui.domElements;
        const matrix = this.matrix;

        while (dom.matrixCanvas.firstChild) {
            dom.matrixCanvas.removeChild(dom.matrixCanvas.firstChild);
        }
    }
}