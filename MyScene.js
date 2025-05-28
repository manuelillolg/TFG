
// Clases de la biblioteca

import * as THREE from './libs/three.module.js'
import * as TWEEN from './libs/tween.esm.js'
import { GUI } from './libs/dat.gui.module.js'
import { TrackballControls } from './libs/TrackballControls.js'
import { DragControls } from './libs/DragControls.js'
import { OBB } from './libs/OBB.js'
import { closeSidebar, openSidebar } from './scripts/sidebarMenu.js';

// Clases de mi proyecto
import { Armario } from './models/forniture/armarioGrafico/Armario.js'
import { Building_1 } from './models/buildings/building_1/Building_1.js'
import { Building_2 } from './models/buildings/building_2/Building_2.js'
import { Building_3 } from './models/buildings/building_3/Building_3.js'
import { Building_4 } from './models/buildings/building_4/Building_4.js'
import { Outside } from './skyboxes/outside/Outside.js'
import { Concrete_1 } from './models/floor/concrete_1/Concrete_1.js'
import { Road_1 } from './models/floor/road_1/Road_1.js'
import { Road_2 } from './models/floor/road_2/Road_2.js'
import { Car_1 } from './models/cars/car_1/Car_1.js'
import { LivingRoom_1 } from './models/rooms/living_room_1/LivingRoom_1.js'

const CENITAL_HEIGHT = 70;
const POV_HEIGHT = (30)/100;
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  constructor(myCanvas) {
    super();

    this.isClick = true;
    this.isDragging = false;
    this.objectSelected = null;
    this.previousTouchX = 0;
    this.previousTouchY = 0;
    this.translationMode = true;
    this.objectSelectedClicked = false;
    this.objectHovered = null;
    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);
    this.renderer.shadowMap.enabled = true;

    // Se crea la interfaz gráfica de usuario
    // this.gui = this.createGUI ();

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();

    // Un suelo 
    //this.createGround ();
    this.skyBox = new Outside();
    this.add(this.skyBox)


    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper(5);
    this.add(this.axis);


    // Por último creamos el modelo.
    // El modelo puede incluir su parte de la interfaz gráfica de usuario. Le pasamos la referencia a 
    // la gui y el texto bajo el que se agruparán los controles de la interfaz que añada el modelo.
    //this.model = new Armario();
    //this.add ();//this.model);

    this.topBar = document.getElementById("topBar");

    this.raycaster = new THREE.Raycaster();

    this.pickableObjects = this.getPickableObjects();
    this.movingObjects = [];
    
    this.commonBlock = document.getElementById("commonBlock");

    this.deleteButton = document.getElementById("delete")
    this.deleteButton.onclick = () => this.deleteObjectSelected();

    this.addCopyButton = document.getElementById("copy");
    this.addCopyButton.onclick = () => this.createFrame();

    this.removeFramesButton = document.getElementById("removeFrames");
    this.removeFramesButton.onclick = ()=> this.objectSelected.removeFrames(this);

    document.getElementById('openNav').addEventListener('click', openSidebar);
    document.getElementById('closeNav').addEventListener('click', closeSidebar);
    //Añadir la funcionalidad de on click al botón de copia 

    this.animationBlock = document.getElementById('duration');
    this.durationInput = document.getElementById('durationInput');
    durationInput.addEventListener('input', () => {
      const newDuration = parseInt(durationInput.value, 10);
      this.objectSelected.duration = newDuration;
      console.log(this.objectSelected.duration);
    });

    this.repetitionsInput = document.getElementById('repetitionsInput');
    repetitionsInput.addEventListener('input', () => {
      const newRepetitions = parseInt(repetitionsInput.value, 10);
      this.objectSelected.repetitions = newRepetitions;
    });

    this.proceduralBuildingDiv = document.getElementById('modal');
    this.dropdowns = [];
    this.wallDropdown = document.getElementById("wallDropdown")
    this.cancelButton2 = document.getElementById('cancelBtn2');
    this.step1 = document.getElementById('step1');
    this.step2 = document.getElementById('step2');
    const heightInput = document.getElementById("heightInput");
    const widthInput = document.getElementById("widthInput");
    const depthInput = document.getElementById("depthInput");
    const dropdownContainer = document.getElementById("dropdownContainer");
    const wallOptions = `
      <option value="-">-</option>
      <option data-image="./imgs/door.jpg" value="door">Principal Door</option>
      <option data-image="./imgs/window.jpg" value="window">Window</option>
      <option data-image="./imgs/balcony.png" value="balcony">Balcony</option>
    `;
    this.cancelButton2.addEventListener('click',()=>{
      for(let dropdown of this.dropdowns){
        if(dropdown.id != "dropdown1"){
          dropdown.disabled = true;
        }
        dropdown.value = '-'
      }
      this.proceduralBuildingDiv.style.display = 'none';
      this.step2.style.display ="none";
      this.step1.style.display = "flex";
    })
    this.cancelButton = document.getElementById('cancelBtn');
    this.cancelButton.addEventListener('click',()=>{
      //Logica de eliminacion de datos 

      this.proceduralBuildingDiv.style.display = 'none';
      this.step2.style.display ="none";
      this.step1.style.display = "flex";
    })

    this.nextButton = document.getElementById('nextBtn');
    this.nextButton.addEventListener('click',()=>{
      //Logica de guardar los datos
      const numPlantas = heightInput.value / 3;

      // Limpiar por si se regenera
      dropdownContainer.innerHTML = "";

      for (let i = 1; i <= numPlantas; i++) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `
          <p>Planta ${i}</p>
          <select id="dropdown${i}">
            ${wallOptions}
          </select>
        `;
        dropdownContainer.appendChild(wrapper);
      }
      this.dropdowns = Array.from(dropdownContainer.querySelectorAll("select"));
      // Inicializar Select2 en cada uno
      this.dropdowns.forEach(select => {
        $(select).select2({
          templateResult: formatOption,
          templateSelection: formatOption,
          minimumResultsForSearch: -1
        });
      });
      this.step1.style.display ="none";
      this.step2.style.display ="flex";
    })
    this.saveButton = document.getElementById('saveBtn');
    this.saveButton.addEventListener('click',()=>{
      //Aquí se tiene que crear el edificio
      var building4 = new Building_4(widthInput.value, heightInput.value, depthInput.value,this.wallDropdown.value) ;
      this.add(building4)
      this.pickableObjects.push(building4);
      building4.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
    

      this.objectSelected = building4;
      building4.selectObject();
      this.configureEditMode();

      for(let dropdown of this.dropdowns){

        //Aquí se llama al método de crear planta solo si el value es distinto de "-". El resto de opciones serían el nombre de la textura que se pasa por parámetro

        
        building4.createFloor(dropdown.value);
        
        
        dropdown.value = '-'
      }
      this.proceduralBuildingDiv.style.display = 'none';

      //Codigo para centrar la cámara en el edificio etc.
      this.POVCamera.position.x = this.objectSelected.position.x;
      this.POVCamera.position.z = this.objectSelected.position.z;
      this.POVCamera.userData.camera.lookAt(this.objectSelected.position.x, 0, this.objectSelected.position.z);
      
      this.step2.style.display ="none";
      this.step1.style.display = "flex";
    })

    this.xInput = document.getElementById('x');
    this.xInput.addEventListener('input', () => {
      let newX = parseFloat(this.xInput.value);
      if (isNaN(newX)) newX = 0;

      this.objectSelected.position.x = 0; 
      this.POVCamera.position.x = 0; 
      this.POVCamera.position.x = newX;
      this.objectSelected.position.x = newX;
      this.checkColission();
    });

    this.zInput = document.getElementById('z');
    this.zInput.addEventListener('input', () => {
      let newZ = parseFloat(this.zInput.value);
      if (isNaN(newZ)) newZ = 0;
      this.objectSelected.position.z = 0; 
      this.POVCamera.position.z = 0; 
      this.POVCamera.position.z = newZ;
      this.objectSelected.position.z = newZ;
      this.checkColission();
    });

    this.loop = document.getElementById('loop');
    this.loop.addEventListener('click', () => {
      this.objectSelected.loop = this.loop.checked;
    });


    this.POV = false;
    this.POVButton = document.getElementById("POV");
    this.POVButton.onclick = () => this.changePOV();

    this.screenshotButton = document.getElementById("screenshot-btn");
    this.screenshotButton.addEventListener('click', () => {
      // Renderiza la escena por si no está actualizada
      this.renderer.render(this, this.getCamera());

      // Captura del canvas como imagen base64 (PNG)
      const dataURL = this.renderer.domElement.toDataURL("image/png");

      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const filename = `screenshot_${pad(now.getDate())}${pad(now.getMonth()+1)}${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;

      // Crea un enlace para descargar la imagen
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.click(); 
    });
   


    //Variables para el control del joystick 

    this.joystickContainer = document.getElementById('joystick-container');
    this.joystick = document.getElementById('joystick');
    this.coordinateX = document.getElementById('coordinateX');
    this.coordinateZ = document.getElementById('coordinateZ');

    this.containerRect = this.joystickContainer.getBoundingClientRect();
    this.centerX = this.containerRect.width / 2;
    this.centerY = this.containerRect.height / 2;
    this.isDraggingJoystick = false;  // Variable para controlar si el joystick está siendo arrastrado
    this.joystickContainer.style.display = "none"

    this.prevDeltaX = null;
    this.prevDeltaY = null;
    this.incrementX = 0;
    this.incrementZ = 0;

    //Prueba 
    this.previousPosition = null;


  }

  moveJoystick(event) {
    if (!this.isDraggingJoystick) return; // Solo mover si está en modo de arrastre

    var clientX = event.touches ? event.touches[0].clientX : event.clientX;
    var clientY = event.touches ? event.touches[0].clientY : event.clientY;

    var deltaX = clientX - this.containerRect.left - this.centerX;
    var deltaY = clientY - this.containerRect.top - this.centerY;

    if (this.prevDeltaX === null || this.prevDeltaX != deltaX || this.prevDeltaY != deltaY) {
      this.prevDeltaX = deltaX;
      this.prevDeltaY = deltaY;

      var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      var maxDistance = this.containerRect.width / 2 - this.joystick.offsetWidth / 2;

      if (distance < maxDistance) {
        this.joystick.style.left = `${this.centerX + deltaX}px`;
        this.joystick.style.top = `${this.centerY + deltaY}px`;
      } else {
        const angle = Math.atan2(deltaY, deltaX);
        this.joystick.style.left = `${this.centerX + Math.cos(angle) * maxDistance}px`;
        this.joystick.style.top = `${this.centerY + Math.sin(angle) * maxDistance}px`;
      }

      // // Obtener la dirección hacia adelante y hacia la derecha de la cámara
      // const forward = new THREE.Vector3();
      // this.POVCamera.getWorldDirection(forward);

      // // Calcular la dirección derecha como el producto cruzado de "arriba" (eje Y) y "forward"
      // const right = new THREE.Vector3();
      // right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      const forward = new THREE.Vector3();
      forward.x = Math.sin(this.POVCamera.rotation.y); // rotación alrededor del eje Y
      forward.y = 0; // En un plano horizontal
      forward.z = Math.cos(this.POVCamera.rotation.y); // rotación alrededor del eje Y
      forward.normalize();
      forward.negate();

      const right = new THREE.Vector3();
      right.x = Math.cos(this.POVCamera.rotation.y); // rotación alrededor del eje Y
      right.y = 0; // En un plano horizontal
      right.z = -Math.sin(this.POVCamera.rotation.y); // rotación alrededor del eje Y
      right.normalize();
      right.negate();

      // // Calcular los incrementos basados en la rotación de la cámara
      // this.incrementX = right.x * (-deltaX / maxDistance) + forward.x * (-deltaY / maxDistance);
      // this.incrementZ = right.z * (deltaX / maxDistance) + forward.z * (deltaY / maxDistance);


      // Normalizar los deltas para obtener la dirección relativa
      const normalizedDeltaX = -deltaX / maxDistance;
      const normalizedDeltaY = -deltaY / maxDistance;

      // Los incrementos se ajustan a la dirección de la cámara/objeto
      this.incrementX = (right.x * normalizedDeltaX + forward.x * normalizedDeltaY)*0.02;
      this.incrementZ = (right.z * normalizedDeltaX + forward.z * normalizedDeltaY)*0.02;
    }
  }

  roundPosition(pos, decimals = 4) {
    return {
      x: parseFloat(pos.x.toFixed(decimals)),
      y: parseFloat(pos.y.toFixed(decimals)),
      z: parseFloat(pos.z.toFixed(decimals))
    };
  }

  goToPreviousPosition() {

    // Retrocede la cámara en la dirección opuesta
    this.POVCamera.position.x = this.previousPosition.x // Retrocede en X
    this.POVCamera.position.z = this.previousPosition.z; // Retrocede en Z

    // Actualiza el OBB después de retroceder
    this.updateCameraOBB();
  }

  updateCameraPosition() {
    this.updateCameraOBB();

    if (this.checkCameraColission() && this.previousPosition != null) {
      this.goToPreviousPosition();
      this.previousPosition = null;
    }

    if (!this.isDraggingJoystick || this.checkCameraColission()) return;

    // Guarda la posición anterior de la cámara
    this.previousPosition = this.POVCamera.position.clone();

    var actualIncrementX = this.incrementX;
    var actualIncrementZ = this.incrementZ;

    // Mueve la cámara
    this.POVCamera.position.x += actualIncrementX;
    this.POVCamera.position.z += actualIncrementZ;

    // Actualiza el OBB
    this.updateCameraOBB();

    if (this.checkCameraColission()) {

      this.goToPreviousPosiition();
    }

    // Continuar actualizando mientras el joystick esté activo
    requestAnimationFrame(this.updateCameraPosition.bind(this));
  }



  startDragJoystick(event) {
    this.isDraggingJoystick = true; // Activar el modo de arrastre
    this.moveJoystick(event); // Inicializa el movimiento al comienzo del arrastre
    this.updateCameraPosition()
    //requestAnimationFrame(this.updateCameraPosition.bind(this)); // Inicia el ciclo de actualización de la cámara
  }

  stopDragJoystick() {
    this.isDraggingJoystick = false; // Desactivar el modo de arrastre
    this.resetJoystick(); // Opcional: resetear la posición del joystick al centro
  }

  resetJoystick() {
    this.joystick.style.left = '50%';
    this.joystick.style.top = '50%';
    this.incrementX = 0;
    this.incrementZ = 0;
  }


  resetJoystick() {
    this.joystick.style.left = '50%';
    this.joystick.style.top = '50%';
    this.coordinateX.value = '0';
    this.coordinateZ.value = '0';
  }


  changePOV() {
    if (this.POV) {
      this.POVCamera.add(this.cenitalPointer);
      this.POVButton.textContent = "POV"
      this.joystickContainer.style.display = "none";
      this.POVCamera.userData.camera.position.y = CENITAL_HEIGHT;
      this.POVCamera.rotation.x = 0;
      this.POVCamera.rotation.y = 0;
      this.POVCamera.userData.camera.lookAt(this.POVCamera.position.x, 0, this.POVCamera.position.z);
      this.POV = false;
      this.topBar.style.display = "block";
      this.screenshotButton.style.display = "none";
      for(const object of this.movingObjects){
        object.update();
        this.pickableObjects.push(object);
      }

      for (const object of this.pickableObjects) {
        if (typeof object.stopAnimation === 'function') {
          object.stopAnimation();
        }
        if (typeof object.configureCeiling === 'function') {
          // El objeto tiene el método y puedes usarlo
          object.configureCeiling();
        }
      }


    } else {

      if (!this.checkCameraColission() && this.objectSelected === null) {
        this.POVCamera.remove(this.cenitalPointer);
        this.POVButton.textContent = "TOP";
        this.joystickContainer.style.display = "block";
        this.POVCamera.userData.camera.position.y = POV_HEIGHT;
        this.camera.rotation.x += Math.PI/2;

        if(this.pickableObjects.length != 0){
          const target = new THREE.Vector3(
  this.pickableObjects[0].position.x,
  0,
  this.pickableObjects[0].position.z
);

const position = this.POVCamera.position.clone();

// Dirección hacia el objetivo en el plano XZ
const dirToTarget = new THREE.Vector3().subVectors(target, position);
dirToTarget.y = 0;
dirToTarget.normalize();

// Dirección actual del objeto según su rotación Y
const currentY = this.POVCamera.rotation.y;
const currentForward = new THREE.Vector3(-Math.sin(currentY), 0, -Math.cos(currentY));

// Ángulos
const angleToTarget = Math.atan2(dirToTarget.x, dirToTarget.z);
const angleCurrent = Math.atan2(currentForward.x, currentForward.z);

// Diferencia angular
const angleDelta = angleToTarget - angleCurrent;

// Aplicar rotación relativa
this.POVCamera.rotation.y += angleDelta;
        }
        console.log(this.POVCamera)
        this.screenshotButton.style.display = "block";
        //this.POVCamera.userData.camera.lookAt(0,0,this.POVCamera.position.z -190)
        this.POV = true;
        this.topBar.style.display = "none";

        for (const object of this.pickableObjects) {


          if (typeof object.animateThroughFrames === 'function') {
            object.animateThroughFrames(this.pickableObjects);
          } 
          if (typeof object.configureCeiling === 'function') {
            // El objeto tiene el método y puedes usarlo
            object.configureCeiling();
          }
        }

        this.pickableObjects = this.pickableObjects.filter(item => !this.movingObjects.includes(item));
        
      }
    }

    this.updateCameraOBB();
  }

  updateCameraOBB() {
    this.POVCamera.userData.obb.copy(this.POVCamera.geometry.userData.obb)
    this.POVCamera.userData.obb.applyMatrix4(this.POVCamera.matrixWorld)
  }



  deleteObjectSelected() {
    let index = this.pickableObjects.indexOf(this.objectSelected);
    this.pickableObjects.splice(index, 1)
    this.objectSelected.selectObject(this);
    this.movingObjects = this.movingObjects.filter(item => item !== this.objectSelected);
    this.remove(this.objectSelected);
    this.objectSelected = null;
    this.configureEditMode();
  }

  rotateObjectSelected(grados) {
    let degrees = parseFloat(grados); // Valor en grados
    let radians = THREE.MathUtils.degToRad(degrees); // Convertir a radianes
    this.objectSelected.rotation.y = radians; // Ajustar la rotación en el eje Y
    this.objectSelected.update()
    this.checkColission()
  }

  createCamera() {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión vértical en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    // También se indica dónde se coloca
    this.camera.position.set(0, CENITAL_HEIGHT, 0);
    // Y hacia dónde mira
    var look = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(look);
    // this.add (this.camera);

    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    this.cameraControl = new DragControls(this.camera, this.renderer.domElement);


    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;


    //Añadimos una OBB a la cámara para cuando pase a POV 
    var POVGeometry = new THREE.BoxGeometry(0.7, 2.50, 0.70);

    POVGeometry.computeBoundingBox()
    var POVMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0 }); // Material sólido
    this.POVCamera = new THREE.Mesh(POVGeometry, POVMaterial);
    this.POVCamera.position.set(0, 2.50 / 2 + 0.2, 0);

    this.POVCamera.geometry.userData.obb = new OBB().fromBox3(
      this.POVCamera.geometry.boundingBox
    )

    this.POVCamera.userData.camera = this.camera;

    this.POVCamera.userData.obb = new OBB()
    this.POVCamera.add(this.camera);

    this.updateCameraOBB();
    var cenitalPointerGeomatry = new THREE.BoxGeometry(0.7, 1, 0.70);
    var cenitalPointerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false});
    this.cenitalPointer = new THREE.Mesh(cenitalPointerGeomatry, cenitalPointerMaterial);
    this.cenitalPointer.position.set(0,CENITAL_HEIGHT-30,0);
    this.POVCamera.add(this.cenitalPointer);


    this.add(this.POVCamera)
  }

  createGround() {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry(20000, 0.2, 20000);

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('../../../imgs/wood.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    var materialGround = new THREE.MeshPhongMaterial({ map: texture });

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh(geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.1;

    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add(ground);
  }

  createGUI() {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();

    // La escena le va a añadir sus propios controles. 
    // Se definen mediante una   new function()
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      lightIntensity: 0.5,
      axisOnOff: true
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder('Luz y Ejes');

    // Se le añade un control para la intensidad de la luz
    folder.add(this.guiControls, 'lightIntensity', 0, 1, 0.1)
      .name('Intensidad de la Luz : ')
      .onChange((value) => this.setLightIntensity(value));

    // Y otro para mostrar u ocultar los ejes
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes : ')
      .onChange((value) => this.setAxisVisible(value));

    return gui;
  }

  createLights() {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    // La añadimos a la escena
    this.add(ambientLight);

    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight(0xffffff, 0.6);
    this.spotLight.position.set(0, 100, 100);
    this.spotLight.castShadow = true;
    this.add(this.spotLight);
  }

  setLightIntensity(valor) {
    this.spotLight.intensity = valor;
  }

  setAxisVisible(valor) {
    this.axis.visible = valor;
  }

  createRenderer(myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();

    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  getCamera() {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }

  setCameraAspect(ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect(window.innerWidth / window.innerHeight);

    // Y también el tamaño del renderizador
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render(this, this.getCamera());

    // Se actualiza la posición de la cámara según su controlador
    //this.cameraControl.update();

    // Se actualiza el resto del modelo
    //this.model.update();

    TWEEN.update();

    if (this.objectSelected != null && this.isDragging) {
      this.objectSelected.update()
      this.checkColission()

      // this.objectSelected.bbox.copy(this.bboxHelper.geometry).applyMatrix4(this.matrixWorld)
    }

    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
  }

  configureEditMode() {
    if (this.objectSelected === null) {
      this.POVButton.style.display = 'block';
      // this.slider.style.display = 'none';
      // this.deleteButton.style.display = 'none';
      // this.addCopyButton.style.display = 'none';
      this.commonBlock.style.display='none';
      this.animationBlock.style.display = 'none';
      this.topBar.style.display = "block";
      this.POVCamera.add(this.cenitalPointer);

    } else {
      this.translationMode = true;
      this.POVButton.style.display = 'none';
      this.topBar.style.display = "none";
      this.POVCamera.remove(this.cenitalPointer);
      // this.slider.style.display = 'block';
      this.loop.checked = this.objectSelected.loop;
      this.repetitionsInput.value = this.objectSelected.repetitions;

      // this.deleteButton.style.display = 'block';
      this.commonBlock.style.display='flex';
      this.xInput.value = this.objectSelected.position.x;
      this.zInput.value = this.objectSelected.position.z;

      if (this.objectSelected.name == "car_1") {
        // this.addCopyButton.style.display = 'block';
        this.animationBlock.style.display = 'flex';
        this.durationInput.value = this.objectSelected.duration;
      }
    }
  }

  createFrame() {
    if (!this.checkColission()) {
      this.objectSelected.addFrame(this);
    }
  }


  getPickableObjects() {

    // const puertaSuperior = this.model.getObjectByName("puertaSuperior");
    // const puertaInferior = this.model.getObjectByName("puertaInferior");

    // const pickableObjects = [this.model.getObjectByName("Armario")];
    const pickableObjects = []
    return pickableObjects;

  }

  pick(event, rect) {
    
    const e = this.getNormalizedEvent(event);
  
    var mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    
    this.raycaster.setFromCamera(mouse, this.getCamera());
    var pickedObjects = this.raycaster.intersectObjects(this.pickableObjects, true);
    
    if (pickedObjects.length > 0 && !this.POV) {



      var selectedObject = pickedObjects[0].object;

      // Subir en la jerarquía hasta encontrar el objeto padre que sea un Object3D
      while (selectedObject.parent && !(selectedObject.parent instanceof THREE.Scene)) {
        selectedObject = selectedObject.parent;
      }

      if (selectedObject.isObject3D) {
        if (this.objectSelected === null) {
          if(this.objectHovered != selectedObject){
            selectedObject.selectObject(this);
          }
          this.objectSelected = selectedObject;


          // this.camera.position.x = this.objectSelected.position.x;
          // this.camera.position.z = this.objectSelected.position.z;
          // this.camera.lookAt(this.objectSelected.position.x,0,this.objectSelected.position.z)

          this.POVCamera.position.x = this.objectSelected.position.x;
          this.POVCamera.position.z = this.objectSelected.position.z;
          this.POVCamera.userData.camera.lookAt(this.objectSelected.position.x, 0, this.objectSelected.position.z)

          this.configureEditMode();

        } else if (this.objectSelected === selectedObject) {
          // if (!this.checkColission()) {
          //   selectedObject.selectObject(this);
          //   this.objectSelected = null;
          //   this.configureEditMode();
          // }
          if(this.translationMode){
            this.translationMode = false;
            this.renderer.domElement.style.cursor = 'ew-resize';
            
          }else{
            this.translationMode = true;
            this.renderer.domElement.style.cursor = 'move';
        
          }
        } 
      } 

    }else if(pickedObjects.length == 0 && !this.POV){
      if (!this.checkColission()) {
          this.objectSelected.selectObject(this);
          this.objectHovered = null;
          this.objectSelected = null;
          this.configureEditMode();
          this.translationMode = true;
      }
    }
  }

  addObject(objectType) {
    if (this.objectSelected === null) {

      switch (objectType) {
        case "armarioGrafico":
          var armario = new Armario();
          armario.scale.set(0.01,0.01,0.01);
          armario.position.set(0,2.136/2+0.1);
          this.add(armario)
          this.pickableObjects.push(armario);

          this.objectSelected = armario;
          armario.selectObject();
          this.configureEditMode();

          break;
        case "building_1":
          var building1 = new Building_1();
          this.add(building1)
          this.pickableObjects.push(building1);
          building1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);

          this.objectSelected = building1;
          building1.selectObject();
          this.configureEditMode();
          break;

        case "building_2":
          var building2 = new Building_2();
          this.add(building2)
          building2.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.pickableObjects.push(building2);

          this.objectSelected = building2;
          building2.selectObject();
          this.configureEditMode();
          break;

        case "building_3":
          var building3 = new Building_3();
          building3.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(building3)
          this.pickableObjects.push(building3);

          this.objectSelected = building3;
          building3.selectObject();
          this.configureEditMode();
          break;

        case "building_4":
          // var building4 = new Building_4();
          // this.add(building4)
          // building4.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          // this.pickableObjects.push(building4);

          // this.objectSelected = building4;
          // building4.selectObject();
          // this.configureEditMode();
          this.proceduralBuildingDiv.style.display="flex";
        break;

        case "concrete_1":
          var concrete_1 = new Concrete_1();
          this.add(concrete_1)
          this.pickableObjects.push(concrete_1);
          concrete_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);

          this.objectSelected = concrete_1;
          concrete_1.selectObject();
          this.configureEditMode();
          break;

        case "road_1":
          var road_1 = new Road_1();
          this.add(road_1)
          this.pickableObjects.push(road_1);
          road_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);

          this.objectSelected = road_1;
          road_1.selectObject();
          this.configureEditMode();
          break;
        case "road_2":
          var road_2 = new Road_2();
          road_2.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(road_2)
          this.pickableObjects.push(road_2);

          this.objectSelected = road_2;
          road_2.selectObject();
          this.configureEditMode();
          break;

        case "car_1":
          var car_1 = new Car_1();
          car_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(car_1)
          this.pickableObjects.push(car_1);
          this.movingObjects.push(car_1);

          this.objectSelected = car_1;
          car_1.selectObject(this);
          this.configureEditMode();
        break;
        case "living_room_1":
          var living_room_1 = new LivingRoom_1();
          living_room_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(living_room_1)
          this.pickableObjects.push(living_room_1);

          this.objectSelected = living_room_1;
          living_room_1.selectObject(this);
          this.configureEditMode();
        break;

        default:
          console.warn("Tipo de objeto no reconocido:", objectType);
          return;
      }


      if(objectType!= 'building_4'){
        this.POVCamera.position.x = this.objectSelected.position.x;
        this.POVCamera.position.z = this.objectSelected.position.z;
        this.POVCamera.userData.camera.lookAt(this.objectSelected.position.x, 0, this.objectSelected.position.z);
      }
    }
  }


  checkColission() {
    let colission = false;

    for (let i = 0; i < this.pickableObjects.length && !colission; i++) {

      if (this.objectSelected !== this.pickableObjects[i] && this.objectSelected.visibleBBox.userData.obb.intersectsOBB(this.pickableObjects[i].visibleBBox.userData.obb)) {
        colission = true;
      }
    }

    if (colission) {
      this.objectSelected.visibleBBox.material.color.set(0xff0000);
    } else {
      this.objectSelected.visibleBBox.material.color.set(0x00ff00);
    }

    return colission;
  }

  checkCameraColission() {
    this.updateCameraOBB()
    let colission = false;

    for (let i = 0; i < this.pickableObjects.length && !colission; i++) {

      if (this.POVCamera.userData.obb.intersectsOBB(this.pickableObjects[i].visibleBBox.userData.obb)) {
        colission = true;
      }
    }

    return colission;
  }


  onTouchStart(event) {
    if (event.touches.length === 1) { // Solo si es un solo dedo
      this.isDragging = true;
      this.previousTouchX = event.touches[0].clientX;
      this.previousTouchY = event.touches[0].clientY;
    }
  }

  onTouchMove(event) {
    if (this.isDragging && event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.previousTouchX;
      const deltaY = touch.clientY - this.previousTouchY;

      // Mover la cámara en respuesta al desplazamiento del dedo
      // this.camera.rotation.y -= deltaX * 0.005; // Ajustar sensibilidad de rotación horizontal
      // this.camera.rotation.x -= deltaY * 0.005; // Ajustar sensibilidad de rotación vertical

      // this.POVCamera.camera.rotation.y -= deltaX * 0.005; // Ajustar sensibilidad de rotación horizontal
      // this.POVCamera.camera.rotation.x -= deltaY * 0.005; // Ajustar sensibilidad de rotación vertical
      // this.POVCamera.rotation.y -= deltaX * 0.005; // Ajustar sensibilidad de rotación horizontal
      // this.POVCamera.rotation.x -= deltaY * 0.005; // Ajustar sensibilidad de rotación vertical

      this.previousTouchX = touch.clientX;
      this.previousTouchY = touch.clientY;
    }
  }

  onTouchEnd(event) {
    this.isDragging = false;
  }

  getNormalizedEvent(event) {
    if (event.touches && event.touches.length > 0) {
      return event.touches[0];
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      return event.changedTouches[0];
    } else {
      return event; // Mouse event normal
    }
  }

  onMouseStart(event,rect) {

    this.isDragging = true;
    this.isClick = true;
    const e = this.getNormalizedEvent(event);
    this.previousTouchX = e.clientX;
    this.previousTouchY = e.clientY;

    if(this.objectSelected != null){
      var mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(mouse,this.getCamera());
      const intersects = this.raycaster.intersectObject(this.objectSelected, true);
      if (intersects.length > 0) {
        this.objectSelectedClicked = true;
      }
    }

  }

  onMouseMove(event,rect) {
    this.isClick = false;
    const e = this.getNormalizedEvent(event);
   
    if (this.isDragging && !this.POV) {
      const touch = e;
      const deltaX = touch.clientX - this.previousTouchX;
      const deltaY = touch.clientY - this.previousTouchY;
      const centerX = window.innerWidth / 2;
      const deltaCenterX = (touch.clientX - centerX) / centerX;

      // Mover la cámara en respuesta al desplazamiento del dedo
      // this.camera.position.z -= deltaY * 0.5; // Ajustar sensibilidad de rotación horizontal
      // this.camera.position.x -= deltaX * 0.5; // Ajustar sensibilidad de rotación vertical

      // Mover la cámara en respuesta al desplazamiento del dedo
      if(this.objectSelected == null){
        this.POVCamera.position.z -= deltaY * 0.02; // Ajustar sensibilidad de rotación horizontal
        this.POVCamera.position.x -= deltaX * 0.02;
      }

      if(this.translationMode && this.objectSelectedClicked){
        this.POVCamera.position.z += deltaY * 0.02; // Ajustar sensibilidad de rotación horizontal
        this.POVCamera.position.x += deltaX * 0.02; // Ajustar sensibilidad de rotación vertical

        if (this.objectSelected != null) {
          this.objectSelected.position.z += deltaY * 0.02;
          this.objectSelected.position.x += deltaX * 0.02;
          this.xInput.value = this.objectSelected.position.x;
          this.zInput.value = this.objectSelected.position.z;
        }

        
      }else{
        if (this.objectSelected != null && this.objectSelectedClicked) {
          this.rotateObjectSelected(deltaCenterX*180);
          // this.objectSelected.position.z -= deltaY * 0.02;
          // this.objectSelected.position.x -= deltaX * 0.02;
          // this.xInput.value = this.objectSelected.position.x;
          // this.zInput.value = this.objectSelected.position.z;
        }
      }

      if(!this.checkCameraColission()){
          this.cenitalPointer.material.color.set(0x00ff00);
      }else{
        this.cenitalPointer.material.color.set(0xff0000);
      }

      //this.POVCamera.userData.camera.lookAt(new THREE.Vector3(this.POVCamera.userData.camera.position.x, 0, this.POVCamera.userData.camera.position.z));

      this.previousTouchX = touch.clientX;
      this.previousTouchY = touch.clientY;
      this.updateCameraOBB();
    } else if (this.isDragging && this.POV) {
      const touch = e;
      const deltaX = touch.clientX - this.previousTouchX;
      const deltaY = touch.clientY - this.previousTouchY;

      // Cambiar la orientación de la cámara en lugar de su posición
      this.POVCamera.rotation.y -= deltaX * 0.005; // Ajusta la sensibilidad de rotación horizontal
      this.camera.rotation.x -= deltaY * 0.005; // Ajusta la sensibilidad de rotación vertical

      // Limita la rotación vertical para evitar una rotación excesiva
      this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

      this.previousTouchX = touch.clientX;
      this.previousTouchY = touch.clientY;


    }else if(!this.isDragging ){
      var mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      this.raycaster.setFromCamera(mouse,this.getCamera());
      if(this.objectSelected != null)  {
        const intersects = this.raycaster.intersectObject(this.objectSelected, true);
        if (intersects.length > 0) {
          if(this.translationMode){
            this.renderer.domElement.style.cursor = 'move';
          }else{
            this.renderer.domElement.style.cursor = 'ew-resize';
          }
          // Aquí puedes hacer lo que necesites, cambiar cursor, activar modo rotación, etc.
        } else {
          // Ratón fuera del objeto
          this.renderer.domElement.style.cursor = 'default';
        }
      }else{
        const intersects = this.raycaster.intersectObjects(this.pickableObjects, true);
        if(intersects.length>0 && !this.POV){
          this.renderer.domElement.style.cursor = 'pointer';
          //hacer que se muestre el objeto como seleccioando
          var selectedObject = intersects[0].object;

          // Subir en la jerarquía hasta encontrar el objeto padre que sea un Object3D
          while (selectedObject.parent && !(selectedObject.parent instanceof THREE.Scene)) {
            selectedObject = selectedObject.parent;
          }

          if (selectedObject.isObject3D) {
            if(this.objectHovered != null &&this.objectHovered != selectedObject){
              this.objectHovered.objectSelected(this);
              this.objectHovered  =null;
              this.objectHovered = selectedObject;
              this.objectHovered.selectObject(this);
            }
            if(this.objectHovered == null){
              this.objectHovered = selectedObject;
              this.objectHovered.selectObject(this);
            }
          
          
            
          }

        }else{
          this.renderer.domElement.style.cursor = 'default';
          if(this.objectHovered != null){
            this.objectHovered.selectObject(this);
            this.objectHovered = null;
          }

        }

      }
    }
  }

  onMouseEnd(event,rect) {
    
    this.isDragging = false;
    this.objectSelectedClicked = false;
    const e = this.getNormalizedEvent(event);
    if (event.type.startsWith('touch') && this.isClick) {
      this.pick(event,rect)
    }
    var mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(mouse,this.getCamera());
    if(this.objectSelected != null)  {
      const intersects = this.raycaster.intersectObject(this.objectSelected, true);
      if (intersects.length > 0) {
        if(this.translationMode){
          this.renderer.domElement.style.cursor = 'move';
        }else{
          this.renderer.domElement.style.cursor = 'ew-resize';
        }
        // Aquí puedes hacer lo que necesites, cambiar cursor, activar modo rotación, etc.
      } else {
        // Ratón fuera del objeto
        this.renderer.domElement.style.cursor = 'default';
      }
    }
    
  }
}




/// La función   main
$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");
  scene.background = new THREE.Color(0x87CEEB);
  var sceneDiv = document.getElementById("WebGL-output");

  var canvas = scene.renderer.domElement;
  
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    closeSidebar();
  });
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
  
    const modelName = e.dataTransfer.getData('text/plain');
    scene.addObject(modelName);
  });
 

  var joystickContainer = document.getElementById("joystick-container")

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());
  sceneDiv.addEventListener("click", (event) => {
    if(scene.isClick){
     scene.pick(event, sceneDiv.getBoundingClientRect());
    }
  });

  // window.addEventListener('joystickMove',(event)=>{scene.moveJoystick(event)});
  sceneDiv.addEventListener('mousedown', (event) => { 
    const rect = sceneDiv.getBoundingClientRect();
    scene.onMouseStart(event,rect);
   });
  sceneDiv.addEventListener('mousemove', (event) => {
    const rect = sceneDiv.getBoundingClientRect();
     scene.onMouseMove(event,rect)
     });
  
  sceneDiv.addEventListener('mouseup', (event) => {
    const rect = sceneDiv.getBoundingClientRect();
    scene.onMouseEnd(event, rect);  // Pasar rect correctamente a onMouseEnd
  });


  sceneDiv.addEventListener('touchstart', (event) => {
    event.preventDefault(); 
    const rect = sceneDiv.getBoundingClientRect();
    scene.onMouseStart(event,rect) ;
  },{passive:false});
  sceneDiv.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const rect = sceneDiv.getBoundingClientRect();
     scene.onMouseMove(event,rect)
  },{passive:false});
  sceneDiv.addEventListener('touchend', (event) => {
    event.preventDefault();
    scene.onMouseEnd(event,sceneDiv.getBoundingClientRect()) 
  },{passive:false});

  joystickContainer.addEventListener('mousedown', (event) => { scene.startDragJoystick(event) });
  document.addEventListener('mousemove', (event) => { scene.moveJoystick(event) });
  document.addEventListener('mouseup', (event) => { scene.stopDragJoystick() });

  // Añadir eventos para táctil (si es necesario)
  joystickContainer.addEventListener('touchstart', (event) => { scene.startDragJoystick(event) });
  document.addEventListener('touchmove', (event) => { scene.moveJoystick(event) });
  document.addEventListener('touchend', (event) => { scene.stopDragJoystick() });
  //document.addEventListener('keydown', (event) => { scene.move(event) });




  window.addObject = (objectType) => scene.addObject(objectType)

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
