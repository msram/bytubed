# BYTubeD Release Notes

-----------------------------------------------------

##  1.0.6

### Release Date

-   August 4, 2011

### Changes

-   There have been some feature requests and a few bugs after 1.0.5. This new version
    (1.0.6) implements those features and fixes the bugs. Following are the changes from
    1.0.5 to 1.0.6.

### Bugs Fixed

1.  With 1.0.5, playlist videos could not be downloaded. 1.0.6 fixes this bug. 

2.  YouTube has made some changes on 3rd August, that made BYTubeD fail. BYTubeD 1.0.6
    includes a fix for this.

### Features Added (Requested by users)

1.  Support for short YouTube URLs  (http://youtu.be/ and http://y2u.be/ links)

2.  An option in Preferences: "Generate YouTube page links when 'What to do?' = 'Generate
    Links'." which is by default FALSE.

3.  An option in Preferences: "Always get highest quality video (don't care whether MP4
    or FLV)"

### Some Other Changes

1.  Alert if "Start" is pressed without selecting any videos.

2.  Alert if no YouTube links were found on the page where BYTubeD was invoked.

3.  Better error reports in the Failed Requests tab of the Queuing Status Window and in
    the generated links page.

4.  Added a "Quality" column while showing generated links, to tell what quality video
    each link corresponds to.

5.  Added an option in Preferences: "Generate YouTube page links for failed requests when
    'What to do?' = 'Generate Links'." which is by default TRUE.

-----------------------------------------------------

##  1.0.5

### Release Date

-   July 10, 2011

### Major Changes

1. Fix for "embedding disabled by request. watch on youtube."

### Minor Changes

1.  charset=UTF-8 in the generated HTML file:
    
        <meta http-equiv="content-type" content="text/html;charset=UTF-8">
    
2.  Changed the default value of "Close the enqueing window..."  to TRUE

3.  '#' and '\n' in title replaced by blank. 

4.  Removed local help file. Redirect to the support page on pressing Help.

5.  Listing failed requests in "Generated Links".

-----------------------------------------------------

##  1.0.4

### Release Date

-   December 12, 2010

### Changes

1. Added a fix to address the recent YouTube code changes.

2. Added a way to use BYTubeD in combination with download managers like *DownThemAll* -
   i.e., the **What to do?** drop-down menu with two options:

    -   *Enqueue for Download* : enqueues videos in the Downloads window as usual.

    -   *Generate Links* : generates an HTML file containing list of downloadable video
        links, on which download managers like DownThemAll can be invoked.

3. Added support for very high quality videos (if they are avaialble).

4. Other Changes

    - Removed the forcible icon in the tool bar.
    
    - Fixed the problems related to title processing.
    
    - Added an option to suppress error messages.

-----------------------------------------------------


##  1.0.3

### Release Date

-   August 8, 2010

### Changes

1. Fixes to address the recent changes made by YouTube to their video URLs.

-----------------------------------------------------

##  1.0.2e

### Release Date

-   April 13, 2010

### Changes

1. Improvements in processing the video title.

-----------------------------------------------------

##  1.0.2d

### Release Date

-   April 12, 2010

### Changes

1. Some issues related to non-English video-title processing have been resolved.

-----------------------------------------------------

##  1.0.2a and 1.0.2b

### Release Date

-   April 11, 2010

### Changes

1.  In 1.0.2, certain videos were not getting selected due to an exception caused by a
    reference to an undefined function.  Rectified that bug in 1.0.2a.

-----------------------------------------------------

##  1.0.2

### Release Date

-   April 10, 2010

### Changes

1.  Added the Preferences tab to the selection window which allows the users to choose
    whether or not to see the queueing status window and the Downloads window after the
    process of enqueuing the videos for download.

2.  As suggested by Andres Hernandez, everything has been wrapped in a unique namespace
    called IITK.CSE.CS213.BYTubeD.

-----------------------------------------------------

##  1.0.1b

### Release Date

-   April 8, 2010

### Changes

1.  Handling the videos whose title has a star (the asterisk symbol). Replaced star by a
    space. ('*' is not allowed in a file name on Windows)

-----------------------------------------------------

##  1.0, 1.0a and 1.0.1

### Release Date

-   April 6, 2010

### Changes

1. Initial versions. (Differences were not noted.)

-----------------------------------------------------
