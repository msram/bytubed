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
IITK.CSE.CS213.BYTubeD.Preferences = function()
{
    this.format             = "flv";
    this.quality            = "720p";
    this.todo               = 0;

    this.preserveOrder      = false;
    this.ignoreFileType     = false;

    this.showDLWindow           = true;
    this.closeQStatusWindow     = false;
    this.suppressErrorMessages  = false;

    this.generateFailedLinks    = true;
    this.generateWatchLinks     = true;
    this.generateBadLinks       = false;
    this.generateGoodLinks      = false;
};

IITK.CSE.CS213.BYTubeD.InvocationInfo = function()
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

IITK.CSE.CS213.BYTubeD.helpPageLink = "http://msram.github.com/bytubed/help.html";

IITK.CSE.CS213.BYTubeD.undesirablePattern   =
    new RegExp( "^http|^<img|thumb|Back(\\s)+$|" +
                "play.all|view.comments|return.to|play.video|" +
                "sign.out|sign.in|switch.account|^(none)$", "i");

IITK.CSE.CS213.BYTubeD.youTubePatterns      =
    new RegExp( "(youtube\\.com\\/v\\/|\\/watch\\?(.)*v=|" +
                "youtube\\.com\\/embed\\/|\\/movie?v=|" +
                "youtu\\.be\\/|y2u\\.be\\/)([a-zA-Z0-9_-]+)", "ig");

IITK.CSE.CS213.BYTubeD.patternToBeRemoved   =
    new RegExp( "(youtube\\.com\\/v\\/|\\/watch\\?(.)*v=|" +
                "youtube\\.com\\/embed\\/|\\/movie?v=|" +
                "youtu\\.be\\/|y2u\\.be\\/)", "i");

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
IITK.CSE.CS213.BYTubeD.hasUndesirablePatterns = function hasUndesirablePatterns(str)
{
    try
    {
        return IITK.CSE.CS213.BYTubeD.undesirablePattern.test(str);
    }
    catch(error)
    {
        // Do nothing.
    }
    return false;
};

IITK.CSE.CS213.BYTubeD.isValidVid = function isValidVid(vid)
{
    try
    {
        return (vid && vid.length > 10 && ! /[^a-zA-Z0-9_-]/.test(vid));
    }
    catch(error)
    {
        // Do nothing.
    }
    return false;
};

IITK.CSE.CS213.BYTubeD.isYouTubeLink = function isYouTubeLink(link)
{
    try
    {
        return IITK.CSE.CS213.BYTubeD.youTubePatterns.test(link);
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
IITK.CSE.CS213.BYTubeD.getVidFromUrl = function getVidFromUrl(ytURL)
{
    try
    {
        return ytURL.replace(IITK.CSE.CS213.BYTubeD.patternToBeRemoved, "");
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
IITK.CSE.CS213.BYTubeD.getVidsFromText = function getVidsFromText(text)
{
    var vids = new Array();
    var patternToBeRemoved = IITK.CSE.CS213.BYTubeD.patternToBeRemoved;
    try
    {
        var results = text.match(IITK.CSE.CS213.BYTubeD.youTubePatterns);
        if(results)
        {
            for(var i=0; i<results.length; i++)
                vids.push(results[i].replace(patternToBeRemoved, ""));
        }
    }
    catch(error)
    {
        IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
    }

    return vids;
};

// buildLinks builds anchors from contentDocument and clipboard
IITK.CSE.CS213.BYTubeD.buildLinks = function buildLinks(contentDocument)
{
    var links           = new Array();	// Will store the links to be passed on
                                        // to selectionManager.xul

    var vidsOnThisPage	= new Array();	// Will store the vids of all YouTube
                                        // URLs on this page. Redundant but
                                        // improves speed.

    try
    {
        var isValidVid = IITK.CSE.CS213.BYTubeD.isValidVid;
        var isYouTubeLink = IITK.CSE.CS213.BYTubeD.isYouTubeLink;
        var getVidsFromText = IITK.CSE.CS213.BYTubeD.getVidsFromText;

        /**
         *  Get all the anchors in the current page and append them to links.
         *  Anchors are handled specially, instead of getting just the vid
         *  through youTubePatterns, because innerHTML is useful as the default
         *  display title.
         */
        var anchors   = contentDocument.getElementsByTagName("a");

        for(var i=0; i<anchors.length; i++)
        {
            if(anchors[i].href && isYouTubeLink(anchors[i].href))
            {
                var vid = getVidsFromText(anchors[i].href)[0];

                if(isValidVid(vid))
                {
                    // Allow duplicates so that the getTitleAndDisplayTitle
                    // method can choose the best diplay title
                    links[links.length] = anchors[i]; // This is special
                    vidsOnThisPage.push(vid);
                }
            }
        }

        /**
         * yetToBeProcessed searchs for vid in the global variable
         * vidsOnThisPage
         *
         * @return
         *      true, if vid was found in vidsOnThisPage;
         *      false, otherwise
         */
        var yetToBeProcessed = function yetToBeProcessed(vid)
        {
            return vidsOnThisPage.indexOf(vid) == -1;
        };

        // Uses the links created so far.
        var getMajorityLength = function getMajorityLength()
        {
            /*
                Implementation of MJRTY algorithm of
                [Boyer, Moore: 1982] & [Fischer, Salzberg: 1982]
            */
            var majorityLength = 11;
            var counter = 0;
            for(var i=0; i<links.length; i++)
            {
                var len = getVidsFromText(links[i].href)[0].length;
                if(counter == 0)
                    majorityLength = len;
                else if(len == majorityLength)
                    counter++;
                else
                    counter--;
            }
            return majorityLength;
        };

        // Works by side-effect; Updates the global varialbe "links"
        var buildAndPushLinkFor = function buildAndPushLinkFor(vids)
        {
            var watchUrlPrefix =  IITK.CSE.CS213.BYTubeD.watchUrlPrefix;

            for(var j=0; j<vids.length; j++)
            {
                var vid = vids[j];
                // Need not allow duplicates here, because there are no display
                // titles available for non-anchor URLs.
                // See the anchors code block above

                // with yetToBeProcessed(), this function becomes a bit slower;
                // but the overall responsiveness increases.
                if(isValidVid(vid) && yetToBeProcessed(vid))
                {
                    var link    = document.createElement("a");
                    link.href   = watchUrlPrefix + vid;
                    links[links.length] = link;
                    vidsOnThisPage.push(vid);
                }
            }
        };

        //var t1 = new Date().getTime();    // Let it be;
                                            // will use during development

        var innerHTML            = null;
        var getElementsByTagName = contentDocument.getElementsByTagName;

        if(getElementsByTagName("html"))
            innerHTML = getElementsByTagName("html")[0].innerHTML;
        else if(getElementsByTagName("HTML"))
            innerHTML = getElementsByTagName("HTML")[0].innerHTML;

        if(innerHTML)
        {
            /*
                Scan the current page HTML to see if there are any patterns
                that look like YouTube URLs even though they are not hyper
                links.
            */
            var vids = getVidsFromText(innerHTML);
            buildAndPushLinkFor(vids);

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
                    var sPattern    = /(")?(data-video-ids)(")?(\s)*=(\s)*|"/g;
                    var dvids       = dataVideoIds[i].replace(sPattern, "").split(",");

                    buildAndPushLinkFor(dvids);
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
            var text = innerHTML.replace(/<[^>]*>/g, "");
            vids = getVidsFromText(text);
            var majorityLength = getMajorityLength();
            for(i=0; i<vids.length; i++)
            {
                // Truncate the vids to the length of the most of the VIDs
                // so far.
                vids[i] = vids[i].substring(0, majorityLength);
            }
            buildAndPushLinkFor(vids);

            //var t3 = new Date().getTime();	// Let it be;
                                                // will use during development
            //alert(t3 - t2);
        }

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

                    var vids = getVidsFromText(clipboardText);
                    var majorityLength = getMajorityLength();
                    for(i=0; i<vids.length; i++)
                    {
                        // Truncate the vids to the length of the most of
                        // the VIDs so far.
                        vids[i] = vids[i].substring(0, majorityLength);
                    }

                    buildAndPushLinkFor(vids);
                }
            }
        } catch(error) { /* Ignore */ }
    }
    catch(error)
    {
        IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
    }

    return links;
};

IITK.CSE.CS213.BYTubeD.getTitleAndDisplayTitle = function getTitleAndDisplayTitle(link)
{
    var title = "";
    var displayTitle = "";

    var stripSpace = function stripSpace(text)
    {
        return text.replace(/^\s*/, "").replace(/\s*$/, "");
    };

    try
    {
        var processTitle    = IITK.CSE.CS213.BYTubeD.processTitle;
        var Cc              = Components.classes;
        var Ci              = Components.interfaces

        var scriptableUnescapeHTML = Cc["@mozilla.org/feed-unescapehtml;1"]
                                     .getService(Ci.nsIScriptableUnescapeHTML);

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

                displayTitle = scriptableUnescapeHTML.unescape(title);
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

                displayTitle = scriptableUnescapeHTML.unescape(title);
                title = processTitle(displayTitle);

                if(title && title.length > 0)
                    break;
            }
        }

        title = stripSpace(title);

        if(title.length == 0 && link.title)
        {
            var text1 = link.title;
            displayTitle = scriptableUnescapeHTML.unescape(text1);
            title = processTitle(displayTitle);
        }

        title = stripSpace(title);

        if(title.length == 0)
        {
            var text = link.innerHTML;

            if(text)
            {
                text = text.replace(/<[^>]*>/g,""); // Remove all HTML tags
                displayTitle = scriptableUnescapeHTML.unescape(text);
                title = processTitle(displayTitle);
            }
        }

        if(IITK.CSE.CS213.BYTubeD.hasUndesirablePatterns(title))
        {
            spans = link.getElementsByClassName("album-track-name");

            if(spans.length > 0)
            {
                var html     = spans[0].innerHTML;
                displayTitle = scriptableUnescapeHTML.unescape(html);
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

IITK.CSE.CS213.BYTubeD.selectionManager = {
    videoList: new Array(),
    destinationDirectory: null,
    invocationInfo: null,

    onLoad: function onLoad(event)
    {
        try
        {
            // ---------------------- BEGIN Important ---------------------- //
            // Do thsese things in any case;
            // even if there are no YouTube links on this page!

            var prefs       = IITK.CSE.CS213.BYTubeD.prefs;

            var chkd = document.getElementById("suppressErrorMessages").checked;
            IITK.CSE.CS213.BYTubeD.suppressErrorMessages = chkd;

            var destination = document.getElementById("destination");
            var dlMgr       = IITK.CSE.CS213.BYTubeD.services.downloadManager;
            var destDir     = prefs.getCharPref("destinationDirectory");
            
            if(!destDir || destDir == "")
                destination.value   = dlMgr.defaultDownloadsDirectory.path;
            else
                destination.value   = IITK.CSE.CS213.BYTubeD.utf8to16(destDir);
            // ----------------------- END Important ----------------------- //


            var contentDocument = window.arguments[0];
            var links = IITK.CSE.CS213.BYTubeD.buildLinks(contentDocument);

            // If no YouTube links were found on 'this' page, alert the user
            // "No YouTube links were found on this page."
            if(links.length == 0)
            {
                var alrt = IITK.CSE.CS213.BYTubeD.services.promptService.alert;
                alrt(null, "BYTubeD",
                "No YouTube links were found on this page or in the clipboard.");

                window.close();
            }
            else
            {
                //var start = new Date().getTime(); // Let it be;
                                                // will use during development

                var selMgr  = IITK.CSE.CS213.BYTubeD.selectionManager;
                var II      = IITK.CSE.CS213.BYTubeD.InvocationInfo;

                var href    = contentDocument.location.href;
                selMgr.invocationInfo                   = new II();
                selMgr.invocationInfo.timeStamp         = new Date().toString();
                selMgr.invocationInfo.sourcePageUrl     = href;
                selMgr.invocationInfo.sourcePageTitle   = href;
                if(contentDocument.title && contentDocument.title.length > 0)
                    selMgr.invocationInfo.sourcePageTitle = contentDocument.title;

                // populate the videoList before applying default fliters
                selMgr.buildVideoList(links); // works by side-effect
                selMgr.setStatus(selMgr.videoList.length +
                                " video links have been found on this page.");

                var filter = document.getElementById("filter");
                filter.focus();

                selMgr.onSelectAll(null);
                selMgr.toggleResAndQual(null);

                window.addEventListener('keypress', selMgr.keyPressed, true);

                window.addEventListener("resize", function(event) {
                    selMgr.manageWindow(event);
                }, false);

                //var stop = new Date().getTime(); // Let it be;
                                                // will use during development
                //alert(stop-start);
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    buildVideoList: function buildVideoList(links)
    {
        try
        {
            var selMgr                  = IITK.CSE.CS213.BYTubeD.selectionManager;
            var hasUndesirablePatterns  = IITK.CSE.CS213.BYTubeD.hasUndesirablePatterns;
            var getVidsFromText         = IITK.CSE.CS213.BYTubeD.getVidsFromText;
            var getTitleAndDisplayTitle = IITK.CSE.CS213.BYTubeD.getTitleAndDisplayTitle;
            var YoutubeVideo            = IITK.CSE.CS213.BYTubeD.YoutubeVideo;

            var vidCount            = 0;
            var treeChildren        = document.getElementById("treeChildren");
            var prefetchingEnabled  = document.getElementById("prefetch").checked;

            for(var li=0; li<links.length; li++)
            {
                // li stands for link index
                links[li].href = unescape(links[li].href);

                // This is faster than getVidFromUrl
                // probably because of instruction caching.
                var curVid = getVidsFromText(links[li].href)[0];
                if(curVid == "")
                    continue;

                var title = "";
                var displayTitle = "";

                var tNdt = getTitleAndDisplayTitle(links[li]);
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

                if( found && !hasUndesirablePatterns(title) &&
                    selMgr.videoList[vi].title.length < title.length )
                {
                    document.getElementById("title"+vi)
                            .setAttribute("label", displayTitle);
                    selMgr.videoList[vi].title = title;
                    selMgr.videoList[vi].displayTitle = displayTitle;
                }

                if(displayTitle.length == 0 || hasUndesirablePatterns(displayTitle))
                {
                    displayTitle = "Loading...";
                    title = "";
                }

                if(found == false)
                {
                    selMgr.videoList[vidCount] = new YoutubeVideo();

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
                    tc3.setAttribute("label", "Loading...");
                    tc3.setAttribute("id", "maxResolution" + vidCount );
                    tr.appendChild(tc3);

                    var tc4 = document.createElement("treecell");
                    tc4.setAttribute("label", "Loading...");
                    tc4.setAttribute("id", "maxQuality" + vidCount );
                    tr.appendChild(tc4);

                    ti.appendChild(tr);
                    treeChildren.appendChild(ti);

                    vidCount++;
                }

                // Prefetch when prefetchingEnabled or the title has
                // some undesirable patterns or title is too short
                if(!found && (prefetchingEnabled || hasUndesirablePatterns(title) || title.length < 4))
                {
                    selMgr.initiatePrefetching(selMgr, curVid);
                }
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    initiatePrefetching: function initiatePrefetching(selMgr, vid)
    {
        var videoInfoUrlPrefix = IITK.CSE.CS213.BYTubeD.videoInfoUrlPrefix;
                                // Defined in videoListManager.js

        var XHRManager = IITK.CSE.CS213.BYTubeD.XmlHttpRequestManager;
                            // Defined in xmlHttpRequestManager.js

        // Check if the video was already prefetched before intiating prefetch
        var ind = -1;
        for(ind=0;ind<selMgr.videoList.length;ind++)
            if(selMgr.videoList[ind].vid == vid)
                break;

        // Don't fetch again if it was already fetched.
        if(ind < selMgr.videoList.length && !selMgr.videoList[ind].prefetched)
        {
            // Don't install a localErrorHanlder for these requests.
            // That will lead to failureDescription being non-null.
            // videoListManager checks for nullity of failureDescription
            // to issue requests.
            var xmlReq = new XHRManager(selMgr, selMgr.setTitleUsingInfo , null, 1);
            xmlReq.doRequest("GET", videoInfoUrlPrefix + vid);
        }
    },

    setTitleUsingInfo: function setTitleUsingInfo(selMgr, info, url, pos)
    {
        try
        {
            var localErrorHanlder = function localErrorHanlder(html,
                                                                requestedUrl)
            {
                try
                {
                    if(IITK)
                    {
                        var failureString = IITK.CSE.CS213.BYTubeD.getFailureString(html)
                                                                  .replace(/^\s+|\s+$/g, '');
                        var vid = requestedUrl.split("v=")[1];
                        var ind = -1;

                        for(ind=0;ind<selMgr.videoList.length;ind++)
                            if(selMgr.videoList[ind].vid == vid)
                                break;

                        if(ind < selMgr.videoList.length)
                        {
                            selMgr.videoList[ind].failureDescription = failureString;
                            var display = "(" + failureString.replace(/<[^>]*>/g, "") + ")";

                            if(selMgr.getValueAt(ind, "title") == "Loading...")
                            {
                                selMgr.setValueAt(ind, "title", display);
                                selMgr.setValueAt(ind, "maxResolution", "Unknown");
                                selMgr.setValueAt(ind, "maxQuality", "Unknown");
                            }
                        }
                    }
                }
                catch(error)
                {
                    // Do nothing.
                }
            };

            var preprocessInfo  = IITK.CSE.CS213.BYTubeD.preprocessInfo;
            var XHRManager      = IITK.CSE.CS213.BYTubeD.XmlHttpRequestManager;
            var watchUrlPrefix  = IITK.CSE.CS213.BYTubeD.watchUrlPrefix;

            var vid = url.split("video_id=")[1];
            var swf_map = preprocessInfo(info);

            if(swf_map["status"] == "fail")
            {
                var xmlReq = new XHRManager(selMgr, selMgr.setTitleUsingYouTubePageInfo, localErrorHanlder);
                xmlReq.doRequest("GET", watchUrlPrefix + vid);
            }
            else
            {
                var failureString = "This video is not available for " +
                                    "download at this point of time.";
                selMgr.setFieldsCommonCode(selMgr, vid, swf_map, failureString);
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }

    },

    setTitleUsingYouTubePageInfo: function setTitleUsingYouTubePageInfo( selMgr, html, url, pos)
    {
        try
        {
            var vid = url.split("?v=")[1];
            var swf_map = IITK.CSE.CS213.BYTubeD.processYouTubePage(html);
            var failureString = IITK.CSE.CS213.BYTubeD.getFailureString(html)
                                                      .replace(/^\s+|\s+$/g, '');

            selMgr.setFieldsCommonCode(selMgr, vid, swf_map, failureString);
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    setFieldsCommonCode: function setFieldsCommonCode(selMgr, vid, swf_map, failureString)
    {
        try
        {
            var processTitle = IITK.CSE.CS213.BYTubeD.processTitle;
            var ind = -1;

            for(ind=0;ind<selMgr.videoList.length;ind++)
                if(selMgr.videoList[ind].vid == vid)
                    break;

            if(ind != selMgr.videoList.length)
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
                    var fmtMap          = IITK.CSE.CS213.BYTubeD.fmtMap;
                    var fmt_list        = swf_map["fmt_list"].split(",");
                    var maxResolution   = fmt_list[0].split("/")[1];

                    var maxQual  = fmtMap[fmt_list[0].split("/")[0]].quality;
                    // var fType = fmtMap[fmt_list[0].split("/")[0]].fileType;

                    selMgr.setValueAt(ind, "maxResolution", maxResolution);
                    selMgr.setValueAt(ind, "maxQuality",  maxQual);
                                                // + " (" + fType + ")");
                }

                if(selMgr.videoList[ind])
                {
                    selMgr.videoList[ind].swfMap = swf_map;
                }

                if(!swf_map["url_encoded_fmt_stream_map"] ||
                    swf_map["url_encoded_fmt_stream_map"].indexOf("url") != 0)
                {
                    selMgr.videoList[ind].failureDescription = failureString;
                    var display =  "(" + failureString + ")";

                    if(selMgr.getValueAt(ind, "title") == "Loading...")
                    {
                        selMgr.setValueAt(ind, "title", display);
                        selMgr.setValueAt(ind, "maxResolution", "Unknown");
                        selMgr.setValueAt(ind, "maxQuality", "Unknown");
                    }
                }
            }
            selMgr.videoList[ind].prefetched = true;
        }
        catch(error)
        {
            // Ignore
        }
    },

    manageWindow: function manageWindow(event)
    {
        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;
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
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }

    },

    resizeWindow: function resizeWindow()
    {
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
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    centerWindow: function centerWindow()
    {
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
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    maintainAspectRatio: function maintainAspectRatio()
    {
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
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    keyPressed: function keyPressed(event)
    {
        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;

            if(event.keyCode == 13 && event.target.tagName != "button")
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
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    onBrowse: function onBrowse(event)
    {
        try
        {
            var Cc  = Components.classes;
            var Ci  = Components.interfaces;
            var fp  = Cc["@mozilla.org/filepicker;1"]
                        .createInstance(Ci.nsIFilePicker);

            fp.init(window,
                    "Please select a destination folder for your downloads.",
                    2);
            var result = fp.show();

            if(result == Ci.nsIFilePicker.returnOK)
            {
                destination = document.getElementById("destination");
                destination.value = fp.file.path;
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    onPreferences: function onPreferences(event)
    {
        try
        {
            window.openDialog(
                    "chrome://BYTubeD/content/preferences.xul",
                    "BYTubeD-Preferences",
                    "chrome,centerscreen,all,menubar=no,width=680,height=510",
                    null);
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    onSelect: function onSelect(event)
    {
        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;
            var count = event.target.view.selection.count;

            if(selMgr.videoList.length > 0)
            {
                selMgr.setStatus(count + "/" +
                                 selMgr.videoList.length +
                                 " videos selected for download.");
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    onStart: function onStart(event)
    {
        try
        {
            var selMgr              = IITK.CSE.CS213.BYTubeD.selectionManager;
            var supportedQualities  = IITK.CSE.CS213.BYTubeD.supportedQualities;
            var supportedFormats    = IITK.CSE.CS213.BYTubeD.supportedFormats;

            var tree = document.getElementById("videoTitlesTree");
            var selection = tree.view.selection;

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
                this.destinationDirectory = IITK.CSE.CS213.BYTubeD.services
                                                .downloadManager
                                                .defaultDownloadsDirectory.path;

                IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
                    "Invalid Destination Directory",
                    "Please check the Destination field." +
                    "It must be a valid absolute path. If you don't know \n" +
                    "what that means, use the Browse button and select the " +
                    "destination directory.");

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

            var preferences    = new IITK.CSE.CS213.BYTubeD.Preferences();

            var i1 = document.getElementById("formatPreference").selectedIndex;
            var i2 = document.getElementById("quality").selectedIndex;
            var i3 = document.getElementById("todo").selectedIndex;
            var c1 = document.getElementById("showDLWindow").checked;
            var c2 = document.getElementById("closeQStatusWindow").checked;
            var c3 = document.getElementById("preserveOrder").checked;
            var c4 = document.getElementById("generateFailedLinks").checked;
            var c5 = document.getElementById("generateWatchLinks").checked;
            var c6 = document.getElementById("generateBadLinks").checked;
            var c7 = document.getElementById("generateGoodLinks").checked;
            var c8 = document.getElementById("ignoreFileType").checked;

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

            if(selCount > 0)
            {
                var proceed = true;
                if(selCount > 5 &&
                       preferences.todo == IITK.CSE.CS213.BYTubeD.ENQUEUE_LINKS)
                {
                    var ps = IITK.CSE.CS213.BYTubeD.services.promptService;

                    proceed = ps.confirm(
                            window,
                            "Not a good idea",
                            "\"What to do?\" = \"Enqueue for Download\" " +
                                "is not a good setting if you want " +
                                "to download more than 5 videos at a time. " +
                                "This will slow down the browser. " +
                                "\"Generate Links\" is the recommended setting. " +
                                "\n\nPress OK to enqueue anyway and " +
                                "Cancel to go back and set " +
                                "\"What to do?\" = \"Generate Links\".");

                    // proceed is true if OK was pressed, false if cancel.
                }

                if(proceed)
                {
                    window.openDialog(
                        "chrome://BYTubeD/content/queueingStatusManager.xul",
                        "queueingStatusManager" + (new Date()).getTime(),
                        "chrome,all,menubar=no,width=680,height=480,left=80,top=80",
                        selectedVideoList,
                        selMgr.destinationDirectory,
                        preferences,
                        selMgr.invocationInfo
                    );

                    window.close();
                }
            }
            else
            {
                IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
                                                                    "Selection",
                                                                    "You haven't selected anything!" +
                                                                    "Please select at least one video.");
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    toggleSuppression: function toggleSuppression(event)
    {
        try
        {
            IITK.CSE.CS213.BYTubeD.suppressErrorMessages =
                    document.getElementById("suppressErrorMessages").checked;
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    toggleFormatDisabled: function toggleFormatDisabled(event)
    {
        try
        {
            document.getElementById("formatPreference").disabled =
                        document.getElementById("ignoreFileType").checked;
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    toggleResAndQual: function toggleResAndQual(event)
    {
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
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    togglePrefetching: function togglePrefetching(event)
    {
        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;
            var prefetchingEnabled = document.getElementById("prefetch").checked;

            document.getElementById("showResolution").disabled  = !prefetchingEnabled;
            document.getElementById("showQuality").disabled     = !prefetchingEnabled;

            selMgr.toggleResAndQual(null);

            if(prefetchingEnabled)
            {
                for(var i=0; i<selMgr.videoList.length; i++)
                    selMgr.initiatePrefetching(selMgr, selMgr.videoList[i].vid);
            }
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    onCancel: function onCancel(event)
    {
        window.close();
    },

    onHelp: function onHelp(event)
    {
        var Cc = Components.classes;
        var Ci = Components.interfaces;
        var win = Cc['@mozilla.org/appshell/window-mediator;1']
                    .getService(Ci.nsIWindowMediator)
                    .getMostRecentWindow('navigator:browser');
        win.openUILinkIn(IITK.CSE.CS213.BYTubeD.helpPageLink, 'tab');
    },

    onUnload: function onUnload(event)
    {
        try
        {
            /**
             * Persistance settings:
             *
             * Don't remove any of the following statements.
             * None of them is vacuous.
             */

            document.getElementById("showDLWindow")
                    .setAttribute("checked", document.getElementById("showDLWindow").checked);

            document.getElementById("closeQStatusWindow")
                    .setAttribute("checked", document.getElementById("closeQStatusWindow").checked);

            document.getElementById("suppressErrorMessages")
                    .setAttribute("checked", document.getElementById("suppressErrorMessages").checked);

            document.getElementById("showResolution")
                    .setAttribute("checked", document.getElementById("showResolution").checked);

            document.getElementById("showResolution")
                    .setAttribute("disabled", document.getElementById("showResolution").disabled);

            document.getElementById("showQuality")
                    .setAttribute("checked", document.getElementById("showQuality").checked);

            document.getElementById("showQuality")
                    .setAttribute("disabled", document.getElementById("showQuality").disabled);

            document.getElementById("resizeWindow")
                    .setAttribute("checked", document.getElementById("resizeWindow").checked);

            document.getElementById("centerWindow")
                    .setAttribute("checked", document.getElementById("centerWindow").checked);

            document.getElementById("maintainAspectRatio")
                    .setAttribute("checked", document.getElementById("maintainAspectRatio").checked);

            document.getElementById("generateFailedLinks")
                    .setAttribute("checked", document.getElementById("generateFailedLinks").checked);

            document.getElementById("generateWatchLinks")
                    .setAttribute("checked", document.getElementById("generateWatchLinks").checked);

            document.getElementById("generateBadLinks")
                    .setAttribute("checked", document.getElementById("generateBadLinks").checked);

            document.getElementById("generateGoodLinks")
                    .setAttribute("checked", document.getElementById("generateGoodLinks").checked);

            document.getElementById("preserveOrder")
                    .setAttribute("checked", document.getElementById("preserveOrder").checked);

            document.getElementById("ignoreFileType")
                    .setAttribute("checked", document.getElementById("ignoreFileType").checked);

            document.getElementById("prefetch")
                    .setAttribute("checked", document.getElementById("prefetch").checked);

            document.getElementById("selectAll")
                    .setAttribute("checked", document.getElementById("selectAll").checked);

            document.getElementById("formatPreference")
                    .setAttribute("disabled", document.getElementById("formatPreference").disabled);

            document.getElementById("quality")
                    .setAttribute("disabled", document.getElementById("quality").disabled);

            document.getElementById("mp4")
                    .setAttribute("selected", document.getElementById("mp4").selected);

            document.getElementById("flv")
                    .setAttribute("selected", document.getElementById("flv").selected);

            document.getElementById("webm")
                    .setAttribute("selected", document.getElementById("webm").selected);

            document.getElementById("p240")
                    .setAttribute("selected", document.getElementById("p240").selected);

            document.getElementById("p360")
                    .setAttribute("selected", document.getElementById("p360").selected);

            document.getElementById("p480")
                    .setAttribute("selected", document.getElementById("p480").selected);

            document.getElementById("p720")
                    .setAttribute("selected", document.getElementById("p720").selected);

            document.getElementById("p1080")
                    .setAttribute("selected", document.getElementById("p1080").selected);

            document.getElementById("original")
                    .setAttribute("selected", document.getElementById("original").selected);

            document.getElementById("genLinks")
                    .setAttribute("selected", document.getElementById("genLinks").selected);

            document.getElementById("nqLinks")
                    .setAttribute("selected", document.getElementById("nqLinks").selected);

            var dest = document.getElementById("destination");
            
            IITK.CSE.CS213.BYTubeD.prefs.setCharPref("destinationDirectory", IITK.CSE.CS213.BYTubeD.utf16to8(dest.value));
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    onSelectAll: function onSelectAll(event)
    {

        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;

            if(document.getElementById("selectAll").checked)
                selMgr.applyFilter(".*");
            else
                selMgr.applyFilter(document.getElementById("filter").value);
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    },

    applyFilter: function applyFilter(filterText)
    {
        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;
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
            // Ignore
        }
    },

    onFilterChange: function onFilterChange(event)
    {
        try
        {
            var selMgr = IITK.CSE.CS213.BYTubeD.selectionManager;

            var filterText = event.target.value.replace(/^\s+|\s+$/g,"");
            selMgr.applyFilter(filterText);
        }
        catch(error)
        {
            // Ignore
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
            // Ignore
        }
    },

    setStatus: function(statusMessage)
    {
        try
        {
            document.getElementById("status").label = statusMessage;
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    }
    // End
};
/* ********************** END selectionManager CODE ********************** */