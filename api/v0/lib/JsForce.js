const jsConnect = require("jsforce");
var connection;
var nameSpace;

async function connect(sessionId, salesforceUrl) {
  try {
    connection = new jsConnect.Connection({
      instanceUrl: salesforceUrl,
      sessionId
    });
    setup();
  } catch (err) {
    console.log(`Log in failed: ${err}`);
  }
}

async function credentialsCheck() { }

async function setup() {
  credentialsCheck();
  connection.query(
    "SELECT NamespacePrefix FROM ApexClass WHERE Name = 'CloudStorageService' LIMIT 1"
  ).then(res => {
    nameSpace = res.NamespacePrefix
    console.log(res);
  }).catch(err => {
    console.log(`error setting up: ${err}`);
  })
}

function create(file) {
  ({ name, webViewLink, id, fileExtension, webContentLink } = file);
  connection
    .sobject("PLMLAW__Document__c")
    .create({
      Name: name,
      PLMLAW__Item_Revision__c: "a0V6g000000KFZmEAO", //hardcoded just for demo
      PLMLAW__External_Attachment_URL__c: webViewLink,
      PLMLAW__File_Extension__c: fileExtension,
      PLMLAW__Google_File_Id__c: id,
      PLMLAW__External_Attachment_Download_URL__c: webContentLink,
      PLMLAW__Content_Location__c: 'E',
    })
}

module.exports = {
  connect,
  create
};
