// IMPORTS
require('dotenv').config()                               // Only for local testing
const dialogflow = require('@google-cloud/dialogflow');     // Imports the Dialogflow library
const express = require('express')                          // Imports the NodeJS web applicaion framework 

// ENVIRONMENT SETUP
const projectId = process.env.PROJECTID;                    // ProjectID
const sessionId = Math.random().toString(36).substring(7);  // Random sessionId for client
const languageCode = 'en';                                  // Language code in English
const port = process.env.PORT                               // Port
const options = {                                           // Credentials
    credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    }
};

// Initialize Express App
const expressApp = express()

// Listen on specified port
expressApp.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})

// Send response on base URL
expressApp.get('/', (req, res) => {
    // Request parameter q  -->  .../?q
    const query = req.query.q
    sendAPIquery(projectId, sessionId, query, languageCode).then(function(resp) {
        console.log("Successful response: ", resp);
        const response = {
            resp: resp,
        }
        res.json(response)
    })
})

// Create session client
const sessionClient = new dialogflow.SessionsClient(options);

// Function that gets the intent of query
async function getIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    // The path to identify the agent that owns the created intent
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // The text query request
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

// Sends off query to the API
async function sendAPIquery(projectId, sessionId, query, languageCode) {
    // Context to continue conversation with chatbot
    let context;
    let intent;
    try {
        console.log(`Sending query: ${query}`);
        // First, get intent
        intent = await getIntent(
            projectId,
            sessionId,
            query,
            context,
            languageCode
        );
        console.log('Intent Detected');
        // Use the context from this response for next queries, if required
        context = intent.queryResult.outputContexts;

        // Fulfillment text from our DialogFlow API
        let response = `${intent.queryResult.fulfillmentText}`
        console.log("Fulfillment Text:", response);
        return response
    } catch (error) {
        console.log(error);
    }
}
