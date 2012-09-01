// URLs for Closed Captions aka subtitles
IITK.CSE.CS213.BYTubeD.subtitleLangListURL = "http://www.youtube.com/api/timedtext?type=list&v=VIDEO_ID";
IITK.CSE.CS213.BYTubeD.subtitleURL = "http://www.youtube.com/api/timedtext?v=VIDEO_ID&lang=LANGUAGE_CODE&name=LANG_NAME";

/**
    loadDefaultSubtitleLanguages: loads the list of languages from langList defined in subtitles.js
    converting an associative array to an integer-indexed array to fecilitate sorting
**/
IITK.CSE.CS213.BYTubeD.loadDefaultSubtitleLanguages = function loadDefaultSubtitleLanguages()
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    var subtitleLanguageInfo    = new Array();  
    try
    {
        var langList                = iccb.langList;
        
        // Entries of subtitleLanguageInfo will have the same information as langList's entries, except that
        // subtitleLangListURL is integer-indexed, while langList is indexed by lang_name.
        for(var lang in langList)
        {
            subtitleLanguageInfo[subtitleLanguageInfo.length] = {
                                    lang_code:          langList[lang].lang_code,
                                    lang_translated:    langList[lang].lang_translated, 
                                    lang_original:      langList[lang].lang_original
                                };
        }
        
        iccb.sortSubtitleLanguageInfo(subtitleLanguageInfo, 'lang_translated');
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
    return subtitleLanguageInfo;
};

// sortSubtitleLanguageInfo sorts subtitleLanguageInfo based on lang_translated
IITK.CSE.CS213.BYTubeD.sortSubtitleLanguageInfo = function sortSubtitleLanguageInfo(subtitleLanguageInfo, property)
{   
    subtitleLanguageInfo.sort(function (a,b)
    {
        if (a[property] < b[property])
            return -1;
        if (a[property] > b[property])
            return 1;
        return 0;
    }); // Array.sort takes an optional compare function to sort 'this'.
}

// _showSubtitleLanguageInfo is for debgguing purposes
IITK.CSE.CS213.BYTubeD._showSubtitleLanguageInfo = function _showSubtitleLanguageInfo(subtitleLanguageInfo)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        iccb.sortSubtitleLanguageInfo(subtitleLanguageInfo, 'lang_translated');
        
        var langList = "// A list of languages to start with; totally there are " + 
                    subtitleLanguageInfo.length + " languages so far.\n\n" + 
                    "IITK.CSE.CS213.BYTubeD.langList = {\n";
        for(var i=0; i<subtitleLanguageInfo.length; i++)
        {
            langList += "\t" + subtitleLanguageInfo[i].lang_code.replace("-", "_") +
                    ": {" + 
                            "lang_code: \"" + subtitleLanguageInfo[i].lang_code + "\", " +
                            "lang_original: \"" + subtitleLanguageInfo[i].lang_original + "\", " +
                            "lang_translated: \"" + subtitleLanguageInfo[i].lang_translated + "\"" +
                    "}" + (i == subtitleLanguageInfo.length - 1? "" : ",") + "\n";
        }
        langList += "};"
        alert(langList);    // this alert is necessary; don't remove it.
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
};


IITK.CSE.CS213.BYTubeD.saveSubtitleLanguageInfo = function saveSubtitleLanguageInfo(subtitleLanguageInfo)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        iccb.sortSubtitleLanguageInfo(subtitleLanguageInfo, 'lang_translated');
        
        var langList = "// A list of accumulated languages; totally there are " + 
                    subtitleLanguageInfo.length + " languages so far.\n\n" + 
                    "IITK.CSE.CS213.BYTubeD.langList = {\n";
        for(var i=0; i<subtitleLanguageInfo.length; i++)
        {
            langList += "\t" + subtitleLanguageInfo[i].lang_code.replace("-", "_") +
                    ": {" + 
                            "lang_code: \"" + subtitleLanguageInfo[i].lang_code + "\", " +
                            "lang_original: \"" + subtitleLanguageInfo[i].lang_original + "\", " +
                            "lang_translated: \"" + subtitleLanguageInfo[i].lang_translated + "\"" +
                    "}" + (i == subtitleLanguageInfo.length - 1? "" : ",") + "\n";
        }
        langList += "};"
        
        iccb.saveTextInAddonDirectory(langList, "langList.js", "generated");
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
};

// Updates subtitleLanguageInfo with the new languages, if there are any, by side effect.
IITK.CSE.CS213.BYTubeD.processSubtitleLangListGlobal = function processSubtitleLangListGlobal(xmlText, subtitleLanguageInfo)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    var curLangs = new Array();
    try
    {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlText,"text/xml");
        var tracks = xmlDoc.getElementsByTagName("track");
        
        for(var i=0; i<tracks.length; i++)
        {
            var name            = tracks[i].getAttribute("name");
            var lang_code       = tracks[i].getAttribute("lang_code");
            var lang_original   = tracks[i].getAttribute("lang_original");
            var lang_translated = tracks[i].getAttribute("lang_translated");
            
            var alreadyPresent = false;
            for(var key in subtitleLanguageInfo)
            {
                if(subtitleLanguageInfo[key].lang_code == lang_code)
                {
                    alreadyPresent = true;
                    break;
                }
            }
            
            if(!alreadyPresent)
            {
                subtitleLanguageInfo[subtitleLanguageInfo.length] = {   
                                            lang_code:          lang_code,
                                            lang_translated:    lang_translated, 
                                            lang_original:      lang_original
                                        };
            }
            curLangs[lang_code] = {lang_translated: lang_translated, lang_original: lang_original, name: name};
        }
        
        // sort subtitleLanguageInfo before returning.
        iccb.sortSubtitleLanguageInfo(subtitleLanguageInfo, 'lang_translated');
    }
    catch(error)
    {
        // Do nothing.
    }
    return curLangs;
};

IITK.CSE.CS213.BYTubeD.getLangRecordByLangCode = function getLangRecordByLangCode(subtitleLanguageInfo, lang_code)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        for(var i=0; i<subtitleLanguageInfo.length; i++)
        {
            if(subtitleLanguageInfo[i].lang_code == lang_code)
                return subtitleLanguageInfo[i];
        }
    }
    catch(error)
    {    
        // iccb.reportProblem(error, arguments.callee.name);
    }
    return null;
}

IITK.CSE.CS213.BYTubeD.processSubtitlesGlobal =  function processSubtitlesGlobal(xmlText)
{  
    var iccb = IITK.CSE.CS213.BYTubeD;
    var zeroPad = iccb.zeroPad;
    var ccContent   = "";
    
    try
    {
        // processTime and processText were inspired by YouTube Caption Downloader
        // https://addons.mozilla.org/en-us/firefox/addon/youtube-caption-downloader/
        var processTime = function processTime(timeInSec) 
        {
            var timeInMilliSec = Math.floor(timeInSec * 1000);
            timeInSec = Math.floor(timeInMilliSec / 1000);
            
            var hh = Math.floor(timeInSec / 3600);
            var mm = Math.floor((timeInSec % 3600) / 60);
            var ss = (timeInSec % 3600) % 60;
            var ms = timeInMilliSec % 1000;
            
            return zeroPad(hh, 2) + ":" + zeroPad(mm, 2) + ":" + zeroPad(ss, 2) + "," + zeroPad(ms, 3);
        };
        
        var processText = function processText(inputText)  
        {
            return inputText.replace(/&amp;/g, "&")
                          .replace(/&lt;/g, "<")
                          .replace(/&gt;/g, ">")
                          .replace(/&#39;/g, "'")
                          .replace(/&quot;/g, "\"");
        };

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlText,"text/xml");
        
        var textNodes   = xmlDoc.getElementsByTagName("text");
        
        var curText     = "";
        var start       = 0;
        var duration    = 0;
        var stop        = 0;
        var count       = 0;
        
        for(var i=0; i<textNodes.length; i++)
        {
            if(!textNodes[i].hasAttribute("start") || !textNodes[i].hasAttribute("dur"))
                continue;
            
            curText     = processText(textNodes[i].textContent);
            start       = parseFloat(textNodes[i].getAttribute("start"));
            duration    = parseFloat(textNodes[i].getAttribute("dur"));
            stop        = start + duration;
            ccContent   = ccContent + (++count) + "\n" + 
                            processTime(start) + " --> " + processTime(stop) + "\n" + curText + "\n\n";
        }
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
    
    return ccContent;
};
