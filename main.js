"use-strict";

const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const util = require("util");
const readFile = util.promisify(fs.readFile);

let fileName;
let mimeType;
const dir = "./tempFile";

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + dir.substring(1));
  },
  filename: function(req, file, cb) {
    fileName = file.originalname;
    mimeType = file.mimetype;
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage }).single("file");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// app.get("/test", (req, res) => {
//   res.send("Hello");
// });

app.post("/token", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.post("/upload", async (req, res) => {
  // Load client secrets from a local file.
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log("dir made");
      fs.readdirSync(__dirname).forEach(file => {
        console.log(file);
      });
    }
    console.log(1);
    console.log("PLEASE: " + __dirname);
    await upload(req, res, function(err) {
      console.log(1.1);
      if (err instanceof multer.MulterError) {
        console.log(1.2);
        return res.status(500).json(err);
      } else if (err) {
        console.log(1.3);
        return res.status(500).json(err);
      }
      console.log(1.4);
    });
    console.log(1.5);
  } catch (err) {
    console.log(`Upload failed with ${err}`);
  }
  console.log(1.6);
  try {
    // Authorize a client with credentials, then call the Google Drive API.
    console.log(2);
    const response = await authorize(uploadFile);
    console.log(3);
    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(403).send(err);
  }
});

const SCOPE = ["https://www.googleapis.com/auth/drive.file"];
const tokenHack = {
  access_token:
    "ya29.Il-7B_iO6yptiu8yEsKItVyLhRFDQ6juK2T2cdatlzParHw5p1W_ku2A5bYxd_pVt8nGFddk1vNOBzc6E1l6HUR-C4UTSP1P_AitFV3-Ns3JRrwFcHhG9xOlG3tmPJKnlg",
  refresh_token:
    "1//0fpt5gY1iAI42CgYIARAAGA8SNwF-L9IrVR2ny3b5Lbjy-FR1oNaMyapFaQneX24mw_Wp9osMHclHlz2fK7nX8zyZE3RgiyzkJfo",
  scope: "https://www.googleapis.com/auth/drive.file",
  token_type: "Bearer",
  expiry_date: 1579908443138
};
const TOKEN_PATH = __dirname + "token.json";
const credentials = {
  installed: {
    client_id:
      "633627215888-do5k0oo1tkju71n2pnmubqqas89htslr.apps.googleusercontent.com",
    project_id: "driveuploader-1579560084775",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "dji6RnVVlj01nbeuQaUAiaiQ",
    redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
  }
};
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  console.log(2.1);
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  console.log(2.2);
  // Check if we have previously stored a token.
  try {
    console.log(2.3);
    // const token = await readFile(TOKEN_PATH);
    console.log(2.4);
    // oAuth2Client.setCredentials(JSON.parse(token));
    oAuth2Client.setCredentials(tokenHack);
    console.log(2.5);
  } catch (error) {
    return getAccessToken(oAuth2Client, callback);
  }
  return await callback(oAuth2Client);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPE
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

async function uploadFile(auth) {
  console.log(`fileName: ${fileName}`);
  var fileMetadata = {
    name: fileName
  };
  try {
    const drive = google.drive({ version: "v3", auth });
    const fileStream = fs.createReadStream(`./tmp/${fileName}`);
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
  console.log(fileName);
  console.log(
    `${functionName} has succeeded with response: ${JSON.stringify(response)}.`
  );
  return response;
}

function sendErrorResponse(error, functionName) {
  console.log(`${functionName} has failed due to error: ${error}.`);
  return error;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({ version: "v3", auth });
  drive.files.list(
    {
      pageSize: 10,
      fields: "nextPageToken, files(id, name)"
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      const files = res.data.files;
      if (files.length) {
        console.log("Files:");
        files.map(file => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log("No files found.");
      }
    }
  );
}
