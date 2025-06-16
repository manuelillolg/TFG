
// Clases de la biblioteca

import * as THREE from './libs/three.module.js'
import * as TWEEN from './libs/tween.esm.js'
import { GUI } from './libs/dat.gui.module.js'
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

    this.renderer = this.createRenderer(myCanvas);
    this.renderer.shadowMap.enabled = true;

    this.createLights();
    this.createCamera();

    this.skyBox = new Outside();
    this.add(this.skyBox)

    this.axis = new THREE.AxesHelper(5);
    this.add(this.axis);

    //Manejo de elementos HTML----------

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

    this.animationBlock = document.getElementById('duration');
    this.durationInput = document.getElementById('durationInput');

    durationInput.addEventListener('input', () => {
      const newDuration = parseInt(durationInput.value, 10);
      this.objectSelected.duration = newDuration;
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
      this.proceduralBuildingDiv.style.display = 'none';
      this.step2.style.display ="none";
      this.step1.style.display = "flex";
    })

    this.nextButton = document.getElementById('nextBtn');
    this.nextButton.addEventListener('click',()=>{
      const numPlantas = heightInput.value / 3;

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
   
      var building4 = new Building_4(widthInput.value, heightInput.value, depthInput.value,this.wallDropdown.value) ;
      this.add(building4)
      this.pickableObjects.push(building4);
      building4.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
    

      this.objectSelected = building4;
      building4.selectObject();
      this.configureEditMode();

      for(let dropdown of this.dropdowns){

        building4.createFloor(dropdown.value);
        
        dropdown.value = '-'
      }

      this.proceduralBuildingDiv.style.display = 'none';

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
  
      this.renderer.render(this, this.getCamera());
      const dataURL = this.renderer.domElement.toDataURL("image/png");

      const now = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const filename = `screenshot_${pad(now.getDate())}${pad(now.getMonth()+1)}${now.getFullYear()}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.click(); 
    });

    //Variables para el control del joystick --------------------

    this.joystickContainer = document.getElementById('joystick-container');
    this.joystick = document.getElementById('joystick');
    this.coordinateX = document.getElementById('coordinateX');
    this.coordinateZ = document.getElementById('coordinateZ');

    this.containerRect = this.joystickContainer.getBoundingClientRect();
    this.centerX = this.containerRect.width / 2;
    this.centerY = this.containerRect.height / 2;
    this.isDraggingJoystick = false;  
    this.joystickContainer.style.display = "none"

    this.prevDeltaX = null;
    this.prevDeltaY = null;
    this.incrementX = 0;
    this.incrementZ = 0;

    this.previousPosition = null;


  }

  //Gestiona el movimiento del joystick y determina la velocidad y dirección del movimiento
  moveJoystick(event) {
    if (!this.isDraggingJoystick) return; 

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

      // Normalizar los deltas para obtener la dirección relativa
      const normalizedDeltaX = -deltaX / maxDistance;
      const normalizedDeltaY = -deltaY / maxDistance;

      // Los incrementos se ajustan a la dirección de la cámara/objeto
      this.incrementX = (right.x * normalizedDeltaX + forward.x * normalizedDeltaY)*0.02;
      this.incrementZ = (right.z * normalizedDeltaX + forward.z * normalizedDeltaY)*0.02;
    }
  }

  //En caso de detección de colisión se vuelve a la posición anterior
  goToPreviousPosition() {

    // Retrocede la cámara en la dirección opuesta
    this.POVCamera.position.x = this.previousPosition.x // Retrocede en X
    this.POVCamera.position.z = this.previousPosition.z; // Retrocede en Z

    // Actualiza el OBB después de retroceder
    this.updateCameraOBB();
  }

  //Actualiza la posición de la cámara al mover el joystick
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


  //Método para iniciar el movimiento del joystick
  startDragJoystick(event) {
    this.isDraggingJoystick = true; // Activar el modo de arrastre
    this.moveJoystick(event); // Inicializa el movimiento al comienzo del arrastre
    this.updateCameraPosition()
  }

  //Método para parar el movimiento del joystick
  stopDragJoystick() {
    this.isDraggingJoystick = false; // Desactivar el modo de arrastre
    this.resetJoystick(); // Opcional: resetear la posición del joystick al centro
  }

  //Método para volver el joystick a la posición inicial al soltarlo
  resetJoystick() {
    this.joystick.style.left = '50%';
    this.joystick.style.top = '50%';
    this.incrementX = 0;
    this.incrementZ = 0;
    this.coordinateX.value = '0';
    this.coordinateZ.value = '0';
  }


  //Cambia de perspectiva la cámara 
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
            this.pickableObjects[this.pickableObjects.length -1].position.x,
            0,
            this.pickableObjects[this.pickableObjects.length -1].position.z
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
        
        this.screenshotButton.style.display = "block";
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

  //Actualiza el OBB de la cámara
  updateCameraOBB() {
    this.POVCamera.userData.obb.copy(this.POVCamera.geometry.userData.obb)
    this.POVCamera.userData.obb.applyMatrix4(this.POVCamera.matrixWorld)
  }


  //Elimina el objeto seleccionado
  deleteObjectSelected() {
    let index = this.pickableObjects.indexOf(this.objectSelected);
    this.pickableObjects.splice(index, 1)
    this.objectSelected.selectObject(this);
    this.movingObjects = this.movingObjects.filter(item => item !== this.objectSelected);
    this.remove(this.objectSelected);
    this.objectSelected = null;
    this.configureEditMode();
  }

  //Rota el objeto seleccionado
  rotateObjectSelected(grados) {
    let degrees = parseFloat(grados); // Valor en grados
    let radians = THREE.MathUtils.degToRad(degrees); // Convertir a radianes
    this.objectSelected.rotation.y = radians; // Ajustar la rotación en el eje Y
    this.objectSelected.update()
    this.checkColission()
  }


  //Crea la cámara y lo necesario para que sea visible en vista cenital
  createCamera() {
    
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
  
    this.camera.position.set(0, CENITAL_HEIGHT, 0);
  
    var look = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(look);
   
    this.cameraControl = new DragControls(this.camera, this.renderer.domElement);

    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;

    this.cameraControl.target = look;


    var POVGeometry = new THREE.BoxGeometry(0.7, 2.50, 0.70);

    POVGeometry.computeBoundingBox()
    var POVMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0 });
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


  createLights() {
   
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  
    this.add(ambientLight);

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
    return this.camera;
  }

  setCameraAspect(ratio) {
    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.setCameraAspect(window.innerWidth / window.innerHeight);

    // Y también el tamaño del renderizador
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  //Método encargado de la actualización de la escena
  update() {
    
    this.renderer.render(this, this.getCamera());

    TWEEN.update();

    if (this.objectSelected != null && this.isDragging) {
      this.objectSelected.update()
      this.checkColission()
    }

    requestAnimationFrame(() => this.update())
  }

  //Método encargado de colocar el modo de edición correspondiente 
  configureEditMode() {
    if (this.objectSelected === null) {
      this.POVButton.style.display = 'block';
      this.commonBlock.style.display='none';
      this.animationBlock.style.display = 'none';
      this.topBar.style.display = "block";
      this.POVCamera.add(this.cenitalPointer);

    } else {
      this.translationMode = true;
      this.POVButton.style.display = 'none';
      this.topBar.style.display = "none";
      this.POVCamera.remove(this.cenitalPointer);
      this.loop.checked = this.objectSelected.loop;
      this.repetitionsInput.value = this.objectSelected.repetitions;

      this.commonBlock.style.display='flex';
      this.xInput.value = this.objectSelected.position.x;
      this.zInput.value = this.objectSelected.position.z;

      if (this.objectSelected.name == "car_1") {
        this.animationBlock.style.display = 'flex';
        this.durationInput.value = this.objectSelected.duration;
      }
    }
  }

  //Gestiona la creación de frames 
  createFrame() {
    if (!this.checkColission()) {
      this.objectSelected.addFrame(this);
    }
  }

  //Inicializa los objetos seleccionables como array vacío
  getPickableObjects() {
    const pickableObjects = []
    return pickableObjects;

  }

  //Método encargado de gestionar el click en los objetos
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
            this.objectHovered.selectObject(this);
            selectedObject.selectObject(this);
          }
          this.objectSelected = selectedObject;

          this.POVCamera.position.x = this.objectSelected.position.x;
          this.POVCamera.position.z = this.objectSelected.position.z;
          this.POVCamera.userData.camera.lookAt(this.objectSelected.position.x, 0, this.objectSelected.position.z)

          this.configureEditMode();

        } else if (this.objectSelected === selectedObject) {
      
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

  //Añadir objeto a la escena
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

      if(this.objectHovered != null){
        this.objectHovered.selectObject(this);
        this.objectHovered = null;
      }
    }
  }

  //Método para comprobar si hay colisiones entre el objeto seleccionado y otro de la escena
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


  //Método para comprobar si la cámara colisiona con allgún elemento
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

  //Normaliza el evento de entrada para que se pueda utilizar indistintamente si es una entrada táctil o de ratón
  getNormalizedEvent(event) {
    if (event.touches && event.touches.length > 0) {
      return event.touches[0];
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      return event.changedTouches[0];
    } else {
      return event; // Mouse event normal
    }
  }

  //Gestión del inicio del movimiento el ratón
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

  //Gestión del movimiento del ratón
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
        }
      }

      if(!this.checkCameraColission()){
          this.cenitalPointer.material.color.set(0x00ff00);
      }else{
        this.cenitalPointer.material.color.set(0xff0000);
      }

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
            if(this.objectHovered != null && this.objectHovered !== selectedObject){
              this.objectHovered.selectObject(this);
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

  //Encargado de gestionar las acciones desencadenadas al terminar el movimiento del ratón
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

  //Eventos de movimiento del ratón-----------------------------------------------------------

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
    scene.onMouseEnd(event, rect); 
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


  //Eventos de movimiento del joystick-------------------------------------------------------------
  joystickContainer.addEventListener('mousedown', (event) => { scene.startDragJoystick(event) });
  document.addEventListener('mousemove', (event) => { scene.moveJoystick(event) });
  document.addEventListener('mouseup', (event) => { scene.stopDragJoystick() });


  joystickContainer.addEventListener('touchstart', (event) => { scene.startDragJoystick(event) });
  document.addEventListener('touchmove', (event) => { scene.moveJoystick(event) });
  document.addEventListener('touchend', (event) => { scene.stopDragJoystick() });
 
  //Necesario para el drag and drop
  window.addObject = (objectType) => scene.addObject(objectType)


  scene.update();
});
