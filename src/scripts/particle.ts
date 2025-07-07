import * as THREE from "three";

export class ParticleSystem {
  private container: HTMLElement;
  private camera: THREE.OrthographicCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points | null = null;
  private originalPositions: Float32Array | null = null;
  private animationFrameId: number | null = null;
  private mouse = new THREE.Vector2(-10000, -10000);

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.scene = new THREE.Scene();
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    this.bindMethods();
    this.addEventListeners();
    this.animate();

    const imageUrl = this.container.dataset.imageUrl;
    if (imageUrl) this.createParticles(imageUrl);
  }

  private createParticles(imageUrl: string): void {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      const img = texture.image;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const tempCtx = document.createElement("canvas").getContext("2d");
      if (!tempCtx) return;
      tempCtx.canvas.width = imgWidth;
      tempCtx.canvas.height = imgHeight;
      tempCtx.drawImage(img, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, imgWidth, imgHeight).data;

      const positions = [];
      const colors = []; // Array to hold color data
      const desiredColor = new THREE.Color(0xa32727); // Your desired red color
      const step = 3;

      for (let y = 0; y < imgHeight; y += step) {
        for (let x = 0; x < imgWidth; x += step) {
          const alpha = imageData[(y * imgWidth + x) * 4 + 3];
          if (alpha > 128) {
            positions.push(x - imgWidth / 2, -y + imgHeight / 2, 0);
            // Add the RGB components of your desired color for each particle
            colors.push(desiredColor.r, desiredColor.g, desiredColor.b);
          }
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      // Set the color attribute for the geometry
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );

      this.originalPositions = new Float32Array(
        geometry.attributes.position.array
      );

      // Tell the material to use the color attribute from the geometry
      const material = new THREE.PointsMaterial({
        size: 1.8,
        sizeAttenuation: false,
        vertexColors: true, // IMPORTANT: Use vertex colors
        transparent: true,
        opacity: 0.9,
      });

      this.particles = new THREE.Points(geometry, material);
      this.particles.userData.imageSize = {
        width: imgWidth,
        height: imgHeight,
      };
      this.onResize();
      this.scene.add(this.particles);
    });
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (!this.particles || !this.originalPositions) return;

    const positions = this.particles.geometry.attributes.position
      .array as Float32Array;
    const maxDist = 150; // Interaction radius, adjust as you like
    const ease = 0.02; // How fast particles return to origin

    for (let i = 0; i < positions.length; i += 3) {
      const dX = positions[i] - this.mouse.x;
      const dY = positions[i + 1] - this.mouse.y;
      const distance = Math.sqrt(dX * dX + dY * dY);
      const force = Math.max(0, (maxDist - distance) / maxDist);

      positions[i] +=
        (this.originalPositions[i] - positions[i]) * ease +
        (dX / distance) * force * 5;
      positions[i + 1] +=
        (this.originalPositions[i + 1] - positions[i + 1]) * ease +
        (dY / distance) * force * 5;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  // --- Event Handling & Cleanup ---
  private bindMethods(): void {
    this.animate = this.animate.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  private handlePointerMove(event: MouseEvent | TouchEvent): void {
    const rect = this.container.getBoundingClientRect();
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const clientY =
      "touches" in event ? event.touches[0].clientY : event.clientY;

    const scale = this.particles ? this.particles.scale.x : 1;
    this.mouse.x = (clientX - rect.left - rect.width / 2) / scale;
    this.mouse.y = (-(clientY - rect.top) + rect.height / 2) / scale;
  }

  private onResize(): void {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Update camera and renderer as always
    this.camera.left = width / -2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = height / -2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // THIS IS THE KEY LOGIC
    if (this.particles && this.particles.userData.imageSize) {
      const imgSize = this.particles.userData.imageSize;
      const imageAspect = imgSize.width / imgSize.height;
      const containerAspect = width / height;

      let scale;
      if (imageAspect > containerAspect) {
        // If image is wider than container, fit to container width
        scale = width / imgSize.width;
      } else {
        // If image is taller than container, fit to container height
        scale = height / imgSize.height;
      }

      // Apply a padding factor to create some margin
      this.particles.scale.set(scale*0.9, scale*0.9, 1);
    }
  }

  private addEventListeners(): void {
    this.container.addEventListener("mousemove", this.handlePointerMove);
    this.container.addEventListener("touchmove", this.handlePointerMove);
    this.container.addEventListener("mouseleave", () =>
      this.mouse.set(-10000, -10000)
    );
    this.container.addEventListener("touchend", () =>
      this.mouse.set(-10000, -10000)
    );
    window.addEventListener("resize", this.onResize);
  }

  public destroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.container.removeEventListener("mousemove", this.handlePointerMove);
    this.container.removeEventListener("touchmove", this.handlePointerMove);
    window.removeEventListener("resize", this.onResize);
  }
}
