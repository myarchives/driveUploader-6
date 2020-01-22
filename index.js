"use-strict";

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const util =  require('util');
const readFile = util.promisify(fs.readFile);

app.use(express.json());

app.post('/token', (req, res) => {
    console.log(req);
    console.log(req.body);
    // validateAccessToken(req.body);
    res.sendStatus(200);
});

app.post('/upload', (req, res) => {
    // Load client secrets from a local file.
    readFile('credentials.json')
    .then(async content => {
        // Authorize a client with credentials, then call the Google Drive API.
        const response = await authorize(JSON.parse(content), uploadFile);
        res.status(response.status).send(response.data);
    })
    .catch(err => {
        res.status(403).send(err);
    })
});

// If modifying these scopes, delete token.json.
const SCOPE = ['https://www.googleapis.com/auth/drive.file'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  // Check if we have previously stored a token.
  try {
    const token = await readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (error) {
    return getAccessToken(oAuth2Client, callback);
  }
    return await callback(oAuth2Client);
}

function validateAccessToken() {

}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPE,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

async function uploadFile(auth) {
    let status;
    var fileMetadata = {
        'name': 'NLP.docx'
    };
    try {
        const drive = google.drive({version: 'v3', auth});
        const fileStream = fs.createReadStream('./NLP.docx');
        var media = {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            body: fileStream
        };
        const file = await drive.files.create({
            resource: fileMetadata,
            media
        });
        const response = {
                status: file.status,
                data: file.data
            }
        return sendSuccessResponse(response, 'uploadFile');
    } catch (err) {
        return sendErrorResponse(err, 'uploadFile');
    }
}

app.listen(port, () => {
    console.log('Endpoints ready.');
});

function sendSuccessResponse(response, functionName) {
    console.log(`${functionName} has succeeded with response: ${JSON.stringify(response)}.`)
    return response;
}

function sendErrorResponse(error, functionName) {
    console.log(`${functionName} has failed due to error: ${error}.`)
    return error;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}
