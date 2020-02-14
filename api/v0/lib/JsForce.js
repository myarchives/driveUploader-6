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
      plmlaw__item_revision__c: "a0V6g000000KFZmEAO",
      plmlaw__external_attachment_url__c: webViewLink,
      plmlaw__file_extension__c: fileExtension,
      plmlaw__google_file_id__c: id
    })
    .then(res => console.log("well done\n" + res))
    .catch(err => console.log("sike: " + err));
}

module.exports = {
  connect,
  create
};
