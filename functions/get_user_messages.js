function get_user_messages(messages, user){
    /* Renvoie la liste des objets HTML correspondants aux messages de l'utilisateur
    à partir de la liste des objets HTML de tous les messages du topic */

    let user_messages = [];
    for (let messages_number = 0; messages_number < messages.length; messages_number++) { // Itération sur chaque message de la page
        current_bloc_avatar = messages[messages_number].querySelectorAll('[class$=text-user]')[0]; // Bloc de l'avatar du message observé
        if (current_bloc_avatar != undefined) { // Quand l'auteur du message observé est banni, le bloc avatar associé n'existe pas (current_bloc_avatar == undefined)
            current_author = current_bloc_avatar.innerHTML.substring(29).split('\n')[0]; // Récupération du pseudonyme de l'auteur
            if (current_author == user) user_messages.push(messages[messages_number]);
        }
    }
    return user_messages;
}