IF EXIST Quote_notificator_local.user.js DEL /F Quote_notificator_local.user.js
FINDSTR /R /I /V "^$// ==/UserScript==" userscript_header.js >> Quote_notificator_local.user.js
FOR %%f IN (functions\*.js) DO echo // @require      file:///%cd%\functions\%%~nxf >> Quote_notificator_local.user.js
echo // ==/UserScript== >> Quote_notificator_local.user.js
