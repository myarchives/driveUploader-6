const jsConnect = require("jsforce");
var connection;

async function connect(sessionId, salesforceUrl) {
  try {
    connection = new jsConnect.Connection({
      instanceUrl: salesforceUrl,
      sessionId
    });
  } catch (err) {
    console.log(`log in failed: ${err}`);
  }
}

function create(file) {
  ({ webViewLink, id, fileExtension } = file);
  connection
    .sobject("PLMLAW__Document__c")
    .create({
      Name: "Test Document 1",
      PLMLAW__Item_Revision__c: "a0V6g000000KFZmEAO",
      PLMLAW__Document__c__External_Attachment_URL__c: webViewLink,
      PLMLAW__Document__File_Extension__c: fileExtension,
      PLMLAW__Google_File_Id__c: id
    })
    .then(res => console.log("well done\n" + res))
    .catch(err => console.log("sike: " + err));
}

module.exports = {
  connect,
  create
};
