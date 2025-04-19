import * as THREE from '../../../libs/three.module.js'


class Outside extends THREE.Object3D {
  constructor() {
    super();

    //Edificio de 40 unidades de alto y 10 de ancho

    const buildingGeometry = new THREE.BoxGeometry( 1000000, 1000000, 1000000); 
    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    //const alzado = textureLoader.load('./imgs/alzado.jpg');
    const cielo = textureLoader.load('./imgs/sky.jpg');
    cielo.wrapS = THREE.RepeatWrapping;
    cielo.wrapT = THREE.RepeatWrapping;
    cielo.repeat.set(1000,1000); 

    const suelo = textureLoader.load('./imgs/sand-ground-textured.jpg');
    suelo.wrapS = THREE.RepeatWrapping;
    suelo.wrapT = THREE.RepeatWrapping;
    suelo.repeat.set(6000,6000); 

    // Crear materiales para cada cara
    const buildingMaterial = [
      new THREE.MeshBasicMaterial({ map:cielo ,side: THREE.BackSide}), // Lateral izquierda
      new THREE.MeshBasicMaterial({ map:cielo ,side: THREE.BackSide}), // Lateral derecha
      new THREE.MeshBasicMaterial({ map:cielo,side: THREE.BackSide }), // Parte superior
      new THREE.MeshBasicMaterial({ map:suelo, side: THREE.BackSide  }), // Parte inferior
      new THREE.MeshBasicMaterial({ map:cielo ,side: THREE.BackSide}),    // Frente con textura
      new THREE.MeshBasicMaterial({ map:cielo ,side: THREE.BackSide })  // Parte trasera
    ];
    const cube = new THREE.Mesh( buildingGeometry, buildingMaterial );
    

    this.name = 'Outside'
    this.objectSelected = false;

    cube.position.set(0,1000000/2 -3,0);
    this.add(cube); 
    //this.update();
  }
  
//   getBBoxPosition(){
    
//     return this.bbox.min.x
//   }

//   selectObject(){
//     if(!this.objectSelected){
//       this.objectSelected = true;
//       this.add(this.bboxHelper);
//       this.add(this.visibleBBox)
//     }else{
//       this.objectSelected = false;
//       this.unselectObject();
//     }
//   }

//   unselectObject(){
//     this.remove(this.bboxHelper);
//     this.remove(this.visibleBBox)
//   }
  
//   update() {
//     this.visibleBBox.userData.obb.copy(this.visibleBBox.geometry.userData.obb)
//     this.visibleBBox.userData.obb.applyMatrix4(this.visibleBBox.matrixWorld)
// }
}

export { Outside }
