function setup_add_remove_button(is_topic_monitored_bool) {
    // Paramètre et affiche le bouton permettant d'ajouer ou de supprimer le topic à la base de données

    let add_remove_button = document.createElement('input');
    add_remove_button.id = 'add_remove_button';
    add_remove_button.type = 'image';
    if (is_topic_monitored_bool) add_remove_button.src = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-remove-button.gif';
    else add_remove_button.src = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-add-button.png';
    add_remove_button.style.width = '15px';
    add_remove_button.style.height = '15px';
    add_remove_button.style.marginLeft = '6px';

    add_remove_button.onclick = async function(){
        this.disabled = true;
        let is_topic_monitored_bool = await is_topic_monitored();
        if (is_topic_monitored_bool){
            add_remove_button.src = 'http://image.noelshack.com/fichiers/2022/28/5/1657905226-remove-button-loading.gif';
            let url_split = document.URL.split('#')[0].split('-');
            url_split[3] = '1';
            await remove_topic(url_split.join('-'));
            add_remove_button.src = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-add-button.png';
        } else {
            add_remove_button.src = 'http://image.noelshack.com/fichiers/2022/28/5/1657905226-add-button-loading.gif';
            await add_topic();
            add_remove_button.src = 'http://image.noelshack.com/fichiers/2022/28/5/1657905477-remove-button.gif';
        }
        this.disabled = false;
    };
    
    document.getElementsByClassName('header__globalUser')[0].appendChild(add_remove_button);
}