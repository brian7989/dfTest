// IMPORTS
// require('dotenv').config()
const dialogflow = require('@google-cloud/dialogflow');     // Imports the Dialogflow library
const express = require('express')                          // Imports the NodeJS web applicaion framework 

// ENVIRONMENT SETUP
const projectId = process.env.PROJECTID;                    // ProjectID
const sessionId = Math.random().toString(36).substring(7);  // Random sessionId
const query = "HELLO";                                      // Query. To be changed to user's input
const languageCode = 'en';                                  // Language code in English
const port = process.env.PORT                               // Port
const options = {                                           // Credentials
    credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY
    }
};

// Initialize Express App
const app = express()

// Listen on specified port
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})

// Send response on base URL
app.get('/', (req, res) => {
    console.log(projectId, sessionId, port, options);
    executeQuery(projectId, sessionId, query, languageCode).then(function (resp) {
        console.log("Successful response: ", resp);
        res.send(resp)
    })
})

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient(options);

async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQuery(projectId, sessionId, query, languageCode) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
    try {
        console.log(`Sending Query: ${query}`);
        intentResponse = await detectIntent(
            projectId,
            sessionId,
            query,
            context,
            languageCode
        );
        console.log('Detected intent');
        // Use the context from this response for next queries, if required
        // context = intentResponse.queryResult.outputContexts;

        // Fulfillment text from DialogFlow API
        let response = `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
        console.log(response);
        return response
    } catch (error) {
        console.log(error);
    }
}
