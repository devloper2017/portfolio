import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private isCubeInDownPosition = false;

  // Declare mouse property
  private mouse: THREE.Vector2 = new THREE.Vector2();

  // Declare raycaster property
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  private textMesh!: THREE.Mesh;
  private textIndex = 0;
  private font: any;  // Treat as any type
  private text: string = 'WELCOME TO MY PORTFOLIO';  // Text to display
  private typingSpeed: number = 100; // Speed of typing
  private currentText: string = ''; // Text that's been typed so far
  private typingIndex: number = 0;


  ngOnInit(): void {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.createCube();
    // this.createText();
    this.loadFontAndCreateText();
    this.addEventListeners();
    this.animate();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#9050d5d4'); // Light black background
  }

  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 6;
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  }


  private loadFontAndCreateText(): void {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      this.createText();
      this.animateText();  // Start the typing animation after the font is loaded
    });
  }

  private createText(): void {
    const geometry = new TextGeometry(this.currentText, {
      font: this.font,
      size: 0.4,
      height: 0.1,
      // curveSegments: 2,
      // bevelEnabled: true,
      // bevelSize: 0.5,
      // bevelThickness: 0.1,
    });

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color('hsla(256, 58.10%, 45.90%, 0.87)'),
      wireframe: false,
      side: THREE.DoubleSide,
    });

    this.textMesh = new THREE.Mesh(geometry, material);
    this.textMesh.position.set(0, 4, -2); // Positioning the text

    this.scene.add(this.textMesh);
  }

  private animateText(): void {
    const interval = setInterval(() => {
      if (this.typingIndex < this.text.length) {
        this.currentText += this.text.charAt(this.typingIndex);
        this.textMesh.geometry = new TextGeometry(this.currentText, {
          font: this.font,
          size: 0.4,
          height: 0.1,
          // curveSegments: 2,
          // bevelEnabled: true,
          // bevelSize: 0.5,
          // bevelThickness: 0.1,
        });

        this.textMesh.geometry.center();  // Re-center the text
        this.typingIndex++;
      } else {
        clearInterval(interval); // Stop once all text is typed
      }
    }, this.typingSpeed);
  }

  private createCube(): void {
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    // Create materials with 3x3 grid textures
    const materials = [
      this.createGridMaterial('yellow'),
      this.createGridMaterial('blue'),
      this.createGridMaterial('green'),
      this.createGridMaterial('red'),
      this.createGridMaterial('white'),
      this.createGridMaterial('purple')
    ];

    this.cube = new THREE.Mesh(geometry, materials);
    this.scene.add(this.cube);
  }

  private createGridMaterial(color: string): THREE.MeshBasicMaterial {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;

    // Fill background with the given color
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    // Draw grid lines
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    const step = canvas.width / 3;
    const radius = 10; // Border radius for rounded corners


    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * step;
        const y = row * step;

        // Create a clipping path for rounded corners
        context.save();
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + step - radius, y);
        context.quadraticCurveTo(x + step, y, x + step, y + radius);
        context.lineTo(x + step, y + step - radius);
        context.quadraticCurveTo(x + step, y + step, x + step - radius, y + step);
        context.lineTo(x + radius, y + step);
        context.quadraticCurveTo(x, y + step, x, y + step - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        context.clip();

        // Draw the cell background
        context.fillStyle = color;
        context.fillRect(x, y, step, step);

        // Draw the border
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.strokeRect(x, y, step, step);

        //number adding
        // if (color === 'white') {
        //   const number = row * 3 + col + 1;
        //   context.fillStyle = 'black';
        //   context.font = 'bold 40px Arial';
        //   context.textAlign = 'center';
        //   context.textBaseline = 'middle';
        //   context.fillText(number.toString(), x + step / 2, y + step / 2);
        // }

        // Draw the letter (A, B, C, etc.)
        if (color === 'white') {
          const letter = letters[row * 3 + col];
          context.fillStyle = 'black';
          context.font = 'bold 40px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(letter, x + step / 2, y + step / 2);
        }


        context.restore();
      }
    }

    // with radious
    // for (let row = 0; row < 3; row++) {
    //   for (let col = 0; col < 3; col++) {
    //     const x = col * step;
    //     const y = row * step;
    //     context.beginPath();
    //     context.moveTo(x + radius, y);
    //     context.lineTo(x + step - radius, y);
    //     context.quadraticCurveTo(x + step, y, x + step, y + radius);
    //     context.lineTo(x + step, y + step - radius);
    //     context.quadraticCurveTo(x + step, y + step, x + step - radius, y + step);
    //     context.lineTo(x + radius, y + step);
    //     context.quadraticCurveTo(x, y + step, x, y + step - radius);
    //     context.lineTo(x, y + radius);
    //     context.quadraticCurveTo(x, y, x + radius, y);
    //     context.closePath();
    //     context.stroke();
    //   }
    // }

    // without readious
    // for (let i = 1; i < 3; i++) {
    //   // Vertical lines
    //   context.beginPath();
    //   context.moveTo(i * step, 0);
    //   context.lineTo(i * step, canvas.height);
    //   context.stroke();

    //   // Horizontal lines
    //   context.beginPath();
    //   context.moveTo(0, i * step);
    //   context.lineTo(canvas.width, i * step);
    //   context.stroke();
    // }

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({ map: texture });
  }

  private addEventListeners(): void {
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('wheel', this.handleWheel.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));

    window.addEventListener('click', this.handleClick.bind(this)); // Add click listener

  }

  private handleMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaMove = {
      x: event.clientX - this.previousMousePosition.x,
      y: event.clientY - this.previousMousePosition.y,
    };

    this.cube.rotation.y += deltaMove.x * 0.005;
    this.cube.rotation.x += deltaMove.y * 0.005;

    this.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private handleWheel(event: WheelEvent): void {
    this.camera.position.z += event.deltaY * 0.005;
    this.camera.position.z = Math.max(3, Math.min(10, this.camera.position.z));
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Set the raycaster's position based on the mouse and camera
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Perform the intersection check with the cube
    let intersects = this.raycaster.intersectObject(this.cube);

    if (intersects.length > 0) {
      let intersectedObject = intersects[0].object as THREE.Mesh;

      if (intersectedObject.material) {
        if (Array.isArray(intersectedObject.material)) {
          const clickedFaceMaterial = intersectedObject.material[intersects[0].face!.materialIndex];
          if (clickedFaceMaterial instanceof THREE.MeshBasicMaterial && clickedFaceMaterial.map) {
            this.processClickOnMaterial(clickedFaceMaterial, intersects[0].uv);
          }
        } else if (intersectedObject.material instanceof THREE.MeshBasicMaterial && intersectedObject.material.map) {
          this.processClickOnMaterial(intersectedObject.material, intersects[0].uv);
        }
      }
    }
  }

  private processClickOnMaterial(material: THREE.MeshBasicMaterial, uv: THREE.Vector2 | undefined): void {
    if (!material.map || !uv) return;

    const texture = material.map;
    const canvas = texture.image as HTMLCanvasElement;

    let pixelData: Uint8ClampedArray | null;

    if (canvas instanceof HTMLCanvasElement) {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const pixelX = Math.floor(uv.x * canvas.width);
      const pixelY = Math.floor((1 - uv.y) * canvas.height);
      pixelData = context?.getImageData(pixelX, pixelY, 1, 1).data || null;
    } else {
      pixelData = this.getPixelDataFromTexture(texture, Math.floor(uv.x * texture.image.width), Math.floor((1 - uv.y) * texture.image.height));
    }

    if (pixelData) {
      const isWhite = pixelData[0] == 255 && pixelData[1] == 255 && pixelData[2] == 255 && pixelData[3] == 255;

      if (!isWhite) {
        console.log('Clicked color is not white.');
        return;
      }

      const step = canvas.width / 3; // Grid step size
      const pixelX = uv.x * canvas.width;
      const pixelY = (1 - uv.y) * canvas.height;
      const col = Math.floor(pixelX / step);
      const row = Math.floor(pixelY / step);

      if (col >= 0 && col < 3 && row >= 0 && row < 3) {
        const letter = String.fromCharCode(65 + row * 3 + col); // Convert to letter
        console.log(`Clicked letter: ${letter}`);

        if (letter === 'A') {
          // this.animateCube();
          // this.updateTextToAboutMe()
        }

      }
    } else {
      console.log('Pixel data could not be retrieved.');
    }
  }

  private getPixelDataFromTexture(texture: THREE.Texture, pixelX: number, pixelY: number): Uint8ClampedArray | null {
    const image = texture.image as HTMLImageElement | HTMLCanvasElement;
    const offscreenCanvas = document.createElement('canvas');
    const context = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    if (!context) return null;

    offscreenCanvas.width = image.width;
    offscreenCanvas.height = image.height;

    // Draw the texture image onto the canvas
    context.drawImage(image, 0, 0);

    // Read the pixel data
    return context.getImageData(pixelX, pixelY, 1, 1).data;
  }

  // private animateCube(): void {

  //   if (this.isCubeInDownPosition) {
  //     console.log("Cube is already in the down position.");
  //     return; // Do nothing if the cube is already in the down position
  //   }

  //   const duration = 5000; // Animation duration in milliseconds
  //   const startTime = performance.now();
  //   const initialYPosition = this.cube.position.y; // Store the initial Y position
  //   const targetYPosition = initialYPosition - 2; // Cube will move down by 2 units

  //   const animate = () => {
  //     const currentTime = performance.now();
  //     const elapsed = currentTime - startTime;

  //     if (elapsed < duration) {
  //       // Spin the cube faster
  //       // this.cube.rotation.x += 0.1;
  //       this.cube.rotation.y += 0.05;

  //       // Smoothly move the cube down
  //       this.cube.position.y = initialYPosition - (elapsed / duration) * 2;

  //       requestAnimationFrame(animate);
  //     } else {
  //       // Ensure the cube stays at the final position
  //       this.cube.rotation.x = Math.round(this.cube.rotation.x * 100) / 100;
  //       this.cube.rotation.y = Math.round(this.cube.rotation.y * 100) / 100;
  //       this.cube.position.y = targetYPosition;


  //       this.isCubeInDownPosition = true;

  //     }
  //   };

  //   animate();
  // }


  // private updateTextToAboutMe(): void {
  //   const aboutText = `ABOUT ME\nI am a web developer with X years of coding experience.\nI specialize in creating amazing web applications!`;
  //   this.textMesh.geometry = new TextGeometry(aboutText);
  //   this.textMesh.geometry.center();
  // }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    if (!this.isDragging) {
      this.cube.rotation.x += 0.004;
      this.cube.rotation.y += 0.006;
    }

    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    window.removeEventListener('wheel', this.handleWheel.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.rendererContainer.nativeElement.removeChild(this.renderer.domElement);
  }
}
