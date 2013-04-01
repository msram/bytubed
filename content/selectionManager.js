/* ***** BEGIN LICENSE BLOCK *****
 *
 * The contents of this file are subject to the GNU General Public License
 * Version 3 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 * http://www.gnu.org/copyleft/gpl.html
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing the rights and limitations under the
 * License.
 *
 * The Original Code is BYTubeD. The Initial Developer of the Original Code
 * is M S Ram (M.S.Ramaiah@gmail.com).
 *
 * Portions created by the Initial Developer are Copyright (C) 2010-2012 the
 * Initial Developer. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK ***** */

/* ********************** BEGIN selectionManager code ********************** */

/**
 * Preferences ADT packs all the user preferences that are to be passed to the
 * further layers. If a user preference is not needed beyond selectionManager,
 * then it won't be store in the Preferences ADT
 */
iitk.cse.cs213.bytubed.Preferences = function()
{
    this.format             = "flv";
    this.quality            = "720p";
    this.todo               = 0;
    
    this.preserveOrder      = false;
    this.ignoreFileType     = false;

    this.showDLWindow           = true;
    this.closeQStatusWindow     = false;
    // this.suppressErrors         = false;     // Not needed
    // this.suppressWarnings       = false;     // Not needed
    
    this.fetchSubtitles         = false;
    this.subtitleLangCodes      = new Array();
    // this.tryOtherLanguages      = true;      // this is not needed.

    this.generateFailedLinks    = true;
    this.generateWatchLinks     = true;
    this.generateBadLinks       = false;
    this.generateGoodLinks      = false;
    
    this.destinationDirectory   = "";
    this.subtitleDest    = "";
};

iitk.cse.cs213.bytubed.InvocationInfo = function()
{
    this.timeStamp          = "";
    this.sourcePageUrl      = "";
    this.sourcePageTitle    = "";
    this.toString           = function()
    {
        return (this.timeStamp + "\n" + this.sourcePageTitle + "\n" +
                this.sourcePageUrl);
    };
};

iitk.cse.cs213.bytubed.helpPageLink = "http://msram.github.com/bytubed/help.html";

iitk.cse.cs213.bytubed.validVidLength = 11; // As of this writing.

iitk.cse.cs213.bytubed.undesirablePattern   =
    new RegExp( "^http|^<img|thumb|Back(\\s)+$|" +
                "play.all|view.comments|return.to|play.video|" +
                "sign.out|sign.in|switch.account|^(none)$", "igm");

iitk.cse.cs213.bytubed.youTubePatterns      =
    new RegExp( "(youtube\\.com\\/v\\/|\\/watch\\?v=|" +
                "youtube\\.com\\/embed\\/|\\/movie?v=|" +
                "youtu\\.be\\/|y2u\\.be\\/)([a-zA-Z0-9_-]{11})", "igm");

iitk.cse.cs213.bytubed.patternToBeRemoved   =
    new RegExp( "(youtube\\.com\\/v\\/|\\/watch\\?(.)*v=|" +
                "youtube\\.com\\/embed\\/|\\/movie?v=|" +
                "youtu\\.be\\/|y2u\\.be\\/)", "igm");

iitk.cse.cs213.bytubed.invalidVids   =  ["__video_id_", "__playlist_", null, ""];

/**
 * hasUndesirablePatterns checks if a YouTube link has certain non-title text
 * as title for the video
 *
 * @param str: The string to be tested for the presence of undesirable patterns.
 *
 * @return
 *      true, if str has undesirable patterns;
 *      false, otherwise
 */
iitk.cse.cs213.bytubed.hasUndesirablePatterns = function hasUndesirablePatterns(str)
{
    try
    {
        return iitk.cse.cs213.bytubed.undesirablePattern.test(str);
    }
    catch(error)
    {
        // Do nothing.
    }
    return false;
};

iitk.cse.cs213.bytubed.isValidVid = function isValidVid(vid)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        return (iccb.invalidVids.indexOf(vid) == -1 && vid.length > 10 && ! /[^a-zA-Z0-9_-]/.test(vid));
    }
    catch(error)
    {
        // Do nothing.
    }
    return false;
};

iitk.cse.cs213.bytubed.isYouTubeLink = function isYouTubeLink(link)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        var yp = iccb.youTubePatterns;
        
        // Reset the lastIndex to 0 so that the next regex pattern match will
        // happen from the beginning. This is a fix suggested by Phil, 
        // to overcome the problem of skipped anchors.
        yp.lastIndex = 0; 
        return yp.test(link);
    }
    catch(error)
    {
        // Do nothing.
    }
    return false;
};

/**
 * Use this function when you are sure that what you are passing to it is a
 * YouTube URL.
 *
 * @param ytURL: the YouTube URL to be scanned for vid
 *
 * @return
 *      YouTube video-id found in ytURL
 **/
iitk.cse.cs213.bytubed.getVidFromUrl = function getVidFromUrl(ytURL)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        return iccb.getParamsFromUrl(ytURL)["v"];
    }
    catch(error)
    {
        // Do nothing.
    }
    return "";
};

/**
 *
 * Use this function if you are not sure what kind of text you are passing
 * to it.
 *
 * @param text: the text to be scanned for YouTube video IDs.
 *
 * @return array of YouTube video IDs found in text
 *
 */
iitk.cse.cs213.bytubed.getVidsFromText = function getVidsFromText(text)
{
    var iccb = iitk.cse.cs213.bytubed;
    var vids = new Array();
    var patternToBeRemoved = iccb.patternToBeRemoved;
    try
    {
        var results = text.match(iccb.youTubePatterns);
        if(results)
        {
            for(var i=0; i<results.length; i++)
                vids.push(results[i].replace(patternToBeRemoved, ""));
        }
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }

    return vids;
};

/**
 * yetToBeProcessed searchs for vid in vids
 *
 * @return
 *      true, if vid was found in vids;
 *      false, otherwise
 */
iitk.cse.cs213.bytubed.yetToBeProcessed = function yetToBeProcessed(vid, vids)
{
    return vids.indexOf(vid) == -1;
};

iitk.cse.cs213.bytubed.getVidsFromLinks = function getVidsFromLinks(links)
{
    var iccb = iitk.cse.cs213.bytubed;
    var vids = new Array();
    try
    {
        for(var i=0; i<links.length; i++)
        {
            vids.push(iccb.getVidFromUrl(links[i].href));
        }
    }
    catch(error)
    {
        // Ignore
    }
    return vids;
}

// Works by side-effect; Updates the varialbe "links"
iitk.cse.cs213.bytubed.buildLinksForVids = function buildLinksForVids(vids, links, processedVids)
{
    var iccb = iitk.cse.cs213.bytubed;
    var watchUrlPrefix =  iccb.watchUrlPrefix;
    
    try
    {
        if(!processedVids)
            processedVids = iccb.getVidsFromLinks(links);

        for(var j=0; j<vids.length; j++)
        {
            var vid = vids[j];
            // Need not allow duplicates here, because there are no display
            // titles available for non-anchor URLs.
            // See the anchors code block above

            // with yetToBeProcessed(), this function becomes a bit slower;
            // but the overall responsiveness increases.
            if(iccb.isValidVid(vid) && iccb.yetToBeProcessed(vid, processedVids))
            {
                var link    = document.createElement("a");
                link.href   = watchUrlPrefix + vid;
                links[links.length] = link;
                processedVids.push(vid);
            }
        }
    }
    catch(error)
    {
        // iccb.reportProblem(error, arguments.callee.name);
    }
};

// getMajorityLength: returns the mode of the lengths of the video-ids from links
iitk.cse.cs213.bytubed.getMajorityLength = function getMajorityLength(links)
{
    var iccb = iitk.cse.cs213.bytubed;
    
    /*
        Implementation of MJRTY algorithm of
        [Boyer, Moore: 1982] & [Fischer, Salzberg: 1982]
    */
    
    var majorityLength = 11;
    try
    {
        var vids = iccb.getVidsFromLinks(links);
        var counter = 0;
        for(var i=0; i<vids.length; i++)
        {
            var len = vids[i].length;
            if(counter == 0)
                majorityLength = len;
            else if(len == majorityLength)
                counter++;
            else
                counter--;
        }
    }
    catch(error)
    {
        // Ignore
    }
    return majorityLength;
};

// buildLinks builds anchors from contentDocument and clipboard
iitk.cse.cs213.bytubed.buildLinks = function buildLinks(contentDocument, links)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        if(links == null)
            links = new Array();
        
        var processedVids = new Array();
        
        /**
         *  Get all the anchors in the current page and append them to links.
         *  Anchors are handled specially, instead of getting just the vid
         *  through youTubePatterns, because innerHTML is useful as the default
         *  display title.
         */
         
        var anchors   = contentDocument.getElementsByTagName("a");
        
        for(var i=0; i<anchors.length; i++)
        {
            if(anchors[i].href)
            {
                var vid = '';
                
                if(iccb.isYouTubeLink(anchors[i].href))
                {
                    vid = iccb.getVidsFromText(anchors[i].href)[0];
                    if(iccb.isValidVid(vid))
                    {
                        // Allow duplicates so that the getTitleAndDisplayTitle
                        // method can choose the best diplay title
                        links[links.length] = anchors[i]; // This is special
                        processedVids.push(vid);
                    }
                }
                else if(anchors[i].href.indexOf('youtube.com/watch?') != -1)
                {
                    // To deal with cases like the following:
                    // http://www.youtube.com/watch?feature=player_embedded&v=U6Z6_sc9mLE
                    // in which "v=" appears not after "watch?", but at some random place.
                    vid = iccb.getParamsFromUrl(anchors[i].href)['v'];
                    iccb.buildLinksForVids([vid], links, processedVids);
                }
            }
        }
        
        // Some times anchor.href is not proper; but the title has a valid YouTube URL
        // Ex: <a title="http://www.youtube.com/watch?v=Y4MnpzG5Sqc" 
        //        href="http://t.co/zeZUtIeg">
        //          youtube.com/watch?v=Y4Mnpz...
        //     </a>
        for(i=0; i<anchors.length; i++)
        {
            if(anchors[i].title && iccb.isYouTubeLink(anchors[i].title))
            {
                var vids = iccb.getVidsFromText(anchors[i].title);
                iccb.buildLinksForVids(vids, links, processedVids);
            }
        }
        
        //var t1 = new Date().getTime();    // Let it be;
                                            // will use during development
        
        var innerHTML            = null;
        var getElementsByTagName = contentDocument.getElementsByTagName;
        
        try
        {
            if(getElementsByTagName("html") && getElementsByTagName("html")[0])
                innerHTML = getElementsByTagName("html")[0].innerHTML;
            else if(getElementsByTagName("HTML") && getElementsByTagName("HTML")[0])
                innerHTML = getElementsByTagName("HTML")[0].innerHTML;
        } catch(error) { /* Ignore */ }

        if(innerHTML)
        {
            /*
                Scan the current page HTML to see if there are any patterns
                that look like YouTube URLs even though they are not hyper
                links.
            */
            
            var vids = iccb.getVidsFromText(innerHTML);
            iccb.buildLinksForVids(vids, links, processedVids);
            
            /*
             *  There are certain videos on YouTube pages hiding behind span
             *  tags. Video IDs of such videos are present in the
             *  "data-video-ids" property. The block below tries to form YouTube
             *  'watch' links based on such tags.
             */
            var dvIDpattern  = /(")?(data-video-ids)(")?(\s)*=(\s)*"[^"]*"/ig;
            var dataVideoIds = innerHTML.match(dvIDpattern);
            if(dataVideoIds)
            {
                for(i=0; i<dataVideoIds.length; i++)
                {
                    var pattern = /(")?(data-video-ids)(")?(\s)*=(\s)*|"/g;
                    var dvids   = dataVideoIds[i].replace(pattern, "").split(",");

                    iccb.buildLinksForVids(dvids, links, processedVids);
                }
            }
            
            //var t2 = new Date().getTime(); // Let it be;
                                            //will use during development
            //alert(t2 - t1);

            /*
             *  The following code block is needed to deal with the case like
             *  the following.
             *
             *      Ex1: <b>youtube</b>.com/watch?v=_1MMn25iWmo<button ...>...
             *      Ex2: <em>youtube</em>.com/watch?<em>v</em>=co1CU3-Ms5Q.
             *
             *  We will need to get "_1MMn25iWmo" and "co1CU3-Ms5Q" in these
             *  cases respectively.
            */
            
            // t2 = new Date().getTime();
            var text = iccb.stripHTML(innerHTML, 3);
            vids = iccb.getVidsFromText(text);
            
            var majorityLength = 11; // iccb.getMajorityLength(links);  // getMajorityLength is slow
            for(i=0; i<vids.length; i++)
            {
                // Truncate the vids to the length of the most of the VIDs
                // so far.
                vids[i] = vids[i].substring(0, majorityLength);
            }
            iccb.buildLinksForVids(vids, links, processedVids);
            
            //var t3 = new Date().getTime();	// Let it be;
                                                // will use during development
            //alert(t3 - t2);
        }
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
};

iitk.cse.cs213.bytubed.getLinksFromClipboard = function getLinksFromClipboard(links)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        /*
         *  Build links from clipboard content as well; The following code block
         *  uses the code snippets from
         *  https://developer.mozilla.org/en/Using_the_Clipboard
         */
        
        var Cc          = Components.classes;
        var Ci          = Components.interfaces;
        var clipboard   = Cc["@mozilla.org/widget/clipboard;1"]
                            .getService(Components.interfaces.nsIClipboard);

        if(clipboard) try
        {
            var trans = Cc["@mozilla.org/widget/transferable;1"]
                          .createInstance(Ci.nsITransferable);
            
            if(trans)
            {
                var str       = new Object();
                var strLength = new Object();

                if(clipboard.hasDataMatchingFlavors(["text/html"], 1, clipboard.kGlobalClipboard))
                {
                    trans.addDataFlavor("text/html");
                    clipboard.getData(trans, clipboard.kGlobalClipboard);
                    trans.getTransferData("text/html", str, strLength);
                }
                else
                if(clipboard.hasDataMatchingFlavors(["text/unicode"], 1, clipboard.kGlobalClipboard))
                {
                    trans.addDataFlavor("text/unicode");
                    clipboard.getData(trans, clipboard.kGlobalClipboard);
                    trans.getTransferData("text/unicode", str, strLength);
                }

                if (str && str.value)
                {
                    str = str.value.QueryInterface(Ci.nsISupportsString);
                    var clipboardText = str.data.substring(0, strLength.value / 2);
                    
                    var vids = iccb.getVidsFromText(clipboardText);
                    
                    var processedVids   = iccb.getVidsFromLinks(links);
                    
                    var majorityLength =  11; // iccb.getMajorityLength(links); // getMajorityLength is slow
                    for(i=0; i<vids.length; i++)
                    {
                        // Truncate the vids to the length of the most of
                        // the VIDs so far.
                        vids[i] = vids[i].substring(0, majorityLength);
                    }
                    
                    iccb.buildLinksForVids(vids, links, processedVids);
                }
            }
        } catch(error) { /* Ignore */ }
    }
    catch(error)
    {
        // Ignore
    }
};

iitk.cse.cs213.bytubed.getLinksFromAllTabs = function getLinksFromAllTabs(browsers, currentDocument, links)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        for(var i=0; i<browsers.length; i++)
        {
            if(browsers[i].contentDocument != currentDocument)
                iccb.buildLinks(browsers[i].contentDocument, links);
        }
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
};

iitk.cse.cs213.bytubed.getTitleAndDisplayTitle = function getTitleAndDisplayTitle(link)
{
    var iccb = iitk.cse.cs213.bytubed;
    
    var title = "";
    var displayTitle = "";

    var stripSpace = function stripSpace(text)
    {
        return text.replace(/^\s*/, "").replace(/\s*$/, "");
    };

    try
    {
        var processTitle    = iccb.processTitle;
        var Cc              = Components.classes;
        var Ci              = Components.interfaces

        /*
         *  The following code tries to extract the video title from the span
         *  that surrounds the current link.
         */
        var spans = link.getElementsByTagName("span");
        for(var si=0; si<spans.length; si++)
        {
            // si stands for span index
            if(spans[si].hasAttribute("class") &&
                spans[si].getAttribute("class").indexOf("title") != -1)
            {
                if(spans[si].hasAttribute("title"))
                    title = spans[si].getAttribute("title");
                else
                    title = spans[si].innerHTML;

                displayTitle = iccb.stripHTML(title, 3);
                title = processTitle(displayTitle);
                break;
            }
        }

        if(!title || title.length == 0)
        {
            // in case title was null, set it to empty string.
            title = "";
            displayTitle = "";

            var images = link.getElementsByTagName("img");

            // ii stands for image index
            for(var ii=0; ii<images.length; ii++)
            {
                if(images[ii].hasAttribute("title"))
                    title = images[ii].getAttribute("title");
                else if(images[ii].hasAttribute("alt"))
                    title = images[ii].getAttribute("alt");

                displayTitle = iccb.stripHTML(title, 3);
                title = processTitle(displayTitle);

                if(title && title.length > 0)
                    break;
            }
        }

        title = stripSpace(title);

        if(title.length == 0 && link.title)
        {
            var text1 = link.title;
            displayTitle = iccb.stripHTML(text1, 3);
            title = processTitle(displayTitle);
        }

        title = stripSpace(title);

        if(title.length == 0)
        {
            var text = link.innerHTML;

            if(text)
            {
                displayTitle = iccb.stripHTML(text, 3);
                title = processTitle(displayTitle);
            }
        }

        if(iccb.hasUndesirablePatterns(title))
        {
            spans = link.getElementsByClassName("album-track-name");

            if(spans.length > 0)
            {
                var html     = spans[0].innerHTML;
                displayTitle = iccb.stripHTML(html, 3);
                title        = processTitle(displayTitle);
            }
        }
    }
    catch(error)
    {
        // Do nothing.
    }
    return [title, displayTitle];
};

iitk.cse.cs213.bytubed.selectionManager = {
    videoList: new Array(),
    destinationDirectory: null,
    invocationInfo: null,
    subtitleLanguageInfo: new Array(),
    aborting: false,
    locked: false,

    onLoad: function onLoad(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var selMgr  = iccb.selectionManager;
        
        try
        {
            // ---------------------- BEGIN Important ---------------------- //
            // Do thsese things in any case;
            // even if there are no YouTube links on this page!

            var prefs       = iccb.prefs;

            var chkd1 = document.getElementById("suppressErrors").checked;
            var chkd2 = document.getElementById("suppressWarnings").checked;
            iccb.suppressErrors     = chkd1;
            iccb.suppressWarnings   = chkd2;

            var destination = document.getElementById("destination");
            var dlMgr       = iccb.services.downloadManager;
            var destDir     = prefs.getCharPref("destinationDirectory");
            
            if(!destDir || destDir == "")
                destination.value   = dlMgr.userDownloadsDirectory.path;
            else
                destination.value   = iccb.utf8to16(destDir);
                
            var subtitleDest = document.getElementById("subtitleDest");
            var destDir1 = prefs.getCharPref("subtitleDest");
            if(!destDir1 || destDir1 == "")
                subtitleDest.value = destination.value;
            else
                subtitleDest.value = iccb.utf8to16(destDir1);
            
            // ----------------------- END Important ----------------------- //

            var currentDocument = window.arguments[0];
            var browsers        = window.arguments[1];
            
            var strings = document.getElementById("strings");
            var links   = new Array();
            
            var scanCB      = document.getElementById("scanClipboard").checked;
            var scanTabs    = document.getElementById("scanAllTabs").checked;
            var scanCurTabFirst = document.getElementById("scanCurTabFirst").checked;
            
            if(!scanTabs)
            {
                iccb.buildLinks(currentDocument, links);
            }
            else if(scanCurTabFirst)
            {  
                iccb.buildLinks(currentDocument, links);
                iccb.getLinksFromAllTabs(browsers, currentDocument, links);
            }
            else
            {
                iccb.getLinksFromAllTabs(browsers, null, links);
            }
            
            if(scanCB)
            {
                iccb.getLinksFromClipboard(links);
            }
            
            // If no YouTube links were found on 'this' page, alert the user
            // "No YouTube links were found on this page."
            if(links.length == 0)
            {
                
                var alrt = iccb.services.promptService.alert;
                var message = strings.getString("NoLinksOnPage");
                if(scanCB)
                    message += " " + strings.getString("NoLinksInClipboard");
                if(scanTabs)
                    message += " " + strings.getString("NoLinksInTabs");
                message += ".";
                
                alrt(null, "BYTubeD", message);

                selMgr.aborting = true;
                window.close();
            }
            else
            {
                var II      = iccb.InvocationInfo;

                var href    = currentDocument.location.href;
                selMgr.invocationInfo                   = new II();
                selMgr.invocationInfo.timeStamp         = new Date().toString();
                selMgr.invocationInfo.sourcePageUrl     = href;
                selMgr.invocationInfo.sourcePageTitle   = href;
                if(currentDocument.title && currentDocument.title.length > 0)
                    selMgr.invocationInfo.sourcePageTitle = currentDocument.title;
    
                var start = new Date().getTime(); // Let it be;
                                                // will use during development
                
                // populate the videoList before applying default fliters
                selMgr.buildVideoList(links); // works by side-effect
                selMgr.setStatus(selMgr.videoList.length +
                                " " + strings.getString("LinkCountOnPage"));

                var stop = new Date().getTime(); // Let it be;
                                                // will use during development
                                                
                var filter = document.getElementById("filter");
                filter.focus();

                selMgr.loadFlags();
                
                window.addEventListener('keypress', selMgr.keyPressed, true);

                window.addEventListener("resize", function(event) {
                    selMgr.manageWindow(event);
                }, false);

                iccb.readTextFromAddonDirectory("langList.js", "generated", selMgr.loadSubtitleLangs);
                iccb.readTextFromAddonDirectory("langList.js", "content", selMgr.loadSubtitleLangs);
                
                // alert(stop-start);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    loadFlags: function loadFlags()
    {
        var selMgr = iitk.cse.cs213.bytubed.selectionManager;
        
        selMgr.onSelectAll();
        selMgr.togglePrefetching();
        selMgr.toggleFormatDisabled();
        selMgr.toggleFetchSubtitles();
        selMgr.toggleTryOtherLanguages();
        selMgr.toggleScanTabs();
    },
    
    buildVideoList: function buildVideoList(links)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr  = iccb.selectionManager;
            var strings = document.getElementById("strings");

            var vidCount            = 0;
            var treeChildren        = document.getElementById("treeChildren");
            var prefetchingEnabled  = document.getElementById("prefetch").checked;

            for(var li=0; li<links.length; li++)
            {
                // li stands for link index
                links[li].href = unescape(links[li].href);

                // This is faster than getVidFromUrl
                // probably because of instruction caching.
                var curVid = iccb.getVidsFromText(links[li].href)[0];
                if(!curVid || curVid == "")
                    continue;

                var title = "";
                var displayTitle = "";

                var tNdt = iccb.getTitleAndDisplayTitle(links[li]);
                title = tNdt[0];
                displayTitle = tNdt[1];

                // Insert curVid in videoList if it is not already there.
                var found = false;
                var vi = 0;
                for(vi=0; vi<selMgr.videoList.length; vi++)
                    if(selMgr.videoList[vi].vid == curVid)
                    {
                        found = true;
                        break;
                    }
                
                if( found && !iccb.hasUndesirablePatterns(title) &&
                    selMgr.videoList[vi].title.length < title.length )
                {
                    document.getElementById("title"+vi)
                            .setAttribute("label", displayTitle);
                    selMgr.videoList[vi].title = title;
                    selMgr.videoList[vi].displayTitle = displayTitle;
                }

                if(displayTitle.length == 0 || iccb.hasUndesirablePatterns(displayTitle))
                {
                    displayTitle = strings.getString("Loading");
                    title = "";
                }

                if(found == false)
                {
                    selMgr.videoList[vidCount] = new iccb.YoutubeVideo(); // <- videoListManager.js

                    selMgr.videoList[vidCount].vid = curVid;
                    selMgr.videoList[vidCount].title = title;
                    selMgr.videoList[vidCount].displayTitle = displayTitle;

                    var ti = document.createElement("treeitem");
                    ti.setAttribute("id", "ti" + vidCount);

                    var tr = document.createElement("treerow");
                    tr.setAttribute("id", "tr" + vidCount);

                    var tc1 = document.createElement("treecell");
                    tc1.setAttribute("label", (vidCount+1) );
                    tc1.setAttribute("id", "sno" + vidCount );
                    tr.appendChild(tc1);

                    var tc2 = document.createElement("treecell");
                    tc2.setAttribute("label", displayTitle);
                    tc2.setAttribute("id", "title" + vidCount );
                    tr.appendChild(tc2);

                    var tc3 = document.createElement("treecell");
                    tc3.setAttribute("label", "Unknown");
                    tc3.setAttribute("id", "maxResolution" + vidCount );
                    tr.appendChild(tc3);

                    var tc4 = document.createElement("treecell");
                    tc4.setAttribute("label", "Unknown");
                    tc4.setAttribute("id", "maxQuality" + vidCount );
                    tr.appendChild(tc4);

                    var tc5 = document.createElement("treecell");
                    tc5.setAttribute("label", "Unknown");
                    tc5.setAttribute("id", "clipLength" + vidCount );
                    tr.appendChild(tc5);

                    ti.appendChild(tr);
                    treeChildren.appendChild(ti);

                    vidCount++;
                }

                // Prefetch when prefetchingEnabled or the title has
                // some undesirable patterns or title is too short
                if(!found && (prefetchingEnabled || iccb.hasUndesirablePatterns(title) || title.length < 4))
                {
                    selMgr.initiatePrefetching(selMgr, curVid);
                }
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    initiatePrefetching: function initiatePrefetching(selMgr, vid)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var videoInfoUrlPrefix  = iccb.videoInfoUrlPrefix;    // <- videoListManager.js
            var getIndexByKey       = iccb.getIndexByKey;         // <- globals.js
            var XHRManager          = iccb.XmlHttpRequestManager; // <- xmlHttpRequestManager.js
            
            // Check if the video was already prefetched before intiating prefetch
            var ind = getIndexByKey(selMgr.videoList, "vid", vid, function(x, y){return x==y;});
                    
            // Don't fetch again if it was already fetched.
            if(ind != -1 && !selMgr.videoList[ind].prefetched)
            {
                // Don't install a localErrorHanlder for these requests.
                // That will lead to failureDescription being non-null.
                // videoListManager checks for nullity of failureDescription
                // to issue requests.
                var xmlReq = new XHRManager(selMgr, selMgr.setTitleUsingInfo , null);
                xmlReq.doRequest("GET", videoInfoUrlPrefix + vid);
            }
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    setTitleUsingInfo: function setTitleUsingInfo(selMgr, info, url)
    {
        var iccb    = iitk.cse.cs213.bytubed;
        var strings = document.getElementById("strings");
        
        try
        {
            var localErrorHanlder = function localErrorHanlder(html, requestedUrl)
            {
                try
                {
                    var failureString = iccb.getFailureString(html);
                        
                    var vid = iccb.getParamsFromUrl(requestedUrl)["v"];
                    var ind = iccb.getIndexByKey(selMgr.videoList, "vid",
                                                 vid, function(x, y){return x==y;});
    
                    if(ind != -1)
                    {
                        selMgr.videoList[ind].failureDescription = failureString;
                        var display = "(" + iccb.stripHTML(failureString, 3) + ")";

                        if(selMgr.getValueAt(ind, "title") == strings.getString("Loading"))
                        {
                            selMgr.setValueAt(ind, "title", display);
                        }
                    }
                }
                catch(error)
                {
                    // Do nothing.
                }
            };

            var preprocessInfo  = iccb.preprocessInfo;
            var XHRManager      = iccb.XmlHttpRequestManager;
            var watchUrlPrefix  = iccb.watchUrlPrefix;

            var vid = url.split("video_id=")[1];
            var swf_map = preprocessInfo(info);

            if(swf_map["status"] == "fail")
            {
                var xmlReq = new XHRManager(selMgr, selMgr.setTitleUsingYouTubePageInfo, localErrorHanlder);
                xmlReq.doRequest("GET", watchUrlPrefix + vid);
            }
            else
            {
                var failureString = strings.getString("GenericFailureMessage");
                selMgr.setFieldsCommonCode(selMgr, vid, swf_map, failureString);
            }
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    setTitleUsingYouTubePageInfo: function setTitleUsingYouTubePageInfo( selMgr, html, url)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var vid = url.split("?v=")[1];
            var swf_map = iccb.processYouTubePage(html);
            var failureString = iccb.getFailureString(html);

            selMgr.setFieldsCommonCode(selMgr, vid, swf_map, failureString);
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    setFieldsCommonCode: function setFieldsCommonCode(selMgr, vid, swf_map, failureString)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var strings = document.getElementById("strings");
        
        try
        {
            var processTitle    = iccb.processTitle;
            var getIndexByKey   = iccb.getIndexByKey
            
            var ind = getIndexByKey(selMgr.videoList, "vid", vid, function(x, y){return x==y;});
        
            if(ind != -1)
            {
                if(swf_map["title"])
                {
                    var title = processTitle(swf_map["title"]);

                    selMgr.setValueAt(ind, "title", title);
                    selMgr.videoList[ind].title = title;
                }

                if(swf_map["display_title"])
                {
                    var displayTitle = swf_map["display_title"];
                    selMgr.videoList[ind].displayTitle = displayTitle;
                    selMgr.setValueAt(ind, "title", displayTitle);
                }

                if(swf_map["fmt_list"])
                {
                    var fmtMap          = iccb.fmtMap;
                    var fmt_list        = swf_map["fmt_list"].split(",");
                    
                    var maxResolution   = fmt_list[0].split("/")[1];
                    var maxQual         = fmtMap[fmt_list[0].split("/")[0]].quality;
                    
                    // var fType = fmtMap[fmt_list[0].split("/")[0]].fileType;

                    selMgr.setValueAt(ind, "maxResolution", maxResolution);
                    selMgr.setValueAt(ind, "maxQuality",  maxQual);
                                                // + " (" + fType + ")");
                }
                
                if(swf_map["length_seconds"])
                {
                    var zeroPad         = iccb.zeroPad;
                    var length_seconds  = parseInt(swf_map["length_seconds"]);
                    
                    var clipLength = "";
                    if(length_seconds > 3600)
                    {
                        var hh  = Math.floor(length_seconds / 3600);
                        clipLength += zeroPad(hh, 2) + ":";
                        length_seconds = length_seconds % (hh * 3600);
                    }
                    var mm = Math.floor(length_seconds / 60);
                    clipLength +=  zeroPad(mm, 2) + ":";
                    if(mm > 0)
                        length_seconds = length_seconds % (mm * 60);
                    clipLength += zeroPad(length_seconds, 2);
                    clipLength = clipLength.replace(/^0/g, "");
                    selMgr.setValueAt(ind, "clipLength", clipLength);
                }
                
                if(selMgr.videoList[ind])
                {
                    selMgr.videoList[ind].swfMap = swf_map;
                }

                if(!swf_map["url_encoded_fmt_stream_map"] ||
                    swf_map["url_encoded_fmt_stream_map"].indexOf("url") == -1)
                {
                    selMgr.videoList[ind].failureDescription = failureString;
                    var display =  "(" + failureString + ")";

                    if(selMgr.getValueAt(ind, "title") == strings.getString("Loading"))
                    {
                        selMgr.setValueAt(ind, "title", display);
                    }
                }
            }
            selMgr.videoList[ind].prefetched = true;
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    manageWindow: function manageWindow(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;
            if(document.getElementById("resizeWindow").checked)
            {
                selMgr.resizeWindow();
            }
            if(document.getElementById("centerWindow").checked)
            {
                selMgr.centerWindow();
            }
            if(document.getElementById("maintainAspectRatio").checked)
            {
                selMgr.maintainAspectRatio();
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    resizeWindow: function resizeWindow()
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            // This if block is an idea suggested by cadorn at
            // http://stackoverflow.com/questions/1030747/how-to-set-a-xulrunner-main-windows-minimum-size
            if(window.outerWidth < window.document.documentElement.minWidth ||
                window.outerHeight < window.document.documentElement.minHeight)
            {
                // Ensure that the minimum window size is maintained.
                window.resizeTo(window.document.documentElement.minWidth,
                                window.document.documentElement.minHeight);

                // Resize the window to fit the content. Suggested by Neil Lee
                window.sizeToContent();
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    centerWindow: function centerWindow()
    {
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            // This condition makes sure that we don't mess with "maximize"
            if(window.outerWidth < window.screen.availWidth &&
                window.outerHeight < window.screen.availHeight)
            {
                // Make sure the window size doesn't go beyond the available
                // screen size
                if(window.outerHeight > window.screen.availHeight)
                {
                    window.resizeTo(window.outerWidth, window.screen.availHeight);
                    window.moveTo(window.screenX, 0);
                }
                if(window.outerWidth > window.screen.availWidth)
                {
                    window.resizeTo(window.screen.availWidth, window.outerHeight);
                    window.moveTo(0, window.screenY);
                }

                // Make sure all the window content is always shown in the
                // view port by aligning window.center with screen.center
                var aw   = screen.availWidth;
                var ow   = window.outerWidth;
                var ah   = screen.availHeight;
                var oh   = window.outerHeight;

                var left = parseInt((aw/2) - (ow/2));
                var top  = parseInt((ah/2) - (oh/2));

                window.moveTo(left, top);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    maintainAspectRatio: function maintainAspectRatio()
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        // This function uses the idea suggested by paxdiablo at
        // http://stackoverflow.com/questions/1186414/whats-the-algorithm-to-calculate-aspect-ratio-i-need-an-output-like-43-169
        try
        {
            function gcd (a, b)
            {
                return (b == 0) ? a : gcd (b, a%b);
            }

            var sw = screen.width;
            var sh = screen.height;

            // cd = gcd of scree width and scree height
            var cd = gcd(sw, sh);

            // Lower bound for the sw:sh ratio
            var lb = (sw/cd + 1) / (sh/cd + 1);

            // Upper bound for the sw:sh ratio
            var ub = (sw/cd - 1) / (sh/cd - 1);

            var wc = sh/cd; // width component  = height / common_divisor
            var hc = sw/cd; // height component = width / common_divisor

            var widthHeightRatio = window.outerWidth/window.outerHeight;
            if(widthHeightRatio < lb || widthHeightRatio > ub)
            {
                var width = window.outerWidth;
                var height = window.outerHeight;

                // Don't change '<' to '>'
                // (that will lead to conflicts with minwidth and minheight)
                if(wc*window.outerWidth < hc*window.outerHeight)
                {
                    width   = hc*height/wc;
                }
                else
                {
                    height  = wc*width/hc;
                }
                window.resizeTo(width, height);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    // Subtitles related functions... 
    // loadSubtitleLangs: prepares iccb.langList by parsing text
    loadSubtitleLangs: function loadSubtitleLangs(text)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var selMgr = iccb.selectionManager;
        
        // Make sure text is non-empty
        if(text != null && text != "" && !selMgr.locked) try
        {
            selMgr.locked = true;
            // It's not a proper locking mechanism; but that's ok, not a problem.
            
            var lines = text.split("\n");
            iccb.langList = new Array();
            
            var str = "";
            for(var i=0; i<lines.length; i++)
            {
                var line =lines[i];
                var key = "";
                var record = new Array();
                if(line.indexOf(":") != -1)
                {
                    var parts = line.split("{");
                    key = parts[0].split(":")[0].replace(/\s/g, "");
                    
                    var keyValpairs = parts[1].split('}')[0].split(",");
                    for(var j=0; j<keyValpairs.length; j++)
                    {
                        parts = keyValpairs[j].split(":");
                        record[parts[0].replace(/\s/g, "")] = parts[1].replace(/"/g, "").replace(/^(\s)+|(\s)+$/, "");
                    }
                    
                    iccb.langList[key] = record;
                }
            }
            selMgr.loadDefaultSubtitleLanguages();
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    // loadDefaultSubtitleLanguages: loads the list of languages from langList <- subtitles.js
    loadDefaultSubtitleLanguages: function loadDefaultSubtitleLanguages()
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr              = iccb.selectionManager;
            var prefs               = iccb.prefs;
            
            var subtitleLangList    = document.getElementById("subtitleLangList");
            var secondaryLanguages  = document.getElementsByClassName("secondaryLanguage");
            
            var plc = new Array();  // previous lang_code preferences
            
            try
            {
                // Get the previous lang_code preferences
                plc.push(prefs.getCharPref("subtitleLangCode"));
                for(var i=0; i<secondaryLanguages.length; i++)
                    plc.push(prefs.getCharPref("subtitleLangCode" + (i+1)));
            } catch(error) { /* Ignore */ }
            
            // The following loop adds all language records to the four language selection lists
            selMgr.subtitleLanguageInfo = iccb.loadDefaultSubtitleLanguages(); // <- subtitles.js
            
            var langList = selMgr.subtitleLanguageInfo;
            for(var lang in langList)
            {
                var lc  = langList[lang].lang_code;
                
                if(lc == "und") continue;   // Unknown Language
                
                var lt  = langList[lang].lang_translated;
                var lo  = langList[lang].lang_original;
                
                var ltm = lt.split(" (")[0];
                var lcm = (lc + "-").split("-")[1] ;
                
                subtitleLangList.appendItem(lt, lc, lt == lo ? "" : lo);
                for(var i=0; i<secondaryLanguages.length; i++)
                {
                    secondaryLanguages[i].appendItem(ltm + " " + lcm, lc, "");
                }
            }
            
            try
            {
                // Restore previous selections.
                iccb.restoreSelectionByValue(subtitleLangList, plc[0]);
                for(var i=0; i<secondaryLanguages.length; i++)
                    iccb.restoreSelectionByValue(secondaryLanguages[i], plc[i+1]);
            } catch(error) { /* Ignore */ }
            
            if(document.getElementById("fetchSubtitles").checked)
            {
                selMgr.fetchSubtitleLangList();
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    showLangList: function showLangList(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;
            iccb._showSubtitleLanguageInfo(selMgr.subtitleLanguageInfo); // <- subtitles.js
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    // Fetch the list all languages in which closed captions (subtitles) are available
    fetchSubtitleLangList: function fetchSubtitleLangList()
    {
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            var selMgr = iccb.selectionManager;
            for(var i=0; i<selMgr.videoList.length; i++)
            {
                vid = selMgr.videoList[i].vid;
                selMgr.getSubtitleLangList(vid);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    getSubtitleLangList: function getSubtitleLangList(vid)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var XHRManager = iccb.XmlHttpRequestManager;
                            // Defined in xmlHttpRequestManager.js
            var selMgr = iccb.selectionManager;
            
            var xmlReq = new XHRManager(selMgr, selMgr.processSubtitleLangList, null);
            xmlReq.doRequest("GET", iccb.subtitleLangListURL.replace("VIDEO_ID", vid));
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    processSubtitleLangList: function processSubtitleLangList(previousBirth, xmlText, url)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var subtitleLanguageInfo    = previousBirth.subtitleLanguageInfo; 
            var subtitleLangList        = document.getElementById("subtitleLangList");
            var secondaryLanguages      = document.getElementsByClassName("secondaryLanguage");
            
            var oldLangCount = subtitleLanguageInfo.length;
            
            var curLangs = iccb.processSubtitleLangListGlobal(xmlText, subtitleLanguageInfo); // <- subtitles.js
            if(oldLangCount != subtitleLanguageInfo.length) // there was atleast one new language
            {
                //alert(oldLangCount + " -> " + subtitleLanguageInfo.length);
                var plc = new Array();
                
                plc[0] = subtitleLangList.selectedItem ? subtitleLangList.selectedItem.value : "";
                for(var i=0; i<secondaryLanguages.length; i++)
                    plc[i+1] = secondaryLanguages[i].selectedItem ? secondaryLanguages[i].selectedItem.value : "";
                 
                iccb.removeAllItems(subtitleLangList);
                for(var i=0; i<secondaryLanguages.length; i++)
                    iccb.removeAllItems(secondaryLanguages[i]);
                
                for(var i=0; i<subtitleLanguageInfo.length; i++)
                {
                    var lc  = subtitleLanguageInfo[i].lang_code;
                    
                    if(lc == "und") continue; // Unknown Language
                    
                    var lo  = subtitleLanguageInfo[i].lang_original;
                    var lt  = subtitleLanguageInfo[i].lang_translated;
                    
                    var ltm = lt.split(" (")[0];
                    var lcm = (lc + "-").split("-")[1];
     
                    subtitleLangList.appendItem(lt, lc, lt == lo ? "" : lo);
                    for(var j=0; j<secondaryLanguages.length; j++)
                        secondaryLanguages[j].appendItem(ltm + " " + lcm , lc, "");
                }
                
                // Restore previous selections.
                iccb.restoreSelectionByValue(subtitleLangList, plc[0]);
                for(var i=0; i<secondaryLanguages.length; i++)
                    iccb.restoreSelectionByValue(secondaryLanguages[i], plc[i+1]);
            }
            
            var vid = iccb.getParamsFromUrl(url)['v'];    // getParamsFromUrl <- globals.js
            var ind = iccb.getIndexByKey(previousBirth.videoList, "vid",
                                                     vid, function(x, y){return x==y;});
            if(ind != -1)
                previousBirth.videoList[ind].availableSubtitleLanguages = curLangs;
            
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    keyPressed: function keyPressed(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;

            if(event.keyCode == 13 && event.target.tagName != "button" && event.target.tagName != "menulist")
            {
                selMgr.onStart(event);
            }
            else if(
                    (event.target.tagName != "textbox" ||
                     event.target.value == "")
                        &&
                    (event.charCode == 65 || event.charCode == 97)
                        &&
                    event.ctrlKey)
            {
                document.getElementById("videoTitlesTree").view.selection
                                                               .selectAll();
            }
            else if(event.keyCode == event.DOM_VK_F1)
            {
                selMgr.onHelp(event);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onBrowse: function onBrowse(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var strings = document.getElementById("strings");
        
        try
        {
            var Cc  = Components.classes;
            var Ci  = Components.interfaces;
            var fp  = Cc["@mozilla.org/filepicker;1"]
                        .createInstance(Ci.nsIFilePicker);

            fp.init(window, strings.getString("SelectDestination"), 2);
            var result = fp.show();

            if(result == Ci.nsIFilePicker.returnOK)
            {
                destination = document.getElementById("destination");
                destination.value = fp.file.path;
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onBrowseSubtitles: function onBrowseSubtitles(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var strings = document.getElementById("strings");
        try
        {
            var Cc  = Components.classes;
            var Ci  = Components.interfaces;
            var fp  = Cc["@mozilla.org/filepicker;1"]
                        .createInstance(Ci.nsIFilePicker);

            fp.init(window, strings.getString("SelectDestinationForSubtitles"), 2);
            var result = fp.show();

            if(result == Ci.nsIFilePicker.returnOK)
            {
                destination = document.getElementById("subtitleDest");
                destination.value = fp.file.path;
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    onSelect: function onSelect(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var strings = document.getElementById("strings");
        
        try
        {
            var selMgr = iccb.selectionManager;
            var count = event.target.view.selection.count;

            if(selMgr.videoList.length > 0)
            {
                selMgr.setStatus(count + "/" +
                                 selMgr.videoList.length +
                                 " " + strings.getString("VideosSelected"));
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onStart: function onStart(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var strings = document.getElementById("strings");
        
        try
        {
            var selMgr              = iccb.selectionManager;
            var supportedQualities  = iccb.supportedQualities;
            var supportedFormats    = iccb.supportedFormats;
            
            var tree        = document.getElementById("videoTitlesTree");
            var selection   = tree.view.selection;

            var destination = document.getElementById("destination");
            selMgr.destinationDirectory = destination.value
                                                     .replace(/^\s*/, "")
                                                     .replace(/\s*$/, "");

            var Cc   = Components.classes;
            var Ci   = Components.interfaces;
            var file = Cc["@mozilla.org/file/local;1"]
                         .createInstance(Ci.nsILocalFile);

            try
            {
                file.initWithPath(selMgr.destinationDirectory);
            }
            catch(error)
            {
                selMgr.destinationDirectory = iccb.services.downloadManager
                                                           .userDownloadsDirectory.path;

                iccb.services.promptService.alert(window,
                    strings.getString("InvalidDestinationDirectory"),
                    strings.getString("InvalidDestinationDirectoryMessage"));

                return;
            }

            try
            {
                file.initWithPath(document.getElementById("subtitleDest").value);
            }
            catch(error)
            {
                iccb.services.promptService.alert(window,
                    strings.getString("InvalidSubtitleDestination"),
                    strings.getString("InvalidSubtitleDestinationMessage"));
                return;
            }
            
            var selCount = 0;
            var i = 0;

            var selectedVideoList = new Array();

            for(i=0; i<selMgr.videoList.length; i++)
            {
                selMgr.videoList[i].selected = selection.isSelected(i);
                if(selMgr.videoList[i].selected)
                {
                    selectedVideoList[selCount++] = selMgr.videoList[i];
                }
            }

            
            
            // Preferences section begins
            var preferences    = new iccb.Preferences();
            
            var i1 = document.getElementById("formatPreferenceNew").selectedIndex;
            var i2 = document.getElementById("qualityNew").selectedIndex;
            var i3 = document.getElementById("todo").selectedIndex;
            
            var c1 = document.getElementById("showDLWindow").checked;
            var c2 = document.getElementById("closeQStatusWindow").checked;
            var c3 = document.getElementById("preserveOrder").checked;
            var c4 = document.getElementById("generateFailedLinks").checked;
            var c5 = document.getElementById("generateWatchLinks").checked;
            var c6 = document.getElementById("generateBadLinks").checked;
            var c7 = document.getElementById("generateGoodLinks").checked;
            var c8 = document.getElementById("ignoreFileType").checked;
            var c9 = document.getElementById("fetchSubtitles").checked;
            
            // don't mess with c10 or worry about all occurences of c10 below.
            var c10 = document.getElementById("tryOtherLanguages").checked; 
            var c11 = document.getElementById("tryOtherDialects").checked;
            
            preferences.format              = supportedFormats[i1];
            preferences.quality             = supportedQualities[i2];
            preferences.todo                = i3;
            preferences.showDLWindow        = c1;
            preferences.closeQStatusWindow  = c2;
            preferences.preserveOrder       = c3;
            preferences.generateFailedLinks = c4;
            preferences.generateWatchLinks  = c5;
            preferences.generateBadLinks    = c6;
            preferences.generateGoodLinks   = c7;
            preferences.ignoreFileType      = c8;
            preferences.fetchSubtitles      = c9;
            // preferences.tryOtherLanguages   = c10; // this is not needed.
            
            preferences.tryOtherDialects = c11;
            
            preferences.destinationDirectory = selMgr.destinationDirectory; // Used in processing subtitles
            preferences.subtitleDest  = document.getElementById("subtitleDest").value;
            
            if(preferences.fetchSubtitles)
            {
                var subtitleLangList    = document.getElementById("subtitleLangList");
                
                if(subtitleLangList && subtitleLangList.selectedItem && subtitleLangList.selectedItem.value)
                    preferences.subtitleLangCodes[0] = subtitleLangList.selectedItem.value;
                
                var secondaryLanguages = document.getElementsByClassName("secondaryLanguage");
                
                for(var i=0; i<secondaryLanguages.length; i++)
                    if(secondaryLanguages[i].selectedItem && secondaryLanguages[i].selectedItem.value)
                        preferences.subtitleLangCodes[i+1] = c10? secondaryLanguages[i].selectedItem.value : "";
            }
            // Preferences section ends
            
            if(selCount > 0)
            {
                var proceed = true;
                if(selCount > 5 &&
                       preferences.todo == iccb.ENQUEUE_LINKS &&
                       iccb.suppressWarnings == false)
                {
                    var ps = iccb.services.promptService;

                    proceed = ps.confirm(
                            window,
                            strings.getString("NotGoodIdea"),
                            strings.getString("NotGoodIdeaMessage"));
                    // proceed is true if OK was pressed, false if cancel.
                }

                if(proceed)
                {
                    window.openDialog(
                        "chrome://BYTubeD/content/queueStatusManager.xul",
                        "queueingStatusManager" + (new Date()).getTime(),
                        "chrome,all,menubar=no,width=680,height=480,left=80,top=80",
                        selectedVideoList,
                        selMgr.destinationDirectory,
                        preferences,
                        selMgr.invocationInfo,
                        selMgr.subtitleLanguageInfo
                    );

                    window.close();
                }
            }
            else
            {
                iccb.services.promptService.alert(window,
                                                    strings.getString("Selection"),
                                                    strings.getString("NothingSelected"));
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    toggleFetchSubtitles: function toggleFetchSubtitles(event)
    {
        var iccb    = iitk.cse.cs213.bytubed;
        var selMgr  = iccb.selectionManager;
        try
        {
            var fetchingEnabled = document.getElementById("fetchSubtitles").checked;
            var tryingOtherLanguagesEnabled = document.getElementById("tryOtherLanguages").checked;
            
            document.getElementById("subtitleLangList").disabled = !fetchingEnabled;
            
            var secondaryLanguages = document.getElementsByClassName("secondaryLanguage");
            for(var i=0; i<secondaryLanguages.length; i++)
                secondaryLanguages[i].disabled = !fetchingEnabled || !tryingOtherLanguagesEnabled;
            
            document.getElementById("tryOtherLanguages").disabled = !fetchingEnabled;
            document.getElementById("tryOtherDialects").disabled = !fetchingEnabled;
            document.getElementById("subtitleDest").disabled = !fetchingEnabled;
            document.getElementById("browseSubtitles").disabled = !fetchingEnabled;
            
            if(fetchingEnabled)
                selMgr.fetchSubtitleLangList();
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    toggleTryOtherLanguages: function toggleTryOtherLanguages(event)
    {
        var iccb    = iitk.cse.cs213.bytubed;
        var selMgr  = iccb.selectionManager;
        try
        {
            var fetchingEnabled = document.getElementById("fetchSubtitles").checked;
            var tryingOtherLanguagesEnabled = document.getElementById("tryOtherLanguages").checked;
            
            var secondaryLanguages = document.getElementsByClassName("secondaryLanguage");
            for(var i=0; i<secondaryLanguages.length; i++)
                secondaryLanguages[i].disabled = !tryingOtherLanguagesEnabled || !fetchingEnabled;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    toggleScanTabs: function toggleScanTabs(event)
    {
        var iccb    = iitk.cse.cs213.bytubed;
        var selMgr  = iccb.selectionManager;
        try
        {
            var scanAllTabs = document.getElementById("scanAllTabs").checked;
            var scanCurTabFirst = document.getElementById("scanCurTabFirst");
            
            scanCurTabFirst.disabled = !scanAllTabs;
            
            if(!scanAllTabs)
                scanCurTabFirst.checked = true;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    toggleSuppression: function toggleSuppression(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            iccb.suppressErrors =
                    document.getElementById("suppressErrors").checked;
            iccb.suppressWarnings =
                    document.getElementById("suppressWarnings").checked;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    toggleFormatDisabled: function toggleFormatDisabled(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            document.getElementById("formatPreferenceNew").disabled =
                        document.getElementById("ignoreFileType").checked;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    toggleResAndQual: function toggleResAndQual(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var sRes        = document.getElementById("showResolution");
            var showRes     = !sRes.disabled && sRes.checked;

            var sQual       = document.getElementById("showQuality");
            var showQual    = !sQual.disabled && sQual.checked;

            document.getElementById("maxResolution").hidden = !showRes;
            document.getElementById("maxQuality").hidden    = !showQual;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    toggleClipLength: function toggleClipLength(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var sClipLen        = document.getElementById("showClipLength");
            var showClipLength  = !sClipLen.disabled && sClipLen.checked;
            
            document.getElementById("clipLength").hidden = !showClipLength;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    togglePrefetching: function togglePrefetching(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;
            var prefetchingEnabled = document.getElementById("prefetch").checked;

            document.getElementById("showResolution").disabled  = !prefetchingEnabled;
            document.getElementById("showQuality").disabled     = !prefetchingEnabled;
            document.getElementById("showClipLength").disabled  = !prefetchingEnabled;

            selMgr.toggleResAndQual(null);
            selMgr.toggleClipLength(null);

            if(prefetchingEnabled)
            {
                for(var i=0; i<selMgr.videoList.length; i++)
                    selMgr.initiatePrefetching(selMgr, selMgr.videoList[i].vid);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onCancel: function onCancel(event)
    {
        window.close();
    },

    onHelp: function onHelp(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var Cc = Components.classes;
            var Ci = Components.interfaces;
            var win = Cc['@mozilla.org/appshell/window-mediator;1']
                        .getService(Ci.nsIWindowMediator)
                        .getMostRecentWindow('navigator:browser');
            
            if(win)
                win.openUILinkIn(iccb.helpPageLink, 'tab');
            else
            {
                window.open("about:blank", "_old_window");      // opens firefox
                window.open(iccb.helpPageLink, "_old_window");  // opens helpPageLink
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onUnload: function onUnload(event)
    {
        var iccb   = iitk.cse.cs213.bytubed;
        var selMgr = iccb.selectionManager;
        
        try
        {
            /**
             * Persistance settings:
             *
             * Don't remove any of the following statements.
             * None of them is vacuous.
             */

            var checkboxes = document.getElementsByTagName("checkbox");
            for(var i=0; i<checkboxes.length; i++)
            {
                if(checkboxes[i].hasAttribute("persist") && 
                    checkboxes[i].getAttribute("persist") == "checked")
                {
                    checkboxes[i].setAttribute("checked", checkboxes[i].checked);
                }
            }
            
            var menuitems = document.getElementsByTagName("menuitem");
            for(var i=0; i<menuitems.length; i++)
            {
                if(menuitems[i].hasAttribute("persist") && 
                    menuitems[i].getAttribute("persist") == "selected")
                {
                    menuitems[i].setAttribute("selected", menuitems[i].selected);
                }
            }

            /*
                Save certain values in preferences
            */            
            var dest = document.getElementById("destination");
            iccb.prefs.setCharPref("destinationDirectory", iccb.utf16to8(dest.value));
            
            var subtitleLangList = document.getElementById("subtitleLangList");
            if(subtitleLangList && subtitleLangList.selectedItem && subtitleLangList.selectedItem.value)
                iccb.prefs.setCharPref("subtitleLangCode", subtitleLangList.selectedItem.value);
            
            var secondaryLanguages = document.getElementsByClassName("secondaryLanguage");
            for(var i=0; i<secondaryLanguages.length; i++)
                if(secondaryLanguages[i].selectedItem && secondaryLanguages[i].selectedItem.value)
                    iccb.prefs.setCharPref("subtitleLangCode" + (i+1), secondaryLanguages[i].selectedItem.value);

            var dest1 = document.getElementById("subtitleDest");
            iccb.prefs.setCharPref("subtitleDest", iccb.utf16to8(dest1.value));
            
            // Save the subtitle language list, if the window is not aborting.
            if(!selMgr.aborting)
                iccb.saveSubtitleLanguageInfo(selMgr.subtitleLanguageInfo);
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onSelectAll: function onSelectAll(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;

            if(document.getElementById("selectAll").checked)
                selMgr.applyFilter(".*");
            else
                selMgr.applyFilter(document.getElementById("filter").value);
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    applyFilter: function applyFilter(filterText)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;
            var tree = document.getElementById("videoTitlesTree");
            var selection = tree.view.selection;

            if(filterText == "")
            {
                selection.clearSelection();
                return;
            }

            var pattern = new RegExp(filterText, "i");

            var i = 0;
            for(i=0; i<selMgr.videoList.length; i++)
            {
                if(pattern.test(selMgr.videoList[i].displayTitle))
                {
                    if(!selection.isSelected(i))
                    {
                        selection.toggleSelect(i);
                    }
                }
                else if(selection.isSelected(i))
                {
                    selection.toggleSelect(i);
                }
            }

        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    onFilterChange: function onFilterChange(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var selMgr = iccb.selectionManager;

            var filterText = event.target.value.replace(/^\s+|\s+$/g,"");
            selMgr.applyFilter(filterText);
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    // The follwing section contains some DOM manipulation functions
    getValueAt: function(row, colId)
    {
        try
        {
            return document.getElementById(colId+row).getAttribute("label");
        }
        catch(error)
        {
            return "";
        }
    },

    setValueAt: function(row, colId, value)
    {
        try
        {
            document.getElementById(colId+row).setAttribute("label", value);
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    },

    setStatus: function(statusMessage)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            document.getElementById("status").label = statusMessage;
        }
        catch(error)
        {
            // iccb.reportProblem(error, arguments.callee.name);
        }
    }
    // End
};
/* ********************** END selectionManager CODE ********************** */