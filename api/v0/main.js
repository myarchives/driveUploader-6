"use-strict";

const express = require("express");
const app = express();

const util = require("util");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const GoogleDrive = require("./lib/GoogleDrive.js");

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../../public")));
const port = process.env.PORT || 5000;

// app.get("/sse", (req, res) => {
//   res.status(200).set({
//     "connection": "keep-alive",
//     "cache-control": "no-cache",
//     "content-type": "text/event-stream"
//   });
// });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "../../public/index.html");
});

var client_id;
var client_secret;
var tokensFromCredentials;

app.post("/jsforceInfo", (req, res) => {
  const url = req.get("host") || req.get("origin");
  const sessionId = req.body.sessionId;
  console.log(url);
  console.log(req.hostname);
  console.log(req.originalUrl);
  console.log(req.baseUrl);
  console.log(sessionId);
  res.send("good");
});

app.post("/token", (req, res) => {
  try {
    ({
      client_secret,
      client_id,
      access_token,
      refresh_token,
      expiry_date
    } = req.body);

    tokensFromCredentials = {
      access_token,
      refresh_token,
      scope: "https://www.googleapis.com/auth/drive.file",
      token_type: "Bearer",
      expiry_date
    };
    sendSuccessResponse(tokensFromCredentials, "/tokens endpoint");
    res.status(200).send(tokensFromCredentials);
  } catch (err) {
    sendErrorResponse(err, "/tokens endpoint");
    res.send(`Failed to receive tokens: ${err}`);
  }
});

app.post("/upload", async (req, res) => {
  var fileName;
  var mimeType;
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "./");
    },
    filename: function(req, file, cb) {
      fileName = file.originalname || file.name;
      mimeType = file.mimetype;
      cb(null, fileName);
    }
  });
  var upload = util.promisify(multer({ storage: storage }).single("file"));
  // Load client secrets from a local file.
  try {
    await upload(req, res);
  } catch (err) {
    console.log(`Upload from local failed with ${err}`);
  }
  try {
    // Authorize a client with credentials, then call the Google Drive API.
    const response = await GoogleDrive.authorize(
      client_id,
      client_secret,
      tokensFromCredentials,
      fileName,
      mimeType,
      GoogleDrive.uploadFile
    );
    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(503).send(`Drive upload failed: ${err}`);
  }
});

app.listen(port, () => {
  console.log("Endpoints ready.");
});

function sendSuccessResponse(response, functionName) {
  console.log(
    `${functionName} has succeeded with response: ${JSON.stringify(response)}.`
  );
  return response;
}

function sendErrorResponse(error, functionName) {
  console.log(`${functionName} has failed due to error: ${error}.`);
  return error;
}
