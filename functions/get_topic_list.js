function get_topic_list(sort_index, get_zero_notification_topics, time_difference_limit_in_sec) {
    /* Renvoie la liste des topics de la base de données, sous forme d'array clés-valeurs
    Les arguments permettent de filtrer les topics à extraire :
    sort_index définit l'ordre d'extraction des topics
    Si get_zero_notification_topics vaut 0, on ne récupère pas les topics sans notification
    time_difference_limit_in_sec définit le nombre maximal de secondes d'écart entre maintenant
    et la dernière heure d'activité du topic pour que celui-ci soit pris en compte*/

    return new Promise(resolve => {
        let current_timestamp = Date.now().toString();
        current_timestamp = current_timestamp.slice(0, current_timestamp.length - 3);
        const request = indexedDB.open('Quote_notificator', 1);
        request.onsuccess = function (event) {
            const db = event.target.result;
            const objectStore = db.transaction(['topic_list'], 'readonly').objectStore('topic_list');
            let index = objectStore.index(sort_index);
            const cursor_request = index.openCursor(null, 'prev'); // 'prev' permet d'extraire les valeurs dans l'ordre croissant selon les valeurs de l'index sort_index
            let topic_list = [];
            cursor_request.onsuccess = function () {
                const cursor = cursor_request.result;
                if (cursor) {
                    if (!get_zero_notification_topics) {
                        if (cursor.value.notification_counter != 0 && current_timestamp - cursor.value.timestamp_of_last_message < time_difference_limit_in_sec) {
                            topic_list.push(cursor.value);
                        } // Les deux if précédents ne peuvent pas être fusionnés sans créer une nouvelle condition
                    } else if (current_timestamp - cursor.value.timestamp_of_last_message < time_difference_limit_in_sec) topic_list.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(topic_list);
                    return;
                }
            }
        }
    });
}