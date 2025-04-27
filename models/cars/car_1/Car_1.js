import { OBB } from '../../../libs/OBB.js'
import * as THREE from '../../../libs/three.module.js'
import * as TWEEN from '../../../libs/tween.esm.js'
import { MTLLoader } from '../../../libs/MTLLoader.js'
import { OBJLoader } from '../../../libs/OBJLoader.js'


class Car_1 extends THREE.Object3D {
  constructor() {
    
    super();
    this.frames = [];
    this.activeTweens = [];
    this.duration = 1000
    this.repetitions = 1; 
    this.loop = false

    //Edificio de 40 unidades de alto y 10 de ancho

    // const buildingGeometry = new THREE.BoxGeometry( 400, 250, 1000); 
    // // Cargar la textura
    // const textureLoader = new THREE.TextureLoader();
    // const alzado = textureLoader.load('./imgs/alzado.jpg');
    // const perfil = textureLoader.load('./imgs/perfil.jpg');
    // perfil.wrapS = THREE.RepeatWrapping;
    // perfil.wrapT = THREE.RepeatWrapping;

    // perfil.repeat.set(2,1)

    // // Crear materiales para cada cara
    // const buildingMaterial = [
    //   new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Lateral izquierda
    //   new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Lateral derecha
    //   new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Parte superior
    //   new THREE.MeshBasicMaterial({ color: 0xaaaaaa }), // Parte inferior
    //   new THREE.MeshBasicMaterial({ color: 0xaaaaaa }),    // Frente con textura
    //   new THREE.MeshBasicMaterial({ color: 0xaaaaaa })  // Parte trasera
    // ];
    // const cube = new THREE.Mesh( buildingGeometry, buildingMaterial );


    const geometry = new THREE.BoxGeometry(4, 2.60, 9);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0.5}); // Material sólido
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()
    this.visibleBBox.position.set(0,2.60/2+1.5,0);

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox,true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox,0xff0000);
    

    this.name = 'car_1'
    this.objectSelected = false;

    // cube.position.set(0,250/2+1.1,0);
    // this.add(cube); 
    this.update();
    this.cargarModelo();
  }
  cargarModelo() {
    const ruta = './obj/'; // por ejemplo: 'assets/models/coche/'

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(ruta);
    mtlLoader.load('911.mtl', (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(ruta);
      objLoader.load('Porsche_911_GT2.obj', (obj) => {
        obj.position.set(0,1.5,0);
        obj.scale.set(2, 2, 2); // Doble de tamaño en todos los ejes
        this.obj = obj; // 🔹 lo guardas como propiedad de la clase
        this.add(this.obj)
         // lo añades a este Object3D
      });
    });
  }
  
  getBBoxPosition(){
    
    return this.bbox.min.x
  }

  selectObject(scene){
    if(!this.objectSelected){
      this.objectSelected = true;
      this.add(this.bboxHelper);
      this.add(this.visibleBBox)

      for (const frame of this.frames) {
        scene.add(frame);
      }
      
    }else{
      this.objectSelected = false;
      this.unselectObject(scene);
    }
  }

  addFrame(scene){
    const mainMesh = this.children.find(child => child.isMesh);

    if (this.obj) {
      const clone = this.obj.clone();
      console.log(clone.position)

      // Posición y rotación en el mundo
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      this.updateMatrixWorld(true); // fuerza la actualización de la jerarquía
      this.obj.updateMatrixWorld(true);

      this.obj.getWorldPosition(worldPos);
      this.obj.getWorldQuaternion(worldQuat);

      const offset = new THREE.Vector3(0, -1.5, 0);
      offset.applyQuaternion(worldQuat); // girar el offset si el objeto está rotado
      worldPos.add(offset); // ajustar la posición final

      clone.position.copy(worldPos);
      clone.quaternion.copy(worldQuat); // importante usar quaternion en lugar de euler

      clone.userData.isFrame = true;

      console.log(clone.position, " esta es la posicion del clone añadiddo")

      scene.add(clone);
      this.frames.push(clone);
    }
  }

  removeFrames(scene){
    for (const frame of this.frames) {
      scene.remove(frame);
    }
    this.frames = [];
  }

  unselectObject(scene){
    this.remove(this.bboxHelper);
    this.remove(this.visibleBBox);
    for (const frame of this.frames) {
      scene.remove(frame);
    }
  }

  animateThroughFrames() {
    console.log("Entra");
    if (this.frames.length < 2) return;
  
    const stepDuration = this.duration / (this.frames.length - 1);
    const object = this;
    this.activeTweens = []; // Limpiar animaciones previas
  
    let currentRepetition = 0;
    let currentIndex = 0;
  
    const createTweenForFrame = (i, onCompleteCallback) => {
      const target = this.frames[i];
  
      // Obtener posición y rotación globales
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      target.getWorldPosition(worldPos);
      target.getWorldQuaternion(worldQuat);
  
      // Convertir a espacio local del padre del objeto animado
      const targetPos = object.parent.worldToLocal(worldPos.clone());
      const parentQuat = object.parent.getWorldQuaternion(new THREE.Quaternion());
      const targetQuat = worldQuat.clone().premultiply(parentQuat.invert());
  
      console.log("Tween hacia:", targetPos);
  
      const posTween = new TWEEN.Tween(object.position)
        .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, stepDuration)
        .easing(TWEEN.Easing.Quadratic.InOut);
  
      const quatObj = { t: 0 };
      const quatTween = new TWEEN.Tween(quatObj)
        .to({ t: 1 }, stepDuration)
        .onUpdate(() => {
          object.quaternion.slerp(targetQuat, quatObj.t);
        });
  
      const combinedTween = new TWEEN.Tween()
        .to({}, stepDuration)
        .onStart(() => {
          posTween.start();
          quatTween.start();
        })
        .onComplete(onCompleteCallback);
  
      this.activeTweens.push(posTween, quatTween, combinedTween);
      return combinedTween;
    };
  
    const loop = () => {
      const tween = createTweenForFrame(currentIndex, () => {
        currentIndex++;
        if (currentIndex >= this.frames.length) {
          currentIndex = 0;
          currentRepetition++;
          if (!this.loop && currentRepetition >= this.repetitions) {
            console.log("Animación completada.");
            return; // No más repeticiones
          }
        }
        loop(); // Continuar con el siguiente frame
      });
      tween.start();
    };
  
    this.stopAnimation(); // Detener cualquier animación previa
    loop();
  }
  
  
  
  stopAnimation() {
    if (this.activeTweens) {
      this.activeTweens.forEach(tween => tween.stop());
      this.activeTweens = [];
    }
    
    this.visibleBBox.updateMatrixWorld(true);
    this.bboxHelper.updateMatrixWorld(true);

      // this.remove(this.bboxHelper);
      // this.remove(this.visibleBBox)
      
  }  
  
  update() {
    this.visibleBBox.userData.obb.copy(this.visibleBBox.geometry.userData.obb)
    this.visibleBBox.userData.obb.applyMatrix4(this.visibleBBox.matrixWorld)
    // Actualizar el Box3 que usa el helper
 
}
}

export { Car_1 }
