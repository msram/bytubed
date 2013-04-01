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

iitk.cse.cs213.bytubed.Download = function Download(dlMgr, callback, errorHandler, destDir, ytVideo, indexInList, totalCount,
                                                        prefs, subtitleLanguageInfo)
{
    //this.caller                    = caller;
    this.destinationDirectory   = destDir;
    this.dlMgr                  = dlMgr;
    this.callback               = callback;
    this.errorHandler           = errorHandler;
    this.ytVideo                = ytVideo;
    this.indexInList            = indexInList;
    this.totalCount             = totalCount;
    this.preferences            = prefs;
    this.subtitleLanguageInfo   = subtitleLanguageInfo;
    this.strings                = iitk.cse.cs213.bytubed.strings;

    this.processRequest = function processRequest()
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        var videoManager = new iccb.VideoManager(this, 
                                            this.enqueAndCallBack, this.errorHandler,
                                            this.ytVideo, this.indexInList, this.totalCount,
                                            this.preferences,
                                            this.subtitleLanguageInfo);
        videoManager.processVideo();
    };
    
    this.enqueAndCallBack = function enqueAndCallBack(previousBirth)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        if(previousBirth.preferences.todo == iccb.ENQUEUE_LINKS)
        {
            previousBirth.enqueue();
        }
        else
        {
            // Deal with generate-links and manage subtitles
        }
    };
    
    this.enqueue = function enqueue()
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

            var fileName    = this.ytVideo.title + this.ytVideo.fileType;

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

            var nioService  = iccb.services.networkIOService;
            var src_URI     = nioService.newURI(this.ytVideo.videoURL, null, null);
            var tgt_URI     = nioService.newFileURI(targetFile);
            
            var dlMgr = Components.classes["@mozilla.org/download-manager;1"]
                                  .getService(Components.interfaces.nsIDownloadManager);
            
            dlMgr.addListener(this.dlMgr);
            
            var aDownload   = dlMgr.addDownload(0, src_URI, tgt_URI, null, null, null, null, persist, false);
            
            persist.saveURI(src_URI, null, null, null, "", tgt_URI, null);
            persist.progressListener = aDownload //this.dlMgr;
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


iitk.cse.cs213.bytubed.DownloadManager = function DownloadManager(document, 
                                                    videoList,
                                                    destinationDirectory,
                                                    maxParallelDownloads,
                                                    preferences,
                                                    subtitleLanguageInfo,
                                                    callback,
                                                    errorHandler)
{
    this.document = document;
    this.videoList = videoList;
    this.destinationDirectory = destinationDirectory;
    this.maxParallelDownloads = maxParallelDownloads;
    this.preferences = preferences;
    this.subtitleLanguageInfo = subtitleLanguageInfo;
    this.callback = callback;
    this.errorHandler = errorHandler;
    
    this.downloadQueue = new Array();
    
    this.start = function start()
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        alert("Ram")
        
        for(var i=0; i<this.videoList.length; i++)
        {
            var download = new iccb.Download(this,
                                            this.callback,
                                            this.errorHandler,
                                            this.destinationDirectory,
                                            this.videoList[i], i, this.videoList.length,
                                            this.preferences,
                                            this.subtitleLanguageInfo);
            
            this.downloadQueue.unshift(download)
        }
        
        this.maxParallelDownloads = Math.min(this.maxParallelDownloads, 
                                                this.downloadQueue.length);
        
        for(var i=0; i<this.maxParallelDownloads; i++)
        {
            this.downloadQueue[i].processRequest();
        }
    };
    
    this.onProgressChange = function onProgressChange(aWebProgress, 
                                                aRequest,
                                                aCurSelfProgress, 
                                                aMaxSelfProgress, 
                                                aCurTotalProgress, 
                                                aMaxTotalProgress,
                                                aDownload)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        var percentComplete = Math.round((aCurTotalProgress / aMaxTotalProgress) * 100);
            
            
            var vid = iccb.getParamsFromUrl(aDownload.source.spec)["vid"];
            var index = iccb.getIndexByKey(this.videoList, "vid", vid, function(x, y){return x==y;});
            
            if(this.document != null && this.document.getElementById != null && this.document.getElementById("progress"+index) != null)
                this.document.getElementById("progress"+index).setAttribute("value", percentComplete);
        
    };
    
    this.onStatusChange = function(aWebProgress, aRequest, aStatus, aMessage, aDownload)
    {
        document.getElementById("successConsole").value += aStatus;
    };
    
    this.onStateChange = function(aWebProgress, aRequest, aStateFlags, aStatus, aDownload) 
    {
        var iccb = iitk.cse.cs213.bytubed;
            // Schedule the other downloads from here.
            const Ci = Components.interfaces;
            const STATE_START = Ci.nsIWebProgressListener.STATE_START;
            const STATE_STOP = Ci.nsIWebProgressListener.STATE_STOP;
            
            // If you use myListener for more than one tab/window, use
            // aWebProgress.DOMWindow to obtain the tab/window which triggers the state change
            if (aStateFlags & STATE_START) 
            {
                // This fires when the load event is initiated
                
                //alert(this.videoList[index].title + "download started.")
                var vid = iccb.getParamsFromUrl(aDownload.source.spec)["vid"];
                var index = iccb.getIndexByKey(this.videoList, "vid", vid, function(x, y){return x==y;});
                
                if(this.document != null && this.document.getElementById != null && this.document.getElementById("progress"+index) != null)
                {
                    this.document.getElementById("progress"+index).setAttribute("mode", "normal");
                    this.document.getElementById("progress"+index).setAttribute("value", 0);
                    //alert(this.document.getElementById("progress"+index).getAttribute("value"));
                }
            }
            if (aStateFlags & STATE_STOP) 
            {
                // This fires when the load finishes
            }
        
    };
    
    this.onDownloadStateChange = function onDownloadStateChange(aState, aDownload)
    {
        //alert(aState)
        
        switch(aDownload.state) {
            case Components.interfaces.nsIDownloadManager.DOWNLOAD_FINISHED:
                
                this.document.getElementById("successConsole").value += "\n\n" + aDownload.source.spec + 
                                                                aDownload.size + "finished."
                
                break;
            case Components.interfaces.nsIDownloadManager.DOWNLOAD_FAILED:
            case Components.interfaces.nsIDownloadManager.DOWNLOAD_CANCELED:
                break;
        }
    };
}