function delete_db(url) {
    /* Supprime un topic de la base de données
    /!\ Toujours appeler cette fonction avec await */

    return new Promise(resolve => {
        const request = indexedDB.open('Quote_notificator', 1);
        request.onsuccess = function (event) {
            const db = event.target.result;
            const objectStore = db.transaction('topic_list', 'readwrite').objectStore('topic_list');
            const delete_request = objectStore.delete(url);
            delete_request.onsuccess = function () {
                resolve();
            }
        }
    });
}