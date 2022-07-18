function get_document(url) {
    // Requête xmlhttp qui extraie l'objet Document associé à url
    
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else if (xhr.status == 410) {
                resolve(undefined); // Si topic 410
            }
            else {
                 reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                }); 
            }
        };
        xhr.onerror = function () {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}