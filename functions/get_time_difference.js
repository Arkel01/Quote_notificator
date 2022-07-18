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