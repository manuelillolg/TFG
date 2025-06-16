import { OBB } from '../../../libs/OBB.js'
import * as THREE from '../../../libs/three.module.js'


class Building_1 extends THREE.Object3D {
  constructor() {
    super();

  

    const buildingGeometry = new THREE.BoxGeometry( 16, 20, 16); 
    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    const alzado = textureLoader.load('./imgs/alzado.jpg');
    const perfil = textureLoader.load('./imgs/perfil.jpg');
    perfil.wrapS = THREE.RepeatWrapping;
    perfil.wrapT = THREE.RepeatWrapping;

    perfil.repeat.set(2,1)

    // Crear materiales para cada cara
    const buildingMaterial = [
      new THREE.MeshStandardMaterial({ map: perfil }), // Lateral izquierda
      new THREE.MeshStandardMaterial({ map: perfil }), // Lateral derecha
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte superior
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte inferior
      new THREE.MeshStandardMaterial({ map: alzado }),    // Frente con textura
      new THREE.MeshStandardMaterial({ map: perfil })  // Parte trasera
    ];
    const cube = new THREE.Mesh( buildingGeometry, buildingMaterial );
    cube.castShadow = true;
    cube.receiveShadow = true;


    const geometry = new THREE.BoxGeometry(15.9, 20, 15.9);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0.5 }); 
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()
    this.visibleBBox.position.set(0,20/2+0.1,0);

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox,true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox,0xff0000);
    

    this.name = 'Building_1'
    this.objectSelected = false;

    cube.position.set(0,20/2+0.1,0);
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

export { Building_1 }
