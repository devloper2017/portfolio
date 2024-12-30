import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

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

  // Declare mouse property
  private mouse: THREE.Vector2 = new THREE.Vector2();

  // Declare raycaster property
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  ngOnInit(): void {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.createCube();
    this.addEventListeners();
    this.animate();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#b1cee7'); // Light black background
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
        if (color === 'white') {
          const number = row * 3 + col + 1;
          context.fillStyle = 'black';
          context.font = 'bold 40px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(number.toString(), x + step / 2, y + step / 2);
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
    this.mouse.x = (event.clientX / rect.width) * 2 - 1;
    this.mouse.y = - (event.clientY / rect.height) * 2 + 1;

    // Set the raycaster's position based on the mouse and camera
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Perform the intersection check
    let intersects = this.raycaster.intersectObject(this.cube);

    // Check if there is any intersection
    if (intersects.length > 0) {
      let object: any = intersects[0].object;

      // this.applyClickEffect(object);
    
    } else {
      console.log("No intersection detected.");
    }
  }



  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    if (!this.isDragging) {
      this.cube.rotation.x += 0.005;
      this.cube.rotation.y += 0.005;
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
