Now working on: 
* Report progress from Download to queueStautsManager
    - manage 'this' in DownloadManager
    - DownloadManager IS IN A VERY BAD SHAPE!!
* I.1
* III.3


0. User requests
----------------
1. Give an option to keep old files of generated links (i.e., no over-write).

2. Give an optin to suppress the warning regarding 'Enqueue for Download'. 
    (done!)

3. Mention "BYTubeD" in the error report request message. 
    (done!)

I. Issues
---------
1. onUnload is not called when qsMgr window is closed.
    - Investigate qsMgr.finishUp(terminate), qsMgr.alreadyFinished
    

II. Minor Changes
-----------------

1. Handle "file is null" in line# 525 of chrome://bytubed/content/queueingStatusManager.js
    (done!)

2. Subtitle destination directory 

3. Give a better message when 'directory creation fails'.

4. Handle "win is null" in queueingStatusManager and selectionManager
    (done!)

III. Major Features
-------------------
1. localization  (1.1.2)
    (done!)


2. Ressurect dead request links;  Alternatives for this are:
    - Implement a simple download manager
    - Implement resurrect(download_links_file) as follows:
        - prereq: write all the relevant preferences into the download_links_file on each invocation.
        - use the preferences in download_links_file to regenerate links.

3. Implement a queue for 'Enqueue for Download' with the following abilities:
    - ability to control the number of parallel downloads
    - ability to cancel to downloads
    - ability to resurrect dead links
   Method:
    - Remove the batch calls and make them one-by-one
    - Localize the strings later

4. Implement history management
    - to avoid duplicate downloads across sessions.
    - give the user a chance to switch it ON/OFF.
    

IV. Code Improvements
----------------------
1. Use iccb for iitk.cse.cs213.bytubed everywhere.
    (done)
    
2. Code Cleanup
    - organize global functions into logical modules and put them in different singleton objects
        - file operations
        - XUL operations
        - subtitle operations
        - general utils
        - addon management
            
3. Document every function
    
4. Logging
    
5. Modularize, instead of using namespaces.

