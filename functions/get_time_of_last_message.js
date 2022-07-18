function get_time_of_last_message(last_page_document) {
    // Renvoie le timestamp correspondant à l'heure du dernier message du topic

    return new Promise(async resolve => {
        let messages = last_page_document.getElementById('page-messages-forum').getElementsByClassName('bloc-message-forum mx-2 mx-lg-0 ');
        let topic_date = messages[messages.length - 1].getElementsByClassName('bloc-date-msg')[0].children[0].textContent;

        // Conversion de la date du dernier message du topic en objet Date puis en timestamp
        let topic_date_splitted = topic_date.split(' ');
        let french_months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        let english_months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        let date = new Date(english_months[french_months.findIndex(french_months => french_months == topic_date_splitted[1])] + ' ' + topic_date_splitted[0] + ', ' + topic_date_splitted[2] + ' ' + topic_date_splitted[4]);
        let timestamp = (+date).toString();
        timestamp = timestamp.slice(0, timestamp.length - 3); // le timestamp rajoute trois zéros à la fin (millièmes de seconde), cette précision n'est pas nécessaire

        resolve(timestamp);
    });
}