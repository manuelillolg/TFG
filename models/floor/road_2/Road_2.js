import { OBB } from '../../../libs/OBB.js'
import * as THREE from '../../../libs/three.module.js'


class Road_2 extends THREE.Object3D {
  constructor() {
    super();

    //Edificio de 40 unidades de alto y 10 de ancho

    const concreteGeometry = new THREE.BoxGeometry( 8, 0.1, 8); 
    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    const textura = textureLoader.load('./imgs/road_2.jpg');

    // Crear materiales para cada cara
    const concreteMaterial = [
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa }), // Lateral izquierda
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa }), // Lateral derecha
      new THREE.MeshStandardMaterial({ map: textura }), // Parte superior
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte inferior
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa}),    // Frente con textura
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa })  // Parte trasera
    ];

    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;

    textura.repeat.set(1,1)
    const cube = new THREE.Mesh( concreteGeometry, concreteMaterial );
    cube.castShadow = true;
    cube.receiveShadow = true;


    const geometry = new THREE.BoxGeometry(7.9, 0.1, 7.9);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false , transparent: true, opacity: 0.5}); // Material sólido
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()
    this.visibleBBox.position.set(0,0.1/2,0);

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox,true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox,0xff0000);
    

    this.name = 'road_2'
    this.objectSelected = false;

    cube.position.set(0,0.1/2,0);
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

export { Road_2 }
