let user = document.getElementsByClassName('headerAccount__pseudo')[0].textContent; // Pseudonyme de l'utilisateur
if(user == 'CONNEXION') {
    alert('Erreur Quote notificator : utilisateur non connecté.');
    return;
}

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
