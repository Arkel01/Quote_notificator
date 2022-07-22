// ==UserScript==
// @name         Quote notificator
// @namespace    Quote_notificator
// @version      1.1.1
// @description  Notifie l'utilisateur lorsque quelqu'un lui répond sur les forums de jeuxvideo.com. Github : https://github.com/Arkel01/Quote_notificator
// @author       Arkel01
// @downloadURL  https://github.com/Arkel01/Quote_notificator/raw/main/Quote_notificator.user.js
// @updateURL    https://github.com/Arkel01/Quote_notificator/raw/main/Quote_notificator.user.js
// @license      MIT
// @match        https://www.jeuxvideo.com/forums/42-*
// @match        https://www.jeuxvideo.com/forums/0-*
// @icon         http://image.noelshack.com/fichiers/2022/28/7/1658094775-quote-notificator-logo.gif
// ==/UserScript==  
 
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
 
function add_topic() {
    /* Récupération des données associées au topic de la page actuellement visitée
    puis ajout du topic à la base de données */

    return new Promise(async resolve => {
        let url = document.URL;

        // Extraction du titre du topic
        let url_split = url.split('-');
        url_split[3] = '1';
        url = url_split.join('-').split('#')[0];
        let topic_name_array = url_split.slice(7, url_split.length - 1).concat(url_split[url_split.length - 1].split('.')[0]);
        let topic_name = topic_name_array.join(' ');
        topic_name = topic_name.charAt(0).toUpperCase() + topic_name.slice(1);

        // Extraction du timestamp du dernier message posté sur le topic
        let page_bloc = document.getElementsByClassName('bloc-liste-num-page')[0];
        let n_pages;
        (page_bloc.lastChild.textContent == '»') ? n_pages = page_bloc.lastChild.previousSibling.textContent : n_pages = page_bloc.lastChild.textContent;
        let last_page_document;
        if(n_pages == document.URL.split('-')[3]) {
            last_page_document = document;
        } else {
            url_split[3] = n_pages;
            last_page_document = await get_document(url_split.join('-').split('#')[0]);
        }
        const timestamp_of_last_message = await get_time_of_last_message(last_page_document);

        let refresh_timestamp = Date.now().toString();
        refresh_timestamp = refresh_timestamp.slice(0, refresh_timestamp.length - 3); // On ignore les trois dernières valeurs du timestamp, qui donnent des informations inutilement trop précises

        await add_db(url, topic_name, timestamp_of_last_message, refresh_timestamp);
        await update_interface();

        resolve();
    });
}  
 
function close() {
    // Ferme l'interface générale du script
    document.getElementById('alert_modal1').style.display = 'none';
    document.getElementById('block3').style.display = 'none';

    // Déverouillage de la scrollbar du topic
    const body = document.getElementsByTagName('body')[0];
    body.style.removeProperty('position');
    body.style.removeProperty('width');
    body.style.removeProperty('overflowY');
}  
 
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
 
function did_user_anwser(user_messages, current_message_text) {
    // Renvoie un booléen valant true si l'utilisateur a déjà répondu au message current_message_text

    // Itérations sur les messages de l'utilisateur pour vérifier qu'il n'a pas déjà répondu au message current_message_text
    for (current_user_message = 0; current_user_message < user_messages.length; current_user_message++) {
        let user_anwsered_text = '';
        if (user_messages[current_user_message].getElementsByClassName('blockquote-jv').length != 0) { // Si current_user_message contient une citation (i.e répond à quelqu'un)
            user_anwsered_text = get_quoted_message_text(user_messages, current_user_message); // Récupération du texte du message auquel user_messages[current_user_message] répond
            // Si le texte auquel répond user_messages[current_user_message] est current_message_text, l'utilisateur a alors déjà répondu à current_message_text
            if (user_anwsered_text.includes(current_message_text)) return true; 
        }
    }
    return false;
}  
 
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
 
function get_message_text(message, current_message){
    // Extraie le texte du message à partir de l'objet HTML message

    let current_message_text = '';
    let current_message_nodes = message[current_message].getElementsByClassName('txt-msg')[0].childNodes;
    for (let i = 0; i < current_message_nodes.length; i++) {
        if (current_message_nodes[i].tagName == 'P') current_message_text += current_message_nodes[i].textContent;
    }
    return current_message_text;
}  
 
function get_quoted_message_text(message, current_message){
    // Extraie le texte du message auquel l'objet HTML message répond

    let current_message_anwsered_text = '';
    let current_message_nodes = message[current_message].getElementsByClassName('blockquote-jv')[0].childNodes;
    for (let i = 0; i < current_message_nodes.length; i++) { // Récupération du texte du message que le message observé cite
        if (current_message_nodes[i].tagName == 'P') current_message_anwsered_text += current_message_nodes[i].textContent;
    }
    return current_message_anwsered_text;
}  
 
function get_time_difference(previous) {
    /* Renvoie une chaîne de caractères indiquant le temps
    approximativement écoulé entre le timestamp previous et maintenant */

    const neglectable_time = 15;
    const sec_per_minute = 60;
    const sec_per_hour = sec_per_minute * 60;
    const sec_per_day = sec_per_hour * 24;
    const sec_per_month = sec_per_day * 30;
    const sec_per_year = sec_per_day * 365;

    let current = Date.now().toString();
    current = current.slice(0, current.length - 3);
    const elapsed = current - previous; // Nombre de secondes de différence

    if (elapsed < neglectable_time) return 'à l\'instant';

    else if (elapsed < sec_per_minute) {
        let str = 'il y a ' + elapsed + ' secondes';
        return elapsed == 1 ? str.slice(0, -1) : str;
    }

    else if (elapsed < sec_per_hour) {
        let elapsed_converted = Math.round(elapsed / sec_per_minute);
        let str = 'il y a ' + elapsed_converted + ' minutes';
        return elapsed_converted == 1 ? str.slice(0,-1) : str;
    }

    else if (elapsed < sec_per_day) {
        let elapsed_converted = Math.round(elapsed / sec_per_hour);
        let str = 'il y a ' + elapsed_converted + ' heures';
        return elapsed_converted == 1 ? str.slice(0, -1) : str;
    }

    else if (elapsed < sec_per_month) {
        let elapsed_converted = Math.round(elapsed / sec_per_day);
        let str = 'il y a ' + elapsed_converted + ' jours';
        return elapsed_converted == 1 ? str.slice(0, -1) + 'née' : str;
    }

    else if (elapsed < sec_per_year) {
        let elapsed_converted = Math.round(elapsed / sec_per_month);
        let str = 'il y a ' + elapsed_converted + ' mois';
        return str;
    }

    else {
        return 'il y a plus d\'un an';
    }

}  
 
function get_time_of_last_message(last_page_document) {
    // Renvoie le timestamp correspondant à l'heure du dernier message du topic

    return new Promise(async resolve => {
        let messages = last_page_document.getElementById('page-messages-forum').getElementsByClassName('bloc-message-forum mx-2 mx-lg-0 ');
        let topic_date = messages[messages.length - 1].getElementsByClassName('bloc-date-msg')[0].children[0].textContent;

        // Conversion de la date du dernier message du topic en objet Date puis en timestamp
        let topic_date_splitted = topic_date.split(' ');
        let french_months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        let english_months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        let date = new Date(english_months[french_months.findIndex(french_months => french_months == topic_date_splitted[1])] + ' ' + topic_date_splitted[0] + ', ' + topic_date_splitted[2] + ' ' + topic_date_splitted[4]);
        let timestamp = (+date).toString();
        timestamp = timestamp.slice(0, timestamp.length - 3); // le timestamp rajoute trois zéros à la fin (millièmes de seconde), cette précision n'est pas nécessaire

        resolve(timestamp);
    });
}  
 
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
 
function get_user_messages(messages, user){
    /* Renvoie la liste des objets HTML correspondants aux messages de l'utilisateur
    à partir de la liste des objets HTML de tous les messages du topic */

    let user_messages = [];
    for (let messages_number = 0; messages_number < messages.length; messages_number++) { // Itération sur chaque message de la page
        current_bloc_avatar = messages[messages_number].querySelectorAll('[class$=text-user]')[0]; // Bloc de l'avatar du message observé
        if (current_bloc_avatar != undefined) { // Quand l'auteur du message observé est banni, le bloc avatar associé n'existe pas (current_bloc_avatar == undefined)
            current_author = current_bloc_avatar.innerHTML.substring(29).split('\n')[0]; // Récupération du pseudonyme de l'auteur
            if (current_author == user) user_messages.push(messages[messages_number]);
        }
    }
    return user_messages;
}  
 
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
  
 
let user = document.getElementsByClassName('headerAccount__pseudo')[0].textContent; // Pseudonyme de l'utilisateur
if(user == 'CONNEXION') {
    alert('Erreur Quote notificator : utilisateur non connecté. Veuillez désactiver le script dans Tampermonkey.');
    return;
}

// Variables globales des URL des icones du script
let is_light_theme_on = document.getElementsByTagName('html')[0].classList == 'theme-light';
document.getElementsByClassName('toggleTheme')[0].addEventListener('click', () => { location.reload(); }); // Rechargement de la page en changeant le thème pour le mettre à jour
let show_button_url, add_button_url, remove_button_url, anwser_button_url, delete_button_url, expand_button_url, collapse_button_url, show_button_loading_url, show_button_notification_blinking_url;
if(is_light_theme_on) {
    show_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142087-show-button.gif';
    add_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142270-add-button.gif';
    remove_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142270-remove-button.gif';
    delete_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142397-delete-button.gif';
    expand_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142605-expand.gif';
    collapse_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142605-collapse.gif';
    anwser_button_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658142397-anwser-button.gif';
    show_button_loading_url = 'http://image.noelshack.com/fichiers/2022/29/5/1658504475-show-button-loading.gif';
    show_button_notification_blinking_url = 'http://image.noelshack.com/fichiers/2022/29/1/1658143189-show-button-notification-blinking.gif';
} else {
    show_button_url = 'http://image.noelshack.com/fichiers/2022/27/5/1657293352-show-button.gif';
    add_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-add-button.png';
    remove_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657222295-remove-button.gif';
    delete_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657217268-delete-button.gif';
    expand_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657219236-expand.gif';
    collapse_button_url = 'http://image.noelshack.com/fichiers/2022/27/4/1657219236-collapse.gif';
    anwser_button_url = 'http://image.noelshack.com/fichiers/2022/27/5/1657234800-anwser-button.gif';
    show_button_loading_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657904402-show-button-loading.gif';
    show_button_notification_blinking_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657904731-show-button-notification-blinking.gif';
}

let show_button_still_loading_notification_url = 'http://image.noelshack.com/fichiers/2022/28/6/1657978443-show-button-still-loading-notification.gif';
let remove_button_loading_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657905226-remove-button-loading.gif';
let add_button_loading_url = 'http://image.noelshack.com/fichiers/2022/28/5/1657905226-add-button-loading.gif';
let refresh_time_limit_choice_tick_url = 'http://image.noelshack.com/fichiers/2022/28/4/1657755789-tick.png';
let refresh_time_limit_dropdown_image_url = 'http://image.noelshack.com/fichiers/2022/28/4/1657810949-dropdown-arrow.png';
let bug_report_button_url = 'http://image.noelshack.com/fichiers/2022/28/6/1657970358-bug-report-icon.gif';
let refresh_button_url = 'http://image.noelshack.com/fichiers/2022/27/3/1657130400-refresh-2-xxl.png';


await setup_db();
setup_show_button();
await setup_interface();

if (localStorage['Quote_notificator_refresh_at_startup']=='1') refresh();
else update_interface();

if (document.URL.includes('https://www.jeuxvideo.com/forums/42-')) { // Si la page actuelle est celle d'un topic, faire apparaître le bouton d'ajout ou de suppression du topic
    let is_topic_monitored_bool = await is_topic_monitored();
    setup_add_remove_button(is_topic_monitored_bool);
    if (!is_topic_monitored_bool) document.getElementsByClassName('js-post-message')[0].onclick = async function () {
        await add_topic(); // Ajout du topic à la liste des topics à surveiller lorsque l'on poste un message
    }

    // Si localStorage['Quote_notificator_anwser_message'] existe, l'utilisateur a cliqué sur le bouton 'répondre' d'un message dans l'interface du script
    if (localStorage['Quote_notificator_anwser_message'] != undefined) {
        // On clique sur le bouton de citation du message auquel l'utilisateur souhaite répondre pour le diriger vers le formulaire de réponse en bas de page
        document.getElementsByClassName('bloc-message-forum mx-2 mx-lg-0')[localStorage['Quote_notificator_anwser_message']].getElementsByClassName('picto-msg-quote')[0].click();
        localStorage.removeItem('Quote_notificator_anwser_message');
    }
}
  
 
function refresh() {
    /* Met à jour la base de donnée en fonction de la date limite de mise
    à jour stockée dans localStorage, puis mise à jour de l'interface */

    return new Promise(async resolve => {
        document.getElementById('show_button').src = show_button_loading_url;
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
            if (show_button.src == show_button_still_loading_notification_url) {
                show_button.src = show_button_notification_blinking_url; // Si au moins une notification, changement d'icone
            } else show_button.src = show_button_url;

            resolve();
        });
    });
}  
 
function remove_topic(url) {
    // Supprime le topic url de la base de données
    
    return new Promise(async resolve => {
        await delete_db(url);
        await update_interface();
        resolve();
    });
}  
 
function scrape_messages(n_pages, topic_url, last_fully_scraped_page) {
    /* Extraction de tous les messages de toutes les pages d'un topic et mise à jour du
    timestamp du dernier message du topic dans la base de donnée */

    return new Promise(async resolve => {
        let messages = [];
        /* Itération sur chaque page du topic en partant de la première page qui n'a pas encore été totalement extraite depuis
        la dernière mise à jour sans notification */
        for (let current_page_number = last_fully_scraped_page + 1; current_page_number < n_pages + 1; current_page_number++) {
            let url_split = topic_url.split('-');
            url_split[3] = current_page_number.toString();
            let current_page_document = await get_document(url_split.join('-')); // Récupération du document de la nouvelle page à observer
            messages = messages.concat(Array.prototype.slice.call(current_page_document.getElementsByClassName('bloc-message-forum mx-2 mx-lg-0 '), 0));

            if (current_page_number == n_pages) await edit_db(topic_url, 'timestamp_of_last_message', await get_time_of_last_message(current_page_document)); // Mise à jour du timestamp du dernier message
        }
        resolve(messages);
    });
}  
 
function setup_add_remove_button(is_topic_monitored_bool) {
    // Paramètre et affiche le bouton permettant d'ajouer ou de supprimer le topic à la base de données

    let add_remove_button = document.createElement('input');
    add_remove_button.id = 'add_remove_button';
    add_remove_button.type = 'image';
    if (is_topic_monitored_bool) add_remove_button.src = remove_button_url;
    else add_remove_button.src = add_button_url;
    add_remove_button.style.width = '15px';
    add_remove_button.style.height = '15px';
    add_remove_button.style.marginLeft = '6px';

    add_remove_button.onclick = async function(){
        this.disabled = true;
        let is_topic_monitored_bool = await is_topic_monitored();
        if (is_topic_monitored_bool){
            add_remove_button.src = remove_button_loading_url;
            let url_split = document.URL.split('#')[0].split('-');
            url_split[3] = '1';
            await remove_topic(url_split.join('-'));
            add_remove_button.src = add_button_url;
        } else {
            add_remove_button.src = add_button_loading_url;
            await add_topic();
            add_remove_button.src = remove_button_url;
        }
        this.disabled = false;
    };
    
    document.getElementsByClassName('header__globalUser')[0].appendChild(add_remove_button);
}  
 
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
 
function setup_interface() {
        // Mise en place de l'interface du script

        return new Promise(async resolve => {

                // Arrière plan
                let main_background = document.createElement('div');
                main_background.id = 'alert_modal1';
                main_background.classList.add('modal-generic', 'modal-generic-scroll', 'active');
                main_background.style.display = 'none';
                main_background.style.overflow = 'hidden';
                document.body.appendChild(main_background);

                
                // Arrière plan 2
                let block3 = document.createElement('div');
                block3.id = 'block3';
                block3.style.display = 'none';
                block3.classList.add('modal-generic', 'modal-generic-overflow', 'active');
                document.body.appendChild(block3);


                // Fenêtre principale
                let main_window = document.createElement('div');
                main_window.id = 'main_window';
                main_window.classList.add('modal-generic-main');
                main_window.style.display = 'block';
                main_window.style.width = '1350px';
                main_window.style.maxHeight = '800px';
                main_background.appendChild(main_window);


                // Header
                let header = document.createElement('div');
                header.id = 'header';
                header.style.width = '1350px';
                header.style.height = '50px';
                header.style.background = '#4084f9';
                //header.style.marginTop = '5px';
                //header.style.marginBottom = '5px';
                header.style.position = 'relative';
                main_window.appendChild(header);


                let header_elements_top = '13px'; // Fixe une même hauteur pour tous les éléments du header


                // Tickbox pour afficher / masquer les topics sans notification
                let display_zero_notification_topics_tickbox = document.createElement('input');
                display_zero_notification_topics_tickbox.id = 'zero_notification_tickbox';
                display_zero_notification_topics_tickbox.type = 'checkbox';
                display_zero_notification_topics_tickbox.style.position = 'absolute';
                display_zero_notification_topics_tickbox.style.left = '56px';
                display_zero_notification_topics_tickbox.style.top = header_elements_top;
                display_zero_notification_topics_tickbox.style.height = '25px';
                display_zero_notification_topics_tickbox.style.width = '25px';

                // On stocke la valeur du paramètre dans localStorage pour pouvoir la conserver d'une page de JVC à l'autre
                if (localStorage['Quote_notificator_get_zero_notification_topics'] == '1') display_zero_notification_topics_tickbox.checked = true;
                else display_zero_notification_topics_tickbox.checked = false;

                display_zero_notification_topics_tickbox.addEventListener('change', async function () {
                        if (this.checked) localStorage.setItem('Quote_notificator_get_zero_notification_topics', '1');
                        else localStorage.setItem('Quote_notificator_get_zero_notification_topics', '0');
                        await update_interface();
                });

                header.appendChild(display_zero_notification_topics_tickbox);


                // Texte affiché en survolant la tickbox pour afficher / masquer les topics sans notification
                let display_zero_notification_topics_tickbox_text = document.createElement('div');
                display_zero_notification_topics_tickbox_text.id = 'display_zero_notification_topics_tickbox_text';
                display_zero_notification_topics_tickbox_text.style.background = 'none';
                display_zero_notification_topics_tickbox_text.style.display = 'none';
                display_zero_notification_topics_tickbox_text.style.width = '300px';
                display_zero_notification_topics_tickbox_text.style.height = '21px';
                
                display_zero_notification_topics_tickbox_text.style.position = 'absolute';
                display_zero_notification_topics_tickbox_text.style.color = 'white';
                display_zero_notification_topics_tickbox_text.style.textAlign = 'center';
                display_zero_notification_topics_tickbox_text.style.verticalAlign = 'middle';
                display_zero_notification_topics_tickbox_text.textContent = 'Afficher les topics sans notification';

                display_zero_notification_topics_tickbox.addEventListener('mouseover', function handleMouseOver() {
                        let rect = header.getBoundingClientRect();
                        display_zero_notification_topics_tickbox_text.style.left = rect.left - 40 + 'px';
                        display_zero_notification_topics_tickbox_text.style.top = rect.top - 35 + 'px';
                        display_zero_notification_topics_tickbox_text.style.display = 'block';
                });

                display_zero_notification_topics_tickbox.addEventListener('mouseout', function handleMouseOut() {
                        display_zero_notification_topics_tickbox_text.style.display = 'none';
                });

                main_background.appendChild(display_zero_notification_topics_tickbox_text);


                // Tickbox pour mettre à jour / ne pas mettre à jour la base de données de chargement de chaque page JVC
                let refresh_at_startup = display_zero_notification_topics_tickbox.cloneNode(true);
                refresh_at_startup.id = 'refresh_at_startup_tickbox';
                refresh_at_startup.style.left = '97px';

                refresh_at_startup.addEventListener('change', async function () {
                        if (this.checked) localStorage.setItem('Quote_notificator_refresh_at_startup', '1');
                        else localStorage.setItem('Quote_notificator_refresh_at_startup', '0');
                });

                if (localStorage['Quote_notificator_refresh_at_startup'] == '1') refresh_at_startup.checked = true;
                else refresh_at_startup.checked = false;
                header.appendChild(refresh_at_startup);


                // Texte affiché en survolant la tickbox pour mettre à jour / ne pas mettre à jour la base de données de chargement de chaque page JVC
                let refresh_at_startup_tickbox_text = display_zero_notification_topics_tickbox_text.cloneNode(true);
                refresh_at_startup_tickbox_text.id = 'refresh_at_startup_tickbox_text';
                refresh_at_startup_tickbox_text.textContent = 'Mettre à jour au chargement de chaque page';
                refresh_at_startup_tickbox_text.style.left = '266px';

                refresh_at_startup.addEventListener('mouseover', function handleMouseOver() {
                        let rect = header.getBoundingClientRect();
                        refresh_at_startup_tickbox_text.style.left = rect.left - 10 + 'px';
                        refresh_at_startup_tickbox_text.style.top = rect.top - 35 + 'px';
                        refresh_at_startup_tickbox_text.style.display = 'block';
                });

                refresh_at_startup.addEventListener('mouseout', function handleMouseOut() {
                        refresh_at_startup_tickbox_text.style.display = 'none';
                });

                main_background.appendChild(refresh_at_startup_tickbox_text);


                let refresh_time_limit_dropdown_menu_left = '140px';
                let refresh_time_limit_dropdown_menu_width = '295px';


                // Bouton principal du dropdown du temps limite de dernière activité pour qu'un topic soit mis à jour
                let refresh_time_limit_dropdown_menu = document.createElement('div');
                refresh_time_limit_dropdown_menu.id = 'refresh_time_limit_dropdown_menu_button';
                refresh_time_limit_dropdown_menu.classList.add('dropdown_menu_button', 'dropdown_menu_element');
                refresh_time_limit_dropdown_menu.style.left = refresh_time_limit_dropdown_menu_left;
                refresh_time_limit_dropdown_menu.style.width = refresh_time_limit_dropdown_menu_width;
                refresh_time_limit_dropdown_menu.textContent = 'Dernière activité des topics à mettre à jour';

                refresh_time_limit_dropdown_menu.onclick = function () {
                        if (document.getElementById('refresh_time_limit_option_1').style.display == 'none') {
                                refresh_time_limit_choice_tick.style.display = 'block';
                                for (let k of document.getElementsByClassName('refresh_time_limit_option')) k.style.display = 'block';
                        } else {
                                refresh_time_limit_choice_tick.style.display = 'none';
                                for (let k of document.getElementsByClassName('refresh_time_limit_option')) k.style.display = 'none';
                        }
                }

                header.appendChild(refresh_time_limit_dropdown_menu);


                // Options du dropdown du temps limite de dernière activité pour qu'un topic soit mis à jour
                let refresh_time_limit_strings = ['Actifs il y a 30 minutes', 'Actifs il y a moins d\'une heure', 'Actifs il y a moins de deux heures', 'Actifs il y a moins d\'un jour', 'Actifs il y a moins de 3 jours', 'Actifs il y a moins d\'un mois', 'Tous'];
                let refresh_time_limit_timestamps = [1800, 3600, 7200, 86400, 259200, 259200, 1e10];
                for (let k = 1; k < refresh_time_limit_strings.length + 1; k++) {
                        let refresh_time_limit_option = document.createElement('div');
                        refresh_time_limit_option.id = 'refresh_time_limit_option_' + k;
                        refresh_time_limit_option.classList.add('dropdown_menu_option', 'dropdown_menu_element', 'refresh_time_limit_option');
                        refresh_time_limit_option.style.display = 'none';
                        refresh_time_limit_option.textContent = refresh_time_limit_strings[k - 1];
                        refresh_time_limit_option.style.width = refresh_time_limit_dropdown_menu_width;
                        refresh_time_limit_option.style.left = refresh_time_limit_dropdown_menu_left;
                        refresh_time_limit_option.style.top = parseInt(header_elements_top.slice(0, 2)) + 25 * k + 'px';
                        refresh_time_limit_option.style.zIndex = 1;

                        refresh_time_limit_option.onclick = function () {
                                localStorage['Quote_notificator_refresh_time_limit'] = refresh_time_limit_timestamps[k - 1];
                                refresh_time_limit_choice_tick.style.top = 43 + 25 * (k - 1) + 'px';
                                refresh_time_limit_choice_tick.style.display = 'none';
                                for (let k of document.getElementsByClassName('refresh_time_limit_option')) k.style.display = 'none';
                        }

                        header.appendChild(refresh_time_limit_option);
                }

                // Tick affichant le choix actuel du dropdown de temps limite de dernière activité pour qu'un topic soit mis à jour
                let refresh_time_limit_choice_tick = document.createElement('input');
                refresh_time_limit_choice_tick.id = 'refresh_time_limit_choice_tick';
                refresh_time_limit_choice_tick.type = 'image';
                refresh_time_limit_choice_tick.src = refresh_time_limit_choice_tick_url;
                refresh_time_limit_choice_tick.style.zIndex = 2;
                refresh_time_limit_choice_tick.style.position = 'absolute';
                refresh_time_limit_choice_tick.style.left = parseInt(refresh_time_limit_dropdown_menu.style.left.slice(0, -2)) + 8 + 'px';
                refresh_time_limit_choice_tick.style.width = '16px';
                refresh_time_limit_choice_tick.style.height = '16px';
                refresh_time_limit_choice_tick.style.display = 'none';
                refresh_time_limit_choice_tick.style.top = 43 + 25 * (refresh_time_limit_timestamps.indexOf(parseInt(localStorage['Quote_notificator_refresh_time_limit']))) + 'px';
                
                header.appendChild(refresh_time_limit_choice_tick);

                // Flèche du dropdown de temps limite de dernière activité pour qu'un topic soit mis à jour
                let refresh_time_limit_dropdown_image = document.createElement('input');
                refresh_time_limit_dropdown_image.id = 'refresh_time_limit_dropdown_image';
                refresh_time_limit_dropdown_image.type = 'image';
                refresh_time_limit_dropdown_image.src = refresh_time_limit_dropdown_image_url;
                refresh_time_limit_dropdown_image.style.zIndex = 2;
                refresh_time_limit_dropdown_image.style.position = 'absolute';
                refresh_time_limit_dropdown_image.style.left = parseInt(refresh_time_limit_dropdown_menu.style.left.slice(0, -2)) + 273 + 'px';
                refresh_time_limit_dropdown_image.style.width = '14px';
                refresh_time_limit_dropdown_image.style.height = '14px';
                refresh_time_limit_dropdown_image.style.top = parseInt(header_elements_top.slice(0, -2)) + 5 + 'px';
                refresh_time_limit_dropdown_image.style.cursor = 'default';

                refresh_time_limit_dropdown_image.onclick = function () { refresh_time_limit_dropdown_menu.click() };

                header.appendChild(refresh_time_limit_dropdown_image);


                let sort_order_dropdown_menu_left = '453px';


                // Bouton principal du dropdown de l'ordre d'affichage des topics
                let sort_order_dropdown_menu = document.createElement('div');
                sort_order_dropdown_menu.id = 'sort_order_dropdown_menu_button';
                sort_order_dropdown_menu.classList.add('dropdown_menu_button', 'dropdown_menu_element');
                sort_order_dropdown_menu.textContent = 'Ordre d\'affichage des topics';
                sort_order_dropdown_menu.style.left = sort_order_dropdown_menu_left;
                sort_order_dropdown_menu.style.width = '255px';

                sort_order_dropdown_menu.onclick = function () {
                        if (document.getElementById('sort_order_option_1').style.display == 'none') {
                                sort_order_choice_tick.style.display = 'block';
                                for (let k of document.getElementsByClassName('sort_order_option')) k.style.display = 'block';
                        } else {
                                sort_order_choice_tick.style.display = 'none';
                                for (let k of document.getElementsByClassName('sort_order_option')) k.style.display = 'none';
                        }
                }

                header.appendChild(sort_order_dropdown_menu);


                // Flèche du dropdown de l'ordre d'affichage des topics
                let sort_order_dropdown_image = refresh_time_limit_dropdown_image.cloneNode(true);
                sort_order_dropdown_image.id = 'sort_order_dropdown_image';
                sort_order_dropdown_image.style.left = parseInt(sort_order_dropdown_menu.style.left.slice(0, -2)) + 230 + 'px';
                sort_order_dropdown_image.onclick = function () { sort_order_dropdown_menu.click() };

                header.appendChild(sort_order_dropdown_image);


                // Options du dropdown de l'ordre d'affichage des topics
                let sort_order_strings = ['Nombre de notifications', 'Date de la dernière activité', 'Date du dernier rafraichissement'];
                let sort_order_values = ['notification_counter', 'timestamp_of_last_message', 'refresh_timestamp'];
                for (let option = 1; option < sort_order_strings.length + 1; option++) {
                        let sort_order_option = document.createElement('div');
                        sort_order_option.id = 'sort_order_option_' + option;
                        sort_order_option.classList.add('sort_order_option');
                        sort_order_option.style.display = 'none';
                        sort_order_option.style.left = sort_order_dropdown_menu_left;
                        sort_order_option.style.zIndex = 1;
                        sort_order_option.style.width = '255px';
                        sort_order_option.style.top = 13 + 25 * option + 'px';
                        sort_order_option.classList.add('dropdown_menu_option', 'dropdown_menu_element', 'sort_order_option');
                        sort_order_option.textContent = sort_order_strings[option - 1];
                        sort_order_option.onclick = function () {
                                localStorage['Quote_notificator_sort_order'] = sort_order_values[option - 1];
                                sort_order_limit_choice_tick.style.top = 43 + 25 * (option - 1) + 'px';
                                sort_order_limit_choice_tick.style.display = 'none';
                                for (let k of document.getElementsByClassName('sort_order_option')) k.style.display = 'none';
                                update_interface();
                        }

                        header.appendChild(sort_order_option);
                }


                // Tick affichant le choix actuel du dropdown de l'ordre d'affichage des topics
                let sort_order_limit_choice_tick = refresh_time_limit_choice_tick.cloneNode(true);
                sort_order_limit_choice_tick.id = 'sort_order_choice_tick';
                sort_order_limit_choice_tick.style.left = parseInt(sort_order_dropdown_menu.style.left.slice(0, -2)) + 8 + 'px';
                sort_order_limit_choice_tick.style.top = 43 + 25 * (sort_order_values.indexOf(localStorage['Quote_notificator_sort_order'])) + 'px';

                header.appendChild(sort_order_limit_choice_tick);


                // Style de tous les éléments dropdown (boutons principaux ET options)
                let boxes = Array.from(document.getElementsByClassName('dropdown_menu_element'));
                boxes.forEach(box => {
                        box.style.background = '#9cc8fc';
                        box.style.height = '25px';
                        box.style.position = 'absolute';
                        box.style.color = '#3b3b3b';
                        box.style.textAlign = 'center';
                        box.style.verticalAlign = 'middle';
                        box.style.lineHeight = box.style.height;
                });

                // Style des options des dropdown (bordures pour séparer les options)
                boxes = Array.from(document.getElementsByClassName('dropdown_menu_option'));
                boxes.forEach(box => {
                        box.style.borderTopWidth = '1px';
                        box.style.borderTopStyle = 'solid';
                        box.style.borderTopColor = 'black';
                });

                // Style des boutons principaux des dropdown
                boxes = Array.from(document.getElementsByClassName('dropdown_menu_button'));
                boxes.forEach(box => {
                        box.style.top = header_elements_top;
                        box.style.textAlign = '';
                        box.style.paddingLeft = '5px';
                });


                // Bouton bug report
                let bug_report_button = document.createElement('input');
                bug_report_button.id = 'bug_report_button';
                bug_report_button.type = 'image';
                bug_report_button.src = bug_report_button_url;
                bug_report_button.style.height = '22px';
                bug_report_button.style.width = '22px';
                bug_report_button.style.top = '14px';
                bug_report_button.style.left = '1269px';
                bug_report_button.style.position = 'absolute';

                bug_report_button.onclick = function () { window.open('https://github.com/Arkel01/Quote_notificator/issues', '_blank').focus(); };

                header.appendChild(bug_report_button);


                // Texte affiché en survolant le bouton bug report
                let bug_report_button_text = display_zero_notification_topics_tickbox_text.cloneNode(true);
                bug_report_button_text.id = 'bug_report_button_text';
                bug_report_button_text.textContent = 'Signaler un bug ou proposer une amélioration';
                bug_report_button_text.style.left = '1335px';

                bug_report_button.addEventListener('mouseover', function handleMouseOver() {
                        let rect = header.getBoundingClientRect();
                        bug_report_button_text.style.left = rect.left + 1058 + 'px';
                        bug_report_button_text.style.top = rect.top - 35 + 'px';
                        bug_report_button_text.style.display = 'block';
                });

                bug_report_button.addEventListener('mouseout', function handleMouseOut() {
                        bug_report_button_text.style.display = 'none';
                });

                main_background.appendChild(bug_report_button_text);


                // Bouton de fermeture de l'interface
                let close_button1 = document.createElement('a');
                close_button1.classList.add('modal-generic-close');
                close_button1.dataset.modal = 'fermer';
                close_button1.id = 'close_button1';
                close_button1.style.top = '15px';
                close_button1.href = 'https://www.jeuxvideo.com/forums/0-51-0-1-0-1-0-blabla-18-25-ans.htm#';

                main_window.appendChild(close_button1);


                // Bouton 2 fermeture de l'interface
                let close_button2 = document.createElement('span');
                close_button2.classList.add('icon-close-popin-jv');
                close_button2.id = 'close_button2';
                close_button2.onclick = close;
                close_button1.appendChild(close_button2);


                // Bouton refresh général
                let refresh_button = document.createElement('input');
                refresh_button.type = 'image';
                refresh_button.src = refresh_button_url;
                refresh_button.id = 'refresh_button';
                refresh_button.style.position = 'absolute';
                refresh_button.style.left = '7px';
                refresh_button.style.top = '11px';
                refresh_button.style.width = '30px';
                refresh_button.style.height = '30px';

                refresh_button.onclick = async function () {
                        await refresh();
                };

                header.appendChild(refresh_button);


                // Div permettant de contenir les topics et les messages 
                let content_box = document.createElement('div');
                content_box.id = 'content_box';
                //content_box.style.background = 'white';
                content_box.style.overflowX = 'hidden';
                content_box.style.overflowY = 'scroll';
                //content_box.style.minHeight = '400px';
                content_box.style.maxHeight = '740px';
                main_window.appendChild(content_box);

                
                resolve();
        });
}  
 
function setup_show_button(){
    // Mise en place du bouton permettant d'afficher l'interface

    let show_button = document.createElement('input');
    show_button.type = 'image';
    show_button.src = show_button_url;
    show_button.id = 'show_button';
    show_button.style.width = '20px';
    show_button.style.height = '20px';

    show_button.onclick = function () {
        this.disabled = true;
        show();
        this.disabled = false;
    }
    
    document.getElementsByClassName('header__globalUser')[0].appendChild(show_button);
}  
 
function show() {
    // Affiche l'interface du script

    document.getElementById('alert_modal1').style.display = 'grid';
    document.getElementById('block3').style.display = 'block';

    // Verrouillage de la scrollbar du topic pour empêcher de scroll le topic 'à travers' l'interface
    let body = document.getElementsByTagName('body')[0];
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.overflowY = 'scroll';
}  
 
function show_topic(topic){
    // Ajoute le topic à l'interface

    // Div contenant toutes les information sur le topic
    let box = document.createElement('div');
    box.id = topic.url;
    box.classList = 'topic_box';
    box.style.width = '1350px';
    box.style.height = '40px';
    box.style.position = 'relative';
    if (is_light_theme_on) box.style.background = '#ffffff'; 
    else box.style.background = '#2e3238';
    box.style.marginTop = '5px';
    box.style.marginBottom = '5px';

    document.getElementById('content_box').appendChild(box);


    // Div contenant le titre du topic
    let topic_name_box = document.createElement('div');
    topic_name_box.style.width = '550px';
    topic_name_box.style.height = '30px';
    topic_name_box.style.background = 'none';
    topic_name_box.style.marginTop = '5px';
    topic_name_box.classList = 'topic_title_box';
    topic_name_box.style.position = 'relative';
    topic_name_box.style.transform = 'translateY(-50%)';
    topic_name_box.style.top = '50%';
    topic_name_box.style.left = '15px';
    topic_name_box.style.textOverflow = 'ellipsis';
    topic_name_box.style.overflow = 'hidden';

    box.appendChild(topic_name_box);


    // Titre cliquable du topic
    let topic_name = document.createElement('a');
    topic_name.classList.add('lien-jv', 'topic_name-title', 'stretched-link', 'topic_title');
    topic_name.href = topic.url;
    topic_name.title = topic.title;
    topic_name.textContent = topic_name.title;
    topic_name.style.position = 'relative';
    topic_name.style.top = '5px';

    topic_name_box.appendChild(topic_name);


    // Bouton de suppression du topic
    let topic_remove_button = document.createElement('input');
    topic_remove_button.classList = 'topic_remove_button';
    topic_remove_button.type = 'image';
    topic_remove_button.src = delete_button_url;
    topic_remove_button.style.position = 'absolute';
    topic_remove_button.style.top = '10px';
    topic_remove_button.style.left = '1296px';
    topic_remove_button.style.width = '20px';
    topic_remove_button.style.height = '20px';
    
    topic_remove_button.onclick = async function () {
        box.remove();
        await remove_topic(topic.url);
    };

    box.appendChild(topic_remove_button);


    // Insertion des messages non répondus depuis la dernière mise à jour dans l'interface
    for (let message_outerHTML of topic.unanwsered_messages) {
        let message = document.createElement('div');
        let referenceNode = document.getElementById(topic.url);
        referenceNode.parentNode.insertBefore(message, referenceNode.nextSibling); // Insertion des messages non répondus sous le topic correspondant
        message.outerHTML = message_outerHTML; // En copiant le outerHTML, la variable message est déconnectée de l'élément correspondant
        message = document.getElementsByClassName(topic.url + '_unanwsered_message')[0]; // Reconnexion entre la variable et l'élément

        if (!topic.messages_to_ignore.includes(message.textContent)){ // Si le message n'a pas été choisit comme 'à ignorer' par l'utilisateur

            // Onclick anwser_button
            let anwser_button = message.getElementsByClassName('anwser_button')[0];
            let topic_url_splitted = topic.url.split('-');
            let current_message = anwser_button.id;
            topic_url_splitted[3] = (Math.floor(current_message / 20) + 1).toString(); // On récupère la page à laquelle le message apparaît, et on la stocke dans l'id de l'élément du message

            anwser_button.onclick = function () {
                localStorage.setItem('Quote_notificator_anwser_message', current_message % 20); // Si on clique pour répondre au message, on stocke la page dans le localStorage pendant le changement de page JVC
                window.location = topic_url_splitted.join('-');
            }

            // Onclick ignore_button
            let ignore_button = message.getElementsByClassName('ignore_button')[0];

            ignore_button.onclick = async function () {
                message.remove();
                topic.messages_to_ignore.push(message.textContent); // Stockage du contenu du message à ignorer pour ne pas la prendre en compte lors de la prochaine mise à jour
                await edit_db(topic.url, 'messages_to_ignore', topic.messages_to_ignore);
                await edit_db(topic.url, 'notification_counter', topic.notification_counter - 1);
                box.getElementsByClassName('notification_counter')[0].textContent = box.getElementsByClassName('notification_counter')[0].textContent - 1;
                let topic_updated = await get_db(topic.url);
                if (topic_updated.notification_counter == 0) { // Si il n'y a plus de notification pour le topic, mettre à jour l'interface
                    if(localStorage['Quote_notificator_get_zero_notification_topics']=='1') {
                        box.getElementsByClassName('notification_counter')[0].style.color = 'white';
                        box.getElementsByClassName('expand_button')[0].src = expand_button_url;
                    } else box.remove();
                }
            };
        } else message.remove();
    }


    // Date approximative de la dernière mise à jour du topic
    let last_refresh_time = document.createElement('div');
    last_refresh_time.textContent = 'Actualisé ' + get_time_difference(topic.refresh_timestamp);
    last_refresh_time.style.position = 'absolute';
    last_refresh_time.style.left = '700px';
    last_refresh_time.style.top = '10px';
    last_refresh_time.style.bottom = '60px';

    box.appendChild(last_refresh_time);

    // Date de la dernière activité du topic
    let last_activity_time = document.createElement('div');
    last_activity_time.textContent = 'Actif ' + get_time_difference(topic.timestamp_of_last_message);
    last_activity_time.style.position = 'absolute';
    last_activity_time.style.left = '990px';
    last_activity_time.style.top = '10px';
    last_activity_time.style.bottom = '60px';

    box.appendChild(last_activity_time);

    if (topic.notification_counter != -1) { // Si topic non supprimé

        // Bouton expand / collapse pour afficher ou masquer les messages associés aux notifications
        let topic_button = document.createElement('input');
        topic_button.type = 'image';
        topic_button.src = expand_button_url;
        topic_button.classList = 'expand_button';
        topic_button.style.position = 'absolute';
        topic_button.style.top = '10px';
        topic_button.style.left = '1233px';
        topic_button.style.width = '20px';
        topic_button.style.height = '20px';

        topic_button.onclick = function () {
            for (let message of document.getElementsByClassName(topic.url + '_unanwsered_message')) {
                if (message != undefined && message.style.display === 'block') { // Première condition pour enlever l'erreur si la réponse a été ignorée entre temps
                    message.style.display = 'none';
                    topic_button.src = expand_button_url;
                } else {
                    message.style.display = 'block';
                    topic_button.src = collapse_button_url;
                }
            }
        }

        document.getElementById(topic.url).appendChild(topic_button);

        // Compteur de notifications du topic
        let nb_notif = document.createElement('div');
        nb_notif.classList = 'notification_counter';
        nb_notif.textContent = topic.notification_counter;
        nb_notif.style.position = 'absolute';
        nb_notif.style.left = '1268px';
        nb_notif.style.top = '10px';
        nb_notif.style.bottom = '60px';
        nb_notif.style.height = '30px';
        nb_notif.style.width = '30px';
        if (is_light_theme_on) nb_notif.style.color = 'black';
        else nb_notif.style.color = 'white';
        if (topic.notification_counter != 0) nb_notif.style.color = '#f2613c';

        box.appendChild(nb_notif);

    } else { // Si topic supprimé, griser le titre, enlever le lien cliquable et supprimer le compteur de notifications
        topic_name.style.pointerEvents = 'none';
        topic_name.style.color = 'grey';
    }
}  
 
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
 
function update_topic(topic, number_of_sections) { 
    // Met à jour le topic dans la base de données, et actualise la barre de progression

    return new Promise(async resolve => {

    // Progressbar
    let header = document.getElementById('header');
    let progressbar_header_section = document.createElement('div');
    progressbar_header_section.style.height = header.style.height;
    progressbar_header_section.classList.add('progressbar_section');
    progressbar_header_section.style.background = '#4084f9';
    progressbar_header_section.style.width = parseFloat(header.style.width.slice(0, -2)) / number_of_sections + 1 + 'px'; // + 1 pour combler le vide entre les sections causé par l'arrondissement des décimales
    progressbar_header_section.style.position = 'absolute';
    progressbar_header_section.style.opacity = 0;

    document.getElementById('main_window').insertBefore(progressbar_header_section, header);

    let unanswered_count = 0; // Nombre de notifications
    topic.unanwsered_messages = [];
    let refresh_timestamp = Date.now().toString();
    refresh_timestamp = refresh_timestamp.slice(0, refresh_timestamp.length - 3);
    await edit_db(topic.url, 'refresh_timestamp', refresh_timestamp);

    // Scrapping de la première page pour savoir si le topic est supprimé, et sinon récupérer le nombre de pages du topic
    let current_page_document = await get_document(topic.url);

    if (current_page_document == undefined) { // Si le topic est supprimé
        await edit_db(topic.url, 'notification_counter', -1); // -1 notification signifie que le topic est supprimé
        progressbar_header_section.style.left = parseFloat(progressbar_header_section.style.width.slice(0, -2)) * (localStorage['Quote_notificator_next_header_section'] - 1) + 'px'; // Calcul de la position de la section de la progressbar
        localStorage['Quote_notificator_next_header_section'] = parseInt(localStorage['Quote_notificator_next_header_section']) + 1;
        progressbar_header_section.style.opacity = 100;
        resolve();
        return;
    }

    let page_bloc = current_page_document.getElementsByClassName('bloc-liste-num-page')[0];
    let n_pages;
    (page_bloc.lastChild.textContent == '»') ? n_pages = page_bloc.lastChild.previousSibling.textContent : n_pages = page_bloc.lastChild.textContent; // Quand il y a beaucoup de pages, le nombre de pages est dans l'avant dernier élément, pas le dernier


    // Messages depuis la dernière page analysée durant la dernière mise à jour
    let messages = await scrape_messages(parseInt(n_pages), topic.url, topic.last_fully_scraped_page); // Array de tous les messages de chaque page du topic. Mise à jour du timestamp du dernier message posté
    let user_messages = get_user_messages(messages, user); // Messages de l'utilisateur depuis la dernière page scrape

    let current_user_messages_text = [];
    for (let k = 0; k < user_messages.length; k++) current_user_messages_text.push(get_message_text(user_messages, k)); 
    current_user_messages_text = topic.user_messages_text.concat(current_user_messages_text); // Messages de l'utilisateur sur toutes les pages (doublons sur la dernière, qui a été partiellement scrape pendant la mise à jour précédente)
    current_user_messages_text = [...new Set(current_user_messages_text)]; // Suppression des doublons

    for (let current_message = 0; current_message < messages.length; current_message++) { // Itération sur chaque message de la page
        if (messages[current_message].getElementsByClassName('blockquote-jv').length != 0) { // Si le message observé répond à quelqu'un (i.e cite un autre message)
            let current_message_text = get_message_text(messages, current_message); // Récupération du texte du message observé
            let current_message_anwsered_text = get_quoted_message_text(messages, current_message); // Récupération du texte du message que le message observé cite

            // Analyse de tous les messages de l'utilisateur pour voir si le message observé répond à un message de l'utilisateur
            for (let current_user_message_text of current_user_messages_text) {

                /* current_message_anwsered_text et current_user_message_text ne sont jamais vraiment identiques car l'un des deux contient l'heure du message, on vérifie donc l'inclusion plutôt que l'égalité
                Si l'auteur a posté un message ne contenant qu'un sticker, current_user_message_text='' et le booléen vaut donc toujours vrai. On ajoute donc le deuxième booléen pour pallier ce cas de figure
                1er booléen  : si current_user_message_text et current_anwsered_text sont similaires, current_message répond bien à l'utilisateur 
                3ème booléen : si le message n'a pas été choisit comme étant à ignorer */
                let ignored_message = false;
                for (let message of topic.messages_to_ignore) {
                    if (message.includes(current_message_text)) ignored_message = true;
                }
                if (current_message_anwsered_text.includes(current_user_message_text) && current_user_message_text != '' && !ignored_message) {
                    if (!did_user_anwser(user_messages, current_message_text)) { // Si l'utilisateur n'a pas répondu au message qui lui répond
                        unanswered_count += 1;
                        
                        // Bloc du message
                        messages[current_message].classList.add('unanwsered_message', topic.url + '_unanwsered_message');
                        messages[current_message].style.display = 'none';
                        messages[current_message].style.position = 'relative';
                        messages[current_message].style.width = '1306px';
                        messages[current_message].style.left = '14px';
                        messages[current_message].style.marginTop = '8px';
                        messages[current_message].style.marginBottom = '8px';
                        messages[current_message].getElementsByClassName('bloc-options-msg')[0].remove(); // Suppression boutons citer / blacklist / ddb
                        current_avatar = messages[current_message].getElementsByClassName('user-avatar-msg js-lazy')[0]; // Les avatars sont déformés lors de la requête (l'avatar passe de l'attribut 'src' à 'data-src' et doit être réattribué)
                        current_avatar.setAttribute('src', current_avatar.getAttribute('data-src'));

                        // Bouton ignore
                        let ignore_button = document.createElement('input');
                        ignore_button.type = 'image';
                        ignore_button.src = delete_button_url;
                        ignore_button.classList = 'ignore_button';
                        ignore_button.style.position = 'absolute';
                        ignore_button.style.top = '12px';
                        ignore_button.style.left = '1268px';
                        ignore_button.style.width = '20px';
                        ignore_button.style.height = '20px';
                        messages[current_message].appendChild(ignore_button);

                        // Bouton anwser
                        let anwser_button = document.createElement('input');
                        anwser_button.type = 'image';
                        anwser_button.src = anwser_button_url;
                        anwser_button.classList = 'anwser_button';
                        anwser_button.style.position = 'absolute';
                        anwser_button.style.top = '12px';
                        anwser_button.style.left = '1231px';
                        anwser_button.style.width = '20px';
                        anwser_button.style.height = '20px';
                        anwser_button.id = current_message + topic.last_fully_scraped_page * 20;
                        messages[current_message].appendChild(anwser_button);

                        topic.unanwsered_messages.push(messages[current_message].outerHTML); // Sauvegarde du message
                        await edit_db(topic.url, 'notification_counter', unanswered_count); // Mise à jour du compteur de notifications
                        await edit_db(topic.url, 'unanwsered_messages', topic.unanwsered_messages); // Mise à jour des messages non répondus
                    }
                }
            }
        }
    }
    if (unanswered_count == 0) {
        await edit_db(topic.url, 'unanwsered_messages', []);
        await edit_db(topic.url, 'notification_counter', 0);
        await edit_db(topic.url, 'last_fully_scraped_page', parseInt(n_pages)-1);
        await edit_db(topic.url, 'user_messages_text', current_user_messages_text);
    } else document.getElementById('show_button').src = show_button_still_loading_notification_url;
    progressbar_header_section.style.left = parseFloat(progressbar_header_section.style.width.slice(0, -2)) * (localStorage['Quote_notificator_next_header_section'] - 1) + 'px';
    localStorage['Quote_notificator_next_header_section'] = parseInt(localStorage['Quote_notificator_next_header_section']) + 1;
    progressbar_header_section.style.opacity = 100;
    resolve();
    });
}  
 
