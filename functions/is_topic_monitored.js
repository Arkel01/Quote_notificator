function is_topic_monitored(){
    /* Renvoie un booléen valant true si le topic est
    déjà dans la base de données */
    
    return new Promise((resolve) => {
        const request = indexedDB.open('Quote_notificator', 1);
        request.onsuccess = function (event) {
            const db = event.target.result;
            const objectStore = db.transaction(['topic_list'], 'readonly').objectStore('topic_list');
            let url_split = document.URL.split('-');
            url_split[3] = '1';
            let get_request = objectStore.get(url_split.join('-').split('#')[0]);
            get_request.onsuccess = function () {
                get_request.result == undefined ? resolve(false) : resolve(true);
            }
        }
    });
}
