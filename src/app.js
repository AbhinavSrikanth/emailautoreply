// Express: Fast, unopinionated, minimalist web framework for Node.js.
const express = require("express");
const app = express();

// Path: Provides utilities for working with file and directory paths.
const path = require("path");
const path = require("path");

// Local Auth: Library for local OAuth 2.0 authentication with Google services.
const { authenticate } = require("@google-cloud/local-auth");

// File System Promises: The Node.js 'fs' module with promises.
const fs = require("fs").promises;

// Google APIs: Comprehensive set of tools for interacting with the Google API.
const { google } = require("googleapis");

const port = 8080;
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];
const labelName = "Vacation Auto-Replies";
const repliedUsersFile = 'repliedUsers.json';
let repliedUsers = [];

async function loadRepliedUsers() {
  try {
    console.log("Loading replied users from file...");
    const data = await fs.readFile(repliedUsersFile, 'utf8');
    
  // Comment: Refresh mail count every 1000 mails, with a potential risk
  // that earlier mails might not be read.
  // const refreshMailCountThreshold = 1000;
  // let mailCount = 0;
  
  // setInterval(async () => {
  //    Get messages that have no prior reply
  //   const messages = await getRecentUnrepliesMessages(auth);

  //   if (messages && messages.length > 0) {
  //      Increment mail count for each received mail
  //     mailCount += messages.length;

  //      Check if the refresh threshold is reached
  //     if (mailCount >= refreshMailCountThreshold) {
  //       console.log(`Refresh mail count. Total received mails: ${mailCount}`);
  //        Reset mail count
  //       mailCount = 0;
  //     }


    repliedUsers = JSON.parse(data);
  } catch (err) {
    console.error("Error loading replied users:", err);
    repliedUsers = [];
  }
}

async function saveRepliedUsers() {
  try {
    console.log("Saving replied users to file...");
    await fs.writeFile(repliedUsersFile, JSON.stringify(repliedUsers), 'utf8');
    console.log("Replied users saved successfully.");
  } catch (err) {
    console.error("Error saving replied users:", err);
  }
}

async function main() {
  // Create or retrieve label ID
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "../credentials/credentials.json"),
    scopes: SCOPES,
  });

  try {
    await fs.access(repliedUsersFile);
  } catch (err) {
    console.log("repliedUsers.json does not exist. Creating an empty file...");
    await fs.writeFile(repliedUsersFile, '[]', 'utf8');
    console.log("Empty file created successfully.");
  }

  const gmail = google.gmail({ version: "v1", auth });
  const labelId = await createLabel(auth);
  const repliedUsersSet = new Set(repliedUsers);

  // Set interval for checking and replying to messages
  const intervalInMinutes = 60000;
  setInterval(async () => {
    // Get messages that have no prior reply
    const messages = await getRecentUnrepliesMessages(auth);

    if (messages && messages.length > 0) {
      for (const message of messages) {
        const messageData = await gmail.users.messages.get({
          auth,
          userId: "me",
          id: message.id,
        });

        const email = messageData.data;
        const senderEmail = email.payload.headers.find(
          (header) => header.name === "From"
        ).value;

        if (!repliedUsersSet.has(senderEmail)) {
          const hasReplied = email.payload.headers.some(
            (header) => header.name === "In-Reply-To"
          );

          if (!hasReplied) {
            // Craft the reply message
            const replyMessage = {
              userId: "me",
              resource: {
                raw: Buffer.from(
                  `To: ${
                    email.payload.headers.find(
                      (header) => header.name === "From"
                    ).value
                  }\r\n` +
                    `Subject: Re: ${
                      email.payload.headers.find(
                        (header) => header.name === "Subject"
                      ).value
                    }\r\n` +
                    `Content-Type: text/plain; charset="UTF-8"\r\n` +
                    `Content-Transfer-Encoding: 7bit\r\n\r\n` +
                    `I'm currently on vacation and will reply to you when I return. \n\n\nThanks and Regards,\nAbhinav Srikanth\r\n`
                ).toString("base64"),
              },
            };

            // Send the reply message
            await gmail.users.messages.send(replyMessage);

            // Add label to the message
            await gmail.users.messages.modify({
              auth,
              userId: "me",
              id: message.id,
              resource: {
                addLabelIds: [labelId],
              },
            });

            // Add the sender to the repliedUsers set and save to file
            repliedUsers.push(senderEmail);
            repliedUsersSet.add(senderEmail);
            await saveRepliedUsers();
          }
        }
      }
    }
  }, intervalInMinutes, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
}

async function createLabel(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  try {
    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
      },
    });
    return response.data.id;
  } catch (error) {
    if (error.code === 409) {
      // Label already exists, retrieve its ID
      const response = await gmail.users.labels.list({
        userId: "me",
      });
      const label = response.data.labels.find(
        (label) => label.name === labelName
      );
      return label.id;
    } else {
      throw error;
    }
  }
}

async function getRecentUnrepliesMessages(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const date = new Date();
  date.setDate(date.getMinutes() - 7);
  const formattedDate = date.toISOString();

  const response = await gmail.users.messages.list({
    userId: "me",
    q: "from:as5441@srmist.edu.in category:primary is:unread",
    //For general use the ideal syntax would be as follows:
    //q:"category:primary is:unread"
  });

  return response.data.messages || [];
}

app.get("/", async (req, res) => {
  await loadRepliedUsers();  // Load replied users when the server starts
  main();  // Start the automation process
  res.json({ "This is Auth": true });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is Running on Port ${port}`);
});

//Areas for Code Improvement
//   - The code currently includes hardcoded values for email addresses, label names, and other parameters.
//     Making these values configurable or accepting them as parameters can enhance flexibility.

//   - Error handling can be further improved. Adding more detailed error messages and implement appropriate
//     error-handling mechanisms for critical sections of the code.

//   - Modularizing the code further to enhance maintainability and readability.

//   - Evaluating potential security considerations, such as handling sensitive information securely and validating inputs.

//   - Consider adding logging functionality to capture important events and aid in debugging.

//   - Explore the possibility of incorporating unit tests to ensure the reliability of individual functions.

//   - Continuous improvement: Regular revisiting and refactoring of code should be done as needed, keeping it up to date with the latest
//     best practices and technologies.
