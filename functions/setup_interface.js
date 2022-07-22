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