function update_interface() {
    // Met à jour l'interface à partir de la base de données et selon les paramètres (afficher ou masquer les topics sans notification, et ordre de tri)
    return new Promise(async resolve => {
        while (document.getElementsByClassName('topic_box').length) document.getElementsByClassName('topic_box')[0].remove();
        while (document.getElementsByClassName('unanwsered_message').length) document.getElementsByClassName('unanwsered_message')[0].remove();
        let topic_order = await get_topic_list(localStorage['Quote_notificator_sort_order'], parseInt(localStorage['Quote_notificator_get_zero_notification_topics']), 1e10);
        for (let topic of topic_order) show_topic(topic);
        resolve();
    });
}