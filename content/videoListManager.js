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

// YoutubeVideo is an ADT that encapsulates some properties related to a YouTube video
// in the context of BYTubeD.
IITK.CSE.CS213.BYTubeD.YoutubeVideo = function()
{
    this.vid                = "";
    this.title              = "";
    this.displayTitle       = "";

    this.prefetched         = false;    // Set to TRUE when prefetched.

    this.availableFormats               = new Array();
    
    this.videoURL           = "";       // This is the downloadable URL of this video.

    this.selected           = false;    // Set by selectionManager to indicate that
                                        // this video needs to downloaded.
    this.bestMatchFormat    = "";       // This is the preferred file format (Ex: .mp4) for this video.

    this.videoQuality       = "";		// Used in the quality column on the generated links page
    
    this.availableSubtitleLanguages = null;    // Array of language records in which subtitles are available for this video
                                                // indexed by lang_code
    this.actualPrefLang             = null;
    this.actualPrefLangName         = null;
    this.fetchedLangName            = null;

    this.failureDescription = null;

    this.swfMap             = null;
    this.expiryTime         = null;

    this.author             = "";
    this.resolution         = "";
};
// End of YoutubeVideo ADT definition.

// Some YouTube URLs
IITK.CSE.CS213.BYTubeD.watchUrlPrefix       = "https://www.youtube.com/watch?v=";
IITK.CSE.CS213.BYTubeD.videoInfoUrlPrefix   = "https://www.youtube.com/get_video_info?video_id=";

// supportedFormats and supportedQualities are to be listed in the same order
// as they are shown to the user in the respective fields
IITK.CSE.CS213.BYTubeD.supportedFormats     = ["flv", "mp4", "webm", "3gp"];
IITK.CSE.CS213.BYTubeD.supportedQualities   = ["144p", "240p", "360p", "480p", "720p", "1080p", "Original"];

/**
 * fmtMap is a dictionary that maps itags to (fileType, resolution, quality)
 * Compute the resolution of "38" dynamically.
 **/

IITK.CSE.CS213.BYTubeD.fmtMap = {
    "5" :   {fileType: "flv",   resolution: "400x226",      quality: "240p",        color: "black"},
    "17":   {fileType: "3gp",   resolution: "",             quality: "144p",        color: "gray"},
    "18":   {fileType: "mp4",   resolution: "480x360",      quality: "360p",        color: "green"},
    "22":   {fileType: "mp4",   resolution: "1280x720",     quality: "720p",        color: "purple"},
    "34":   {fileType: "flv",   resolution: "640x360",      quality: "360p",        color: "green"},
    "35":   {fileType: "flv",   resolution: "854x480",      quality: "480p",        color: "lightblue"},
    "36":   {fileType: "3gp",   resolution: "",             quality: "240p",        color: "black"},
    "37":   {fileType: "mp4",   resolution: "1920x1080",    quality: "1080p",       color: "pink"},
    "38":   {fileType: "mp4",   resolution: "",             quality: "Original",    color: "red"},
    "43":   {fileType: "webm",  resolution: "640x360",      quality: "360p",        color: "green"},
    "44":   {fileType: "webm",  resolution: "854x480",      quality: "480p",        color: "lightblue"},
    "45":   {fileType: "webm",  resolution: "1280x720",     quality: "720p",        color: "purple"},
    "46":   {fileType: "webm",  resolution: "1920x1080",    quality: "1080p",       color: "pink"},
    "82":   {fileType: "mp4",   resolution: "640x360",      quality: "360p",        color: "green"},
    "84":   {fileType: "mp4",   resolution: "1280x720",     quality: "720p",        color: "purple"}
};

IITK.CSE.CS213.BYTubeD.requiredParams = ["upn", "sparams", "fexp", "ms", "itag", "ipbits", "signature", 
    "sig", "mv", "sver", "mt", "ratebypass", "source", "expire", "key", "ip", "cp", "id", "gcr", "fallback_host",
    "algorithm", "newshard", "burst", "factor"];

// =====================================================================================================

// YouTube video utilities.

IITK.CSE.CS213.BYTubeD.processTitle = function processTitle(title)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        if(!title)
            return "";

        title = iccb.stripHTML(title);

        title = title.replace(/^(\s)*|(\s)*$/g, "")    // Strip off white spaces
                     .replace(/(&lt;)|(&gt;)|"/g, "")  // replace < >
                     .replace(/&#39;|'|&quot;/g, "")   // " and ' by nothing
                     .replace(/[\\\/!|:?]/g, " - ")    // replace {/, |, ?, \} by " - "
                     .replace(/[*#<>%$]/g, " ")        // replace {*, #, <, >, %, $} by a single space.
                     .replace(/\+/g, " plus ")         // replace '+' by "plus ". (e.g. "C++" by "C plus plus"
                     .replace(/&/g, " and ")           // replace &amp; by " and "
                     .replace(/(\s)+/g, " ")           // replace multiple white-spaces by a single space
                     .replace(/-\s-/g, "-")            // replace all double hyphens by a single hyphen.
                    ;
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }

    return title;
};

// preprocessInfo constructs swf_map based on the junk content in video_info
// swf_map is equivalent to SWF_ARGS in a YouTube page source.
IITK.CSE.CS213.BYTubeD.preprocessInfo = function preprocessInfo(video_info)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    var swf_map = {};
    try
    {
        var components  = video_info.replace(/%2C/g,",").replace(/<[^>]*>/g, ".").split('&');

        var i=0;
        for(i=0; i<components.length; i++)
        {
            var key     = unescape(components[i]).substring(0, components[i].indexOf("="));
            var value   = unescape(components[i]).slice(key.length+1);

            swf_map[key] = value.replace(/\+/g, " ");

            if(key == "title")
            {
                swf_map[key] = iccb.utf8to16(swf_map[key]);

                if(value.indexOf("+++") != -1)  // If title contains "++ " handle it seperately.
                    return {"status": "fail"};

                swf_map["display_title"] = iccb.stripHTML(swf_map[key]);
            }
        }
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
    return swf_map;
};

// processYouTubePage takes the HTML source of a YouTube page and returns swf_map
// containing title, author, fmt_list and url_encoded_fmt_stream_map
IITK.CSE.CS213.BYTubeD.processYouTubePage =  function processYouTubePage(html)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    var swf_map = {};

    try
    {
        var i1 = html.indexOf("<title>") + 7;
        var i2 = html.indexOf("</title>");
        var title = unescape(html.substring(i1, i2));

        swf_map["display_title"] = iccb.stripHTML(title).replace("YouTube -", "").replace("- YouTube", "");

        title = IITK.CSE.CS213.BYTubeD.processTitle(title);

        var argsString = "";
        var argsStringMatch = html.match(/\"args\":\s*\{.*\},/);
        if(argsStringMatch)
        {
            argsString = argsStringMatch[0];
            var i1 = argsString.indexOf("args\":") + 8;
            var i2 = argsString.indexOf("},", i1);
            argsString = argsString.substring(i1, i2).replace(/\\\//g, "/").replace(/\\u0026/g, "&");
        }
        else
            return swf_map;

        var keyValPairs = argsString.split(", \"");

        var fmt_list = "";
        var url_encoded_fmt_stream_map = "";
        var length_seconds = "Unknown";

        var author = "";
        var authIndex1 = argsString.indexOf("author=");
        var authIndex2 = argsString.indexOf("&", authIndex1);
        if( authIndex1 != -1 && authIndex2 != -1)
        {
            author = argsString.substring(authIndex1 + 7, authIndex2);
        }

        for(var i=0; i<keyValPairs.length; i++)
        {
            var key = keyValPairs[i].split(": ")[0];
            var val = keyValPairs[i].split(": ")[1];

            key = key.replace(/\"/g, "");
            val = val.replace("\",", "").replace(/\"/g, "");

            if(key.indexOf("fmt_list") != -1)
                fmt_list = val;

            if(key.indexOf("url_encoded_fmt_stream_map") != -1)
            {
                url_encoded_fmt_stream_map = val.replace(/\\\//g, "/").replace(/\\u0026/g, "&");
            }
            
            if(key.indexOf("length_seconds") != -1)
                length_seconds = val;
        }

        swf_map["title"] = title;
        swf_map["author"] = author;
        swf_map["fmt_list"] = fmt_list;
        swf_map["length_seconds"] = length_seconds;
        swf_map["url_encoded_fmt_stream_map"] = url_encoded_fmt_stream_map;
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }

    return swf_map;
};

// getFailureString(youTubePageHTML)
IITK.CSE.CS213.BYTubeD.getFailureString = function getFailureString(aHTMLString)
{
    var failureString = "";
    var iccb = IITK.CSE.CS213.BYTubeD;
    if(aHTMLString && aHTMLString != "") try
    {
        var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                               .createInstance(Components.interfaces.nsIDOMParser);
        
        var htmlDoc = parser.parseFromString(aHTMLString, "text/html");
        
        if(htmlDoc.getElementsByClassName("verify-age").length > 0)
        {
            failureString = htmlDoc.getElementsByClassName("verify-age")[0].innerHTML;
        }

        if(htmlDoc.getElementById("unavailable-message"))
        {
            failureString = htmlDoc.getElementById("unavailable-message").innerHTML;
        }
        
        // Remove anchors from failureString.
        failureString = failureString.replace(/<a [^>]*>/ig, "").replace(/<\/a(\s|\n)*>/ig, "");
    }
    catch(error)
    {
        // iccb.reportProblem(error, arguments.callee.name);
    }

    if(failureString == "")
            failureString = "This video is not available for download at this point of time.";
            
    return failureString;
};

// End of YouTube utilities.

// =====================================================================================================

// VideoListManager is an abstract data type that encapsulates the process of
// making downloadble video URLs from /watch? URLs.
IITK.CSE.CS213.BYTubeD.VideoListManager = function(callerObject,
                                                    callBack,
                                                    errorHandler,
                                                    videoList,
                                                    preferences,
                                                    subtitleLanguageInfo)
{
    this.callerObject   = callerObject;
    this.videoList      = videoList;
    this.preferences    = preferences;
    this.callBack       = callBack;
    this.errorHandler   = errorHandler;

    this.subtitleLanguageInfo = subtitleLanguageInfo;
    
    this.processVideoList = function processVideoList()
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var videoInfoUrlPrefix      = iccb.videoInfoUrlPrefix;
            var XmlHttpRequestManager   = iccb.XmlHttpRequestManager;

            var infoUrls = new Array();
            var i=0;
            for(i= 0; i<this.videoList.length; i++)
            {
                infoUrls[i] = videoInfoUrlPrefix + this.videoList[i].vid;
            }

            var videoRequestManager = new XmlHttpRequestManager(this, this.processInfoAndCallBack,
                                                                 this.errorHandler);
            
            for(i=0;i<this.videoList.length;i++)
            {
                if(this.videoList[i].displayTitle == "Loading...")
                    this.videoList[i].displayTitle = this.videoList[i].vid;
                
                if(this.videoList[i].failureDescription) // If already tried and failed
                {
                    var message = this.videoList[i].failureDescription;
                    if(message.replace(/<[^>]*>/g, "").match(/"[^"]*"/))
                    {
                        var newTitle = message.replace(/<[^>]*>/g, "").match(/"[^"]*"/)[0].replace(/"/g, "");
                        if(this.videoList[i].displayTitle.length < newTitle.length)
                            this.videoList[i].displayTitle = newTitle;
                        message = message.replace(/^(\s|\n)+/g, "");
                        this.errorHandler(message);
                    }
                    else
                        this.errorHandler("\"" + this.videoList[i].displayTitle + "\" -- " + message);
                }
                else if(this.videoList[i].swfMap)   // If prefetched
                {
                    if(this.videoList[i].swfMap["url_encoded_fmt_stream_map"] 
                        && this.videoList[i].swfMap["url_encoded_fmt_stream_map"].indexOf("url") != -1
                        )
                    {
                        this.processInfo(this.videoList[i].swfMap, infoUrls[i], i);
                        this.callBack(this.callerObject, i);
                    }
                    else
                    {
                        this.videoList[i].failureDescription = "This video is not available for download at this point of time.";
                        this.errorHandler("\"" + this.videoList[i].displayTitle + "\" -- This video is not available for download at this point of time.");
                    }
                }
                else
                    videoRequestManager.doRequest("GET", infoUrls[i]);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    };

    this.processInfoAndCallBack = function processInfoAndCallBack(previousBirth, info, url)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var watchUrlPrefix          = iccb.watchUrlPrefix;
            var XmlHttpRequestManager   = iccb.XmlHttpRequestManager;
            var preprocessInfo          = iccb.preprocessInfo;
            var getParamsFromUrl        = iccb.getParamsFromUrl;
            var getIndexByKey           = iccb.getIndexByKey;

            var swf_map = preprocessInfo(info);

            var video_id = getParamsFromUrl(url)["video_id"];
            
            var index = getIndexByKey(previousBirth.videoList, "vid",
                                                    video_id, function(x, y){return x==y;});
            
            if(swf_map["status"] != "ok"
                || !swf_map["url_encoded_fmt_stream_map"]
                || swf_map["url_encoded_fmt_stream_map"] == ""
                || swf_map["url_encoded_fmt_stream_map"].indexOf("url") == -1
                )
            {
                var vid = previousBirth.videoList[index].vid;
                var videoUrl = watchUrlPrefix + vid;

                var localErrorHandler = function localErrorHandler(aHTMLString, requestedUrl)
                {
                    var iccb = IITK.CSE.CS213.BYTubeD;
                    try
                    {
                        var message = iccb.getFailureString(aHTMLString);

                        previousBirth.videoList[index].failureDescription = message;

                        if(message.replace(/<[^>]*>/g, "").match(/"[^"]*"/))
                        {
                            var newTitle = message.replace(/<[^>]*>/g, "")
                                                  .match(/"[^"]*"/)[0]
                                                  .replace(/"/g, "");

                            if(previousBirth.videoList[index].displayTitle.length < newTitle.length)
                                previousBirth.videoList[index].displayTitle = newTitle;

                            message = message.replace(/^(\s|\n)+/g, "");
                            previousBirth.errorHandler(message);
                        }
                        else
                            previousBirth.errorHandler("\"" + previousBirth.videoList[index].displayTitle +
                                                        "\" -- " + message);
                    }
                    catch(error)
                    {
                        // Do nothing.
                    }
                };

                var youTubePageHandler = function youTubePageHandler(pb, html, dummyVar1, dummyVar2)
                {
                    var iccb = IITK.CSE.CS213.BYTubeD;
                    try
                    {
                        swf_map = iccb.processYouTubePage(html);

                        if(swf_map && swf_map["url_encoded_fmt_stream_map"]
                                && swf_map["url_encoded_fmt_stream_map"] != ""
                                && swf_map["url_encoded_fmt_stream_map"].indexOf("url") != -1
                            )
                        {
                            pb.processInfo(swf_map, url, index);
                            pb.callBack(pb.callerObject, index);
                        }
                        else
                        {
                            var failureString = iccb.getFailureString(html);
                            pb.videoList[index].failureDescription = failureString;

                            if(swf_map && swf_map["display_title"])
                                pb.videoList[index].displayTitle = swf_map["display_title"];

                            pb.errorHandler("\"" + pb.videoList[index].displayTitle + "\" -- " + failureString);
                        }
                    }
                    catch(error)
                    {

                    }
                };

                var requestManager = new XmlHttpRequestManager(previousBirth,
                                                                youTubePageHandler,
                                                                localErrorHandler);

                requestManager.doRequest("GET", videoUrl);

            }
            else
            {
                previousBirth.processInfo(swf_map, url, index);
                previousBirth.callBack(previousBirth.callerObject, index);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }

    };

    this.processInfo = function processInfo(swf_map, url, index)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var processTitle        = iccb.processTitle;
            var supportedQualities  = iccb.supportedQualities;
            var fmtMap              = iccb.fmtMap;
            var zeroPad             = iccb.zeroPad;
            var digitCount          = iccb.digitCount;

            var url_encoded_fmt_stream_map = swf_map["url_encoded_fmt_stream_map"];

            /*
                // DO NOT remove this block. I will use this for development purposes.
            var testString = "";
            for(key in swf_map)
            {
                testString += key + " -> " + swf_map[key] + "\n";
            }
            alert(testString);
            */

            var availableFormats    = new Array();
            var fmt_list =  swf_map["fmt_list"];

            if(fmt_list)
            {
                // fmt_list looks like
                // "45/1280x720/99/0/0,22/1280x720/9/0/115," +
                // "44/854x480/99/0/0,35/854x480/9/0/115,43/640x360/99/0/0," +
                // "34/640x360/9/0/115,18/640x360/9/0/115,5/320x240/7/0/0"

                var formats = fmt_list.split(",");

                for(var i=0; i<formats.length; i++)
                {
                    var fmt = formats[i].split("/")[0];
                    var res = formats[i].split("/")[1];

                    availableFormats[i] = fmt;

                    if(fmt in fmtMap)
                        fmtMap[fmt].resolution = res;
                    else
                    {
                        fmtMap[fmt] = new Object();
                        fmtMap[fmt].resolution = res;
                    }
                }
            }

            var curTitle = this.videoList[index].title;
            curTitle = curTitle.replace(/^\s*/, "").replace(/\s*$/, "");

            var newTitle = "";

            if(swf_map["title"])
                newTitle = processTitle(swf_map["title"]);

            if(curTitle.length != newTitle.length)
            {
                this.videoList[index].title = newTitle;
            }

            // Prepend the s.no if preserveOrder = true
            if(preferences.preserveOrder)
            {
                var sNo = zeroPad(index+1, digitCount(this.videoList.length));
                this.videoList[index].title = sNo + " - " + this.videoList[index].title;
            }

            if(swf_map["display_title"])
                this.videoList[index].displayTitle = swf_map["display_title"];

            /*
            // If verboseTitles

            if(swf_map["author"])
            {
                this.videoList[index].author = swf_map["author"];
            }

            this.videoList[index].title = this.videoList[index].author + " - " +
                                          this.videoList[index].title + " (" +
                                          this.videoList[index].vid + ")";
            */

            var encodedUrls 	    = url_encoded_fmt_stream_map.split(",");
            var videoUrls       	= new Array();
            var vUrl                = "";

            for(var i=0; i<encodedUrls.length; i++)
            {
                try
                {
                    vUrl = unescape(unescape(encodedUrls[i].split("url=")[1]));
                    var urlParams = iccb.getParamsFromUrl(vUrl.replace(/\"/g, "%22"));
                    //alert(vUrl.replace("\"", "%22"));
                    var fmt     = urlParams["itag"];
                    var type    = urlParams["type"];
                    
                    var quality = urlParams["quality"];

                    if(fmtMap[fmt] && (!fmtMap[fmt].fileType || !fmtMap[fmt].quality))
                    {
                        fmtMap[fmt].fileType = type.split(";")[0].split("/")[1].replace("x-", "");
                        fmtMap[fmt].quality  = quality;
                    }
                    
                    vUrl = vUrl.split("?")[0] + "?";
                    for(var k=0; k<iccb.requiredParams.length; k++)
                    {
                        var key =  iccb.requiredParams[k];
                        if(urlParams[key])
                        {
                            var val = urlParams[key];
                            vUrl += "&" + (key == "sig"? "signature":key) + "=" + val;
                        }
                    }
                    vUrl += "&title=" + this.videoList[index].title;

                    videoUrls[fmt] = vUrl.replace("?&", "?");
                }
                catch(error)
                {
                    // Ignore error.
                }
            }

            this.videoList[index].availableFormats = availableFormats;
            
            var expire = vUrl.match(/expire=[^&]*&/)[0].replace(/&|expire=/g, "");
            var expiryTime = new Date(expire*1000);
            this.videoList[index].expiryTime = expiryTime;

            // Find best match URL based on the user preferences.
            var pFormat         = this.preferences.format;
            var ignoreFileType  = this.preferences.ignoreFileType;

            var found       = false;
            var loopCount   = 0; // Just to ensure that the loop ends in finite time.

            while(!found && loopCount++ < 4)
            {
                for(var qIndex = supportedQualities.indexOf(this.preferences.quality); qIndex >= 0; qIndex--)
                {
                    var pQuality = supportedQualities[qIndex];

                    for(var key in videoUrls)
                    {
                        if(fmtMap[key])
                        {
                            var props = fmtMap[key];
                            if( (ignoreFileType || props.fileType == pFormat) && props.quality == pQuality)
                            {
                                this.videoList[index].videoURL      = videoUrls[key];
                                this.videoList[index].videoQuality  = "<span class='" + props.color + "'>" +
                                                                      props.resolution + " (" +
                                                                      props.quality + ")</span>";

                                this.videoList[index].bestMatchFormat   = "." + props.fileType;

                                found = true;
                                break;
                            }
                        }
                    }

                    if(found)
                        break;
                }
                if(!found)
                {
                    // This means that the video is not available in the requested format.
                    // Set ignoreFileType to true and repeat the above loop.
                    ignoreFileType = true;
                }
            }

            //alert(this.videoList[index].videoURL);
            
            if(this.videoList[index].failureDescription == null)
                this.videoList[index].failureDescription  = "";
            
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    };
};
