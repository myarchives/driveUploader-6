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
    .sobject(`PLM__Document__c`)
    .create({
      Name: "Test Document 1",
      PLMLAW__Item_Revision__c: "a0X6g000000Jl2ZEAS",
      PLMLAW__External_Attachment_URL__c: webViewLink,
      PLMLAW__File_Extension__c: fileExtension,
      PLMLAW__Google_File_Id__c: id
    })
    .then(() => console.log("well done"))
    .catch(() => console.log("sike"));
}

module.exports = {
  connect,
  create
};
