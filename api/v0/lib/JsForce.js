const jsConnect = require("jsforce");
var connection;

async function connect(sessionId, salesforceUrl) {
  try {
    connection = new jsConnect.Connection({
      instanceUrl: salesforceUrl,
      sessionId
    });
    console.log(connection)
  } catch (err) {
    console.log(`log in failed: ${err}`);
  }
}

function create(file) {
  ({ name, webViewLink, id, fileExtension, webContentLink } = file);
  console.log(1)
  connection
    .sobject("PLMLAW__Document__c")
    .create({
      Name: name,
      PLMLAW__Item_Revision__c: "a0V6g000000KFZmEAO", //hardcoded just for demo
      PLMLAW__External_Attachment_URL__c: webViewLink,
      PLMLAW__File_Extension__c: fileExtension,
      PLMLAW__Google_File_Id__c: id,
      PLMLAW__External_Attachment_Download_URL__c: webContentLink,
      PLMLAW__Document_Version_Download__c: webContentLink
    })
    .then(res => console.log("well done: " + fileExtension))
    .catch(err => console.log("sike: " + err));
  console.log(2)
}

module.exports = {
  connect,
  create
};
