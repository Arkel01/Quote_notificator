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