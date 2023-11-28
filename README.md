# Gmail Auto-Replier

Automatically replies to unread emails with a vacation message on Gmail.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Dependencies](#dependencies)
- [Usage](#usage)

## Introduction

The Gmail Auto-Replier is a Node.js application that automates the process of replying to unread emails with a vacation message. It uses the Gmail API to interact with your Gmail account and send automated replies.

## Features

- Automatically sends vacation replies to unread emails.
- Keeps track of users who have already received a reply.
- Customizable vacation message.

## Getting Started

To get started with the Gmail Auto-Replier, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/gmail-auto-replier.git
    cd gmail-auto-replier
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up Google Cloud API credentials:

    - Obtain credentials from the [Google Cloud Console](https://console.cloud.google.com/).
    - Download the JSON file and save it in the `credentials` directory.
    - Update the keyfilePath in `app.js` with the path to your credentials JSON file.

## Dependencies

The following npm packages are used in this project:

- `express`: Fast, unopinionated, minimalist web framework for Node.js.
- `@google-cloud/local-auth`: A simple library to perform local OAuth 2.0 authentication with Google services.
- `fs.promises`: The Node.js 'fs' module with promises.
- `googleapis`: A comprehensive set of tools for interacting with the Google API.

Install these dependencies using:

```bash

- npm install express @google-cloud/local-auth fs.promises googleapis

- Use `npm start`/`node --no-deprecation src/app.js` to start the server.

Contact Information:
- Name: Abhinav Srikanth
- Reg No: RA2011003020345
- College: SRM Institute of Science and Technology, Ramapuram
- Sem: VII
- Year: IV
- Email: abhinavsrikanth01@gmail.com/as5441@srmist.edu.in
- Contact Number/Whatsapp: +91 6382637353
