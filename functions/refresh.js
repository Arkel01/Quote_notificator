function refresh() {
    /* Met à jour la base de donnée en fonction de la date limite de mise
    à jour stockée dans localStorage, puis mise à jour de l'interface */

    return new Promise(async resolve => {
        document.getElementById('show_button').src = 'http://image.noelshack.com/fichiers/2022/28/5/1657904402-show-button-loading.gif';
        document.getElementById('header').style.opacity = 0; // Opacité du header nulle pour initialiser la progressbar de mise à jour des topics

        // Suppression des topics et des messages dans l'interface
        while (document.getElementsByClassName('topic_box').length) document.getElementsByClassName('topic_box')[0].remove();
        while (document.getElementsByClassName('unanwsered_message').length) document.getElementsByClassName('unanwsered_message')[0].remove();

        /* Récupération de la liste des topics à mettre à jour (en partant du plus récemment actif, en prenant les topics 
        n'ayant aucune notification et selon la date limite de mise à jour choisit par l'utilisateur) */
        let topic_list = await get_topic_list('timestamp_of_last_message', true, parseInt(localStorage['Quote_notificator_refresh_time_limit']));

        update_topic_promises_array = [];
        for (let topic of topic_list) {
            /* localStorage['Quote_notificator_next_header_section'] permet de servir de variable globale pour que la progressbar
            se remplisse dans l'ordre, car les mises à jour des topics ne se terminent pas nécessairement dans le même sens que leur appel */
            localStorage.setItem('Quote_notificator_next_header_section', 1);
            /* Mise à jour de chaque topic. Tous les topics se mettent à jour simultanément. Récupération de toutes les promesses
            de mise à jour des topics, pour savoir quand toutes les mises à jour sont terminées */
            update_topic_promises_array.push(update_topic(topic, topic_list.length));
        }

        Promise.all(update_topic_promises_array).then(async () => { // Quand tous les topics ont été mis à jour

            // Suppression de la progressbar
            let progressbar_header_sections_number = document.getElementsByClassName('progressbar_section').length;
            for (let k = 0; k < progressbar_header_sections_number; k++) document.getElementsByClassName('progressbar_section')[0].remove();

            await update_interface();
            document.getElementById('header').style.opacity = 100;

            let show_button = document.getElementById('show_button');
            if (show_button.src == 'http://image.noelshack.com/fichiers/2022/28/6/1657978443-show-button-still-loading-notification.gif') {
                show_button.src = 'http://image.noelshack.com/fichiers/2022/28/5/1657904731-show-button-notification-blinking.gif'; // Si au moins une notification, changement d'icone
            } else show_button.src = 'http://image.noelshack.com/fichiers/2022/27/5/1657293352-show-button.gif';

            resolve();
        });
    });
}