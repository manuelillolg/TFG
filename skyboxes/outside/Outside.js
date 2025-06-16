import * as THREE from '../../../libs/three.module.js'


class Outside extends THREE.Object3D {
  constructor() {
    super();

    const buildingGeometry = new THREE.BoxGeometry( 9000, 3, 9000); 
    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    //const alzado = textureLoader.load('./imgs/alzado.jpg');
    const cielo = textureLoader.load('./imgs/sky.jpg');
    cielo.wrapS = THREE.RepeatWrapping;
    cielo.wrapT = THREE.RepeatWrapping;
    cielo.repeat.set(800000,800000); 

    const suelo = textureLoader.load('./imgs/sand-ground-textured.jpg');
    suelo.wrapS = THREE.RepeatWrapping;
    suelo.wrapT = THREE.RepeatWrapping;
    suelo.repeat.set(3000,3000); 

    // Crear materiales para cada cara
    const buildingMaterial = [
      new THREE.MeshStandardMaterial({ map:suelo ,side: THREE.BackSide}), // Lateral izquierda
      new THREE.MeshStandardMaterial({ map:suelo ,side: THREE.BackSide}), // Lateral derecha
      new THREE.MeshStandardMaterial({ map:suelo }), // Parte superior
      new THREE.MeshStandardMaterial({ map:suelo, side: THREE.BackSide  }), // Parte inferior
      new THREE.MeshStandardMaterial({ map:suelo ,side: THREE.BackSide}),    // Frente con textura
      new THREE.MeshStandardMaterial({ map:suelo ,side: THREE.BackSide })  // Parte trasera
    ];
    const cube = new THREE.Mesh( buildingGeometry, buildingMaterial );
    cube.castShadows = true;
    cube.receiveShadows = true;
    

    this.name = 'Outside'
    this.objectSelected = false;

    cube.position.set(0,3/2-3 ,0);
    this.add(cube); 
    //this.update();
  }
  

}

export { Outside }
