document.write
    (
        
        '<a href="http://github.com/msram"><img style="position: absolute; top: 0; right: 0; border: 0;" ' +
        'src="images/fork_me_gray.png" alt="Fork me on GitHub"></a>' +
        
        '<div class="download">' + 
            '<a href="https://github.com/msram/bytubed/tarball/master"><img border="0" width="90" src="images/tar.png"></a>' +
            '<div class="info">Source code<br/>(from GitHub)</div>' +
        '</div>' +
        '<h1 class="header">' +
            '<a href="https://github.com/msram/bytubed">BYTubeD - Bulk (Batch) YouTube video Downloader</a> ' +
        '</h1>' +
        '<div class="description">' +
            'A <a href="https://addons.mozilla.org/addon/bytubed/">Firefox extension</a> ' +
            'by <a href="https://github.com/msram">msram</a>, to batch download multiple YouTube videos.' +
        '</div>'        
    );

/* 
*   Navigation Bar
*   --------------
*   To add a new page, just add an entry in the menu list following  the template.
*   Do not forget to add a comma at the end of the current list before adding the
*   new item.
*/
var menu = {
    "0" : {"text": "Home",          "link" : "index.html"},
    "1" : {"text": "Help",          "link" : "help.html"},
    "2" : {"text": "Screenshots",   "link" : "screen-shots.html"},
    "3" : {"text": "Development",   "link" : "development.html"}    
};

var navBar = '<hr class="navbar"/>';

var itemCount = Object.keys(menu).length;  // Works in FF4+

var i = 0;
for(var item in menu)
{
    navBar += '<a href="' + menu[item].link + '">' + menu[item].text + '</a>';
    
    if(!itemCount || i++ < itemCount - 1)
        navBar += '&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;';
}
navBar += '<br/><hr class="navbar"/>';

document.write(navBar);
/* End of Navigation Bar */