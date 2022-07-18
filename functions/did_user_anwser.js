function did_user_anwser(user_messages, current_message_text) {
    // Renvoie un booléen valant true si l'utilisateur a déjà répondu au message current_message_text

    // Itérations sur les messages de l'utilisateur pour vérifier qu'il n'a pas déjà répondu au message current_message_text
    for (current_user_message = 0; current_user_message < user_messages.length; current_user_message++) {
        let user_anwsered_text = '';
        if (user_messages[current_user_message].getElementsByClassName('blockquote-jv').length != 0) { // Si current_user_message contient une citation (i.e répond à quelqu'un)
            user_anwsered_text = get_quoted_message_text(user_messages, current_user_message); // Récupération du texte du message auquel user_messages[current_user_message] répond
            // Si le texte auquel répond user_messages[current_user_message] est current_message_text, l'utilisateur a alors déjà répondu à current_message_text
            if (user_anwsered_text.includes(current_message_text)) return true; 
        }
    }
    return false;
}