function get_db(url) {
    /* Récupère les informations d'un topic sous la forme d'un array clés-valeurs
    /!\ Toujours appeler cette fonction avec await */

    return new Promise(resolve => {
        const request = indexedDB.open('Quote_notificator', 1);
        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction('topic_list', 'readonly');
            const objectStore = transaction.objectStore('topic_list');
            const topic = objectStore.get(url);
            topic.onsuccess = function () {
                resolve(topic.result);
            }
        }
    });
}