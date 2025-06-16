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

    const geometry = new THREE.BoxGeometry(1.95, 1.30, 4.45);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0.5}); 
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()
    this.visibleBBox.position.set(0,1.30/2+0.12,0);

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox,true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox,0xff0000);
    

    this.name = 'car_1'
    this.objectSelected = false;

    this.update();
    this.cargarModelo();
  }
  cargarModelo() {
    const ruta = './obj/'; 

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(ruta);
    mtlLoader.load('911.mtl', (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(ruta);
      objLoader.load('Porsche_911_GT2.obj', (obj) => {
        obj.position.set(0,0.12+0.65,0);
      
        this.obj = obj; 
        this.add(this.obj)
        
        obj.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        })
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

      const offset = new THREE.Vector3(0, -0.12-0.65, 0);
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

  animateThroughFrames(pickableObjects = []) {
    console.log("Entra");
    let stopRequested = false;
    if (this.frames.length < 2) return;
    const firstFrame = this.frames[0];

    // Obtener posición y rotación en mundo
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    firstFrame.getWorldPosition(worldPos);
    firstFrame.getWorldQuaternion(worldQuat);

    // Convertir a espacio local del padre
    const localPos = this.parent.worldToLocal(worldPos.clone());
    const parentQuat = this.parent.getWorldQuaternion(new THREE.Quaternion());
    const localQuat = worldQuat.clone().premultiply(parentQuat.invert());

    // Colocar el coche directamente
    this.position.copy(localPos);
    this.quaternion.copy(localQuat);
    this.update(); 
    this.add(this.bboxHelper);
    this.add(this.visibleBBox)
    this.visibleBBox.visible = false;  
    this.bboxHelper.visible = false;   
      
    const stepDuration = this.duration / (this.frames.length - 1);
    const object = this;
    this.activeTweens = []; // Limpiar animaciones previas
  
    let currentRepetition = 0;
    let currentIndex = 1;
  
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
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          object.update(); 
          if (object.checkCollision(pickableObjects)) {
            console.warn("Colisión detectada");
            stopRequested = true;
            object.stopAnimation();
          }
        });
  
      const quatObj = { t: 0 };
      const quatTween = new TWEEN.Tween(quatObj)
      .to({ t: 1 }, stepDuration)
      .onUpdate(() => {
        object.quaternion.slerp(targetQuat, quatObj.t);
        object.update();
        if (object.checkCollision(pickableObjects)) {
          console.warn("Colisión detectada");
          stopRequested = true;
          object.stopAnimation();
        }
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
      if(!stopRequested){
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
      }
    };
  
    this.stopAnimation(false); // Detener cualquier animación previa
    loop();
  }

  checkCollision(pickableObjects) {
    let collision = false;
  
    for (let i = 0; i < pickableObjects.length && !collision; i++) {
      const target = pickableObjects[i];
      console.log(this.visibleBBox.userData.obb.position)
      if (this !== target && this.visibleBBox.userData.obb.intersectsOBB(target.visibleBBox.userData.obb)) {
        collision = true;
        this.remove(this.bboxHelper);
        this.remove(this.visibleBBox);
        this.bboxHelper.visible = true;
        this.visibleBBox.visible = true;
      }
    }
    return collision;
  } 
  
  
  stopAnimation(removeVisibleBox = true) {
    if (this.activeTweens) {
      this.activeTweens.forEach(tween => tween.stop());
      this.activeTweens = [];
    }

    if(removeVisibleBox){
      this.visibleBBox.visible = true;
      this.bboxHelper.visible = true;
      this.remove(this.visibleBBox);
      this.remove(this.bboxHelper); 
    }
    this.visibleBBox.updateMatrixWorld(true);
    this.bboxHelper.updateMatrixWorld(true);
      
  }  
  
  update() {
    this.updateMatrixWorld(true);
    this.visibleBBox.userData.obb.copy(this.visibleBBox.geometry.userData.obb)
    this.visibleBBox.userData.obb.applyMatrix4(this.visibleBBox.matrixWorld)
 
  }

}

export { Car_1 }
