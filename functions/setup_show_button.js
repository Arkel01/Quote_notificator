function setup_show_button(){
    // Mise en place du bouton permettant d'afficher l'interface

    let show_button = document.createElement('input');
    show_button.type = 'image';
    show_button.src = show_button_url;
    show_button.id = 'show_button';
    show_button.style.width = '20px';
    show_button.style.height = '20px';

    show_button.onclick = function () {
        this.disabled = true;
        show();
        this.disabled = false;
    }
    
    document.getElementsByClassName('header__globalUser')[0].appendChild(show_button);
}