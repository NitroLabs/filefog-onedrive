var q = require('q')
    , fs = require('fs')
    , path = require('path')
    , extend = require('node.extend')
    , request = require('request')


var Client = function () {

    this._skydriveClientPromise = null
};

Client.prototype.accountInfo = function (options) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.get({
                url: 'https://apis.live.net/v5.0/me'
            },
            function (err, r, body) {
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            });

        return deferred.promise;
    })
};

Client.prototype.checkQuota = function (options) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.get({
                url: 'https://apis.live.net/v5.0/me/skydrive/quota'
            },
            function (err, r, body) {
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            });

        return deferred.promise;
    })
};

Client.prototype.createFile = function (fileName, parentIdentifier, content_buffer, options) {
    var self = this;
    parentIdentifier = parentIdentifier || 'me/skydrive';
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.put({
                url: 'https://apis.live.net/v5.0/' + parentIdentifier  + '/files/'+ fileName,
                body: content_buffer
//                    multipart: [
//                        {
//                            'content-type': 'application/octet-stream',
//                            'content-disposition':' form-data; name="file"; filename="' + fileName + '"',
//
//                        }
//                    ]
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            });
        return deferred.promise;
    })
};

Client.prototype.deleteFile = function (identifier) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.del(
            {
                url: 'https://apis.live.net/v5.0/' + identifier
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve({});
            }
        );
        return deferred.promise;
    })
};

Client.prototype.downloadFile = function (identifier) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.get(
            {
                url: 'https://apis.live.net/v5.0/' + identifier + '/content',
                encoding: null /*forces the content to be sent back in binary form, body will always be a buffer.*/
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve({ "headers": r.headers, "data": body});
            }
        );
        return deferred.promise;
    })
};

Client.prototype.getFileInformation = function (identifier) {
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.get(
            {
                url: 'https://apis.live.net/v5.0/' + identifier
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            }
        );
        return deferred.promise;
    })
};

Client.prototype.createFolder = function (folderName, parentIdentifier, options) {
    var self = this;
    parentIdentifier = parentIdentifier || 'me/skydrive/'
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.post(
            {
                headers: {
                    'Authorization': 'Bearer ' + self.credentials.access_token,
                    'content-type': 'application/json'
                },
                url: 'https://apis.live.net/v5.0/' + parentIdentifier,
                body: '{"name":"' + folderName + '", "description": ""}'
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            }
        );
        return deferred.promise;
    })
};

Client.prototype.deleteFolder = function (identifier){
    var self = this;
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.del(
            {
                url: 'https://apis.live.net/v5.0/' + identifier
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve({});
            }
        );
        return deferred.promise;
    })
};

Client.prototype.getFolderInformation = function(identifier){
    var self = this;
    identifier = identifier || 'me/skydrive'
    return self._getClient().then(function (client) {
        var deferred = q.defer();
        client.get(
            {
                url: 'https://apis.live.net/v5.0/' + identifier
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            }
        );
        return deferred.promise;
    })
}

Client.prototype.searchFiles = function (filters,options){
    // TODO: suppoort for filter http://msdn.microsoft.com/en-us/library/dn631835.aspx
    var _url;
    var params = {};
    filters = extend({},filters);
    options = extend({},options);
    if (filters.q){
        params.q=filters.q
    } else {
        params.q="*";
    }
    if (options.maxResults){
        params.limit = options.maxResults;
    } 
    if (options.nextPageToken){
        params.offset = options.nextPageToken;
    }
    // If there is a nextPageToken, use that as the url
    // Otherwise construct the url from params
    if (options.nextPageToken){
        _url = "https://apis.live.net/v5.0"+options.nextPageToken;
    } else {
        _url = url.format({pathname:'https://apis.live.net/v5.0/me/skydrive/search',query:params});
    }
    console.log(_url)
    return this._getClient().then(function (client) {
        var deferred = q.defer();
        client.get({url:_url},
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                var response = JSON.parse(body)
                if (response.paging){
                    response.nextPageToken = response.paging.next;
                }
                return deferred.resolve(response);
            }
        );
        return deferred.promise;
    })
};

Client.prototype.retrieveFolderItems = function (identifier,options) {
    identifier = identifier || 'me/skydrive';
    return this._getClient().then(function (client) {
        var deferred = q.defer();
        client.get(
            {
                url: 'https://apis.live.net/v5.0/' + identifier + '/files'
            },
            function (err, r, body) {
                err = errorHandler(r, body, err);
                if (err) return deferred.reject(err);
                return deferred.resolve(JSON.parse(body));
            }
        );
        return deferred.promise;
    })
};

///////////////////////////////////////////////////////////////////////////////
// Helper Methods
Client.prototype._getClient = function(){
    if (this._skydriveClientPromise) return this._skydriveClientPromise;
    var options = {
        headers: {
            'Authorization': 'Bearer ' + this.credentials.access_token
        }
    };
    this._skydriveClientPromise = q.when(request.defaults(options));
    return this._skydriveClientPromise;
}

//custom error detection method.
function errorHandler(response, body, err){
    if(err) return err;
    if(response.statusCode != 200 && body.error){

        return body.error;
        //if(response.statusCode == 401 && response.body.error) return  new FFTokenRejected(err_message);
        //if(response.statusCode == 403) return new FFAdditionalAuthorizationRequired(err_message);
    }

    return false;
}
module.exports = Client;