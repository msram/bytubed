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

Components.utils.import("resource://gre/modules/Downloads.jsm");
const Cu = Components.utils;
const Ci = Components.interfaces;
const Cc = Components.classes;


var get, cancel;
if (Downloads.getList) {  // use Downloads.jsm
    Cu.import("resource://gre/modules/Promise.jsm");
    var cache = [];
    get = function (callback, pointer) {
        return function (url, file, aPrivacyContext, aIsPrivate, callback2, pointer2) {
            Promise.all([
                Downloads.createDownload({
                    source: {
                        url: url,
                        isPrivate: aIsPrivate
                    },
                    target: file
                }),
                Downloads.getList(Downloads.PUBLIC)
            ]).then(function ([dl, list]) {
                // Adapting to the old download object
                dl.id = Math.floor(Math.random() * 100000);
                Object.defineProperty(dl, "amountTransferred", { get: function () { return dl.currentBytes } });
                Object.defineProperty(dl, "size", { get: function () { return dl.totalBytes } });
                // Observe progress
                list.add(dl);
                var view = {
                    onDownloadChanged: function (d) {
                        if (d != dl) return;
                        if (callback && callback.progress) {
                            callback.progress.apply(pointer, [dl]);
                        }
                        if (d.succeeded && d.stopped) {
                            if (callback && callback.done) callback.done.apply(pointer, [dl]);
                        }
                        if (d.stopped && !(d.canceled || d.succeeded) && d.error) {
                            if (callback && callback.error) callback.error.apply(pointer, [dl, d.error.message]);
                        }
                        if (d.stopped && !(d.canceled || d.succeeded) && !d.error) {
                            if (callback && callback.paused) callback.paused.apply(pointer, [dl]);
                        }
                        if (d.stopped && d.canceled) {
                            if (callback && callback.error) callback.error.apply(pointer, [dl]);
                        }
                        if (d.stopped) list.removeView(view);
                    }
                };
                list.addView(view);
                dl.start();
                cache.push({ id: dl.id, dl: dl });
                if (callback2) callback2.apply(pointer2, [dl]);
            }, function (err) { throw err });
        }
    }
    cancel = function (id) {
        cache.forEach(function (obj) {
            if (obj.id == id) obj.dl.cancel();
        });
    }
}
else {  // Old
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService),
        dm = Cc["@mozilla.org/download-manager;1"].createInstance(Ci.nsIDownloadManager);
    get = function (callback, pointer) {
        var dl,
            persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
        persist.persistFlags = persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES | persist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

        var listener;
        var mListener = function (download) {
            this.download = download;
        }
        mListener.prototype = {
            download: null,
            onStatusChange: function (aWebProgress, aRequest, aStatus, aMessage, aDownload) { },
            onSecurityChange: function (prog, req, state, dl) { },
            onProgressChange: function (prog, req, prog, progMax, tProg, tProgMax, dl) {
                if (dl.id != this.download.id) return;
                if (callback && callback.progress) callback.progress.apply(pointer, [dl]);
            },
            onStateChange: function (prog, req, flags, status, dl) { },
            onDownloadStateChange: function (state, dl) {
                if (dl.id != this.download.id) return;

                if (dl.state == Ci.nsIDownloadManager.DOWNLOAD_FINISHED) {
                    dm.removeListener(this);
                    if (callback && callback.done) callback.done.apply(pointer, [dl]);
                }
                else if (dl.state == Ci.nsIDownloadManager.DOWNLOAD_PAUSED) {
                    if (callback && callback.paused) callback.paused.apply(pointer, [dl]);
                }
                else if (dl.state == Ci.nsIDownloadManager.DOWNLOAD_FAILED ||
                    dl.state == Ci.nsIDownloadManager.DOWNLOAD_CANCELED ||
                    dl.state == Ci.nsIDownloadManager.DOWNLOAD_BLOCKED_PARENTAL ||
                    dl.state == Ci.nsIDownloadManager.DOWNLOAD_BLOCKED_POLICY ||
                    dl.state == Ci.nsIDownloadManager.DOWNLOAD_DIRTY) {
                    dm.removeListener(this);
                    if (callback && callback.error) callback.error.apply(pointer, [dl]);
                }
            }
        }

        return function (url, file, aPrivacyContext, aIsPrivate, callback2, pointer2) {
            // Create URI
            var urlURI = ioService.newURI(url, null, null),
                fileURI = ioService.newFileURI(file);
            // Start download, Currently the extension is not available on private mode due to panel module incompatibility
            dl = dm.addDownload(dm.DOWNLOAD_TYPE_DOWNLOAD, urlURI, fileURI, null, null, null, null, persist, aIsPrivate || false);
            listener = new mListener(dl);
            dm.addListener(listener);
            persist.progressListener = dl.QueryInterface(Ci.nsIWebProgressListener);
            persist.saveURI(dl.source, null, null, null, null, file, aPrivacyContext);

            if (callback2) callback2.apply(pointer2, [dl]);
        }
    };
    cancel = function (id) {
        dm.cancelDownload(id);
    };
}

iitk.cse.cs213.bytubed.DownloadQueueManager = function(callBack, errorHandler, destDir, vList, 
                                                        prefs, subtitleLanguageInfo)
{
    //this.caller                    = caller;
    this.destinationDirectory   = destDir;
    this.videoList              = vList;
    this.callBack               = callBack;
    this.errorHandler           = errorHandler;
    this.preferences            = prefs;
    this.subtitleLanguageInfo   = subtitleLanguageInfo;
    this.strings                = iitk.cse.cs213.bytubed.strings;

    this.processQueue = function processQueue()
    {
        var iccb    = iitk.cse.cs213.bytubed;
        
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
                    this.strings.getString("InvalidDestinationDirectory"),
                    this.strings.getFormattedString("dqMgr.InvalidDestinationDirectoryMessage", 
                                                    [this.destinationDirectory]));

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
                        this.strings.getString("DirectoryCreationFailed"),
                        this.strings.getString("NoWritePermission"));
                    
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
                        this.strings.getString("DirectoryCreationFailed"),
                        this.strings.getString("NoWritePermission"));
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
                this.callBack(this.strings.getFormattedString("RequestSuccessfullyProcessed", 
                                                              [this.videoList[index].displayTitle]));
        }
        catch(error)
        {
            this.callBack(this.strings.getFormattedString("RequestSuccessfullyProcessed", 
                                                              [this.videoList[index].displayTitle]));
        }
    };
    
    this.processSubtitleLangList = function processSubtitleLangList(previousBirth, xmlText, url)
    {   
        var iccb = iitk.cse.cs213.bytubed;
        var title = "";
        
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
                    title = previousBirth.videoList[i].displayTitle;
                    index = i;
                    break;
                }
            }
            
            previousBirth.processSubtitleRequest(index);
        }
        catch(error)
        {
            previousBirth.callBack( previousBirth.strings
                                                 .getFormattedString("RequestSuccessfullyProcessed", 
                                                                    [title]) + " " + 
                                    previousBirth.strings
                                                 .getFormattedString("ButNoSubtitlesDueToInternalError", 
                                                                    [error.message]));
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
            
                var xmlReq = new XHRManager(this, this.processSubtitles, null);//function(msg){this.handleSubtitleFailure(index, msg)});
                xmlReq.doRequest("GET", url);
            }
            else
            {
                this.callBack(this.strings.getFormattedString("RequestSuccessfullyProcessed", 
                                                              [this.videoList[index].displayTitle]) +
                              " " + this.strings.getString("ButNoSubtitlesAvailable"));
            }   
        }
        catch(error)
        {
            // Ignore error
            this.callBack(this.strings.getFormattedString("RequestSuccessfullyProcessed", 
                                                [this.videoList[index].displayTitle]) + " " + 
                          this.strings.getFormattedString("ButNoSubtitlesDueToInternalError", 
                                                          [error.message]));
        }
    };
    
    this.handleSubtitleFailure = function handleSubtitleFailure(index, msg)
    {
        this.callBack(this.strings.getFormattedString("RequestSuccessfullyProcessed", 
                                        [this.videoList[index].displayTitle]) + " " + 
                      this.strings.getFormattedString("ButNoSubtitlesDueToInternalError", 
                                                      [msg]));
    };
    
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
                                          .lang_original;
                previousBirth.videoList[vIndex].actualPrefLangName = actualPrefLangName;
            }
            
            var lang_name   = previousBirth.videoList[vIndex].availableSubtitleLanguages[lang_code].lang_original;
            var file_name   = previousBirth.videoList[vIndex].title +  " - [" + lang_name + "].srt";
            
            previousBirth.videoList[vIndex].fetchedLangName = 
                previousBirth.videoList[vIndex].availableSubtitleLanguages[lang_code].lang_original;
            
            var content     = processSubtitlesGlobal(xmlText);
			
            writeTextToFile(content, file_name, previousBirth.preferences.subtitleDest,
                                previousBirth.preferences.destinationDirectory);
            
            if(actualPrefLang == null || actualPrefLangName == lang_name)
                previousBirth.callBack( previousBirth.strings
                                                     .getFormattedString("RequestSuccessfullyProcessed", 
                                                            [previousBirth.videoList[vIndex].displayTitle]) + " " + 
                                        previousBirth.strings
                                                     .getFormattedString("SubtitlesDownloadedIn", [lang_name]));
            else
                previousBirth.callBack( previousBirth.strings
                                                     .getFormattedString("RequestSuccessfullyProcessed", 
                                                            [previousBirth.videoList[vIndex].displayTitle]) + " " + 
                                        previousBirth.strings
                                                     .getFormattedString("SubtitlesDownloadedInDifferentDialect",
                                                                    [actualPrefLangName, lang_name, actualPrefLangName]));
        }
        catch(error)
        {
            previousBirth.callBack( previousBirth.strings
                                                 .getFormattedString("RequestSuccessfullyProcessed", 
                                                    [previousBirth.videoList[vIndex].displayTitle]) + " " + 
                                    previousBirth.strings
                                                 .getFormattedString("ButNoSubtitlesDueToInternalError", 
                                                                    [error.message]));
        }
    };
    
    this.enqueue = function enqueue(videoIndex)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
//            var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
//                .createInstance(Components.interfaces.nsIWebBrowserPersist);
//
//            var nsIWBP = Components.interfaces.nsIWebBrowserPersist;
//            persist.persistFlags = nsIWBP.PERSIST_FLAGS_NO_CONVERSION |
//            // nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
//            nsIWBP.PERSIST_FLAGS_CLEANUP_ON_FAILURE;

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
                    this.strings.getString("FileCreationFailed"), 
                    fileName + " - " + this.strings.getString("NoWritePermission"));

                return;
            }

//            var nioService = iccb.services.networkIOService;
//            var src_URI = nioService.newURI(this.videoList[videoIndex].videoURL, null, null);
//            var tgt_URI = nioService.newFileURI(targetFile);

//            var dlMgr = iccb.services.downloadManager;
            var url = this.videoList[videoIndex].videoURL;
            var file = targetFile.path;


            var aDownload = new get;
            aDownload(url, file);
            //            var aDownload   = dlMgr.addDownload(0, src_URI, tgt_URI, null, null, null, null, persist, false);
            //
            //            persist.saveURI(src_URI, null, null, null, "", tgt_URI, null);
            //            persist.progressListener = aDownload;
        }
        catch(error)
        {
            if(error.message.indexOf("ACCESS") != -1)
            {
                iccb.services.promptService.alert(window,
                    this.strings.getString("FileCreationFailed"),
                    this.strings.getString("NoWritePermission"));
            }
            else
            {
                iccb.reportProblem(error, arguments.callee.name);
            }
        }
    };
};
