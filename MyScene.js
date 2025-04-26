
// Clases de la biblioteca

import * as THREE from './libs/three.module.js'
import * as TWEEN from './libs/tween.esm.js'
import { GUI } from './libs/dat.gui.module.js'
import { TrackballControls } from './libs/TrackballControls.js'
import { DragControls } from './libs/DragControls.js'
import { OBB } from './libs/OBB.js'

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


const CENITAL_HEIGHT = 8000;
const POV_HEIGHT = 240 - 250 / 2;
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

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

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
    
    this.commonBlock = document.getElementById("commonBlock");

    this.slider = document.getElementById("myRange");
    this.slider.oninput = () => this.rotateObjectSelected();

    this.deleteButton = document.getElementById("delete")
    this.deleteButton.onclick = () => this.deleteObjectSelected();

    this.addCopyButton = document.getElementById("copy");
    this.addCopyButton.onclick = () => this.createFrame();
    //Añadir la funcionalidad de on click al botón de copia 

    this.animationBlock = document.getElementById('duration');
    this.durationInput = document.getElementById('durationInput');
    durationInput.addEventListener('input', () => {
      const newDuration = parseInt(durationInput.value, 10);
      this.objectSelected.duration = newDuration;
    });

    this.repetitionsInput = document.getElementById('repetitionsInput');
    this.repetitionsInput.addEventListener('input', () => {
      const newRepetitions = parseInt(durationInput.value, 10);
      this.objectSelected.repetitions = newRepetitions;
    });

    this.loop = document.getElementById('loop');
    this.loop.addEventListener('click', () => {
      this.objectSelected.loop = this.loop.checked;
    });


    this.POV = false;
    this.POVButton = document.getElementById("POV");
    this.POVButton.onclick = () => this.changePOV();


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
      this.incrementX = right.x * normalizedDeltaX + forward.x * normalizedDeltaY;
      this.incrementZ = right.z * normalizedDeltaX + forward.z * normalizedDeltaY;
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
    console.log("DEBUG: Nueva posición tras avanzar y chocar: ", this.POVCamera.position);

    // Retrocede la cámara en la dirección opuesta
    this.POVCamera.position.x = this.previousPosition.x // Retrocede en X
    this.POVCamera.position.z = this.previousPosition.z; // Retrocede en Z

    // Actualiza el OBB después de retroceder
    this.updateCameraOBB();
    console.log("DEBUG: Nueva posición tras retroceder:", this.POVCamera.position);
  }

  updateCameraPosition() {
    this.updateCameraOBB();
    console.log("DEBUG: INIT FUNCTION POSITION ", this.POVCamera.position)

    if (this.checkCameraColission() && this.previousPosition != null) {
      this.goToPreviousPosition();
      this.previousPosition = null;
    }

    if (!this.isDraggingJoystick || this.checkCameraColission()) return;

    // Guarda la posición anterior de la cámara
    this.previousPosition = this.POVCamera.position.clone();

    console.log("DEBUG: actual position ", this.previousPosition);

    var actualIncrementX = this.incrementX;
    var actualIncrementZ = this.incrementZ;

    // Mueve la cámara
    this.POVCamera.position.x += actualIncrementX;
    this.POVCamera.position.z += actualIncrementZ;

    // Actualiza el OBB
    this.updateCameraOBB();

    // Verifica la colisión
    console.log("DEBUG: incremento X ", actualIncrementX)
    console.log("DEBUG: incremento Z ", actualIncrementZ)
    console.log("DEBUG: new position before checking ", this.POVCamera.position);
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

  move(event) {

    // switch(event.key){
    //   case 'w':
    //     this.POVCamera.position.x += 2;
    //     break;
    //   case 's':
    //     this.POVCamera.position.x -=2;
    //     break;
    //   default:
    //       console.log("error");
    // }
  }

  changePOV() {
    if (this.POV) {
      this.POVButton.textContent = "POV"
      this.joystickContainer.style.display = "none";
      this.POVCamera.userData.camera.position.y = CENITAL_HEIGHT;
      this.POVCamera.rotation.x = 0;
      this.POVCamera.rotation.y = 0;
      this.POVCamera.userData.camera.lookAt(this.POVCamera.position.x, 0, this.POVCamera.position.z);
      this.POV = false;
      this.topBar.style.display = "block";

      for (const object of this.pickableObjects) {
        if (typeof object.stopAnimation === 'function') {
          object.stopAnimation();
        }
      }


    } else {

      if (!this.checkCameraColission() && this.objectSelected === null) {
        this.POVButton.textContent = "TOP";
        this.joystickContainer.style.display = "block";
        this.POVCamera.userData.camera.position.y = POV_HEIGHT;
        //this.POVCamera.userData.camera.lookAt(0,0,this.POVCamera.position.z -190)
        this.POV = true;
        this.topBar.style.display = "none";
        for (const object of this.pickableObjects) {


          if (typeof object.animateThroughFrames === 'function') {
            console.log("Funciona")
            object.animateThroughFrames();
          } else {
            console.log("No funciona")

          }
        }
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
    this.remove(this.objectSelected);
    this.objectSelected = null;
    this.configureEditMode();
  }

  rotateObjectSelected() {
    let degrees = parseFloat(this.slider.value); // Valor en grados
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
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000000);
    // También se indica dónde se coloca
    this.camera.position.set(0, CENITAL_HEIGHT, 1);
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
    var POVGeometry = new THREE.BoxGeometry(70, 250, 70);

    POVGeometry.computeBoundingBox()
    var POVMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false, transparent: true, opacity: 0 }); // Material sólido
    this.POVCamera = new THREE.Mesh(POVGeometry, POVMaterial);
    this.POVCamera.position.set(0, 250 / 2 + 2, 0);

    this.POVCamera.geometry.userData.obb = new OBB().fromBox3(
      this.POVCamera.geometry.boundingBox
    )

    this.POVCamera.userData.camera = this.camera;

    this.POVCamera.userData.obb = new OBB()
    this.POVCamera.add(this.camera);

    this.updateCameraOBB();

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
    this.spotLight = new THREE.SpotLight(0xffffff, 1);
    this.spotLight.position.set(0, 40000, 0);
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

      // console.log("EL ARMARIO: ", this.objectSelected)
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

    } else {
      this.POVButton.style.display = 'none';
      this.topBar.style.display = "none";
      // this.slider.style.display = 'block';
      this.slider.value = THREE.MathUtils.radToDeg(this.objectSelected.rotation.y);
      this.loop.checked = this.objectSelected.loop;
      this.repetitionsInput = this.objectSelected.repetitions;

      // this.deleteButton.style.display = 'block';
      this.commonBlock.style.display='flex';

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
    console.log(rect)
    var mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);

    this.raycaster.setFromCamera(mouse, this.getCamera());
    var pickedObjects = this.raycaster.intersectObjects(this.pickableObjects, true);
    console.log(this.pickableObjects)
    if (pickedObjects.length > 0 && !this.POV) {



      var selectedObject = pickedObjects[0].object;

      // Subir en la jerarquía hasta encontrar el objeto padre que sea un Object3D
      while (selectedObject.parent && !(selectedObject.parent instanceof THREE.Scene)) {
        selectedObject = selectedObject.parent;
        console.log(selectedObject)
      }

      if (selectedObject.isObject3D) {
        if (this.objectSelected === null) {
          selectedObject.selectObject(this);
          this.objectSelected = selectedObject;


          // this.camera.position.x = this.objectSelected.position.x;
          // this.camera.position.z = this.objectSelected.position.z;
          // this.camera.lookAt(this.objectSelected.position.x,0,this.objectSelected.position.z)

          this.POVCamera.position.x = this.objectSelected.position.x;
          this.POVCamera.position.z = this.objectSelected.position.z;
          this.POVCamera.userData.camera.lookAt(this.objectSelected.position.x, 0, this.objectSelected.position.z)

          this.configureEditMode();
          console.log("NO HABIA OBJETO SELECCIONADO")

        } else if (this.objectSelected === selectedObject) {
          if (!this.checkColission()) {
            selectedObject.selectObject(this);
            this.objectSelected = null;
            console.log("ELIMINAMOS LA SELECCION DEL OBJETO")
            this.configureEditMode();
          }
        } else if (this.objectSelected.frames && this.objectSelected.frames.includes(selectedObject)) {
          //En caso de que hagamos click sobre una copia
          console.log("SELECCIONAMOS LA COPIA")
        }

      } else {
        console.log("No entro")
      }


    } else {
      console.log("No funciona")
    }
  }

  addObject(objectType) {
    if (this.objectSelected === null) {

      switch (objectType) {
        case "armarioGrafico":
          var armario = new Armario();
          this.add(armario)
          this.pickableObjects.push(armario);

          this.objectSelected = armario;
          armario.selectObject();
          this.configureEditMode();

          break;
        case "building_1":
          console.log("Adding building...");
          var building1 = new Building_1();
          this.add(building1)
          this.pickableObjects.push(building1);
          building1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);

          this.objectSelected = building1;
          building1.selectObject();
          this.configureEditMode();
          break;

        case "building_2":
          console.log("Adding building...");
          var building2 = new Building_2();
          this.add(building2)
          building2.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.pickableObjects.push(building2);

          this.objectSelected = building2;
          building2.selectObject();
          this.configureEditMode();
          break;

        case "building_3":
          console.log("Adding building...");
          var building3 = new Building_3();
          building3.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(building3)
          this.pickableObjects.push(building3);

          this.objectSelected = building3;
          building3.selectObject();
          this.configureEditMode();
          break;

        case "building_4":
          console.log("Adding building...");
          var building4 = new Building_4();
          this.add(building4)
          building4.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.pickableObjects.push(building4);

          this.objectSelected = building4;
          building4.selectObject();
          this.configureEditMode();
          break;

        case "concrete_1":
          console.log("Adding building...");
          var concrete_1 = new Concrete_1();
          this.add(concrete_1)
          this.pickableObjects.push(concrete_1);
          concrete_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);

          this.objectSelected = concrete_1;
          concrete_1.selectObject();
          this.configureEditMode();
          break;

        case "road_1":
          console.log("Adding building...");
          var road_1 = new Road_1();
          this.add(road_1)
          this.pickableObjects.push(road_1);
          road_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);

          this.objectSelected = road_1;
          road_1.selectObject();
          this.configureEditMode();
          break;
        case "road_2":
          console.log("Adding building...");
          var road_2 = new Road_2();
          road_2.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(road_2)
          this.pickableObjects.push(road_2);

          this.objectSelected = road_2;
          road_2.selectObject();
          this.configureEditMode();
          break;

        case "car_1":
          console.log("Adding building...");
          var car_1 = new Car_1();
          car_1.position.set(this.POVCamera.position.x, 0, this.POVCamera.position.z);
          this.add(car_1)
          this.pickableObjects.push(car_1);

          this.objectSelected = car_1;
          car_1.selectObject(this);
          this.configureEditMode();
          break;

        default:
          console.warn("Tipo de objeto no reconocido:", objectType);
          return;
      }


      this.POVCamera.position.x = this.objectSelected.position.x;
      this.POVCamera.position.z = this.objectSelected.position.z;
      this.POVCamera.userData.camera.lookAt(this.objectSelected.position.x, 0, this.objectSelected.position.z);

    }
  }


  checkColission() {
    let colission = false;

    for (let i = 0; i < this.pickableObjects.length && !colission; i++) {

      if (this.objectSelected !== this.pickableObjects[i] && this.objectSelected.visibleBBox.userData.obb.intersectsOBB(this.pickableObjects[i].visibleBBox.userData.obb)) {
        console.log("ESTA CHOCANDO")
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
        console.log("DEBUG: ESTA CHOCANDO")
        colission = true;
      }
    }

    if (!colission) {
      console.log("DEBUG: no está chocando")
    }

    return colission;
  }


  onTouchStart(event) {
    console.log("ENTRO AQUI")
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
      console.log("MOVIENDO CAARA")

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

  onMouseStart(event) {

    this.isDragging = true;
    this.isClick = true;
    const e = this.getNormalizedEvent(event);
    this.previousTouchX = e.clientX;
    this.previousTouchY = e.clientY;

  }

  onMouseMove(event) {
    this.isClick = false;
    const e = this.getNormalizedEvent(event);
   
    if (this.isDragging && !this.POV) {
      const touch = e;
      const deltaX = touch.clientX - this.previousTouchX;
      const deltaY = touch.clientY - this.previousTouchY;

      // Mover la cámara en respuesta al desplazamiento del dedo
      // this.camera.position.z -= deltaY * 0.5; // Ajustar sensibilidad de rotación horizontal
      // this.camera.position.x -= deltaX * 0.5; // Ajustar sensibilidad de rotación vertical

      // Mover la cámara en respuesta al desplazamiento del dedo

      this.POVCamera.position.z -= deltaY * 0.5; // Ajustar sensibilidad de rotación horizontal
      this.POVCamera.position.x -= deltaX * 0.5; // Ajustar sensibilidad de rotación vertical

      if (this.objectSelected != null) {
        this.objectSelected.position.z -= deltaY * 0.5;
        this.objectSelected.position.x -= deltaX * 0.5;
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


    }
  }

  onMouseEnd(event) {
    this.isDragging = false;
  }
}




/// La función   main
$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");
  scene.background = new THREE.Color(0x87CEEB);
  var sceneDiv = document.getElementById("WebGL-output");

  var joystickContainer = document.getElementById("joystick-container")

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());
  sceneDiv.addEventListener("click", (event) => {
    event.preventDefault(); 
    if(scene.isClick){
     scene.pick(event, sceneDiv.getBoundingClientRect());
    }
  },{passive:false});

  // window.addEventListener('joystickMove',(event)=>{scene.moveJoystick(event)});
  sceneDiv.addEventListener('mousedown', (event) => { scene.onMouseStart(event) });
  sceneDiv.addEventListener('mousemove', (event) => { scene.onMouseMove(event) });
  sceneDiv.addEventListener('mouseup', (event) => { scene.onMouseEnd(event) });

  sceneDiv.addEventListener('touchstart', (event) => {
    event.preventDefault(); 
    scene.onMouseStart(event) 
  },{passive:false});
  sceneDiv.addEventListener('touchmove', (event) => {
    event.preventDefault();
    scene.onMouseMove(event) 
  },{passive:false});
  sceneDiv.addEventListener('touchend', (event) => {
    event.preventDefault();
    scene.onMouseEnd(event) 
  },{passive:false});

  joystickContainer.addEventListener('mousedown', (event) => { scene.startDragJoystick(event) });
  document.addEventListener('mousemove', (event) => { scene.moveJoystick(event) });
  document.addEventListener('mouseup', (event) => { scene.stopDragJoystick() });

  // Añadir eventos para táctil (si es necesario)
  joystickContainer.addEventListener('touchstart', (event) => { scene.startDragJoystick(event) });
  document.addEventListener('touchmove', (event) => { scene.moveJoystick(event) });
  document.addEventListener('touchend', (event) => { scene.stopDragJoystick() });
  document.addEventListener('keydown', (event) => { scene.move(event) });




  window.addObject = (objectType) => scene.addObject(objectType)

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
