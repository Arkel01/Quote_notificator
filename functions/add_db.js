function add_db(url, title, timestamp_of_last_message, refresh_timestamp) {
    /* Ajoute un nouveau topic à la base de données
    /!\ Toujours appeler cette fonction avec await */

    return new Promise(resolve => {
        const request = indexedDB.open('Quote_notificator', 1);
        request.onsuccess = function (event) {
            const db = event.target.result;
            const objectStore = db.transaction('topic_list', 'readwrite').objectStore('topic_list');
            const add_request = objectStore.add({
                url: url,
                title: title,
                notification_counter: 0,
                timestamp_of_last_message: timestamp_of_last_message,
                refresh_timestamp: refresh_timestamp,
                messages_to_ignore: [],
                unanwsered_messages: [],
                last_fully_scraped_page: 0,
                user_messages_text: []
            });
            add_request.onsuccess = function () {
                resolve();
            }
        }
    });
}