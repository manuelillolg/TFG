const joystickContainer = document.getElementById('joystick-container');
const joystick = document.getElementById('joystick');
const coordinateX = document.getElementById('coordinateX');
const coordinateZ = document.getElementById('coordinateZ');

let containerRect = joystickContainer.getBoundingClientRect();
let centerX = containerRect.width / 2;
let centerY = containerRect.height / 2;
let isDragging = false;  // Variable para controlar si el joystick está siendo arrastrado

let moveEvent =  new CustomEvent('joystickMove', {
    detail: {
        coordinateX: coordinateX.value,
        coordinateZ: coordinateZ.value
    }
})


function moveJoystick(event) {
    if (!isDragging) return; // Solo mover si está en modo de arrastre

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - containerRect.left - centerX;
    const deltaY = clientY - containerRect.top - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = containerRect.width / 2 - joystick.offsetWidth / 2;

    if (distance < maxDistance) {
        joystick.style.left = `${centerX + deltaX}px`;
        joystick.style.top = `${centerY + deltaY}px`;
    } else {
        const angle = Math.atan2(deltaY, deltaX);
        joystick.style.left = `${centerX + Math.cos(angle) * maxDistance}px`;
        joystick.style.top = `${centerY + Math.sin(angle) * maxDistance}px`;
    }

    // Mostrar coordenadas normalizadas
    // coordinateX.value = `${(deltaX / maxDistance).toFixed(2)}`
    // coordinateZ.value = `${(deltaY / maxDistance).toFixed(2)}`;

    moveEvent.detail.coordinateX =( deltaX / maxDistance).toFixed(2)
    moveEvent.detail.coordinateZ = (deltaY / maxDistance).toFixed(2)
    window.dispatchEvent(
        moveEvent
    )
}

function startDrag() {
    isDragging = true; // Activar el modo de arrastre
}

function stopDrag() {
    isDragging = false; // Desactivar el modo de arrastre
    resetJoystick(); // Opcional: resetear la posición del joystick al centro
}

function resetJoystick() {
    joystick.style.left = '50%';
    joystick.style.top = '50%';
    coordinateX.value = '0';
    coordinateZ.value = '0';
}

// Añadir eventos para el clic y arrastre
joystickContainer.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', moveJoystick);
document.addEventListener('mouseup', stopDrag);

// Añadir eventos para táctil (si es necesario)
joystickContainer.addEventListener('touchstart', startDrag);
document.addEventListener('touchmove', moveJoystick);
document.addEventListener('touchend', stopDrag);
