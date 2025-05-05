import { OBB } from '../../../libs/OBB.js'
import * as THREE from '../../../libs/three.module.js'


class LivingRoom_1 extends THREE.Object3D {
  constructor() {
    
    super();
    this.pov = false;
    //Edificio de 40 unidades de alto y 10 de ancho

    const floor = new THREE.BoxGeometry( 3.5, 0.1, 6); 
    // Cargar la textura
    const textureLoader = new THREE.TextureLoader();
    const textura = textureLoader.load('./imgs/ceramic_floor_1.jpg');

    // Crear materiales para cada cara
    const concreteMaterial = [
      new THREE.MeshStandardMaterial({  map: textura  }), // Lateral izquierda
      new THREE.MeshStandardMaterial({  map: textura  }), // Lateral derecha
      new THREE.MeshStandardMaterial({ map: textura }), // Parte superior
      new THREE.MeshStandardMaterial({ map: textura  }), // Parte inferior
      new THREE.MeshStandardMaterial({  map: textura }),    // Frente con textura
      new THREE.MeshStandardMaterial({  map: textura  })  // Parte trasera
    ];

    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;

    textura.repeat.set(6,12)
    const cube = new THREE.Mesh( floor, concreteMaterial );
    cube.receiveShadow = true;
    cube.castShadow = true;


    //Techo
    const ceilingGeometry = new THREE.BoxGeometry( 3.5, 0.1, 6); 
    const ceilingTexture = textureLoader.load('./imgs/wall_1.jpg');
    const ceilingMaterial = [
      new THREE.MeshStandardMaterial({  map:ceilingTexture }), // Lateral izquierda
      new THREE.MeshStandardMaterial({  map:ceilingTexture }), // Lateral derecha
      new THREE.MeshStandardMaterial({ map: ceilingTexture }), // Parte superior
      new THREE.MeshStandardMaterial({ map: ceilingTexture }), // Parte inferior
      new THREE.MeshStandardMaterial({  map: ceilingTexture}),    // Frente con textura
      new THREE.MeshStandardMaterial({  map: ceilingTexture })  // Parte trasera
    ];
    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(7,7);
    this.ceiling = new THREE.Mesh( ceilingGeometry, ceilingMaterial );
    this.ceiling.position.set(0,0.1/2+0.1+2.55,0);
    //this.add(this.ceiling);
    this.ceiling.receiveShadow = true;
    this.ceiling.castShadow = true;


    const walltexture = textureLoader.load('./imgs/wall_1.jpg');

    const longWallGeometry = new THREE.BoxGeometry( 0.1, 2.55, 6); 
    const longWallMaterial = [
      new THREE.MeshStandardMaterial({  map:walltexture }), // Lateral izquierda
      new THREE.MeshStandardMaterial({  map:walltexture }), // Lateral derecha
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte superior
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte inferior
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa}),    // Frente con textura
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa })  // Parte trasera
    ];

    walltexture.wrapS = THREE.RepeatWrapping;
    walltexture.wrapT = THREE.RepeatWrapping;

    walltexture.repeat.set(7,7)

    const longWall1 = new THREE.Mesh( longWallGeometry, longWallMaterial );
    longWall1.position.set(-0.1/2-(3.5/2),2.55/2+0.1,0);
    this.add(longWall1);
    longWall1.receiveShadow = true;
    longWall1.castShadow = true;

    const longWall2 = new THREE.Mesh( longWallGeometry, longWallMaterial );
    longWall2.position.set(0.1/2+(3.5/2),2.55/2 +0.1,0);
    this.add(longWall2);
    longWall2.receiveShadow = true;
    longWall2.castShadow = true;

    const shortwalltexture = textureLoader.load('./imgs/wall_1.jpg');

    const shortWallGeometry = new THREE.BoxGeometry( 3.5, 2.55, 0.1); 
    const shortWallMaterial = [
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa  }), // Lateral izquierda
      new THREE.MeshStandardMaterial({  color: 0xaaaaaa  }), // Lateral derecha
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte superior
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa }), // Parte inferior
      new THREE.MeshStandardMaterial({  map:shortwalltexture}),    // Frente con textura
      new THREE.MeshStandardMaterial({  map:shortwalltexture  })  // Parte trasera
    ];

    shortwalltexture.wrapS = THREE.RepeatWrapping;
    shortwalltexture.wrapT = THREE.RepeatWrapping;

    shortwalltexture.repeat.set(7,7)

    const shortWall1 = new THREE.Mesh( shortWallGeometry, shortWallMaterial );
    shortWall1.position.set(0, 2.55/2 +0.1, -0.1/2-6/2);
    this.add(shortWall1);
    shortWall1.receiveShadow = true;
    shortWall1.castShadow = true;

    const shortWall2 = new THREE.Mesh( shortWallGeometry, shortWallMaterial );
    shortWall2.position.set(0, 2.55/2 +0.1, 0.1/2+6/2);
    this.add(shortWall2);
    shortWall2.receiveShadow = true;
    shortWall2.castShadow = true;

    //Escalera
    const stairsTexture = textureLoader.load('./imgs/stairs.jpg');
    const stairsGeometry = new THREE.PlaneGeometry(0.93, 2.55); // ancho x alto en metros
    const stairsMaterial = new THREE.MeshStandardMaterial({ map: stairsTexture, transparent: true });
    const stairs = new THREE.Mesh(stairsGeometry, stairsMaterial);
    stairs.position.set(-3.5/2+0.01, 2.55/2+0.1, -0.93/2+6/2-2.14);
    stairs.rotation.y = Math.PI/2;
    this.add(stairs);
    stairs.receiveShadow = true;
    stairs.castShadow = true;

    //Puerta calle
    const streetDoorTexture = textureLoader.load('./imgs/streetDoor.jpg');
    const streetDoorGeometry = new THREE.PlaneGeometry(1.22, 2.09); // ancho x alto en metros
    const streetDoorMaterial = new THREE.MeshStandardMaterial({ map: streetDoorTexture, transparent: true });
    const streetDoor = new THREE.Mesh(streetDoorGeometry, streetDoorMaterial);
    streetDoor.position.set(3.5/2-0.01, 2.09/2+0.1, -1.22/2+6/2-1.09);
    streetDoor.rotation.y = -Math.PI/2;
    this.add(streetDoor);
    streetDoor.receiveShadow = true;
    streetDoor.castShadow = true;

    //Puerta interior
    const insideDoorTexture = textureLoader.load('./imgs/insideDoor.jpg');
    const insideDoorGeometry = new THREE.PlaneGeometry(0.79, 2.11); // ancho x alto en metros
    const insideDoorMaterial = new THREE.MeshStandardMaterial({ map: insideDoorTexture, transparent: true });
    const insideDoor = new THREE.Mesh(insideDoorGeometry, insideDoorMaterial);
    insideDoor.position.set(-0.79/2 + 3.5/2, 2.11/2+0.1, -3+0.01);
    this.add(insideDoor);
    insideDoor.receiveShadow = true;
    insideDoor.castShadow = true;

    //Puerta cuarto
    const roomDoorTexture = textureLoader.load('./imgs/roomDoor.jpg');
    const roomDoorGeometry = new THREE.PlaneGeometry(0.96, 2.08); // ancho x alto en metros
    const roomDoorMaterial = new THREE.MeshStandardMaterial({ map: roomDoorTexture, transparent: true });
    const roomDoor = new THREE.Mesh(roomDoorGeometry, roomDoorMaterial);
    roomDoor.position.set(-0.96/2 + 3.5/2-0.16, 2.08/2+0.1, +3-0.01);
    roomDoor.rotation.y = Math.PI;
    this.add(roomDoor);
    roomDoor.receiveShadow = true;
    roomDoor.castShadow = true;



    const geometry = new THREE.BoxGeometry(0.79, 0.1, 0.79);
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
    

    this.name = 'livingroom_1'
    this.objectSelected = false;

    cube.position.set(0,0.1/2,0);
    this.add(cube); 
    this.update();
  }
  
  getBBoxPosition(){
    
    return this.bbox.min.x
  }

  configureCeiling(){
    if(this.pov){
      this.remove(this.ceiling);
      this.pov = false;
    }else{
      this.add(this.ceiling)
      this.pov = true;
    }
    
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

export { LivingRoom_1 }
