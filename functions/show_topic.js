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