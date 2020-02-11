const { google } = require("googleapis");
const fs = require("fs");

const redirect_uris = ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"];
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(
  clientId,
  clientSecret,
  tokens,
  fileName,
  mimeType,
  callback
) {
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(tokens);
  return await callback(oAuth2Client, fileName, mimeType);
}

async function uploadFile(auth, fileName, mimeType) {
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
    const req = drive.files.create(
      {
        resource: fileMetadata,
        media
      },
      function(err, response, body) {
        if (err) {
          console.log(err);
        } else {
          console.log("finish upload");
          clearInterval(q);
        }
      }
    );
    var q = setInterval(function() {
      console.log("Uploaded: " + req.req.connection.bytesWritten);
    }, 100);
    const response = {
      status: parseInt(req.status),
      data: req.data
    };
    return sendSuccessResponse(response, "uploadFile");
  } catch (err) {
    return sendErrorResponse(err, "uploadFile");
  }
}

function sendSuccessResponse(response, functionName) {
  console.log(
    `${functionName} has succeeded with response: ${JSON.stringify(response)}.`
  );
  return response;
}

function sendErrorResponse(error, functionName) {
  console.log(
    `${functionName} has failed due to error: ${JSON.stringify(error)}.`
  );
  return error;
}

module.exports = {
  authorize,
  uploadFile
};
