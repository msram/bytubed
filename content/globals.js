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

if(!IITK)
    var IITK = {};

if(!IITK.CSE)
    IITK.CSE = {};

if(!IITK.CSE.CS213)
    IITK.CSE.CS213 = {};

if(!IITK.CSE.CS213.BYTubeD)
    IITK.CSE.CS213.BYTubeD = {};

IITK.CSE.CS213.BYTubeD.services = {
    downloadManager  :  Components.classes["@mozilla.org/download-manager;1"]
                                  .getService(Components.interfaces.nsIDownloadManager),

    downloadManagerUI:  Components.classes["@mozilla.org/download-manager-ui;1"]
                                  .getService(Components.interfaces.nsIDownloadManagerUI),

    promptService    :  Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService),

    networkIOService :  Components.classes["@mozilla.org/network/io-service;1"]
                                  .getService(Components.interfaces.nsIIOService)
};

// BYTubeD Preferences
IITK.CSE.CS213.BYTubeD.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                         .getService(Components.interfaces.nsIPrefService)
                                         .getBranch("extensions.bytubed@cs213.cse.iitk.ac.in.");


// Version number
IITK.CSE.CS213.BYTubeD.versionNumber = "";

try
{
    Components.utils.import("resource://gre/modules/AddonManager.jsm");

    AddonManager.getAddonByID("bytubed@cs213.cse.iitk.ac.in", function(addon) {
            IITK.CSE.CS213.BYTubeD.versionNumber = addon.version;
        });
}
catch(error)
{
    // Ignore
}

// Constants for preference.todo
IITK.CSE.CS213.BYTubeD.GENERATE_LINKS = 0;
IITK.CSE.CS213.BYTubeD.ENQUEUE_LINKS = 1;

// Suppress error messages
IITK.CSE.CS213.BYTubeD.suppressErrorMessages = false;

IITK.CSE.CS213.BYTubeD.reportRequestMessage = "There was some problem while I was doing my job.\n"+
                                              "Please consider reporting this problem to my boss.\n\n" +
                                              "If you say \"OK\", then a mail window will be opened,\n" +
                                              "if you already have a mail client configured.";

IITK.CSE.CS213.BYTubeD.reportProblem = function reportProblem(e, functionName)
{
    if(! IITK.CSE.CS213.BYTubeD.suppressErrorMessages)
    {
        var ps   = IITK.CSE.CS213.BYTubeD.services.promptService;
        try
        {
            var eMsg = " " + e;

            var ok   = ps.confirm(null, "Oops!", IITK.CSE.CS213.BYTubeD.reportRequestMessage);

            if(ok)
            {
                var aWindow = window.open("mailto:bytubed@gmail.com?subject=BYTubeD " +
                                            IITK.CSE.CS213.BYTubeD.versionNumber +
                                            " Error Report&body=" + eMsg,
                                        "mail", "width=100,height=100");

                aWindow.close();
            }
        }
        catch(error)
        {
            ps.alert(window, "Hmmmmm!", error + "\n\n" + e);
        }
    }
};

// Prepend a number with zeros: num is the number and count is the total number of digits at the end
IITK.CSE.CS213.BYTubeD.zeroPad = function zeroPad(num, count)
{
    var numZeropad = num + "";
    while(numZeropad.length < count)
    {
        numZeropad = "0" + numZeropad;
    }
    return numZeropad;
};

// commpute the number of digits in num
IITK.CSE.CS213.BYTubeD.digitCount = function digitCount(num)
{
    var nDigits = 0;
    while(num >= 1)
    {
        num /= 10;
        nDigits++;
    }
    return nDigits;
};

/*
 * File Operations
 */

// Create a nsILocalFile object for a given fileName in the given directory.
IITK.CSE.CS213.BYTubeD.File = function File(fileName, directory)
{
    var file = null;
    try
    {
        file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);

        file.initWithPath(directory);
        file.append(fileName);
    }
    catch(error)
    {
        return null;
        // Important to return null because a problem could have occurred after 1st step above.
    }
    return file;
};

IITK.CSE.CS213.BYTubeD.createFileIfNotExists = function createFileIfNotExists(fileName, directory)
{
    var file = null;
    try
    {
        file = IITK.CSE.CS213.BYTubeD.File(fileName, directory);
        if(file && (!file.exists() || !file.isFile()))
        {
            try
            {
                file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
            }
            catch(error)
            {
                return null;
            }
        }
    }
    catch(error)
    {
        IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
    }
    return file;
};

IITK.CSE.CS213.BYTubeD.writeTextToFile = function writeTextToFile(text,
                                                                    fileName,
                                                                    primaryDestination,
                                                                    secondaryDestination)
{
    var file = null;
    try
    {
        file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);

        try
        {
            file.initWithPath(primaryDestination);
        }
        catch(error)
        {
            file.initWithPath(secondaryDestination);
        }
        file.append(fileName);

        if( !file.exists() || !file.isFile() )
        {
            try
            {
                file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
            }
            catch(error)
            {
                IITK.CSE.CS213.BYTubeD.services.promptService.confirm(window,
                    "File write failed!",
                    "Probably you don't have write permissions on the destination directory.");
                return null;
            }
        }
        // do whatever you need to the created file
        //alert(file.path);

        // file is nsIFile, data is a string
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                       createInstance(Components.interfaces.nsIFileOutputStream);

        // use 0x02 | 0x10 to open file for appending.
        foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
        // write, create, truncate

        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                        createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);
        converter.writeString(text);
        converter.close(); // this closes foStream
    }
    catch(error)
    {
        IITK.CSE.CS213.BYTubeD.reportProblem(error, arguments.callee.name);
    }
    return file;
};

