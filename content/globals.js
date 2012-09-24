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

// Addon id
IITK.CSE.CS213.BYTubeD.addonId = "bytubed@cs213.cse.iitk.ac.in";

try
{
    Components.utils.import("resource://gre/modules/AddonManager.jsm");

    AddonManager.getAddonByID(IITK.CSE.CS213.BYTubeD.addonId, function(addon) {
            IITK.CSE.CS213.BYTubeD.versionNumber = addon.version;
        });
}
catch(error)
{
    // iccb.reportProblem(error, arguments.callee.name);
}

// Constants for preference.todo
IITK.CSE.CS213.BYTubeD.GENERATE_LINKS = 0;
IITK.CSE.CS213.BYTubeD.ENQUEUE_LINKS = 1;

// Suppress error messages
IITK.CSE.CS213.BYTubeD.suppressErrorMessages = false;


// ------------------------ User interaction routines begin ---------------------------

IITK.CSE.CS213.BYTubeD.reportRequestMessage = "There was some problem while I was doing my job.\n"+
                                              "Please consider reporting this problem to my boss.\n\n" +
                                              "If you say \"OK\", then a mail window will be opened,\n" +
                                              "if you already have a mail client configured.";

IITK.CSE.CS213.BYTubeD.reportProblem = function reportProblem(e, functionName)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    if(! iccb.suppressErrorMessages)
    {
        var ps   = iccb.services.promptService;
        try
        {
            var eMsg = " " + e + ".\n\n This error occurred in line# " + e.lineNumber + " of " + e.fileName + 
                          "\n while executing the " + functionName + " function.\n\n " ;
            
            var ok   = ps.confirm(null, "Oops!", iccb.reportRequestMessage);

            if(ok)
            {
                var aWindow = window.open("mailto:bytubed@gmail.com?subject=BYTubeD " +
                                            iccb.versionNumber +
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


// _showObjectProperties: shows the properties of obj as a list of key-value pairs
// will be used for debugging.
IITK.CSE.CS213.BYTubeD._showObjectProperties = function _showObjectProperties(obj)
{
    try
    {
        var str = "";
        for(key in obj)
            str += key + " -> " + obj[key] + "\n";
        alert(str); // Let this alert be there. 
    }
    catch(error)
    {
        alert(error);
    }
};

// ------------------------ User interaction routines end ---------------------------

/**
*   
*   General utilities follow
*   ------------------------
*
**/

// Prepend a number with zeros: num is the number and count is the total number of digits at the end
IITK.CSE.CS213.BYTubeD.zeroPad = function zeroPad(num, count)
{
    try
    {
        var numZeropad = num + "";
        while(numZeropad.length < count)
        {
            numZeropad = "0" + numZeropad;
        }
        return numZeropad;
    }
    catch(error)
    {
        return ("000" + num);
    }
};

// commpute the number of digits in num
IITK.CSE.CS213.BYTubeD.digitCount = function digitCount(num)
{
    try
    {
        var nDigits = 0;
        while(num >= 1)
        {
            num /= 10;
            nDigits++;
        }
        return nDigits;
    }
    catch(error)
    {
        return 0;
    }
};

// getParamsFromUrl returns a dictionary of key-val pairs based on the query string in url
// returns null if there is no query string in the url
IITK.CSE.CS213.BYTubeD.getParamsFromUrl = function getParamsFromUrl(url)
{
    try
    {
        if(url.indexOf("?") == -1)
            return null;
        
        var params = new Array();
        
        var qString = url.split("?")[1];
        var keyValPairs = qString.split("&");
        for(var i=0; i<keyValPairs.length; i++)
        {
            var parts = keyValPairs[i].split("=");
            var key = unescape(parts[0]);
            var val = unescape(parts[1]);
            
            params[key] = val;
        }
        return params;
    }
    catch(error)
    {
        return null;
    }
}

// getIndexByKey returns the index of objList for which objList[index][key] and value areEqual.
// areEqual is the function to use to say whether two 'things' are equal.
// returns -1 if key is not found in objList[i] or objList[i][key] != value for any i.
IITK.CSE.CS213.BYTubeD.getIndexByKey = function getIndexByKey(objList, key, value, areEqual)
{
    // This function is only for integer-indexed objLists. 
    // Use a different function for string-indexed objLists.
    
    try
    {
        //for(var i in objList) // don't use this kind of indexing here. it generates only 'string' index.
        for(var i=0; i<objList.length; i++)
        {
            if(key in objList[i] && areEqual(objList[i][key], value))
            {
                return i;
            }
        }
    }
    catch(error) { }
    return -1;
}

IITK.CSE.CS213.BYTubeD.stripHTML = function stripHTML(text)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        return iccb.escapeEntities(text.replace(/<(?:.|\n)*?>/gm, '').replace(/^(\s)+|(\s)+$/g, ""));
    }
    catch(e)
    {
        return "Some problem occurred in stripHTML: " + e.message;
    }
}

IITK.CSE.CS213.BYTubeD.escapeEntities = function escapeEntities(inputText)  
{
    return inputText.replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&#39;/g, "'")
                  .replace(/&quot;/g, "\"");
};

// -------------------------------------------------------------------------------------------
// --------------------------------- END OF General Utilities --------------------------------
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// ---------------------------------- File Operations begin ----------------------------------
// -----------------------------------------------------------------------------

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
            file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        }
        return file;
    }
    catch(error)
    {
        return null;
        // Important to return null because a problem could have occurred after 1st step above.
    }
};


IITK.CSE.CS213.BYTubeD.writeTextToFileByFileRef = function writeTextToFileByFileRef(text, fileRef)
{
    try
    {
        // file is nsIFile, data is a string
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                       createInstance(Components.interfaces.nsIFileOutputStream);

        // use 0x02 | 0x10 to open file for appending.
        foStream.init(fileRef, 0x02 | 0x08 | 0x20, 0666, 0);
        // write, create, truncate

        // Write UTF-8 BOM: EF BB BF
        var str = "";
        str += String.fromCharCode(0xEF) + String.fromCharCode(0xBB) + String.fromCharCode(0xBF);
        foStream.write(str, str.length);
        
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                        createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);
        converter.writeString(text);
        converter.close(); // this closes foStream
        return true;
    }
    catch(error)
    {
        //IITK.CSE.CS213.BYTubeD.services.promptService.confirm(window,
        //    "File write failed!",
        //    "Writing text to " + (file? file.path: "file") + " failed due to " + error.message + ".");
        return false;
    }
};

// getPathSeparator: returns file path separator under current OS
// Suggested by bhovhannes on StackOverFlow
// http://stackoverflow.com/questions/5814143/how-to-check-the-directory-separator-in-xpcom-component-via-js
IITK.CSE.CS213.BYTubeD.getPathSeparator = function getPathSeparator()
{
    try
    {
        var profD = Components.classes["@mozilla.org/file/directory_service;1"]
                              .getService(Components.interfaces.nsIProperties)
                              .get("ProfD", Components.interfaces.nsIFile);
        profD.append("abc");
        profD.append("abc");
        var length = profD.path.length;
        return profD.path.substr(length-("abc".length)-1,1);
    }
    catch(error)
    {
        return null;
    }
}

/*
    saveTextInAddonDirectory: allows saving something like logs and other data in the addon directory
        text: text to be saved
        fileName: name of the file
        destDir: destination directory as a string 
               : nested directories should be seperated by '/' (forward slash)
*/ 
IITK.CSE.CS213.BYTubeD.saveTextInAddonDirectory = function saveTextInAddonDirectory(text, fileName, destDir)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        var Cc = Components.classes;
        var Ci = Components.interfaces;
        
        var directoryService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
        
        // this is a reference to the profile dir (ProfD) now.
        var localDir = directoryService.get("ProfD", Ci.nsIFile);

        if (!localDir.exists() || !localDir.isDirectory()) {
            // read and write permissions to owner and group, read-only for others.
            localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
        }

        var sep = iccb.getPathSeparator();
        destDir = destDir.replace("/", sep);
        
        var dirName = localDir.path + sep + "extensions" + sep + "bytubed_cs213.cse.iitk.ac.in" + sep + destDir;
        
        var fileWritten = false;
        
        try
        {
            Components.utils.import("resource://gre/modules/AddonManager.jsm");
            AddonManager.getAddonByID(iccb.addonId, function(aAddon) {
                var file1 = aAddon.getResourceURI("install.rdf")
                               .QueryInterface(Components.interfaces.nsIFileURL).file;
                
                dirName = file1.path.replace("install.rdf", destDir);
                
                var file = iccb.createFileIfNotExists(fileName, dirName);
                if(file)
                {
                    fileWritten = iccb.writeTextToFileByFileRef(text, file);
                }
            });
        } catch(error) { /* Ignore */    }
        return fileWritten;
    }
    catch(error)
    {
        // iccb.reportProblem(error, arguments.callee.name);
        return false;
    }
};

IITK.CSE.CS213.BYTubeD.writeTextToFile = function writeTextToFile(text,
                                                                    fileName,
                                                                    primaryDestination,
                                                                    secondaryDestination)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
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
            file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        }
    
        iccb.writeTextToFileByFileRef(text, file);
    }
    catch(error)
    {
        // iccb.services.promptService.confirm(window,
        //    "File write failed!",
        //    "Probably you don't have write permissions on the destination directory.");
        return null;
    }
    return file;
};

// Return: text, on success; null, if file read fails
IITK.CSE.CS213.BYTubeD.readTextFromFileByFileRef = function readTextFromFileByFileRef(fileRef)
{   
    try
    {
        var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                       createInstance(Components.interfaces.nsIFileInputStream);

        // Open file in read-only mode
        fiStream.init(fileRef, -1, -1, 0);
        
        // Read the UTF-8 BOM: EF BB BF
        // var str = "";
        // fiStream.read(str, 3);
        
        var converter = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                        createInstance(Components.interfaces.nsIConverterInputStream);
        converter.init(fiStream, "UTF-8", 0, 0);
        
        var text = "";
        var str = {};
        while (converter.readString(4096, str) != 0) {
          text += str.value;
        }
        
        converter.close(); // this closes fiStream
        return text;
    }
    catch(error)
    {
        /*
        IITK.CSE.CS213.BYTubeD.services.promptService.confirm(window,
            "File read failed!",
            "Reading text from " + fileRef.path + " failed due to " + error.message + " in line " + error.lineNumber + ".");
        */
    }
    return null;
};


/*
    readTextFromAddonDirectory: allows reading the contents of a text file in the addon directory
        fileName: name of the file
        destDir: destination directory as a string 
               : nested directories should be seperated by '/' (forward slash)
               
    callsback with text, which is either a string or null based on whether the file read was successful or not.
*/ 
IITK.CSE.CS213.BYTubeD.readTextFromAddonDirectory = function readTextFromAddonDirectory(fileName, destDir, callback)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    var text = null;
    try
    {
        var Cc = Components.classes;
        var Ci = Components.interfaces;
        
        var directoryService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
        
        // this is a reference to the profile dir (ProfD) now.
        var localDir = directoryService.get("ProfD", Ci.nsIFile);

        if (!localDir.exists() || !localDir.isDirectory()) {
            // read and write permissions to owner and group, read-only for others.
            localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
        }

        var sep = iccb.getPathSeparator();
        destDir = destDir.replace("/", sep);
        
        var dirName = localDir.path + sep + "extensions" + sep + "bytubed_cs213.cse.iitk.ac.in" + sep + destDir;
        
        try
        {
            var done = false;
            Components.utils.import("resource://gre/modules/AddonManager.jsm");
            AddonManager.getAddonByID(iccb.addonId, function(aAddon) {
                var file1 = aAddon.getResourceURI("install.rdf")
                               .QueryInterface(Components.interfaces.nsIFileURL).file;
                
                dirName = file1.path.replace("install.rdf", destDir);
                
                var file = iccb.File(fileName, dirName);
                if(file)
                {
                    text = iccb.readTextFromFileByFileRef(file);
                }
                callback(text);
            });
            
        } catch(error) { callback(null); }
    } catch(error) { callback(null); }
};

// --------------------------------------------------------------------------------------------
// ---------------------------------- END OF FILE OPERATIONS ----------------------------------
// --------------------------------------------------------------------------------------------


/* 
    Following global functions deal with XUL objects
*/

// removeAllItems removes all items from listObject.
IITK.CSE.CS213.BYTubeD.removeAllItems = function removeAllItems(listObject)
{
    try
    {
        var count = listObject.itemCount;
        while(count-- > 0)
        {
            listObject.removeItemAt(0);
        }
    }
    catch(error)
    {
        // alert(error);
    }
}

// restoreSelectionByValue sets the selection of menuList to the given selectedValue
// Use it only for menulist control; don't use it for listbox control.
IITK.CSE.CS213.BYTubeD.restoreSelectionByValue = function(menuList, selectedValue)
{
    var iccb = IITK.CSE.CS213.BYTubeD;
    try
    {
        var curValue = "";
        for(var i=0; i<menuList.itemCount; i++)
        {
            var curValue = menuList.getItemAtIndex(i).value;
            
            if(selectedValue == curValue)
            {
                menuList.selectedIndex = i;
                break;
            }
        }
    }
    catch(error)
    {
        iccb.reportProblem(error, arguments.callee.name);
    }
}
// --------------------------- XUL operations END ---------------------------------