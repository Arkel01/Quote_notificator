set path_to_github_folder=PATH\TO\GITHUB\FOLDER\HERE

IF EXIST Quote_notificator_local.js DEL /F Quote_notificator_local.js
FINDSTR /R /I /V "^$// ==/UserScript==" userscript_header.js >> Quote_notificator_local.js
echo // @require      file:///%path_to_github_folder%\functions\*.js >> Quote_notificator_local.js
echo // ==/UserScript== >> Quote_notificator_local.js