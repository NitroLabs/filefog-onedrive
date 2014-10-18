var path = require('path')
var transform = {};

transform.accountInfo = function(account_response){
    var transform = {};
    transform.name = account_response.name;
    transform.email = account_response.emails.preferred;
    transform.avatar_url = '';
    transform.created_date = new Date(account_response.updated_time);
    transform.modified_date = new Date(account_response.updated_time);
    transform.id = account_response.id;
    transform._raw = account_response;
    return transform;
};

transform.checkQuota = function (quota_response){
    var transform = {};
    transform.total_bytes = quota_response.quota; //total space allocated in bytes
    transform.used_bytes = quota_response.quota - quota_response.available; //bytes used.
    transform.limits= {
    }
    transform._raw = quota_response;
    return transform;
};

transform.createFile = function(create_response){
    var transform = {};
    transform.is_file = true;
    transform.is_folder = false;
    transform.etag = '';
    transform.identifier = create_response.id;
    transform.parent_identifier = '';
    transform.mimetype = ''
    transform.created_date = new Date();
    transform.modified_date = new Date();
    transform.name = create_response.name;
    transform.description = create_response.description;
    //transform.extension = file_response.name.split('.')
    transform.checksum = null;
    transform.file_size = 0;
    transform._raw = create_response;
    return transform;
};

transform.deleteFile = function(deletion_response){
    var transform = {};
    transform.success = true;
    transform._raw = deletion_response;
    return transform;
};

transform.downloadFile = function(download_response){
    var transform = {};
    transform.data = download_response.data;
    transform.headers = download_response.headers;
    transform._raw = download_response;
    return transform;
};

transform.getFileInformation = function (file_response){
    var transform = {};
    transform.is_file = (file_response.type != "folder");
    transform.is_folder = (file_response.type == "folder");
    transform.etag = '';
    transform.identifier = file_response.id;
    transform.parent_identifier = file_response.parent_id;
    transform.mimetype = ''
    transform.created_date = new Date(file_response.created_time);
    transform.modified_date = new Date(file_response.updated_time);
    transform.name = file_response.name;
    transform.description = file_response.description;
    //transform.extension = file_response.name.split('.')
    transform.checksum = null;
    transform.file_size = file_response.size;
    transform._raw = file_response;
    return transform;
};

transform.createFolder = function(create_response){

    var transform = {};
    transform.is_file = false;
    transform.is_folder = true;
    transform.etag = '';
    transform.identifier = create_response.id;
    transform.parent_identifier = create_response.parent_id;
    transform.created_date = new Date(create_response.created_time);
    transform.modified_date = new Date(create_response.updated_time);
    transform.name = create_response.name;
    transform.description = create_response.description;
    transform._raw = create_response;
    return transform;
};

transform.deleteFolder = function(deletion_response){
    var transform = {};
    transform.success = true;
    transform._raw = deletion_response;
    return transform;
};


transform.getFolderInformation = function(folder_response){
    var transform = {};
    transform.is_file = (folder_response.type != "folder");
    transform.is_folder = (folder_response.type == "folder");
    transform.etag = '';
    transform.identifier = folder_response.id;
    transform.parent_identifier = folder_response.parent_id;
    transform.created_date = new Date(folder_response.created_time);
    transform.modified_date = new Date(folder_response.updated_time);
    transform.name = folder_response.name;
    transform.description = folder_response.description;
    transform._raw = folder_response;
    return transform;
};


transform.searchFiles = function(items_response){
    var self = this;
    var transform = {};
    transform.total_items = null;
    transform.content = items_response.data.map(function(current_item){
        if(current_item.type != "folder"){
            return self.getFileInformation(current_item);
        }
        else{
            return self.getFolderInformation(current_item);
        }
    });
    return transform;
};


transform.retrieveFolderItems = function(items_response){
    var self = this;
    var transform = {};
    transform.total_items = null;
    transform.content = items_response.data.map(function(current_item){
        if(current_item.type != "folder"){
            return self.getFileInformation(current_item);
        }
        else{
            return self.getFolderInformation(current_item);
        }
    });
    return transform;
};


///////////////////////////////////////////////////////////////////////////////
// OAuth transforms

transform.oAuthGetAccessToken = function(token_response){
    var transform = {};
    transform.access_token = token_response.access_token;
    transform.refresh_token = token_response.refresh_token;
    //calculate expiry
    var expiration_utc_timestamp = (new Date().getTime()) + (1000 * token_response.expires_in);
    transform.expires_on = (new Date(expiration_utc_timestamp)).toISOString();
    transform._raw = token_response;
    return transform;
}

transform.oAuthRefreshAccessToken = function(token_response){
    var transform = {};
    transform.access_token = token_response.access_token;
    transform.refresh_token = token_response.refresh_token;
    //calculate expiry
    var expiration_utc_timestamp = (new Date().getTime()) + (1000 * token_response.expires_in);
    transform.expires_on = (new Date(expiration_utc_timestamp)).toISOString();
    transform._raw = token_response;
    return transform;
}

module.exports = transform;
