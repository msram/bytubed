## General Notes
XUL is a language to specify user interfaces for Mozilla extensions. 

## Details of code files
- chrome
    * Nothing significant yet
    * Just contains an icon of BYTubeD 
- content
    - overlay.xul
        * UI specification to get a menu item in the context-menu and in the Tools menu
    - overlay.js
        * Code to handle the onClick event for the BYTubeD menu item in the context-menu and in the Tools menu
    
    - selectionManager.xul
        * UI specification of the main window (the video selection window) of BYTubeD
    - selectionManager.js
        * Event handlers for various actions on the main window
    
    - queueingStatusManager.xul
        * UI specification of the window that shows the status while generating download links for videos
    - queueingStatusManager.js
        * Code to report  the status to the users during link generation
        * Code to generate an HTML file containing download links 
        * Code to generate HTML and text files containing other types of links depending on the user's choices
          in [Preferences -> Generate Links] of selection window

    - downloadQueueManager.js
        * Code that handles downloads
        * Used to 'Enqueue for Download' and to download subtitles

    - videoListManager.js
        * Code to deal with YouTube pages and download-link construction
    - subtitles.js
        * Code to fetch and process subtitle response text from the server
    - langList.js
        * Minimal list of subtitle-languages to begin with
    - xmlHttpRequestManager.js
        * Code to communicate with server using XMLHttpRequest

    - globals.js
        * Defines the namespace: iitk.cse.cs213.bytubed
        * Defines miscellaneous functions used by almost all modules
    - utf.js
        * Code to convert between UTF-8 and UTF-16

- defaults
    - preferences
        - BYTubeD.js
            * Defines the default values of certain preferences

- generated
    - langList.js
        * List of subtitle-languages known so far
        * Gets updated dynamically

- locale
    * Files containing language specific strings for each language

- skin
    - icons
        * Various icons used in the UI design
    - win.css
        * Style sheet for selection window and queueing status window
    - overlay.css
        * Style sheet for BYTubeD related menu items in the browser window

- chome.manifest
    * Acts like a starting point
    * Tells what is where 

- icon.png
    * A representative icon of BYTubeD

- install.rdf
    * Instllation related information such as the version of add-on, supported browser-versions, 
      author's name, add-on description etc.

## Miscellaneous

- Changes.md
    * Release notes, telling what is new in each release
- GPL
    * Terms of GNU GPL version 3
- LICENSE
    * Terms of use for BYTubeD
- Readme.md
    * A readme file from the users' perspective
- todo-dev.md
    * Notes for the developer on what to do next
- what is what.md
    * This file