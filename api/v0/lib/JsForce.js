const jsConnect = require("jsforce");
var connection;
var namespace;

async function connect(namespace, sessionId, salesforceUrl) {
  namespace = namespace;
  try {
    connection = new jsConnect.Connection({
      instanceUrl: salesforceUrl,
      sessionId
    });
  } catch (err) {
    console.log(`log in failed: ${err}`);
  }
}

function create(sobjectName, options) {
  connection
    .sobject(`${namespace}__Document__c`)
    .create({
      Name: "Test Document 2",
      PLMLAW__Item_Revision__c: "a0V6g000000KFZmEAO"
      //   PLMLAW__External_Attachment_URL__c: "",
      //   PLMLAW__File_Extension__c: "",
      //   PLMLAW__Google_File_Id__c: ""
    })
    .then(() => console.log("well done"))
    .catch(() => console.log("sike"));
}

module.exports = {
  connect,
  create
};
