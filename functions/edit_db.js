function edit_db(url, key, value) {
    /* Modifie dans la base de données la donnée key du topic url par la valeur value
    /!\ Toujours appeler cette fonction avec await */

    return new Promise(resolve => {
    const request = indexedDB.open('Quote_notificator', 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction('topic_list', 'readwrite');
        const objectStore = transaction.objectStore('topic_list');
        const topic = objectStore.get(url);
        topic.onsuccess = function () {
            const data = topic.result;
            data[key] = value;
            objectStore.put(data);
            resolve();
        }
    }
    });
}