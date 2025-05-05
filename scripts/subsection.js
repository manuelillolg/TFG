function toggleDropdown(menuId) {
    var menu = document.getElementById(menuId);
    if (menu.classList.contains('w3-show')) {
        menu.classList.remove('w3-show');
        menu.classList.add('w3-hide');
    } else {
        menu.classList.remove('w3-hide');
        menu.classList.add('w3-show');
    }
}