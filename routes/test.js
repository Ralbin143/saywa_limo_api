const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const processs = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

router.get("/", async (req, res) => {
  // Call the function to create the invoice
  test();
});

// Function to create a customer and charge them for an invoice
const test = async () => {
  authorize().then(listEvents).catch(console.error);

  

    async function listEvents(auth) {
      const calendar = google.calendar({ version: "v3", auth });
      const tripTime = `2024-04-06T22:19:24.527+00:00`;

     

    
      const event = {
        summary: "New Trip",
        location: `vadakara`,
        description: `husguhsuizgfuygiu`,
        start: {
          dateTime: "2024-04-06T22:19:24.527+00:00",
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: "2024-04-06T22:19:24.527+00:00",
          timeZone: "America/Los_Angeles",
        },

        attendees: [{ email: 'ralbin.m.r@gmail.com' }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 10 },
          ],
        },
      };

      calendar.events.insert(
        {
          auth: auth,
          calendarId: "primary",
          resource: event,
        },
        function (err, event) {
          if (err) {
            console.log(
              "There was an error contacting the Calendar service: " + err
            );
            return;
          }
          console.log(event);
          return;
          console.log("Event created: %s", event.htmlLink);
        }
      );
    }
};
SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = path.join(processs.cwd(), "tokenx.json");
const CREDENTIALS_PATH = path.join(processs.cwd(), "google_cal.json");
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}
async function authorize(tripdata) {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
module.exports = router;
