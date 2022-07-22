let user = document.getElementsByClassName('headerAccount__pseudo')[0].textContent; // Pseudonyme de l'utilisateur
if(user == 'CONNEXION') {
    alert('Erreur Quote notificator : utilisateur non connecté. Veuillez désactiver le script dans Tampermonkey.');
    return;
}

// Variables globales des URL des icones du script
let is_light_theme_on = document.getElementsByTagName('html')[0].classList == 'theme-light';
document.getElementsByClassName('toggleTheme')[0].addEventListener('click', () => { location.reload(); }); // Rechargement de la page en changeant le thème pour le mettre à jour
let show_button_url, add_button_url, remove_button_url, anwser_button_url, delete_button_url, expand_button_url, collapse_button_url, show_button_loading_url, show_button_notification_blinking_url;
if(is_light_theme_on) {
    show_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142087-show-button.gif';
    add_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142270-add-button.gif';
    remove_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142270-remove-button.gif';
    delete_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142397-delete-button.gif';
    expand_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142605-expand.gif';
    collapse_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142605-collapse.gif';
    anwser_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142397-anwser-button.gif';
    show_button_loading_url = 'http://image.noelshack.com/fichiers/2022/29/5/1658504475-show-button-loading.gif';
    show_button_notification_blinking_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658143189-show-button-notification-blinking.gif';
} else {
    show_button_url = 'http://image.noelshack.com/fichiers/2022/27/5/1657293352-show-button.gif';
    add_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-add-button.png';
    remove_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-remove-button.gif';
    delete_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657217268-delete-button.gif';
    expand_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657219236-expand.gif';
    collapse_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657219236-collapse.gif';
    anwser_button_url = 'http://image.noelshack.com/fichiers/2022/27/5/1657234800-anwser-button.gif';
    show_button_loading_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657904402-show-button-loading.gif';
    show_button_notification_blinking_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657904731-show-button-notification-blinking.gif';
}

let show_button_still_loading_notification_url = 'http://image.noelshack.com/fichiers/2022/28/6/1657978443-show-button-still-loading-notification.gif';
let remove_button_loading_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657905226-remove-button-loading.gif';
let add_button_loading_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657905226-add-button-loading.gif';
let refresh_time_limit_choice_tick_url = 'http://image.noelshack.com/fichiers/2022/28/4/1657755789-tick.png';
let refresh_time_limit_dropdown_image_url = 'http://image.noelshack.com/fichiers/2022/28/4/1657810949-dropdown-arrow.png';
let bug_report_button_url = 'http://image.noelshack.com/fichiers/2022/28/6/1657970358-bug-report-icon.gif';
let refresh_button_url = 'http://image.noelshack.com/fichiers/2022/27/3/1657130400-refresh-2-xxl.png';


await setup_db();
setup_show_button();
await setup_interface();

if (localStorage['Quote_notificator_refresh_at_startup']=='1') refresh();
else update_interface();

if (document.URL.includes('https://www.jeuxvideo.com/forums/42-')) { // Si la page actuelle est celle d'un topic, faire apparaître le bouton d'ajout ou de suppression du topic
    let is_topic_monitored_bool = await is_topic_monitored();
    setup_add_remove_button(is_topic_monitored_bool);
    if (!is_topic_monitored_bool) document.getElementsByClassName('js-post-message')[0].onclick = async function () {
        await add_topic(); // Ajout du topic à la liste des topics à surveiller lorsque l'on poste un message
    }

    // Si localStorage['Quote_notificator_anwser_message'] existe, l'utilisateur a cliqué sur le bouton 'répondre' d'un message dans l'interface du script
    if (localStorage['Quote_notificator_anwser_message'] != undefined) {
        // On clique sur le bouton de citation du message auquel l'utilisateur souhaite répondre pour le diriger vers le formulaire de réponse en bas de page
        document.getElementsByClassName('bloc-message-forum mx-2 mx-lg-0')[localStorage['Quote_notificator_anwser_message']].getElementsByClassName('picto-msg-quote')[0].click();
        localStorage.removeItem('Quote_notificator_anwser_message');
    }
}
