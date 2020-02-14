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

function create() {
  connection
    .sobject("PLMLAW__Document__c")
    .create({
      Name: "Test Document",
      PLMLAW__Item_Revision__c: "a0V6g000000KFZmEAO"
    })
    .then(() => console.log("well done"))
    .catch(() => console.log("sike"));
}

module.exports = {
  connect,
  create
};
