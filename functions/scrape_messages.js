function scrape_messages(n_pages, topic_url, last_fully_scraped_page) {
    /* Extraction de tous les messages de toutes les pages d'un topic et mise à jour du
    timestamp du dernier message du topic dans la base de donnée */

    return new Promise(async resolve => {
        let messages = [];
        /* Itération sur chaque page du topic en partant de la première page qui n'a pas encore été totalement extraite depuis
        la dernière mise à jour sans notification */
        for (let current_page_number = last_fully_scraped_page + 1; current_page_number < n_pages + 1; current_page_number++) {
            let url_split = topic_url.split('-');
            url_split[3] = current_page_number.toString();
            let current_page_document = await get_document(url_split.join('-')); // Récupération du document de la nouvelle page à observer
            messages = messages.concat(Array.prototype.slice.call(current_page_document.getElementsByClassName('bloc-message-forum mx-2 mx-lg-0 '), 0));

            if (current_page_number == n_pages) await edit_db(topic_url, 'timestamp_of_last_message', await get_time_of_last_message(current_page_document)); // Mise à jour du timestamp du dernier message
        }
        resolve(messages);
    });
}