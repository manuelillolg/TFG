import * as THREE from '../../../libs/three.module.js'
import * as TWEEN from '../../../libs/tween.esm.js'
import { OBB } from '../../../libs/OBB.js'

class Armario extends THREE.Object3D {
  constructor() {
    super();
    const cuerpoArmario = this.createCuerpoArmario();
    this.puertaSuperior = this.createPuertaSuperior();
    this.puertaInferior = this.createPuertaInferior();
    this.add(cuerpoArmario,this.puertaSuperior, this.puertaInferior);
   
    this.cerradoSuperior = true;
    this.cerradoInferior = true;

    
    // const size = new THREE.Vector3();
    // const center = new THREE.Vector3();

    // this.bbox.getSize(size);
    // this.bbox.getCenter(center);

    const geometry = new THREE.BoxGeometry(102.1, 213.6, 44);
    geometry.computeBoundingBox()
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0.5 }); // Material sólido
    this.visibleBBox = new THREE.Mesh(geometry, material);

    this.visibleBBox.geometry.userData.obb = new OBB().fromBox3(
      this.visibleBBox.geometry.boundingBox
    )

    this.visibleBBox.userData.obb = new OBB()

    this.bbox = new THREE.Box3().setFromObject(this.visibleBBox,true);
    this.bboxHelper = new THREE.Box3Helper(this.bbox,0xff0000);
    

    this.name = 'Armario'
    this.objectSelected = false;

    this.update()
    
  }
  
  createCuerpoArmario(){

    var texture = new THREE.TextureLoader().load('./imgs/wood.jpg');
    const cuerpoArmario = new THREE.Object3D();

    //18mm ancho, alto 210cm, largo 44cm
    const tableroLateralGeom = new THREE.BoxGeometry(1.8, 213.6, 44);
    const tableroLateralMat = new THREE.MeshPhongMaterial({map:texture});
    const tablerolateralIzquierdo = new THREE.Mesh(tableroLateralGeom,tableroLateralMat);
    tablerolateralIzquierdo.receiveShadow = true;
    tablerolateralIzquierdo.castShadow = true;

    //0.9 es la mitad de los mm de ancho y 49.25 es la mitad de 98.5(ancho total del armario por dentro)
    tablerolateralIzquierdo.position.set(-0.9-49.25,0,0);

    const tableroLateralDerecho = new THREE.Mesh(tableroLateralGeom,tableroLateralMat);
    tableroLateralDerecho.position.set(0.9+49.25,0,0);
    tableroLateralDerecho.receiveShadow = true;
    tableroLateralDerecho.castShadow = true;


    //Tableros inferior y superior
    const tableroSuperiorGeom = new THREE.BoxGeometry(98.5, 1.8, 44);
    const trableroSuperiorMat = new THREE.MeshPhongMaterial({map:texture});

    const tableroSuperior = new THREE.Mesh(tableroSuperiorGeom,trableroSuperiorMat);
    tableroSuperior.position.set(0,0.9+105,0);
    tableroSuperior.receiveShadow = true;
    tableroSuperior.castShadow = true;

    const tableroInferior = new THREE.Mesh(tableroSuperiorGeom,trableroSuperiorMat);
    tableroInferior.position.set(0,-0.9-105,0);
    tableroInferior.receiveShadow = true;
    tableroInferior.castShadow = true;

    //Pared trasera
    const tablaTraseraGeom = new THREE.BoxGeometry(102.1, 213.6, 1.8);
    const tablaTraseraMat = new THREE.MeshPhongMaterial({map:texture});

    const tablaTrasera = new THREE.Mesh(tablaTraseraGeom,tablaTraseraMat);
    tablaTrasera.position.set(0,0,-0.9-22);
    tablaTrasera.receiveShadow = true;
    tablaTrasera.castShadow = true;

    //Tabla de  abajo
    const tablaInferiorGeom = new THREE.BoxGeometry(98.5, 10, 1.8);
    const tablaInferiorMat = new THREE.MeshPhongMaterial({map:texture});

    const tablaInferior = new THREE.Mesh(tablaInferiorGeom,tablaInferiorMat);
    tablaInferior.position.set(0,5-105,-0.9+22);
    tablaInferior.receiveShadow = true;
    tablaInferior.castShadow = true;

    //Piezas interiores
    const piezaInteriorGeom = new THREE.BoxGeometry(6, 33, 6);   
    piezaInteriorGeom.translate(0,16.5-105,-3+22-1.8);
    const piezaInteriorMat = new THREE.MeshPhongMaterial({map:texture});

    const piezaInteriorI = new THREE.Mesh(piezaInteriorGeom,piezaInteriorMat);
    piezaInteriorI.receiveShadow = true;
    piezaInteriorI.castShadow = true;
    const piezaInteriorD = piezaInteriorI.clone();
    
    piezaInteriorI.position.set(3-49.25,0,0);
    piezaInteriorD.position.set(-3+49.25,0,0);

    


    //Añadir al armario
    cuerpoArmario.add(
        tablerolateralIzquierdo,
        tableroLateralDerecho,
        tableroSuperior, 
        tableroInferior, 
        tablaTrasera,
        tablaInferior,
        piezaInteriorI,
        piezaInteriorD,
    );
    
    return cuerpoArmario;
    
  }

  createPuertaSuperior(){
    var texture = new THREE.TextureLoader().load('./imgs/wood.jpg');
    //Puerta superior
    const puertaSuperiorGeom = new THREE.BoxGeometry(98.5, 66, 1.8);   
    puertaSuperiorGeom.translate(0,-33,-0.9);

    const puertaSuperiorMat = new THREE.MeshPhongMaterial({map:texture});
    const puertaSuperior = new THREE.Mesh(puertaSuperiorGeom,puertaSuperiorMat);
    puertaSuperior.castShadow = true;
    puertaSuperior.receiveShadow = true;

    puertaSuperior.position.set(0,105,22);
    //puertaSuperior.rotateX(-90*(Math.PI/180));
    
    puertaSuperior.userData = this;
    puertaSuperior.name = "puertaSuperior";

    return puertaSuperior;
  }

  createPuertaInferior(){
    var texture = new THREE.TextureLoader().load('./imgs/wood.jpg');
    
    const puertaInferiorArribaGeom = new THREE.BoxGeometry(98.5,111,1.8);
    const puertaInferiorArribaMat = new THREE.MeshPhongMaterial({map:texture});

    const puertaInferiorArriba = new THREE.Mesh(puertaInferiorArribaGeom,puertaInferiorArribaMat);
    puertaInferiorArriba.castShadow = true;
    puertaInferiorArriba.receiveShadow = true;
    puertaInferiorArriba.position.set(0,(111/2)+9,0.9);
    puertaInferiorArriba.userData = this;
    puertaInferiorArriba.name ="puertaInferior";


    const puertaInferiorAbajoGeom = new THREE.BoxGeometry(86.5,23,1.8);
    puertaInferiorAbajoGeom.translate(0,(23/2)-14,0.9);

    const puertaInferiorAbajoMat = new THREE.MeshPhongMaterial({map:texture});
    const puertaInferiorAbajo = new THREE.Mesh(puertaInferiorAbajoGeom,puertaInferiorAbajoMat);
    puertaInferiorAbajo.castShadow = true;
    puertaInferiorAbajo.receiveShadow = true;

    //puertaInferiorAbajo.position.set(0,14-105+10,-0.9-0.9+22);
    

    const puertaInferior = new THREE.Object3D();
    puertaInferior.add(puertaInferiorAbajo);//,puertaInferiorArriba);
    puertaInferior.userData = this;
    puertaInferior.name ="puertaInferior";

    puertaInferiorAbajo.userData =this;
    puertaInferiorAbajo.name ="puertaInferior";

    
    

    puertaInferior.position.set(0,14-105+10,-0.9-0.9+22);
    puertaInferior.add(puertaInferiorArriba);


    return puertaInferior;
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
    //this.bbox.copy(this.bbox).applyMatrix4(this.visibleBBox.matrixWorld) // Crea el Box3 a partir del objeto principal

    // // Elimina el helper anterior si existe y crea uno nuevo
    // if (this.bboxHelper) {
    //     this.bboxHelper.box = this.bbox; // Actualiza el helper si ya existe
    // } else {
    //     this.bboxHelper = new THREE.Box3Helper(this.bbox, 0xff0000);
    //     this.add(this.bboxHelper); // Añade el helper si no existe
    // }

    this.visibleBBox.userData.obb.copy(this.visibleBBox.geometry.userData.obb)
    this.visibleBBox.userData.obb.applyMatrix4(this.visibleBBox.matrixWorld)
}
}

export { Armario }
