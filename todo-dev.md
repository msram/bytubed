Now working on: 

I. Issues
---------

II. Minor Changes
-----------------

1. Handle "file is null" in line# 525 of chrome://bytubed/content/queueingStatusManager.js
    (done!)

2. Subtitle destination directory 

III. Major Features
------------------
1. localization  (1.1.2)
    (do it!!)

2. Ressurect dead request links;  Alternatives for this are:
    - Implement a simple download manager
    - Implement resurrect(download_links_file) as follows:
        - prereq: write all the relevant preferences into the download_links_file on each invocation.
        - use the preferences in download_links_file to regenerate links.


IV. Code Improvements
----------------------
1. Use iccb for IITK.CSE.CS213.BYTubeD everywhere.
    (done)
    
2. Code Cleanup
    1. organize global functions into logical modules and put them in different singleton objects.
    2. file operations
    3. XUL operations
    4. subtitle operations
    5. general utils
    6. addon management
            
3. Document every function
    
4. Logging
    
5. Modularize, instead of using namespaces.