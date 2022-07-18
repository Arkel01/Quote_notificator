function setup_db() {
    // Initialise la base de données

    return new Promise(resolve => {
        const request = indexedDB.open('Quote_notificator', 1);
        request.onerror = function () {
            alert('Erreur Quote notificator : IndexedDB n\'est pas supporté sur ce navigateur. Le script ne peut fonctionner.');
        };

        request.onupgradeneeded = function (event) { // Si la base de donnée n'existe pas
            const db = event.target.result;
            const objectStore = db.createObjectStore('topic_list', { keyPath: 'url' });
            objectStore.createIndex('title', 'title', { unique: false });
            objectStore.createIndex('notification_counter', 'notification_counter', { unique: false });
            objectStore.createIndex('timestamp_of_last_message', 'timestamp_of_last_message', { unique: false });
            objectStore.createIndex('messages_to_ignore', 'messages_to_ignore', { unique: false });
            objectStore.createIndex('unanwsered_messages', 'unanwsered_messages', { unique: false });
            objectStore.createIndex('refresh_timestamp', 'refresh_timestamp', { unique: false });
            objectStore.createIndex('last_fully_scraped_page', 'last_fully_scraped_page', { unique: false });
            objectStore.createIndex('user_messages_text', 'user_messages_text', { unique: false });

            // Paramètres par défaut
            localStorage.setItem('Quote_notificator_sort_order','notification_counter');
            localStorage.setItem('Quote_notificator_get_zero_notification_topics', '1');
            localStorage.setItem('Quote_notificator_refresh_at_startup', '1');
            localStorage.setItem('Quote_notificator_refresh_time_limit', '10000000000');
        }
        resolve();
    });
}