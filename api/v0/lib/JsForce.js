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
    .sobject("Account")
    .create({ Name: "Another Account" })
    .then(() => console.log("well done"))
    .catch(() => console.log("sike"));
}

module.exports = {
  connect,
  create
};
