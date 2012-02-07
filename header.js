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
var menu = [
    {"text" : "Home",               "link" : "index.html"},
    {"text" : "Help",               "link" : "help.html"},
    {"text" : "Screenshots",        "link" : "screen-shots.html"},
    {"text" : "Keyboard Shortcuts", "link" : "keyboard-shortcuts.html"},
    {"text" : "Development",        "link" : "development.html"},
    {"text" : "Acknowledgements",   "link" : "acknowledgements.html"}
];

var navbar = '<hr class="navbar"/>';

for(var i=0; i < menu.length; i++)
{
    navbar += '<a href="' + menu[i].link + '">' + menu[i].text + '</a>';
    
    if(i < menu.length - 1)
        navbar += '&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;';
}
navbar += '<br/><hr class="navbar"/>';

document.write(navbar);
/* End of Navigation Bar */