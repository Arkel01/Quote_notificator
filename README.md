# Quote notificator
L'objectif de ce userscript est de permettre à l'utilisateur d'être notifié lorsque quelqu'un le cite sur les forums de www.jeuxvideo.com, dans le but
de pouvoir échanger plus facilement entre forumeurs. Le script propose une interface permettant de gérer la liste des topics dont l'utilisateur souhaite surveiller les réponses à ses messages. Pour chaque message,
l'utilisateur peut faire le choix soit d'être redirigé vers la réponse pour à son tour y répondre, soit d'ignorer le message. D'autres informations sur les topics surveillés
sont également disponibles.

# Installation

Ce script s'installe avec Tampermonkey, une extension pour navigateur facilement trouvable permettant d'injecter du code javascript. Les nouvelles mises à jour sont automatiquement proposées aux utilisateurs. <br />
Une fois l'extension installée, le script s'installe via le lien suivant :
<p align="center">
https://github.com/Arkel01/Quote_notificator/raw/main/Quote_notificator.user.js
</p>

# Fonctionnement
Dans toute la suite, pour présenter le script, on fait le choix arbitraire d'utiliser le forum du jeu *Programme d'entraînement du Dr Kawashima*. <br /> <br />
Dans un premier temps, l'utilisateur doit impérativement être connecté à son compte www.jeuxvideo.com. Le cas échéant, le script ne se lance pas et invite l'utilisateur
à désactiver le script :
![Capture d’écran 2022-07-22 183052](https://user-images.githubusercontent.com/14261356/180500326-0191c3ac-125a-402d-823c-4aac23a1659c.png)
<br />

Une fois connecté, le script s'intègre à la page du forum et affiche un nouveau bouton à côté du pseudonyme de l'utilisateur, lui permettant d'accéder à l'interface :
![Sans titre-1](https://user-images.githubusercontent.com/14261356/180500486-d69fadc1-2a8a-45f6-a28c-7d8245a7041e.png)

L'interface se présente alors comme telle : 
![Quote_notificator interface vide](https://user-images.githubusercontent.com/14261356/180518114-b32390d1-7c3e-4630-b79f-03a66dbfda60.gif)



Sur celle-ci, l'utilisateur peut faire plusieurs choses :

- Le premier bouton sert à relancer manuellement la recherche de nouvelles réponses, selon le seuil de rafraichissement maximal défini par le menu déroulant suivant.

- La première case cochable sert à choisir d'afficher ou non les topics n'ayant pas de nouvelles réponses. 
L'utilisateur peut alors faire le choix de ne pas du tout voir les topics sans nouvelles réponses et d'avoir ainsi une interface épurée, ou au contraire d'afficher
tous les topics, ce qui lui permet d'avoir davantage d'informations.

- La deuxième case cochable sert à choisir si le script doit effectuer ou non une nouvelle recherche de réponses (parmi les topics sous le seuil de date de dernière activité) **à chaque chargement d'une
page www.jeuxvideo.com**. Activer cette fonctionnalité permet ainsi de rendre le script très discret en le faisant fonctionner en arrière plan sans intervention de l'utilisateur.
Cette fonctionnalité présente cependant le désavantage de systématiquement consommer de la bande passante supplémentaire. Si l'utilisateur utilise
une connexion internet ayant un débit trop faible, cette fréquence de rafraichissement pourraît causer des ralentissements.

- Le premier menu déroulant sert à sélectionner un seuil de date de dernière activité des topics en deçà duquel le script ne recherchera pas de nouvelles réponses. En effet,
pour chercher de nouvelles réponses, le script doit parcourir chaque message de chaque nouvelle page de chaque topic. Idéalement, l'utilisateur souhaiterait pouvoir chercher des réponses
à ses messages sur tous les topics sur lesquels il a posté. Cependant, au fil du temps, le script serait amené à effectuer de plus en plus de requêtes,
ce qui finirait par non seulement ralentir la connexion internet de l'utilisateur, mais également ralentir la vitesse d'exécution du script. L'objectif étant de rendre le script utilisable
sur les forums, où les utilisateurs sont amenés à changer très fréquemment de pages, le script doit pouvoir terminer son exécution suffisamment rapidement pour que 
l'utilisateur n'ai pas à l'attendre. Les forums affichant les topics par date de dernière activité, on peut raisonnablement penser que plus un topic a une date de 
dernière activité ancienne, moins celui-ci est susceptible de contenir de nouveaux messages. Dans ce cas, il n'est
alors pas nécessaire de rechercher régulièrement des réponses. L'utilisateur a donc tout intérêt à sélectionner un seuil de dernière activité 
relativement faible pour garantir que le script terminera son exécution rapidement. De temps en temps, il pourra exécuter le script sur l'ensemble des topics 
pour s'assurer qu'un topic qui n'avait pas été actif depuis longtemps n'a pas été "relancé".

- Le deuxième menu déroulant sert à sélectionner un ordre de tri pour la liste des topics.

- L'avant dernier bouton permet à l'utilisateur de proposer une nouvelle amélioration pour le script ou de signaler un bug. Ce bouton redirige l'utilisateur
vers la page "Issues" de ce repository GitHub.

- Le dernier bouton sert à fermer l'interface.

Une fois le script installé, lorsque l'utilisateur navigue sur un topic, un bouton supplémentaire apparaît :

![Sans titre-2](https://user-images.githubusercontent.com/14261356/180500591-2cdcbfd7-0f12-48f4-8ca2-89961db9fa4b.png)


C'est grâce à ce bouton que l'utilisateur peut ajouter le topic à la liste des topics à surveiller. Il est important de noter que lorsque l'utilisateur poste sur un topic
qu'il n'a pas déjà ajouté à la liste des topics à surveiller, le topic est automatiquement ajouté. Une fois que l'utilisateur a cliqué sur ce bouton **ou** s'il visite un
topic qu'il a déjà ajouté, le bouton d'ajout change et devient un bouton permettant de supprimer le topic de la liste des topics à surveiller :

![Sans titre-3](https://user-images.githubusercontent.com/14261356/180500623-027d0c2c-6ce2-4359-8142-ff0753c2d46e.png)

L'interface affiche alors le nouveau topic :
![Capture d’écran 2022-07-22 193225](https://user-images.githubusercontent.com/14261356/180503165-f155fd27-13ce-4d35-946c-8a976126762a.png)


Lorsqu'un topic que l'utilisateur avait ajouté est supprimé, l'interface l'affiche également en rendant le nom du topic gris et en supprimant le compteur de nouvelles réponses :
![Capture d’écran 2022-07-22 193919](https://user-images.githubusercontent.com/14261356/180500810-3950d6d4-8ef3-491f-b670-2ddace8a5e9d.png)

Lorsque le script trouve au moins une réponse à l'utilisateur sur l'un des topics à surveiller, il l'indique en faisant clignoter l'icône : 
![Quote_notificator_2](https://user-images.githubusercontent.com/14261356/180497978-6c5e5375-906a-484d-bda1-42f26a97d129.gif)

En ouvrant l'interface, l'utilisateur peut alors voir le nombre de nouvelles réponses sur chaque topic, et les afficher :
![Quote_notificator expand](https://user-images.githubusercontent.com/14261356/180516677-ad01f175-f1d2-4a08-8da6-16298d3eea5c.gif)


S'il souhaite répondre, l'utilisateur peut cliquer sur le premier bouton du message pour être redirigé sur le topic, où la citation est déjà prête. L'utilisateur
n'a alors plus qu'à composer et envoyer sa réponse :
![Quote_notificator anwser message](https://user-images.githubusercontent.com/14261356/180515556-eb25906f-bcef-4d24-8d1e-efffc8d4f3d8.gif)


S'il ne souhaite pas répondre, il peut cliquer sur le second bouton du message, ce qui permet au script de ne pas en tenir compte pour toutes les prochaines
recherches de nouveaux messages :
![Quote_notificator ignore message](https://user-images.githubusercontent.com/14261356/180513537-87a5558b-70a2-40c3-acc3-742d19a33777.gif)


# Modification du script

Un script Tampermonkey correspond à un fichier au format <code>.user.js</code> contenant un <code>header</code> ainsi que toutes les fonctions javascript les unes après les autres.
Il est cependant possible de charger ces fonctions localement en indiquant leurs chemins d'accès. Ceci permet de pouvoir modifier les fonctions dans un IDE tout 
en pouvant effectuer le deboggage en actualisant simplement le navigateur. Le processus de modification est donc le suivant  (les fichiers batch devront être 
réécrit si le développeur n'utilise pas Windows) : 
- Lancer le fichier <code>compile_local.bat</code>.
- Un fichier <code>Quote_notificator_local.user.js</code> est créé. Celui-ci contient le <code>header</code> contenu dans <code>userscript_header</code>, complété par la syntaxe permettant de lire les fonctions
localement.
- Glisser-déposer le fichier <code>Quote_notificator_local.user.js</code> sur le navigateur. Tampermonkey propose alors de "réinstaller" <code>Quote_notificator</code>
par le nouveau script local. A partir de cet instant, Tampermonkey lit le script directement dans les fonctions locales.
- Effectuer les modifications voulues en éditant les fonctions via un IDE. Actualiser le navigateur permet de prendre en compte les modifications et de pouvoir debogger avec <code>devtools</code>.
- Une fois toutes les modifications faites, modifier la version du script dans <code>userscript_header</code>. C'est l'incrémentage de cette version qui permet à Tampermonkey de proposer
aux utilisateurs du script la nouvelle version. La nomenclature du versionnage est <code>Mise_a_jour_majeure.Feature_mineure.Correctif_mineur</code>.
- Lancer <code>compile.bat</code>, qui supprime <code>Quote_notificator_local.user.js</code> et crée <code>Quote_notificator.user.js</code>, qui 
est la concaténation du <code>header</code> et de toutes les fonctions javascript, et correspond au script final.
- Effectuer une pull request.

