function add_topic() {
    /* Récupération des données associées au topic de la page actuellement visitée
    puis ajout du topic à la base de données */

    return new Promise(async resolve => {
        let url = document.URL;

        // Extraction du titre du topic
        let url_split = url.split('-');
        url_split[3] = '1';
        url = url_split.join('-').split('#')[0];
        let topic_name_array = url_split.slice(7, url_split.length - 1).concat(url_split[url_split.length - 1].split('.')[0]);
        let topic_name = topic_name_array.join(' ');
        topic_name = topic_name.charAt(0).toUpperCase() + topic_name.slice(1);

        // Extraction du timestamp du dernier message posté sur le topic
        let page_bloc = document.getElementsByClassName('bloc-liste-num-page')[0];
        let n_pages;
        (page_bloc.lastChild.textContent == '»') ? n_pages = page_bloc.lastChild.previousSibling.textContent : n_pages = page_bloc.lastChild.textContent;
        let last_page_document;
        if(n_pages == document.URL.split('-')[3]) {
            last_page_document = document;
        } else {
            url_split[3] = n_pages;
            last_page_document = await get_document(url_split.join('-').split('#')[0]);
        }
        const timestamp_of_last_message = await get_time_of_last_message(last_page_document);

        let refresh_timestamp = Date.now().toString();
        refresh_timestamp = refresh_timestamp.slice(0, refresh_timestamp.length - 3); // On ignore les trois dernières valeurs du timestamp, qui donnent des informations inutilement trop précises

        await add_db(url, topic_name, timestamp_of_last_message, refresh_timestamp);
        await update_interface();

        resolve();
    });
}