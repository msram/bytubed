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

if(!iitk)
    var iitk = {};

if(!iitk.cse)
    iitk.cse = {};

if(!iitk.cse.cs213)
    iitk.cse.cs213 = {};

if(!iitk.cse.cs213.bytubed)
    iitk.cse.cs213.bytubed = {};

iitk.cse.cs213.bytubed.services = {
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
iitk.cse.cs213.bytubed.prefs    = Components.classes["@mozilla.org/preferences-service;1"]
                                         .getService(Components.interfaces.nsIPrefService)
                                         .getBranch("extensions.bytubed@cs213.cse.iitk.ac.in.");

// BYTubeD strings
iitk.cse.cs213.bytubed.strings  = {
    _bundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
                       .getService(Components.interfaces.nsIStringBundleService)
                       .createBundle("chrome://BYTubeD/locale/BYTubeD.properties"),
    getString: function getString(str)
    {
         return this._bundle.GetStringFromName(str);
    },
    getFormattedString: function getFormattedString(str, args)
    {
        return this._bundle.formatStringFromName(str, args, args.length);
    }
};

// Version number
iitk.cse.cs213.bytubed.versionNumber = "";

// Addon id
iitk.cse.cs213.bytubed.addonId = "bytubed@cs213.cse.iitk.ac.in";

try
{
    Components.utils.import("resource://gre/modules/AddonManager.jsm");

    AddonManager.getAddonByID(iitk.cse.cs213.bytubed.addonId, function(addon) {
            iitk.cse.cs213.bytubed.versionNumber = addon.version;
        });
}
catch(error)
{
    // iccb.reportProblem(error, arguments.callee.name);
}

// Constants for preference.todo
iitk.cse.cs213.bytubed.GENERATE_LINKS = 0;
iitk.cse.cs213.bytubed.ENQUEUE_LINKS = 1;

// Suppress error messages
iitk.cse.cs213.bytubed.suppresErrors = false;


// ------------------------ User interaction routines begin ---------------------------

iitk.cse.cs213.bytubed.reportRequestMessage = iitk.cse.cs213.bytubed.strings.getString("ReportRequestMessage");

iitk.cse.cs213.bytubed.reportProblem = function reportProblem(e, functionName)
{
    var iccb = iitk.cse.cs213.bytubed;
    if(! iccb.suppresErrors)
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
iitk.cse.cs213.bytubed._showObjectProperties = function _showObjectProperties(obj)
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
iitk.cse.cs213.bytubed.zeroPad = function zeroPad(num, count)
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
iitk.cse.cs213.bytubed.digitCount = function digitCount(num)
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
iitk.cse.cs213.bytubed.getParamsFromUrl = function getParamsFromUrl(url)
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
iitk.cse.cs213.bytubed.getIndexByKey = function getIndexByKey(objList, key, value, areEqual)
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

iitk.cse.cs213.bytubed.stripHTML = function stripHTML(text, stripLevel)
{
    var iccb = iitk.cse.cs213.bytubed;
    try
    {
        // Based on the post by Lenka (http://stackoverflow.com/users/876375/lenka) on
        // http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
        // and ThiefMaster (http://stackoverflow.com/users/298479/thiefmaster) on
        // http://stackoverflow.com/questions/6659351/removing-all-script-tags-from-html-with-js-regular-expression
        
        var returnText = text;
        
        switch(stripLevel)
        {
            case 3:
                //-- remove all inside SCRIPT and STYLE tags
                returnText = returnText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gim, "");
                returnText = returnText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gim, "");
                // DO NOT break.
                
            case 2:
                //-- remove BR tags and replace them with line break
                returnText = returnText.replace(/<br>/gi, "\n");
                returnText = returnText.replace(/<br(\s)*\/>/gim, "\n");
                // DO NOT break.
                
            case 1:
                //-- remove all else
                returnText = returnText.replace(/<(?:.|\s|\n)*?>/gm, "");

                //-- get rid of more than 2 multiple line breaks:
                returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

                //-- get rid of html-encoded characters:
                returnText = iccb.escapeEntities(returnText);
                
                //-- get rid of more than 1 spaces:
                returnText = returnText.replace(/(\s)+/gm,' ');
                
                //-- strip space at the beginning and ending
                returnText = returnText.replace(/^(\s)+|(\s)+$/gm, "");
                
                break;
            
            default:
                returnText = iccb.escapeEntities(text.replace(/<(?:.|\n)*?>/gm, ''));
                break;
        }
        
        //-- return
        return returnText;
    }
    catch(e)
    {
        return iccb.escapeEntities(text.replace(/<(?:.|\n)*?>/gm, ''));
    }
}

iitk.cse.cs213.bytubed.escapeEntities = function escapeEntities(inputText)  
{
    return inputText.replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&#39;/g, "'")
                    .replace(/&quot;/g, "\"")
                    .replace(/&nbsp;/gi," ");
};

// -------------------------------------------------------------------------------------------
// --------------------------------- END OF General Utilities --------------------------------
// -------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------
// ---------------------------------- File Operations begin ----------------------------------
// -----------------------------------------------------------------------------

// Create a nsILocalFile object for a given fileName in the given directory.
iitk.cse.cs213.bytubed.File = function File(fileName, directory)
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

iitk.cse.cs213.bytubed.createFileIfNotExists = function createFileIfNotExists(fileName, directory)
{
    var iccb = iitk.cse.cs213.bytubed;
    var file = null;
    try
    {
        file = iccb.File(fileName, directory);
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


iitk.cse.cs213.bytubed.writeTextToFileByFileRef = function writeTextToFileByFileRef(text, fileRef)
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
        //iitk.cse.cs213.bytubed.services.promptService.confirm(window,
        //    "File write failed!",
        //    "Writing text to " + (file? file.path: "file") + " failed due to " + error.message + ".");
        return false;
    }
};

// getPathSeparator: returns file path separator under current OS
// Suggested by bhovhannes on StackOverFlow
// http://stackoverflow.com/questions/5814143/how-to-check-the-directory-separator-in-xpcom-component-via-js
iitk.cse.cs213.bytubed.getPathSeparator = function getPathSeparator()
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
iitk.cse.cs213.bytubed.saveTextInAddonDirectory = function saveTextInAddonDirectory(text, fileName, destDir)
{
    var iccb = iitk.cse.cs213.bytubed;
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

iitk.cse.cs213.bytubed.writeTextToFile = function writeTextToFile(text,
                                                                    fileName,
                                                                    primaryDestination,
                                                                    secondaryDestination)
{
    var iccb = iitk.cse.cs213.bytubed;
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
        iccb.services.promptService.alert(window,
            iccb.strings.getString("FileWriteFailed"),
            iccb.strings.getString("NoWritePermission"));
        return null;
    }
    return file;
};

// Return: text, on success; null, if file read fails
iitk.cse.cs213.bytubed.readTextFromFileByFileRef = function readTextFromFileByFileRef(fileRef)
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
        iitk.cse.cs213.bytubed.services.promptService.confirm(window,
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
iitk.cse.cs213.bytubed.readTextFromAddonDirectory = function readTextFromAddonDirectory(fileName, destDir, callback)
{
    var iccb = iitk.cse.cs213.bytubed;
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
iitk.cse.cs213.bytubed.removeAllItems = function removeAllItems(listObject)
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
iitk.cse.cs213.bytubed.restoreSelectionByValue = function(menuList, selectedValue)
{
    var iccb = iitk.cse.cs213.bytubed;
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