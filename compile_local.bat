IF EXIST Quote_notificator_local.js DEL /F Quote_notificator_local.js
FINDSTR /R /I /V "^$// ==/UserScript==" userscript_header.js >> Quote_notificator_local.js
FOR %%f IN (functions\*.js) DO echo // @require      file:///%cd%\functions\%%~nxf >> Quote_notificator_local.js
echo // ==/UserScript== >> Quote_notificator_local.js
