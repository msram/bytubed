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

IITK.CSE.CS213.BYTubeD.queueingStatusManager = {
    selectedVideoList   : null,
    destinationDirectory: "undefined",
    preferences         : null,
    invocationInfo		: null,

    successCount        : 0,
    failureCount        : 0,
    expiryTime          : null,
    alreadyFinished     : false,

    // onLoad is the handler for the event window.onload of qsMgr
    onLoad: function onLoad(event)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;
            document.getElementById("successConsole").focus();

            qsMgr.selectedVideoList    	= window.arguments[0];
            qsMgr.destinationDirectory  = window.arguments[1];
            qsMgr.preferences           = window.arguments[2];
            qsMgr.invocationInfo		= window.arguments[3];
            qsMgr.subtitleLanguageInfo  = window.arguments[4];

            qsMgr.setStatus("Processing selection...");
            document.getElementById("progressmeter").mode = "undetermined";

            var dqManager    = new iccb.DownloadQueueManager(
                                                        qsMgr.reportProgress,
                                                        qsMgr.reportError,
                                                        qsMgr.destinationDirectory,
                                                        qsMgr.selectedVideoList,
                                                        qsMgr.preferences,
                                                        qsMgr.subtitleLanguageInfo);
            dqManager.processQueue();
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    // setStatus sets the given statusMessage in the status bar.
    setStatus: function setStatus(statusMessage)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            document.getElementById("status").label = statusMessage;
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    // reportProgress is the callback function for the layers below this layer;
    // it's job is to report progress to the user.
    reportProgress: function reportProgress(progressMessage)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;

            qsMgr.successCount++;

            document.getElementById("successConsole").value += "[" + qsMgr.successCount + "] " +
                                                                progressMessage + "\n\n";

            var TextBoxElement = document.getElementById("successConsole");
            var ti = document.getAnonymousNodes(TextBoxElement)[0].childNodes[0];
            ti.scrollTop=ti.scrollHeight;

            qsMgr.updateProgress();
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    // reportError is the callback error handler function for the layers below this layer;
    // it's job is to report failures to the user.
    reportError: function reportError(errorMessage, requestedUrl, criticalError)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        
        if(criticalError)
            window.close();
        
        else try
        {
            var qsMgr = iccb.queueingStatusManager;
            qsMgr.failureCount++;

            var console = document.getElementById("errorConsole");

            errorMessage = iccb.stripHTML(errorMessage);
            
            if(errorMessage.indexOf("--") == -1)
                errorMessage = errorMessage.replace(/"(\s|\n)+/g, "\" -- ");
            if(!(/\.$/).test(errorMessage)) // if message doesn't end in '.' then append '.'.
                errorMessage += ".";

            console.value += "[" + qsMgr.failureCount + "] " + errorMessage + "\n\n";

            var TextBoxElement = document.getElementById("errorConsole");
            var ti = document.getAnonymousNodes(TextBoxElement)[0].childNodes[0];
            ti.scrollTop=ti.scrollHeight;

            qsMgr.updateProgress();
        }
        catch(error)
        {
            // Do nothing
        }
    },

    // updateProgress is the common task for reportProgress and reportError functions to
    // check if the assigned task is completed.
    updateProgress: function updateProgress()
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;

            var selCount = qsMgr.selectedVideoList.length;

            var progress    = document.getElementById("progressmeter");
            progress.mode   = "determined";
            progress.value  = 100*((qsMgr.successCount + qsMgr.failureCount)/selCount);

            qsMgr.setStatus(qsMgr.successCount +
                                    "/" + selCount +  " requests have been processed successfully; " +
                                    qsMgr.failureCount + " request" + 
                                    (qsMgr.failureCount == 1? " has ": "s have ") + "failed.");

            if(qsMgr.successCount + qsMgr.failureCount == qsMgr.selectedVideoList.length)
            {
                qsMgr.finishUp();
                qsMgr.alreadyFinished = true;
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    finishUp: function finishUp(terminate)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        if(!terminate) try
        {
            var qsMgr = iccb.queueingStatusManager;

            document.getElementById("successConsole").value +=
                "\n-------------- All the requests have been processed --------------\n\n";
            
            if(qsMgr.preferences.todo == iccb.GENERATE_LINKS)
            {
                qsMgr.prepareWatchLinksFile();
                qsMgr.prepareBadLinksTextFile();
                qsMgr.prepareGoodLinksTextFile();
                qsMgr.launchDownloadLinksFile();
            }

            if(qsMgr.failureCount > 0)
            {
                window.focus();
                document.getElementById("consoleTabs").selectedIndex = 1;
                document.getElementById("consolePanels").selectedIndex = 1;
            }

            if(qsMgr.preferences.todo == iccb.ENQUEUE_LINKS &&
                qsMgr.successCount > 0 && qsMgr.preferences.showDLWindow)
                iccb.services.downloadManagerUI.show();

            if(qsMgr.preferences.closeQStatusWindow && qsMgr.failureCount == 0)
            {
                window.close();
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
        else
        {
            window.close();
        }
    },

    commonHtml: function commonHtml()
    {
        var htmlString = "";
        var iccb = IITK.CSE.CS213.BYTubeD;

        try
        {
            htmlString += " <!DOCTYPE html>" +
                "\n <html>" +
                "\n\t <head>" +
                "\n\t\t <title>BYTubeD Generated Links</title>" +
                "\n\t\t <meta http-equiv=\"content-type\" content=\"text/html;charset=UTF-8\">" +
                "\n\t\t <style>"+
                "\n\t\t\t body      { font-family:Georgia,Ubuntu,Times,Sans; text-align:justify }" +
                "\n\t\t\t table     { border-collapse:collapse; margin-left:auto; margin-right:auto }" +
                "\n\t\t\t .green    { color:#006600; }" +
                "\n\t\t\t .gray     { color:#808080; }" +
                "\n\t\t\t .red      { color:#FF0000; }" +
                "\n\t\t\t .pink     { color:#FF00C0; }" +
                "\n\t\t\t .purple   { color:#C000FF; }" +
                "\n\t\t\t .ruby     { color:#C00000; }" +
                "\n\t\t\t .lightblue{ color:#4480FF; }" +
                "\n\t\t\t .center   { text-align:center; }" +
                "\n\t\t\t .fullwidth{ width:100%; }" +
                "\n\t\t\t .centerdiv{ margin:auto; }" +
                "\n\t\t\t .pad20    { padding:20px }" +
                "\n\t\t </style>" +
                "\n\t </head>" +
                "\n\t <body>";
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }

        return htmlString;
    },

    prepareBadLinksTextFile: function prepareBadLinksTextFile()
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;
            if(qsMgr.preferences.generateBadLinks)
            {
                var text = "";

                for(var i=0; i < qsMgr.selectedVideoList.length; i++)
                {
                    if(qsMgr.selectedVideoList[i].videoURL == "")
                    {
                        text += "http://www.youtube.com/watch?v=" + qsMgr.selectedVideoList[i].vid + "\n";
                    }
                }
                iccb.writeTextToFile(text,
                                            "bad_links_bytubed@cs213.cse.iitk.ac.in.txt",
                                            qsMgr.destinationDirectory,
                                            iccb.services.downloadManager
                                                                           .userDownloadsDirectory.path);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    prepareGoodLinksTextFile: function prepareGoodLinksTextFile()
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;

            if(qsMgr.preferences.generateGoodLinks)
            {
                var text = "";

                for(var i=0; i < qsMgr.selectedVideoList.length; i++)
                {
                    if(qsMgr.selectedVideoList[i].videoURL != "")
                    {
                        text += "http://www.youtube.com/watch?v=" + qsMgr.selectedVideoList[i].vid + "\n";
                    }
                }
                iccb.writeTextToFile(text,
                                            "good_links_bytubed@cs213.cse.iitk.ac.in.txt",
                                            qsMgr.destinationDirectory,
                                            iccb.services.downloadManager
                                                                           .userDownloadsDirectory.path);
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    prepareWatchLinksFile: function prepareWatchLinksFile()
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;

            if(!(qsMgr.preferences.generateFailedLinks || qsMgr.preferences.generateWatchLinks) || 
                (!qsMgr.preferences.generateFailedLinks && qsMgr.successCount == 0) ||
                (!qsMgr.preferences.generateWatchLinks && qsMgr.failureCount == 0))
                return;
            
            var htmlString = qsMgr.commonHtml();

            htmlString += "\n\t\t <div class=\"fullwidth center gray\">" +
                          "\n\t\t\t <b>BYTubeD Invocation Timestamp:</b> " +
                          qsMgr.invocationInfo.timeStamp + "" + "<br/>" +
                          "\n\t\t\t <b>Source page:</b> <a href=\"" +
                          qsMgr.invocationInfo.sourcePageUrl + "\">" +
                          qsMgr.invocationInfo.sourcePageTitle + "</a>" +
                          "\n\t\t </div>";

            // if there is atleast one failure and generateFailedLinks is true
            if(qsMgr.successCount < qsMgr.selectedVideoList.length && qsMgr.preferences.generateFailedLinks)
            {
                htmlString += "\n\t\t <br/><h2 class=\"red center\">" +
                              "Failed to generate download links for the following videos.</h2>" +
                              "\n\t\t <div id=\"failed_links\" class=\"pad20\">" +
                              "\n\t\t\t <table border=\"1\" cellpadding=\"5px\" " +
                              "style=\"border-collapse:collapse;margin-left:auto;margin-right:auto\">" +
                              "\n\t\t\t\t <tr><th>S.No</th><th>Title</th><th>Reason for failure</th></tr>";

                var k = 1;
                for(var i=0; i < qsMgr.selectedVideoList.length; i++)
                {
                    if(qsMgr.selectedVideoList[i].videoURL == "")
                    {
                        if(qsMgr.selectedVideoList[i].failureDescription == null)
                        {
                            qsMgr.selectedVideoList[i].failureDescription =
                                    "Didn't get enough time to process the request!";
                        }
                        if(qsMgr.selectedVideoList[i].displayTitle == "Loading...")
                            qsMgr.selectedVideoList[i].displayTitle = qsMgr.selectedVideoList[i].vid;

                        htmlString += "\n\t\t\t\t <tr><td>"+ (k++) +
                                        "</td><td><a href=\"http://www.youtube.com/watch?v=" +
                                        qsMgr.selectedVideoList[i].vid + "\">" +
                                        qsMgr.selectedVideoList[i].displayTitle +
                                        "</a></td><td>" +
                                        qsMgr.selectedVideoList[i].failureDescription.replace(/\n/g, " ") +
                                        "</td></tr>";
                    }
                }
                htmlString += "\n\t\t\t </table>" +
                              "\n\t\t </div>";
            }

            if(qsMgr.successCount && qsMgr.preferences.generateWatchLinks)
            {
                if(qsMgr.failureCount)
                    htmlString += "\n\n\t\t <br /><hr size=\"1\" />";

                htmlString += "\n\t\t" +
                              "\n\t\t <br/><h2 class=\"center\">" +
                              "YouTube page links of the successful requests:</h2>" +
                              "\n\t\t <div id=\"successful_links\" class=\"pad20\">" +
                              "\n\t\t\t <table border=\"1\" cellpadding=\"5px\">" +
                              "\n\t\t\t\t <tr><th>S.No</th><th>Title</th></tr>";

                var k = 1;
                for(var i=0; i < qsMgr.selectedVideoList.length; i++)
                {
                    if(qsMgr.selectedVideoList[i].videoURL != "")
                    {
                        htmlString += "\n\t\t\t\t <tr><td>"+ (k++) +
                            "</td><td><a href=\"http://www.youtube.com/watch?v=" +
                            qsMgr.selectedVideoList[i].vid + "\">" +
                            qsMgr.selectedVideoList[i].displayTitle + "</a></td></tr>";
                    }
                }
                htmlString += "\n\t\t\t </table>" +
                              "\n\t\t </div>";
            }

            htmlString += "\n\t </body>" +
                          "\n </html>";

            iccb.writeTextToFile(htmlString,
                                    "watch_links_bytubed@cs213.cse.iitk.ac.in.html",
                                    qsMgr.destinationDirectory,
                                    iccb.services.downloadManager.userDownloadsDirectory.path);
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    },

    launchDownloadLinksFile: function launchDownloadLinksFile()
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;

            var htmlString = qsMgr.commonHtml();

            if(qsMgr.successCount)
            {
                for(var i=0; i<qsMgr.selectedVideoList.length; i++)
                    if(qsMgr.selectedVideoList[i].expiryTime)
                        qsMgr.expiryTime = qsMgr.selectedVideoList[i].expiryTime;

                var txt = qsMgr.successCount == 1? " downloadable video link." :
                                                   " downloadable video links.";
                htmlString  += "\n\t\t <br/>" +
                               "\n\t\t <div class=\"center\">" +
                               "\n\t\t\t <h2 class=\"green\"> BYTubeD has generated " +
                               qsMgr.successCount + txt + "</h2>" +
                               "\n\t\t\t Invoke a download manager, such as <b>DownThemAll</b>, " +
                               "on this page to download these videos." +
                               "\n\t\t\t <br/>" +
                               "\n\t\t\t <br/><hr size=\"1\" width=\"80%\"/><br/>" +
                               "\n\t\t\t <span class=\"gray\">" +
                               "\n\t\t\t\t If you do not have a download manger, " +
                               "you can click on the links below and download the videos one by one.<br/>" +
                               "\n\t\t\t\t But batch download becomes far easier " +
                               "if you have a download manager like DownThemAll.<br/>" +
                               "\n\t\t\t </span>" +
                               "\n\t\t </div>" +
                               "\n\t\t <p/>";

                htmlString  += "\n\t\t <div id=\"links\">" +
                               "\n\t\t\t <table border=\"1\" cellpadding=\"5px\">" +
                               "\n\t\t\t\t <tr><th>S.No</th><th>Title</th><th>Quality</th>" + 
                               (qsMgr.preferences.fetchSubtitles? "<th>Subtitles</th>" : "") +
                               "</tr>";

                var k = 1;
                for(var i=0; i < qsMgr.selectedVideoList.length; i++)
                {
                    if(qsMgr.selectedVideoList[i].videoURL != "")
                    {
                        var fetchedLangName = qsMgr.selectedVideoList[i].fetchedLangName;
                        var actualPrefLangName  = qsMgr.selectedVideoList[i].actualPrefLangName;
                        
                        htmlString += "\n\t\t\t\t <tr><td>"+ (k++) + "</td><td><a href=\"" +
                                        qsMgr.selectedVideoList[i].videoURL + "\">" +
                                        qsMgr.selectedVideoList[i].displayTitle +
                                        qsMgr.selectedVideoList[i].bestMatchFormat +
                                        "</a></td><td>" + qsMgr.selectedVideoList[i].videoQuality + "</td>" +
                                        (qsMgr.preferences.fetchSubtitles?
                                            "<td>" + (fetchedLangName == null? "None" : "<span class='ruby'>" + fetchedLangName + "</span>") +
                                            ((!actualPrefLangName || fetchedLangName == actualPrefLangName)? "" : "<br/>for " + actualPrefLangName) + "</td>"
                                            : "") +
                                        "</tr>";
                    }
                }
                htmlString += "\n\t\t\t </table>" +
                              "\n\t\t </div>";
            }
            else
            {
                htmlString += "\n\t\t <br/><h2 calss=\"center\"> " +
                               "BYTubeD has not generated any downnload links.</h2>\n";
            }
            
            if(qsMgr.expiryTime)
                        htmlString += "\n\t\t <br/><div class='center gray'>" +
                                        "Link Generation Time: " + new Date() +
                                        "<br/>Link Expiry Time: " + qsMgr.expiryTime +
                                        "</div><br/><hr size=\"1\" width=\"80%\"/><br/><br/>";
            var file1 = null;
            if( (qsMgr.preferences.generateFailedLinks && qsMgr.failureCount > 0) ||
                (qsMgr.preferences.generateWatchLinks && qsMgr.successCount))
            {
                try
                {
                    file1 = Components.classes["@mozilla.org/file/local;1"]
                                     .createInstance(Components.interfaces.nsILocalFile);
                    file1.initWithPath(qsMgr.destinationDirectory);
                    file1.append("watch_links_bytubed@cs213.cse.iitk.ac.in.html");
                    htmlString += "<div class=\"center\">" +
                                    "See <a href=\"watch_links_bytubed@cs213.cse.iitk.ac.in.html\">" +
                                        file1.path + "</a> for YouTube page links.</div><br/>";
                }
                catch(error)
                {
                    // alert(error);
                }
            }

            htmlString += "\n\t </body>" +
                          "\n </html>";

            var file = iccb.writeTextToFile(htmlString,
                                        "download_links_bytubed@cs213.cse.iitk.ac.in.html",
                                        qsMgr.destinationDirectory,
                                        iccb.services.downloadManager.userDownloadsDirectory.path);

            if(file == null && file1 == null)
            {
                iccb.services.promptService.confirm(window,
                    "File write failed!",
                    "Probably you don't have write permissions on the destination directory.");
            }
            else
            {
                var launchPath = (qsMgr.successCount > 0 || file1 == null) ? file.path : file1.path;
                
                var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
                                .getService(Components.interfaces.nsIWindowMediator)
                                .getMostRecentWindow('navigator:browser');

                if(win)
                    win.openUILinkIn("file:///" + launchPath, 'tab');
                else
                {
                    window.open("about:blank", "_old_window");  // Opens firefox
                    window.open("file:///" + launchPath, "_old_window"); // opens launchPath
                }
            }
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
            window.close();
        }
    },

    onUnload: function onUnload(event)
    {
        var iccb = IITK.CSE.CS213.BYTubeD;
        try
        {
            var qsMgr = iccb.queueingStatusManager;
            if(!qsMgr.alreadyFinished)
                qsMgr.finishUp(!qsMgr.alreadyFinished);
        }
        catch(error)
        {
            iccb.reportProblem(error, arguments.callee.name);
        }
    }
};
