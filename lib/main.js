var self = require("sdk/self");
const {Cc,Ci,Cu} = require("chrome");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var tab_utils = require("sdk/tabs/utils");
var browserWindows = require("sdk/windows").browserWindows;

Cu.import("resource://gre/modules/Services.jsm");
Services.scriptloader.loadSubScript("chrome://BYTubeD/content/defaultprefs.js",
                                    {pref:setDefaultPref} );

var button = buttons.ActionButton({
	id: "BYTubeDButton",
	label: "BYTubeD - Bulk Youtube Video Downloader",
	icon: {
		"16": self.data.url("Down-16.png"),
		"24": self.data.url("Down-24.png"),
		"32": self.data.url("Down-32.png"),
		"64": self.data.url("Down-64.png")
	},
	onClick: handleClick
});

function handleClick(state) {
	var { viewFor } = require("sdk/view/core");
	// get the XUL tab that corresponds to this high-level tab
	var tab = tabs.activeTab;
	var lowLevelTab = viewFor(tab);
	// now we can, for example, access the tab's content directly
	var browsers = tab_utils.getBrowserForTab(lowLevelTab);
	var chromeWindow = viewFor(browserWindows.activeWindow);
	var contentDocument = browsers.contentDocument;

	try
	{
		chromeWindow.openDialog("chrome://BYTubeD/content/selectionManager.xul", "BYTubeD", "chrome,centerscreen,all,menubar=no", contentDocument, browsers);

	}
	catch(error)
	{
		iitk.cse.cs213.bytubed.reportProblem(error, arguments.callee.name);
	}
}

var menuitem = require("menuitems").Menuitem({
	id: "BYTubeD_Menu",
	menuid: "menu_ToolsPopup",
	label: "BYTubeD",
	accesskey: "y",
	image: self.data.url("Down-16.png"),
	onCommand: function() {
		handleClick();
	}
});


var contextMenu = require("sdk/context-menu");
var contextMenuItem = contextMenu.Item({
	label: "BYTubeD",
	accesskey: "y",
	image: self.data.url("Down-16.png"),
	contentScript: 'self.on("click", function (node, data) {self.postMessage("clicked");});',
	onMessage: handleClick
});


function getGenericPref(branch,prefName)
{
    switch (branch.getPrefType(prefName))
    {
        default:
        case 0:   return undefined;                      // PREF_INVALID
        case 32:  return getUCharPref(prefName,branch);  // PREF_STRING
        case 64:  return branch.getIntPref(prefName);    // PREF_INT
        case 128: return branch.getBoolPref(prefName);   // PREF_BOOL
    }
}
function setGenericPref(branch,prefName,prefValue)
{
    switch (typeof prefValue)
    {
      case "string":
          setUCharPref(prefName,prefValue,branch);
          return;
      case "number":
          branch.setIntPref(prefName,prefValue);
          return;
      case "boolean":
          branch.setBoolPref(prefName,prefValue);
          return;
    }
}
function setDefaultPref(prefName,prefValue)
{
    var defaultBranch = Services.prefs.getDefaultBranch(null);
    setGenericPref(defaultBranch,prefName,prefValue);
}
function getUCharPref(prefName,branch)  // Unicode getCharPref
{
    branch = branch ? branch : Services.prefs;
    return branch.getComplexValue(prefName, Ci.nsISupportsString).data;
}
function setUCharPref(prefName,text,branch)  // Unicode setCharPref
{
    var string = Cc["@mozilla.org/supports-string;1"]
                           .createInstance(Ci.nsISupportsString);
    string.data = text;
    branch = branch ? branch : Services.prefs;
    branch.setComplexValue(prefName, Ci.nsISupportsString, string);
}