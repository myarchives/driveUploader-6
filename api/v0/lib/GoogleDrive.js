const { google } = require("googleapis");
const fs = require("fs");
const progress = require("progress-stream");
const { Transform } = require("stream");
const { create } = require("./JsForce.js");

const redirect_uris = ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"];
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(clientId, clientSecret, tokens, options, callback) {
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(tokens);
  return await callback(oAuth2Client, options);
}

async function uploadFile(auth, options) {
  var fileMetadata = {
    name: options.fileName
  };
  try {
    const drive = google.drive({ version: "v3", auth });
    var stat = fs.statSync(`./${options.fileName}`);
    var str = progress({ length: stat.size, time: 100 });
    str.on("progress", p => {
      console.log(p);
    });
    let fileStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      }
    });
    fs.createReadStream(`./${options.fileName}`)
      .pipe(str)
      .pipe(fileStream);
    var media = {
      mimeType: options.mimeType,
      body: fileStream
    };
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id,name,exportLinks,mimeType,fileExtension"
    });
    const response = {
      status: parseInt(file.status),
      data: file.data
    };
    await create(file);
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
