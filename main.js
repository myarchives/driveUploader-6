"use-strict";

const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { google } = require("googleapis");
const path = require("path");

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const util = require("util");

var fileName;
var mimeType;
var client_id;
var client_secret;
var tokensFromCredentials;
const redirect_uris = ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"];

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./");
  },
  filename: function(req, file, cb) {
    fileName = file.originalname;
    mimeType = file.mimetype;
    cb(null, fileName);
  }
});
var upload = util.promisify(multer({ storage: storage }).single("file"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/token", (req, res) => {
  try {
    // ({
    //   client_secret,
    //   client_id,
    //   access_token,
    //   refresh_token,
    //   expiry_date
    // } = req.body);

    tokensFromCredentials = {
      //access_token,
      access_token:
        "ya29.ImC7B82qIq4apzPBvUfHsb6uUh2lkaZTvojgsGrfTec7tx2UGR2uJ0sWSJyc2AlPAtWpd0xJ22MLu_rbQk3N-fGoFbGrtGp7XZibgxcQAkeN9yAYmV2LkXqBs1SluEmvBUk",
      // refresh_token,
      refresh_token:
        "1//0fpt5gY1iAI42CgYIARAAGA8SNwF-L9IrVR2ny3b5Lbjy-FR1oNaMyapFaQneX24mw_Wp9osMHclHlz2fK7nX8zyZE3RgiyzkJfo",
      scope: "https://www.googleapis.com/auth/drive.file",
      token_type: "Bearer",
      // expiry_date
      expiry_date: "1579908443138"
    };
    sendSuccessResponse(tokensFromCredentials, "/tokens endpoint");
    res.status(200).send(tokensFromCredentials);
  } catch (err) {
    sendErrorResponse(err, "/tokens endpoint");
    res.send(`Failed to receive tokens: ${err}`);
  }
});

app.post("/upload", async (req, res) => {
  // Load client secrets from a local file.
  try {
    await upload(req, res);
  } catch (err) {
    console.log(`Upload from local failed with ${err}`);
  }
  try {
    // Authorize a client with credentials, then call the Google Drive API.
    const response = await authorize(uploadFile);
    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(503).send(`Drive upload failed: ${err}`);
  }
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback) {
  const oAuth2Client = new google.auth.OAuth2(
    // client_id,
    "633627215888-do5k0oo1tkju71n2pnmubqqas89htslr.apps.googleusercontent.com",
    // client_secret,
    "dji6RnVVlj01nbeuQaUAiaiQ",
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(tokensFromCredentials);
  return await callback(oAuth2Client);
}

async function uploadFile(auth) {
  var fileMetadata = {
    name: fileName
  };
  try {
    const drive = google.drive({ version: "v3", auth });
    const fileStream = fs.createReadStream(`./${fileName}`);
    var media = {
      mimeType: mimeType,
      body: fileStream
    };
    const file = await drive.files.create({
      resource: fileMetadata,
      media
    });
    const response = {
      status: file.status,
      data: file.data
    };
    return sendSuccessResponse(response, "uploadFile");
  } catch (err) {
    return sendErrorResponse(err, "uploadFile");
  }
}

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
