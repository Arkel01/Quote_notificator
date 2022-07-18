IF EXIST Quote_notificator.user.js DEL /F Quote_notificator.user.js
type userscript_header.js >> Quote_notificator.user.js & echo: >> Quote_notificator.user.js & echo: >> Quote_notificator.user.js
FOR %%f IN (functions\*.js) DO type %%f >> Quote_notificator.user.js & echo: >> Quote_notificator.user.js & echo: >> Quote_notificator.user.js