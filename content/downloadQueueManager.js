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

iitk.cse.cs213.bytubed.DownloadQueueManager = function(callBack, errorHandler, destDir, vList, prefs, subtitleLanguageInfo)
{
    //this.caller                    = caller;
    this.destinationDirectory   = destDir;
    this.videoList              = vList;
    this.callBack               = callBack;
    this.errorHandler           = errorHandler;
    this.preferences            = prefs;
    this.subtitleLanguageInfo   = subtitleLanguageInfo;

    this.processQueue = function processQueue()
    {
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            var allIsWell = true;
            
            // create the destination directory if it doesn't exist
            var file = Components.classes["@mozilla.org/file/local;1"]
                                 .createInstance(Components.interfaces.nsILocalFile);

            try
            {
                file.initWithPath(this.destinationDirectory);
            }
            catch(error)
            {
                this.destinationDirectory = iccb.services.downloadManager.userDownloadsDirectory.path;

                iccb.services.promptService.alert(window,
                    "Invalid Destination Directory",
                    "Please check the Destination field. It must be a valid absolute path.\n" +
                    "\nFor now proceeding with the default Downloads directory...\n(" +
                    this.destinationDirectory + ")");

                file.initWithPath(this.destinationDirectory);
            }

            if( !file.exists() || !file.isDirectory() )
            {
                try
                {
                    file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
                }
                catch(error)
                {
                    iccb.services.promptService.alert(window,
                        "Directory creation failed!",
                        "Probably you don't have write permissions on the destination directory.");
                    
                    allIsWell = false;
                }
            }
            // End

            if(allIsWell)
            {
                var videoListManager = new iccb.VideoListManager(this,
                                                                this.enqueueAndCallBack,
                                                                this.errorHandler,
                                                                this.videoList,
                                                                this.preferences,
                                                                this.subtitleLanguageInfo);

                videoListManager.processVideoList();
            }
            else
            {
                this.errorHandler(null, null, !allIsWell);
            }
        }
        catch(error)
        {
            if(error.message.indexOf("ACCESS") != -1)
            {
                iccb.services.promptService.alert(window,
                    "Directory creation failed!",
                    "Probably you don't have write permissions on the destination directory.");
            }
            else
            {
                iccb.reportProblem(error, arguments.callee.name);
            }
        }
    };

    this.enqueueAndCallBack = function enqueueAndCallBack(previousBirth, videoIndex)
    {
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            if(this.preferences.todo == iccb.ENQUEUE_LINKS)
                previousBirth.enqueue(videoIndex);

            previousBirth.manageSubtitles(videoIndex);
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    };

    // Following code is to manage subtitles.
    this.manageSubtitles = function manageSubtitles(index)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            if(this.preferences.fetchSubtitles)
            {
                var XmlHttpRequestManager   = iccb.XmlHttpRequestManager;
                var subtitleLangRequestManager = new XmlHttpRequestManager(this, this.processSubtitleLangList, null);
                
                var vid = this.videoList[index].vid;
                if(this.videoList[index].availableSubtitleLanguages == null)    // Not yet fetched available languages
                {
                    subtitleLangRequestManager.doRequest("GET", 
                                                iccb.subtitleLangListURL.replace("VIDEO_ID", vid));
                }
                else
                {
                    this.processSubtitleRequest(index);
                }
            }
            else
                this.callBack("Request for \"" + this.videoList[index].displayTitle +
                                        "\" has been successfully processed.");
        }
        catch(error)
        {
            this.callBack("Request for \"" + this.videoList[index].displayTitle +
                                        "\" has been successfully processed.");
        }
    };
    
    this.processSubtitleLangList = function processSubtitleLangList(previousBirth, xmlText, url)
    {   
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            var curLangs = iccb.processSubtitleLangListGlobal(xmlText, previousBirth.subtitleLanguageInfo);
            
            var vid = iccb.getParamsFromUrl(url)['v'];    // getParamsFromUrl <- globals.js
            var index = -1;
            
            for(var i=0; i<previousBirth.videoList.length; i++)
            {
                if(previousBirth.videoList[i].vid == vid)
                {
                    previousBirth.videoList[i].availableSubtitleLanguages = curLangs;
                    index = i;
                    break;
                }
            }
            
            previousBirth.processSubtitleRequest(index);
        }
        catch(error)
        {
            previousBirth.callBack("Request for \"" + previousBirth.videoList[vIndex].displayTitle +
                            "\" has been successfully processed." +
                            " But subtitles were not downloaded due to an internal error [" + error.message + "].");
        }
    };
    
    this.processSubtitleRequest = function processSubtitleRequest(index)
    {
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            var prefLangs       = this.preferences.subtitleLangCodes;   // array of lang_codes
            var availableLangs  = this.videoList[index].availableSubtitleLanguages;
            
            /*
            var str = "";
            for(var key in availableLangs)
            {
                str += key + ", ";
            }
            alert(str);
            */
            
            var lang_code = null;
            var lang_name = null;
            
            for(var i=0; i<prefLangs.length && lang_code == null; i++)
            {
                if(prefLangs[i] in availableLangs)
                {
                    lang_code = actualPrefLang = prefLangs[i];
                    lang_name = availableLangs[lang_code].name;
                    break;
                }
                else if(this.preferences.tryOtherDialects)
                {
                    for(var key in availableLangs)
                    {
                        if(key.split("-")[0] == prefLangs[i].split("-")[0])
                        {
                            lang_code = key;
                            this.videoList[index].actualPrefLang = prefLangs[i];
                            lang_name = availableLangs[lang_code].name;
                            break;
                        }
                    }
                }
            }
            
            if(lang_code != null && lang_name != null)
            {
                var url = iccb.subtitleURL.replace("VIDEO_ID", this.videoList[index].vid)
                                                            .replace("LANGUAGE_CODE", lang_code)
                                                            .replace("LANG_NAME", lang_name);
                
                var XHRManager  = iccb.XmlHttpRequestManager;
                                        // Defined in xmlHttpRequestManager.js
            
                var xmlReq = new XHRManager(this, this.processSubtitles, null);
                xmlReq.doRequest("GET", url);
            }
            else
            {
                this.callBack("Request for \"" + this.videoList[index].displayTitle +
                                    "\" has been successfully processed." +
                                    " But subtitles are not available for this video in any language you have chosen.");
            }   
        }
        catch(error)
        {
            // Ignore error
            this.callBack("Request for \"" + this.videoList[index].displayTitle +
                            "\" has been successfully processed." +
                            " But subtitles were not downloaded due to an internal error [" + error.message + "].");
        }
    }
    
    this.processSubtitles = function processSubtitles(previousBirth, xmlText, url)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var getIndexByKey           = iccb.getIndexByKey;
        var writeTextToFile         = iccb.writeTextToFile;
        var getParamsFromUrl        = iccb.getParamsFromUrl;
        var processSubtitlesGlobal  = iccb.processSubtitlesGlobal;
        var vIndex;
        
        try
        {
            //alert(url);
            var params      = getParamsFromUrl(url);
            var vid         = params['v'];
            var lang_code   = params['lang'];
            
            var vIndex      = getIndexByKey(previousBirth.videoList, "vid", vid, function(x,y){return x==y});
            
            var actualPrefLang      = previousBirth.videoList[vIndex].actualPrefLang;
            var actualPrefLangName  = "";
            if(actualPrefLang != null)
            {
                actualPrefLangName  = iccb.getLangRecordByLangCode(previousBirth.subtitleLanguageInfo, actualPrefLang)
                                          .lang_translated;
                previousBirth.videoList[vIndex].actualPrefLangName = actualPrefLangName;
            }
            
            var lang_name   = previousBirth.videoList[vIndex].availableSubtitleLanguages[lang_code].lang_translated;
            var file_name   = previousBirth.videoList[vIndex].title +  " - [" + lang_name + "].srt";
            
            previousBirth.videoList[vIndex].fetchedLangName = 
                previousBirth.videoList[vIndex].availableSubtitleLanguages[lang_code].lang_original;
            
            var content     = processSubtitlesGlobal(xmlText);
			
            writeTextToFile(content, file_name, previousBirth.preferences.subtitleDest,
                                previousBirth.preferences.destinationDirectory);
            
            if(actualPrefLang == null || actualPrefLangName == lang_name)
                previousBirth.callBack("Request for \"" + previousBirth.videoList[vIndex].displayTitle +
                                    "\" has been successfully processed; " +
                                    "subtitles were downloaded in " + lang_name + ".");
            else
                previousBirth.callBack("Request for \"" + previousBirth.videoList[vIndex].displayTitle +
                                    "\" has been successfully processed; " +
                                    "subtitles were asked in " + actualPrefLangName + 
                                    ", but downloaded in " + lang_name + " due to their unavailability in " + 
                                    actualPrefLangName + ".");
        }
        catch(error)
        {
            previousBirth.callBack("Request for \"" + previousBirth.videoList[vIndex].displayTitle +
                            "\" has been successfully processed." +
                            " But subtitles were not downloaded due to an internal error [" + error.message + "].");
        }       
    };
    
    this.enqueue = function enqueue(videoIndex)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                                    .createInstance(Components.interfaces.nsIWebBrowserPersist);

            var nsIWBP  = Components.interfaces.nsIWebBrowserPersist;
            persist.persistFlags =  nsIWBP.PERSIST_FLAGS_NO_CONVERSION |
                                    // nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
                                    nsIWBP.PERSIST_FLAGS_CLEANUP_ON_FAILURE;

            var targetFile  = Components.classes["@mozilla.org/file/local;1"]
                                        .createInstance(Components.interfaces.nsILocalFile);
            targetFile.initWithPath(this.destinationDirectory);     // download destination

            var fileName    = this.videoList[videoIndex].title + this.videoList[videoIndex].fileType;

            targetFile.appendRelativePath(fileName);

            try
            {
                targetFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);
            }
            catch(error)
            {
                iccb.services.promptService.alert(window,
                    "File creation failed!",
                    fileName + " - Probably you don't have write permissions on the destination directory.");

                return;
            }

            var nioService  = iccb.services.networkIOService;
            var src_URI     = nioService.newURI(this.videoList[videoIndex].videoURL, null, null);
            var tgt_URI     = nioService.newFileURI(targetFile);

            var dlMgr       = iccb.services.downloadManager;
            var aDownload   = dlMgr.addDownload(0, src_URI, tgt_URI, null, null, null, null, persist);

            persist.progressListener = aDownload;
            persist.saveURI(src_URI, null, null, null, "", tgt_URI);
        }
        catch(error)
        {
            if(error.message.indexOf("ACCESS") != -1)
            {
                iccb.services.promptService.alert(window,
                    "File creation failed!",
                    "Probably you don't have write permissions on the destination directory.");
            }
            else
            {
                iccb.reportProblem(error, arguments.callee.name);
            }
        }
    };
};
