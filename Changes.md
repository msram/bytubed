# BYTubeD Release Notes

-----------------------------------------------------
## 1.1.2

### Release Date

* To be decided

### Bugs/Issues Fixed

- None

### Code Improvements

1. Got rid of the depricated scriptableUnescapeHTML and hence incompatibility with Easy YouTube Video Downloader
2. Used iccb for IITK.CSE.CS213.BYTubeD everywhere.
3. Centralized stripHTML
4. Gracefully handling:
    - "win is null"
    - "file is null"

## 1.1.1

### Release Date

* September 18, 2012

### Changes

* Fixes the following issues:
    * Videos are not downloadable in FLV format.
    * Non-English characters are not shown properly in the file name.

## 1.1.0

### Release Date

* September 15, 2012

### Changes

* Added a fix for the recent YouTube changes. 


## 1.0.9

### Release Date

-   August 31, 2012

### Changes

Features Added:
* Support for downloading subtitles
* Support for 3gp format
* Ability to scan all tabs of the current window for YouTube links
* Show Clip Length

Fixed the following issues:
* Generating watch_links file when not necessary.
* Preserve Order does not work with FF 14+
* Selecting multiple non-contiguous videos is not possible with FF 15+ 

Other changes
* Moved "Additional Features" tab from "Preferences" tab to main window.
* Added "Miscellaneous" and "Subtitles" tabs under "Additional Features".
* Changed the default value of Generate links for "Successful requests" to "false".

## 1.0.8

### Release Date

-   February 17, 2012

### Changes

This is not a major release. It just includes fixes for the following bugs that got introduced
in 1.0.7:

1.  Quality field is grayed out and cannot be changed from 720p.
2.  Cannot handle destination directory with non-ASCII characters.
3.  Cannot download videos containing double-quotes in title, when using "Enqueue for Download". 

For actual changes from earlier versions, please see notes on 1.0.7.

## 1.0.7

### Release Date

-   February 4, 2012

### License
    
-   Earlier versions of BYTubeD were released under MPL 1.1; BYTubeD 1.0.7 is released under GPL 3.

### UI Changes

1.  Preferences tab has been split into 4 sub-tabs:

    1.  "Additional Features" with the following options:

        -   "Video format does not matter. Try to get the videos in requested quality."

        -   "Preserve order (prepends the file name with the serial number)."

        -   "Silently prefetch downloadable video URLs (makes the next step faster)."

            -   "Show Max Resolution"

            -   "Show Max Quality"

    2.  "User Interaction" with the first 3 of the old options of the Preferences tab.

    3.  "Generate Links" with options to generate text files for YouTube watch links.

    4.  "Window Management" with the following options:

        -   "Try to resize the window to fit content."

        -   "Try to center the window after resizing."

        -   "Maintain aspect ratio while resizing the window."

2.  In addition to "FLV" and "MP4", a new option "WebM" has been added in the Video Format
    field

    -   Radio-group has been replaced by a drop-down-menu.

    -   If a video is not available in the requested format, then among the available
        formats, the highest quality video will be fetched subject to the quality
        constraints specified in the Quality field.

3.  More specific Quality field:

    -   The set {"High", "Medium", "Low"} of quality values has been replaced by the
        following set of options:

        -   {"240p", "360p", "480p", "720p HD", "1080p HD", "Original"}

    -   "240p" to "Original" are arranged in increasing order of quality.

    -   "720p HD" is the default value.

    -   If a video is not available in the requested quality, then a lower quality video
        of the same format, as specified in the Video Format field, will be fetched.


4.  By default "What to do?" = "Generate Links"; earlier it was "Enqueue for Download"

5.  The option "Always get highest quality video (don't care whether MP4 or FLV)" has
    been replaced by "Video format does not matter. Try to get the videos in requested
    quality." under Preferences -> Additional Features

    -   This new option allows prioritizing quality over file format.

6.  "Show Max Resolution" and "Show Max Quality" under Preferences -> Additional Features

    -   To show maximum resolution and maximum quality of each video along with S.No and
        Title in Selection Window.

    -   Require silent prefetching enabled.

7.  Added an option: "Select All" in the Selection Window to select all the videos.

### Features Added

1.  **Silent prefetching** of downloadable video URLs

2.  **Grabbing more links**

    1.  Ability to grab YouTube URLs even if they are not hyperlinks to YouTube videos.
        This means that now BYTubeD can be invoked on:

        -   a page containing embedded YouTube videos, hidden video links, etc.

        -   even a text file containing some YouTube URLs here and there.

    2.  Ability to grab YouTube links from the clipboard.


3.  **Preserve Order**

    -   This option can be set to true to make sure that the videos in the destination
        directory are in the same order as they appear on the page where BYTubeD was
        invoked.

4.  **Support for WebM format**

    -   In addition to "FLV" and "MP4", a new option "WebM" has been added in the
        Video Format field

    -   If a video is not available in the requested format, then among the available
        formats, the highest quality video will be fetched subject to the quality
        constraints specified in the Quality field.

### Other Changes

1.  Generating the youtube-page-links in a sperate file; and showing only download links
    in the 'main' links file, to avoid watch links being shown in DownThemAll

    -   *download_links_bytubed@cs213.cse.iitk.ac.in.html* contains the downloadable
        video links

    -   *watch_links_bytubed@cs213.cse.iitk.ac.in.html* contains the YouTube video page
        links for all the successful and failed requests.

2.  Including, at the top of generated youtube-watch-links page:

    -   time stamp of BYTubeD invocation

    -   window/tab title/link of the source page on which BYTubeD was invoked,

3.  Added an option to generate text files containing the YouTube page links for failed
    and successful requests  (not the download links, because the download links expire
    within 7 hours after generation)

    -   Failed requests are saved in *bad_links_bytubed@cs213.cse.iitk.ac.in.txt*

    -   Successful requests are saved in *good_links_bytubed@cs213.cse.iitk.ac.in.txt*

4.  All communication happens over HTTPS rather than HTTP

5.  Change in support page:
    -   All references to http://bytubed.blogspot.com/ have been replaced by 
        http://msram.github.com/bytubed/

### Code Improvements

1.  Including swf_map as a property of YouTubeVideo and added code to make sure that
    video_info is fetched at most once for each video.

2.  Error reports will include BYTubeD version number to make developer's life easy

3.  Brought all the functions with return values to the following template:

    ```javascript
    var func = func()
    {
        var returnValue = ...;

        try
        {
            // populate returnValue
        }
        catch(error)
        {
            // handle error
        }

        return returnValue;
    }

---------------------------------------------------

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
