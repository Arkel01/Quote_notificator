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
                        ignore_button.src = 'http://image.noelshack.com/fichiers/2022/27/4/1657217268-delete-button.gif';
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
                        anwser_button.src = 'http://image.noelshack.com/fichiers/2022/27/5/1657234800-anwser-button.gif';
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
    } else document.getElementById('show_button').src = 'http://image.noelshack.com/fichiers/2022/28/6/1657978443-show-button-still-loading-notification.gif';
    progressbar_header_section.style.left = parseFloat(progressbar_header_section.style.width.slice(0, -2)) * (localStorage['Quote_notificator_next_header_section'] - 1) + 'px';
    localStorage['Quote_notificator_next_header_section'] = parseInt(localStorage['Quote_notificator_next_header_section']) + 1;
    progressbar_header_section.style.opacity = 100;
    resolve();
    });
}