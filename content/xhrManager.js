/* 
 * This file is based on the code found at: http://drakware.com/?e=3
 *  
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Modified by M S Ram (M.S.Ramaiah@gmail.com) to adapt to BYTubeD
 * 
 * Modifications include: 
 * 1. wrapping the functions in the iitk.cse.cs213.bytubed namespace
 * 2. exception handling
 * 
 * LastModified: Jan 31 2012
 * 
 */

iitk.cse.cs213.bytubed.XHRManager = function(callerObject, callBack, errorHandler)
{
    this.callerObject   = callerObject;
    this.callBack       = callBack;
    this.errorHandler   = errorHandler;

    this.doRequest = function doRequest(method, url)
    {
        xmlhttp = new XMLHttpRequest();

        if (xmlhttp)
        {
            var previousBirth = this;
            xmlhttp.onreadystatechange = function()
            {
                try
                {
                    if (method == "GET" && xmlhttp.readyState == 4)
                    {
                        if (xmlhttp.status == 200 || xmlhttp.status == 304)
                        {
                            if(previousBirth.callBack != null && previousBirth.callBack != 'undefined')
                            {
                                var returnValue = xmlhttp.responseText;
                                
                                previousBirth.callBack(previousBirth.callerObject, returnValue, url);
                            }
                        }
                        else
                        {
                            // handle_error();
                            
                            if(previousBirth.errorHandler)
                            {
                                previousBirth.errorHandler(xmlhttp.responseText, url);
                            }
                        }
                    }
                    else if(method == "HEAD" && xmlhttp.readyState > 1)
                    {
                        //alert(xmlhttp.readyState);
                        var returnValue = xmlhttp.getAllResponseHeaders();

                        if(previousBirth.callBack != null && previousBirth.callBack != 'undefined')
                        {
                            previousBirth.callBack(previousBirth.callerObject, returnValue, url);
                        }
                    }
                    else
                    {
                        // You can write something here for debugging purposes.
                    }
                }
                catch(e)
                {
                    if(previousBirth.errorHandler)
                        previousBirth.errorHandler("XMLHttpRequestManager: " + e + e.lineNumber + e.fileName, url);
                }
            }
            xmlhttp.open(method, url, true);
            xmlhttp.send(null);
        }
        else if(this.errorHandler)
        {
            this.errorHandler("XMLHttpRequestManager: Failed to create a new XMLHttpRequest object", url);
        }
    };

    // End
};
