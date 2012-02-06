document.write(   
        '<meta charset="utf-8">' +
        '<link rel="stylesheet" type="text/css" href="style.css" />'
    );

if(navigator.userAgent.indexOf("Trident") != -1)	// IE is not a supported browser
    window.location.href = "ie.html";