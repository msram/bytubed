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

iitk.cse.cs213.bytubed.queueStatusManager = {
    videoList   : null,
    destinationDirectory: "undefined",
    preferences         : null,
    invocationInfo		: null,
    document            : null,
    successCount        : 0,
    failureCount        : 0,
    expiryTime          : null,
    alreadyFinished     : false,

    downloadQueue       : null,
    maxParallelDownloads: 4,
    
    strings             : null,
    
    // onLoad is the handler for the event window.onload of qsMgr
    onLoad: function onLoad(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        strings = document.getElementById("strings");
        
        try
        {
            var qsMgr = iccb.queueStatusManager;
            
            qsMgr.document = document;
            document.getElementById("successConsole").focus();

            qsMgr.videoList    	        = window.arguments[0];
            qsMgr.destinationDirectory  = window.arguments[1];
            qsMgr.preferences           = window.arguments[2];
            qsMgr.invocationInfo		= window.arguments[3];
            qsMgr.subtitleLanguageInfo  = window.arguments[4];

            qsMgr.setStatus(strings.getString("ProcessingSelection"));
            document.getElementById("progressmeter").mode = "undetermined";

            var allIsWell = true;
            
            // create the destination directory if it doesn't exist
            var file = Components.classes["@mozilla.org/file/local;1"]
                                 .createInstance(Components.interfaces.nsILocalFile);

            try
            {
                file.initWithPath(qsMgr.destinationDirectory);
            }
            catch(error)
            {
                qsMgr.destinationDirectory = iccb.services.downloadManager.userDownloadsDirectory.path;

                iccb.services.promptService.alert(window,
                    qsMgr.strings.getString("InvalidDestinationDirectory"),
                    qsMgr.strings.getFormattedString("dqMgr.InvalidDestinationDirectoryMessage", 
                                                    [qsMgr.destinationDirectory]));

                file.initWithPath(qsMgr.destinationDirectory);
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
                        qsMgr.strings.getString("DirectoryCreationFailed"),
                        qsMgr.strings.getString("NoWritePermission"));
                    
                    allIsWell = false;
                }
            }
            // End

            if(!allIsWell)
            {
                qsMgr.errorHandler(null, null, !allIsWell);
            }
            
            for(var i=0; i<qsMgr.videoList.length; i++)
                qsMgr.addDownload(i)
            
            var dlMgr = new iccb.DownloadManager(document, 
                                            qsMgr.videoList, 
                                            qsMgr.destinationDirectory, 
                                            qsMgr.maxParallelDownloads, 
                                            qsMgr.preferences,
                                            qsMgr.subtitleLanguageInfo,
                                            qsMgr.reportProgress,
                                            qsMgr.reportError
                                            );
            dlMgr.start();
        }
        catch(error)
        {
            if(error.message.indexOf("ACCESS") != -1)
            {
                iccb.services.promptService.alert(window,
                        qsMgr.strings.getString("DirectoryCreationFailed"),
                        qsMgr.strings.getString("NoWritePermission"));
            }
            else
            {
                iccb.reportProblem(error, arguments.callee.name);
            }
        }
    },
    
    addDownload : function addDownload(index)
    {
        var iccb = iitk.cse.cs213.bytubed;
        var qsMgr = iccb.queueStatusManager;
        
        var treeChildren        = document.getElementById("treeChildren");
        var ti = document.createElement("treeitem");
        ti.setAttribute("id", "ti" + index);

        var tr = document.createElement("treerow");
        tr.setAttribute("id", "tr" + index);

        var tc1 = document.createElement("treecell");
        tc1.setAttribute("label", (index+1) );
        tc1.setAttribute("id", "sno" +  index);
        tr.appendChild(tc1);

        var tc2 = document.createElement("treecell");
        tc2.setAttribute("label", qsMgr.videoList[index].displayTitle);
        tc2.setAttribute("id", "title" + index);
        tr.appendChild(tc2);

        var tc3 = document.createElement("treecell");
        tc3.setAttribute("label", "Unknown");
        tc3.setAttribute("id", "progress" + index);
        tr.appendChild(tc3);

        var tc4 = document.createElement("treecell");
        tc4.setAttribute("label", "Unknown");
        tc4.setAttribute("id", "elapsed" + index);
        tr.appendChild(tc4);

        var tc5 = document.createElement("treecell");
        tc5.setAttribute("label", "Unknown");
        tc5.setAttribute("id", "ert" + index);
        tr.appendChild(tc5);
        
        var tc6 = document.createElement("treecell");
        tc5.setAttribute("label", "Unknown");
        tc5.setAttribute("id", "speed" + index);
        tr.appendChild(tc6);
        
        ti.appendChild(tr);
        treeChildren.appendChild(ti);
    },
    
    reportProgress: function reportProgress()
    {
        // May be removed
    },
    
    reportError: function reportError()
    {
        
    },
    
    onUnload: function onUnload(event)
    {
        var iccb = iitk.cse.cs213.bytubed;
        
        try
        {
            var qsMgr = iccb.queueStatusManager;
            //???
            //if(!qsMgr.alreadyFinished)
            //    qsMgr.finishUp();
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },
    
    // setStatus sets the given statusMessage in the status bar.
    setStatus: function setStatus(statusMessage)
    {
        var iccb = iitk.cse.cs213.bytubed;
        try
        {
            document.getElementById("status").label = statusMessage;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    }
}
