const jsConnect = require("jsforce");
const conn = new jsConnect.Connection();
// {
//   loginUrl: "https://clin-dev-ed.lightning.force.com/"
//});
const credentials = require("../credentials.json");
(async () =>
  await conn.login(
    "clinton@plm20200113.dev.com",
    credentials.password + "PytmZZYBu1mH7TB3o8PkPsjQ",
    (err, res) => {
      if (err) {
        console.log(`Errordsfdsf: ${err}`);
      } else {
        console.log(`Logged in!!: ${res}`);
      }
    }
  ))().then(() => {
  //   conn.query("SELECT Id, Name, CreatedDate FROM Contact", function(
  //     err,
  //     result
  //   ) {
  //     if (err) {
  //       res.json(err);
  //     }
  //     console.log("total : " + result.totalSize);
  //     res.json(result);
  // });
  conn.sobject("Contact").create(
    {
      Name: "hello"
    },
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    }
  );
});
