const { google } = require("googleapis");
const fs = require("fs");
const progress = require("progress-stream");
const { Transform } = require("stream");
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
    console.log(1);
    var stat = fs.statSync(`./${fileName}`);
    var str = progress({ length: stat.size, time: 100 });
    console.log(2);
    str.on("progress", p => {
      console.log(p);
    });
    console.log(3);
    let fileStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      }
    });
    console.log(4);
    fs.createReadStream(`./${fileName}`)
      .pipe(str)
      .pipe(fileStream);
    console.log(5);
    var media = {
      mimeType: mimeType,
      body: fileStream
    };
    console.log(6);
    const file = await drive.files.create({
      resource: fileMetadata,
      media
    });
    console.log(7);
    const response = {
      status: parseInt(file.status),
      data: file.data
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
