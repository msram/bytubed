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

iitk.cse.cs213.bytubed.CXMLReq = function(freed)
{
    this.freed = (freed != "undefined")? freed: 1;
    this.xmlhttp = new XMLHttpRequest();
    this.requestCompleted = false;
};

iitk.cse.cs213.bytubed.XmlHttpRequestManager = function(callerObject, callBack, errorHandler)
{
    this.xmlreqs        = [];

    this.callerObject   = callerObject;
    this.callBack       = callBack;
    this.errorHandler   = errorHandler;

    this.doRequest      = function doRequest(method, url)
    {
        var pos = this.xmlreqs.length;
        this.xmlreqs[pos] = new iitk.cse.cs213.bytubed.CXMLReq(1);

        if (this.xmlreqs[pos].xmlhttp)
        {
            this.xmlreqs[pos].freed = 0;
            this.xmlreqs[pos].xmlhttp.open(method, url, true);

            var previousBirth = this;

            this.xmlreqs[pos].xmlhttp.onreadystatechange = function()
            {
                if (typeof(previousBirth.xmlhttpChange) != 'undefined')
                {
                    previousBirth.xmlhttpChange(method, pos, url);
                }
            };

            this.xmlreqs[pos].xmlhttp.send(null);
        }
        else if(this.errorHandler)
        {
            this.errorHandler("XMLHttpRequestManager: Failed to create a new XMLHttpRequest object", url);
        }
    };

    this.xmlhttpChange = function xmlhttpChange(method, pos, url)
    {
        try
        {
            if (typeof(this.xmlreqs[pos]) && this.xmlreqs[pos].freed === 0)
            {
                var xmlhttp = this.xmlreqs[pos].xmlhttp;
                
                if(method == "GET" && xmlhttp.readyState == 4)
                {
                    if (this.xmlreqs[pos].xmlhttp.status == 200 || this.xmlreqs[pos].xmlhttp.status == 304)
                    {
                        this.xmlreqs[pos].requestCompleted = true;

                        if(this.callBack !== null && this.callBack != 'undefined')
                        {
                            var returnValue = xmlhttp.responseText;
                            this.callBack(this.callerObject, returnValue, url, pos);
                        }
                    }
                    else
                    {
                        // handle_error();
                        
                        if(this.errorHandler)
                        {
                            this.errorHandler(xmlhttp.responseText, url);
                        }
                    }
                    this.xmlreqs[pos].freed = 1;

                }
                else if(method == "HEAD" && this.xmlreqs[pos].xmlhttp.readyState > 1)
                {
                    //alert(xmlhttp.readyState);
                    var returnValue = xmlhttp.getAllResponseHeaders();

                    if(this.callBack !== null && this.callBack != 'undefined' && this.xmlreqs[pos].freed === 0)
                    {
                        this.xmlreqs[pos].freed = 1;
                        this.callBack(this.callerObject, returnValue, url);
                    }
                }
                else
                {
                    // You can write something here for debugging purposes.
                }
            }
        }
        catch(e)
        {
            if(this.errorHandler)
                this.errorHandler("XMLHttpRequestManager: " + e + e.lineNumber + e.fileName, url);
        }
    };

    // End
};
