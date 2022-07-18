function get_quoted_message_text(message, current_message){
    // Extraie le texte du message auquel l'objet HTML message répond

    let current_message_anwsered_text = '';
    let current_message_nodes = message[current_message].getElementsByClassName('blockquote-jv')[0].childNodes;
    for (let i = 0; i < current_message_nodes.length; i++) { // Récupération du texte du message que le message observé cite
        if (current_message_nodes[i].tagName == 'P') current_message_anwsered_text += current_message_nodes[i].textContent;
    }
    return current_message_anwsered_text;
}