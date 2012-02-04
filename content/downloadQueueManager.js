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

IITK.CSE.CS213.BYTubeD.DownloadQueueManager = function(callBack, errorHandler, destDir, vList, prefs)
{
    //this.caller                    = caller;
    this.destinationDirectory   = destDir;
    this.videoList              = vList;
    this.callBack               = callBack;
    this.errorHandler           = errorHandler;
    this.preferences            = prefs;

    this.processQueue = function processQueue()
    {
        try
        {
            // create the destination directory if it doesn't exist
            var file = Components.classes["@mozilla.org/file/local;1"]
                                 .createInstance(Components.interfaces.nsILocalFile);

            try
            {
                file.initWithPath(this.destinationDirectory);
            }
            catch(error)
            {
                this.destinationDirectory = IITK.CSE.CS213.BYTubeD.services.downloadManager
                                                                           .defaultDownloadsDirectory.path;

                IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
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
                    IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
                        "Directory creation failed!",
                        "Probably you don't have write permissions on the destination directory.");
                    return;
                }
            }
            // End

            var videoListManager = new IITK.CSE.CS213.BYTubeD.VideoListManager(this,
                                                                                this.enqueueAndCallBack,
                                                                                this.errorHandler,
                                                                                this.videoList,
                                                                                this.preferences);

            videoListManager.processVideoList();
        }
        catch(error)
        {
            if(error.message.indexOf("ACCESS") != -1)
            {
                IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
                    "Directory creation failed!",
                    "Probably you don't have write permissions on the destination directory.");
            }
            else
            {
                IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
            }
        }
    };

    this.enqueueAndCallBack = function enqueueAndCallBack(previousBirth, videoIndex)
    {
        try
        {
            if(this.preferences.todo == IITK.CSE.CS213.BYTubeD.ENQUEUE_LINKS)
                previousBirth.enqueue(videoIndex);

            previousBirth.callBack("\"" + previousBirth.videoList[videoIndex].displayTitle +
                                    "\" has been successfully processed.");
        }
        catch(error)
        {
            IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
        }
    };

    this.enqueue = function enqueue(videoIndex)
    {
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

            var fileName    = this.videoList[videoIndex].title + this.videoList[videoIndex].bestMatchFormat;

            targetFile.appendRelativePath(fileName);

            try
            {
                targetFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);
            }
            catch(error)
            {
                IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
                    "File creation failed!",
                    fileName + " - Probably you don't have write permissions on the destination directory.");

                return;
            }

            var nioService  = IITK.CSE.CS213.BYTubeD.services.networkIOService;
            var src_URI     = nioService.newURI(this.videoList[videoIndex].videoURL, null, null);
            var tgt_URI     = nioService.newFileURI(targetFile);

            var dlMgr       = IITK.CSE.CS213.BYTubeD.services.downloadManager;
            var aDownload   = dlMgr.addDownload(0, src_URI, tgt_URI, null, null, null, null, persist);

            persist.progressListener = aDownload;
            persist.saveURI(src_URI, null, null, null, "", tgt_URI);
        }
        catch(error)
        {
            if(error.message.indexOf("ACCESS") != -1)
            {
                IITK.CSE.CS213.BYTubeD.services.promptService.alert(window,
                    "File creation failed!",
                    "Probably you don't have write permissions on the destination directory.");
            }
            else
            {
                IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
            }
        }
    };
};
