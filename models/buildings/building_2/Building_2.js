import { OBB } from '../../../libs/OBB.js'
import * as THREE from '../../../libs/three.module.js'


class Building_2 extends THREE.Object3D {
  constructor() {
    super();

    //Edificio de 40 unidades de alto y 10 de ancho

    const buildingGeometry = new THREE.BoxGeometry( 16, 30, 16); 
    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    const perfil = textureLoader.load('./imgs/perfil2.jpg');

    // Crear materiales para cada cara
    const buildingMaterial = [
      new THREE.MeshBasicMaterial({ map: perfil }), // Lateral izquierda
      new THREE.MeshBasicMaterial({ map: perfil }), // Lateral derecha
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Parte superior
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Parte inferior
      new THREE.MeshBasicMaterial({ map: perfil }),    // Frente con textura
      new THREE.MeshBasicMaterial({ map: perfil })  // Parte trasera
    ];
    const cube = new THREE.Mesh( buildingGeometry, buildingMaterial );


    const geometry = new THREE.BoxGeometry(15.9, 30, 15.9);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0.5 }); // Material sólido
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()
    this.visibleBBox.position.set(0,30/2,0);

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox,true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox,0xff0000);
    

    this.name = 'Building_2'
    this.objectSelected = false;

    cube.position.set(0,30/2,0);
    this.add(cube); 
    this.update();
  }
  
  getBBoxPosition(){
    
    return this.bbox.min.x
  }

  selectObject(){
    if(!this.objectSelected){
      this.objectSelected = true;
      this.add(this.bboxHelper);
      this.add(this.visibleBBox)
    }else{
      this.objectSelected = false;
      this.unselectObject();
    }
  }

  unselectObject(){
    this.remove(this.bboxHelper);
    this.remove(this.visibleBBox)
  }
  
  update() {
    this.visibleBBox.userData.obb.copy(this.visibleBBox.geometry.userData.obb)
    this.visibleBBox.userData.obb.applyMatrix4(this.visibleBBox.matrixWorld)
}
}

export { Building_2 }
