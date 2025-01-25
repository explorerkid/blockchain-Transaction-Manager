// firebaseAdmin.js
const admin = require("firebase-admin");
const path = require('path');
require('dotenv').config();

// Use absolute path for the service account file
const serviceAccount = require(path.resolve(__dirname, process.env.FIREBASE_ADMIN_SDK_PATH));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
