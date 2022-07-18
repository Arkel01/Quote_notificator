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