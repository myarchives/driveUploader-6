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
  ({ name, webViewLink, id, fileExtension } = file);
  console.log(webViewLink);
  console.log(id);

  connection
    .sobject("PLMLAW__Document__c") //so is this
    .create({
      Name: name,
      PLMLAW__Item_Revision__c: "a0V6g000000KFZmEAO", //hardcoded just for demo
      PLMLAW__External_Attachment_URL__c: webViewLink,
      PLMLAW__File_Extension__c: fileExtension,
      PLMLAW__Google_File_Id__c: id
    })
    .then(res => console.log("well done\n" + res))
    .catch(err => console.log("sike: " + err));
}

module.exports = {
  connect,
  create
};
