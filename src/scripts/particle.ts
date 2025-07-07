import * as THREE from 'three';

export class ParticleSystem {
  private container: HTMLElement;
  private camera: THREE.OrthographicCamera; // Changed to OrthographicCamera
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
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    
    // Use OrthographicCamera for a 1:1 coordinate mapping without perspective distortion
    this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    this.camera.position.z = 100;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.bindMethods();
    
    const imageUrl = this.container.dataset.imageUrl;
    if (imageUrl) this.loadAndCreateParticles(imageUrl);
    
    this.addEventListeners();
    this.animate();
  }
  
  private loadAndCreateParticles(imageUrl: string): void {
    const loader = new THREE.ImageLoader();
    loader.load(imageUrl, (image) => {
      // Get the ACTUAL display size of the container
      const viewWidth = this.container.clientWidth;
      const viewHeight = this.container.clientHeight;
      
      const img = image;
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
      const viewAspectRatio = viewWidth / viewHeight;

      // Calculate the size the image should be to fit inside the container
      let drawWidth, drawHeight;
      if (imgAspectRatio > viewAspectRatio) {
        drawWidth = viewWidth;
        drawHeight = drawWidth / imgAspectRatio;
      } else {
        drawHeight = viewHeight;
        drawWidth = drawHeight * imgAspectRatio;
      }
      
      const tempCtx = document.createElement('canvas').getContext('2d');
      if (!tempCtx) return;
      tempCtx.canvas.width = drawWidth;
      tempCtx.canvas.height = drawHeight;
      tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
      const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight).data;

      const positions = [];
      const step = 2; // You can adjust this for particle density

      for (let y = 0; y < drawHeight; y += step) {
        for (let x = 0; x < drawWidth; x += step) {
          const alpha = imageData[(y * Math.floor(drawWidth) + x) * 4 + 3];
          if (alpha > 128) {
            // Position particles relative to the center of the container
            positions.push(x - drawWidth / 2, -y + drawHeight / 2, 0);
          }
        }
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      this.originalPositions = new Float32Array(geometry.attributes.position.array);

      const material = new THREE.PointsMaterial({
        color: 0xa32727,
        size: 1.8,
        sizeAttenuation: true
      });

      this.particles = new THREE.Points(geometry, material);
      // No need to scale the particle system anymore, as it's created at the correct size
      this.scene.add(this.particles);
    });
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (!this.particles || !this.originalPositions) return;

    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const maxDist = 70;  // Interaction radius, adjust as you like
    const ease = 0.02;   // How fast particles return to origin

    for (let i = 0; i < positions.length; i += 3) {
      const dX = positions[i] - this.mouse.x;
      const dY = positions[i+1] - this.mouse.y;
      const distance = Math.sqrt(dX * dX + dY * dY);
      const force = Math.max(0, (maxDist - distance) / maxDist);
      
      positions[i] += (this.originalPositions[i] - positions[i]) * ease + (dX / distance) * force * 5;
      positions[i+1] += (this.originalPositions[i+1] - positions[i+1]) * ease + (dY / distance) * force * 5;
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
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const scale = this.particles ? this.particles.scale.x : 1;
    this.mouse.x = (clientX - rect.left - rect.width / 2) / scale;
    this.mouse.y = (-(clientY - rect.top) + rect.height / 2) / scale;
  }
  
  private onResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.left = width / -2; this.camera.right = width / 2;
    this.camera.top = height / 2; this.camera.bottom = height / -2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    // Re-calculating scale on resize is also important
    // (This part can be further refactored if needed, but for now we focus on the camera)
  }
  
  private addEventListeners(): void {
    this.container.addEventListener('mousemove', this.handlePointerMove);
    this.container.addEventListener('touchmove', this.handlePointerMove);
    this.container.addEventListener('mouseleave', () => this.mouse.set(-10000, -10000));
    this.container.addEventListener('touchend', () => this.mouse.set(-10000, -10000));
    window.addEventListener('resize', this.onResize);
  }

  public destroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.container.removeEventListener('mousemove', this.handlePointerMove);
    this.container.removeEventListener('touchmove', this.handlePointerMove);
    window.removeEventListener('resize', this.onResize);
  }
}