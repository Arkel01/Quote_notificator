function get_message_text(message, current_message){
    // Extraie le texte du message à partir de l'objet HTML message

    let current_message_text = '';
    let current_message_nodes = message[current_message].getElementsByClassName('txt-msg')[0].childNodes;
    for (let i = 0; i < current_message_nodes.length; i++) {
        if (current_message_nodes[i].tagName == 'P') current_message_text += current_message_nodes[i].textContent;
    }
    return current_message_text;
}