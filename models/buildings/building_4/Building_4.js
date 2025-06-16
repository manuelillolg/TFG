import { OBB } from '../../../libs/OBB.js'
import * as THREE from '../../../libs/three.module.js'


class Building_4 extends THREE.Object3D {
  constructor(x, y, z, texture) {
    super();
    this.level = 0;
    this.height = y / 3;
    this.depth = z;
    this.width = x;

    const buildingGeometry = new THREE.BoxGeometry(x, y, z);
    //Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    const pared = textureLoader.load(`./imgs/${texture}.jpg`);
    pared.wrapS = THREE.RepeatWrapping;
    pared.wrapT = THREE.RepeatWrapping;
    pared.repeat.set(this.width/6,this.height)

    const paredLateral = textureLoader.load(`./imgs/${texture}.jpg`);
    paredLateral.wrapS = THREE.RepeatWrapping;
    paredLateral.wrapT = THREE.RepeatWrapping;
    paredLateral.repeat.set(this.depth/6,this.height)

    // Crear materiales para cada cara
    const buildingMaterial = [
      new THREE.MeshStandardMaterial({ map: paredLateral }), // Lateral izquierda
      new THREE.MeshStandardMaterial({ map: paredLateral }), // Lateral derecha
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte superior
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte inferior
      new THREE.MeshStandardMaterial({ map: pared }),    // Frente con textura
      new THREE.MeshStandardMaterial({ map: pared })  // Parte trasera
    ];
    const cube = new THREE.Mesh(buildingGeometry, buildingMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;


    const geometry = new THREE.BoxGeometry(x - 0.1, y, z - 0.1);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0.5 }); 
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()
    this.visibleBBox.position.set(0, y / 2 + 0.1, 0);

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox, true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox, 0xff0000);


    this.name = 'Building_4'
    this.objectSelected = false;

    cube.position.set(0, y / 2 + 0.1, 0);
    this.add(cube);
    this.update();
  }
  createFloor(object) {
    const textureLoader = new THREE.TextureLoader();
    switch (object) {

      case 'door':
        const doorTexture = textureLoader.load('./imgs/door.jpg');
        const doorGeometry = new THREE.PlaneGeometry(1.8, 2.8); // ancho x alto en metros
        const doorMaterial = new THREE.MeshStandardMaterial({ map: doorTexture, transparent: true });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.castShadow = true;
        door.receiveShadow = true;

        //Posicionar la puerta en la base de la planta
        door.position.set(0, 2.8 / 2 + 0.1 + this.level * 3, this.depth / 2 + 0.01);
        this.add(door);
      break;

      case 'balcony':
        const balconyTexture = textureLoader.load('./imgs/balcony.png');
        const balconyGeometry = new THREE.PlaneGeometry(1.8, 2.8); // ancho x alto en metros
        const balconyMaterial = new THREE.MeshStandardMaterial({ map: balconyTexture, transparent: true });
        const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
        balcony.castShadow = true;
        balcony.receiveShadow = true;

        // balcón trasero
        for(let i = 0; i < this.width/6; i++){
          const backBalcony = balcony.clone();
          backBalcony.rotation.y = Math.PI; 
          backBalcony.position.set( -this.width/2 + (this.width/(this.width/6))/2 +6*i, 2.8/ 2 + 0.1 + 0.1 + this.level * 3, -this.depth / 2 - 0.01);
          this.add(backBalcony);
        }
        

        // Ventana izquierda
        for(let i = 0; i < this.depth/6; i++){
          const leftBalcony = balcony.clone();
          leftBalcony.rotation.y = -Math.PI / 2; 
          leftBalcony.position.set(-this.width / 2 - 0.01, 2.8/ 2 + 0.1 + 0.1 + this.level * 3, -this.depth/2 + (this.depth/(this.depth/6))/2 +6*i);
          this.add(leftBalcony);
        }

        // Ventana derecha
        for(let i = 0; i < this.depth/6 ;i++){
          const rightBalcony = balcony.clone();
          rightBalcony.rotation.y = Math.PI / 2; 
          rightBalcony.position.set(+this.width / 2 + 0.01, 2.8/ 2 + 0.1 + 0.1 + this.level * 3, -this.depth/2 + (this.depth/(this.depth/6))/2 +6*i);
          this.add(rightBalcony);
        }

        //Ventana frontal

        for(let i = 0; i < this.width/6; i++){
          const frontBalcony = balcony.clone();
          frontBalcony.position.set( -this.width/2 + (this.width/(this.width/6))/2 +6*i, 2.8/ 2 + 0.1 + 0.1 + this.level * 3, this.depth / 2 +0.01);
          this.add(frontBalcony);
        }
      break;

      case 'window':
        const windowTexture = textureLoader.load('./imgs/window.jpg');
        const windowGeometry = new THREE.PlaneGeometry(1.8, 1.5); // ancho x alto en metros
        const windowMaterial = new THREE.MeshStandardMaterial({ map: windowTexture, transparent: true });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.castShadow = true;
        window.receiveShadow = true;

        // Ventana trasera
        for(let i = 0; i < this.width/6; i++){
          const backWindow = window.clone();
          backWindow.rotation.y = Math.PI; 
          backWindow.position.set( -this.width/2 + (this.width/(this.width/6))/2 +6*i, 1.5/ 2 + 0.1 + 1.5/2 + this.level * 3, -this.depth / 2 - 0.01);
          this.add(backWindow);
        }
        

        // Ventana izquierda
        for(let i = 0; i < this.depth/6; i++){
          const leftWindow = window.clone();
          leftWindow.rotation.y = -Math.PI / 2; 
          leftWindow.position.set(-this.width / 2 - 0.01, 1.5/ 2 + 0.1 + 1.5/2 + this.level * 3, -this.depth/2 + (this.depth/(this.depth/6))/2 +6*i);
          this.add(leftWindow);
        }

        // Ventana derecha
        for(let i = 0; i < this.depth/6 ;i++){
          const rightWindow = window.clone();
          rightWindow.rotation.y = Math.PI / 2; 
          rightWindow.position.set(+this.width / 2 + 0.01, 1.5/ 2 + 0.1 + 1.5/2 + this.level * 3, -this.depth/2 + (this.depth/(this.depth/6))/2 +6*i);
          this.add(rightWindow);
        }

        //Ventana frontal

        for(let i = 0; i < this.width/6; i++){
          const frontWindow = window.clone();
          frontWindow.position.set( -this.width/2 + (this.width/(this.width/6))/2 +6*i, 1.5/ 2 + 0.1 + 1.5/2 + this.level * 3, this.depth / 2 +0.01);
          this.add(frontWindow);
        }
      break;

      default:
      break;

    }

    this.level = this.level + 1;

  }

  getBBoxPosition() {

    return this.bbox.min.x
  }

  selectObject() {
    if (!this.objectSelected) {
      this.objectSelected = true;
      this.add(this.bboxHelper);
      this.add(this.visibleBBox)
    } else {
      this.objectSelected = false;
      this.unselectObject();
    }
  }

  unselectObject() {
    this.remove(this.bboxHelper);
    this.remove(this.visibleBBox)
  }

  update() {
    this.visibleBBox.userData.obb.copy(this.visibleBBox.geometry.userData.obb)
    this.visibleBBox.userData.obb.applyMatrix4(this.visibleBBox.matrixWorld)
  }
}

export { Building_4 }
