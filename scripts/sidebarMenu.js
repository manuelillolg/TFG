var localhost;//"192.168.1.141" //// 
const debug = true;

if (debug) {
  localhost = "localhost";
} else {
  localhost = "192.168.1.46";
}

export function openSidebar() {
  loadCategories();
  document.getElementById("main").style.marginLeft = "25%";
  document.getElementById("mySidebar").style.width = "25%";
  document.getElementById("mySidebar").style.display = "block";
  document.getElementById("openNav").style.display = 'none';
  document.getElementById("POV").style.display = 'none';
}

export function closeSidebar() {
  document.getElementById("main").style.marginLeft = "0%";
  document.getElementById("mySidebar").style.display = "none";
  document.getElementById("openNav").style.display = "inline-block";
  document.getElementById("POV").style.display = 'block';
}

function loadCategories() {
  fetch(`http://${localhost}:3000/getCategories`)
    .then(response => response.json())
    .then(data => {
      const menuContainer = document.getElementById('menuCategories');
      menuContainer.innerHTML = '';

      data.categories.forEach((category, index) => {
        // Título de categoría como texto con fondo gris claro
        const categoryLabel = document.createElement('div');
        categoryLabel.textContent = category;
        categoryLabel.style.backgroundColor = '#f0f0f0';
        categoryLabel.style.padding = '8px';
        categoryLabel.style.fontWeight = 'bold';
        menuContainer.appendChild(categoryLabel);

        // Contenedor de subdirectorios (siempre visible)
        const menu = document.createElement('div');
        menu.id = `menu${index + 1}`;
        menu.classList.add('w3-bar-block');
        menuContainer.appendChild(menu);

        // Cargar los subdirectorios directamente
        fetch(`http://${localhost}:3000/getSubdirectories/${category}`)
          .then(response => response.json())
          .then(data => {
            data.subdirectories.forEach(subdir => {
              const option = document.createElement('a');
              option.href = "#";
              option.classList.add('w3-bar-item', 'w3-button');
              option.style.display = 'flex';
              option.style.justifyContent = 'center';
              option.style.alignItems = 'center';

              const img = document.createElement('img');
              img.src = `./previews/${category}/${subdir}.png`;
              img.alt = subdir;
              img.style.width = '30%';
              img.style.height = 'auto'; // Mantiene proporción
              option.appendChild(img);

              option.onclick = () => {
                const url = `http://${localhost}:8080/models/${category}/${subdir}`;
                window.open(url, 'popupWindow', 'width=800,height=600,scrollbars=yes,resizable=yes');
              };

              option.setAttribute('draggable', 'true');
              option.dataset.model = subdir;

              option.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', subdir);
              });

              menu.appendChild(option);
            });
          })
          .catch(error => {
            console.error(`Error al obtener subdirectorios de ${category}:`, error);
          });
      });
    })
    .catch(error => {
      console.error('Error al obtener las categorías:', error);
    });
}


// Función para mostrar/ocultar el menú y cargar subdirectorios
function toggleDropdown(menuId, category) {
  const menu = document.getElementById(menuId);
  
  // Si el menú está oculto, lo mostramos y cargamos su contenido
  if (menu.classList.contains('w3-hide')) {
      // Mostrar el menú
      menu.classList.remove('w3-hide');

      // Limpiamos el menú antes de llenarlo con subdirectorios
      menu.innerHTML = '';

      // Realizar una solicitud para obtener los subdirectorios de la categoría
      fetch(`http://${localhost}:3000/getSubdirectories/${category}`)
          .then(response => response.json())
          .then(data => {
              // Iterar sobre los subdirectorios y añadir enlaces al menú
              data.subdirectories.forEach(subdir => {
                  const option = document.createElement('a');
                  option.href = "#";
                  option.classList.add('w3-bar-item', 'w3-button');
                  // Crear un elemento <img> para la imagen
                  const img = document.createElement('img');
                  img.src = `./previews/${category}/${subdir}.png`;  
                  img.alt = subdir; 
                  img.style.width = '30%';  
                  img.style.height = 'auto'; 

                  // Añadir la imagen al enlace
                  option.appendChild(img);

                  // Establecer un manejador de clics para abrir una nueva ventana con la ruta
                  option.onclick = () => {
                    const url = `http://${localhost}:8080/models/${category}/${subdir}`;
                    window.open(url, 'popupWindow', 'width=800,height=600,scrollbars=yes,resizable=yes'); // Abre en una ventana emergente
                  };

                  option.setAttribute('draggable', 'true');
                  option.dataset.model = subdir;

                  option.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', subdir);
                  });


                  menu.appendChild(option);
              });
          })
          .catch(error => {
              console.error(`Error al obtener subdirectorios de ${category}:`, error);
          });
  } else {
      // Si ya está visible, lo ocultamos
      menu.classList.add('w3-hide');
  }
}