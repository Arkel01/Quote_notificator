function remove_topic(url) {
    // Supprime le topic url de la base de données
    
    return new Promise(async resolve => {
        await delete_db(url);
        await update_interface();
        resolve();
    });
}