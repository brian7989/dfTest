const projectId = 'testagent-plqe';
const sessionId = '123456';
const queries = [
    'Whats your favorite food?',
    "Hello"
]
const languageCode = 'en';
const options = {
    credentials: {
        client_email: "test3-319@testagent-plqe.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBYTbYC3K7MH3L\nR/fQ8+QP6x87CEm6I6cqCQi8B5cmCiV7Kjq00f8iVExyKB2kKHPf7hsTcd5OfPhT\nzu579ufHE7bpxZyz7awFRDxY6pkwekdwmTB+TGf4aq0BpUFfv6shzFrGf2TdMK4e\nt4hp4j5Tm++WTnw5/Y4aP6t5O/ZWIQ8Jt4EWsn15lCFcDc7VbNnHQonczuA9BHWc\nkLE4BqQ+KZgMd76crzGkPht0LfbfAhO9Vzzuypcxv9/p9oXJhrrb8+PRfbp+m6yc\nGTGCO2ROiXyhdVpwGy4D7zU4YHkgPbX7RZRX+5iwrp5pOGWgyS/RsDJ4u+Sr7oJa\nGUnH3SeTAgMBAAECggEAAJWeauLh+KwlWJyUJISZU8j9ND74YYCRFUVebuOesq7y\nvQ0y+qbIHLDy9emmaUisA9bi4xAWHEXnIfJIX87TJ8qEP4GgCELlRbMWmHXqMeVi\nbXYMfh06AKVF5CgGWOnOdIefp3fIq50KH2Tt5NSaAOhB9Qsfif4vr9UNAGgoDvAl\nt6RS2UJmdjlv6gEBSxeAU0YZ8Mf9KcT0SWiXJFuWHBVakGFkVsrsMe3484u0uJiO\nZH813JtVV1xjIvyZHLPmvqx1WN8u3YkvE9JvCvA6sxx1uG3Fu3eGIj1c66wyJNx6\nfl+o/Wq2P8jjjUNwNvzwTj3LVwZek7hhZ4OVztEfwQKBgQD1IeEGJ+m6Xs9pOxeq\nvIrECq3mZTZg72jkMRLB8DTWqSjYRQm0UgBfAToYkeWMSKc+9CBAAoSXcaMr8uTc\nWzKqpmt4IRdoz+Icxxo/MpahDfMCXX7AzwIWAB2mUSlaQ4y+oP5ZG1geZ4Ca6kbP\nAR2CYN6qYgFhy1GmnwB7irOTQQKBgQDJ8/iO29BqaOiLbib2dXen+7qse0mLVw6d\n98pmzt0bpiEOCiQWDffc4/nq8yiXP62n8VUsnHFFeh24vnN7/Zb4Sz38HEgCSEeW\nGiDRVXo1v8gV93C23K6FKgr1PRsbpj/g7PVtumSUI7RdN6+zbhTpH3LkXUQ2Iwt6\n1xVAMc2J0wKBgQDcJoMbrjjhIkkQbvvAYPgXPKgVZQzDXgBMAC6icoJhzyZZpRck\nFQk0SbvNWSpZJN7fUQytsBU4ldw/mjMkG9uTG0clakLF5P1jbwUJgPt6xTZcB2/Q\n5Zkv/Qaj2fxTjpsWkSwdBsvK8pWzi3fwbUX9U9ZmGwK2u40nIWGjklvYgQKBgGMy\najHJuPq7oxXxukOu+WJS3KOiP0KpNW3Ua9/J1oOhO3VI9+a5X7lpZbXJUHPSfHsU\nqJCsG1tUG0tGiTUrH7/APacbQSeV10vcc6g/QzMpi592li/MABE60H0bUbhoFdJm\nsjr+pi65xvtOwgfxl2XW47lWMo4g8p+ZDEAm9l2vAoGAFp41NEL3BJURlU7JvmXT\niFX+vib+2wdtgFni2jq+bQVXglCdSvae2VLDVspPEyO1UGLsO2IXJuzv1HXNYhmq\nwva64fV23E4YKm8XEwIqu8kkinCbXyQQaiDZvDyR1jCZmk/YmNzb5xPNh6CSU9B6\n0jL34XkJZatlWFTiRNkIPyw=\n-----END PRIVATE KEY-----\n"
    }
};

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

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

async function executeQueries(projectId, sessionId, queries, languageCode) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
    for (const query of queries) {
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
            console.log(
                `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
            );
            // Use the context from this response for next queries
            context = intentResponse.queryResult.outputContexts;
        } catch (error) {
            console.log(error);
        }
    }
}
executeQueries(projectId, sessionId, queries, languageCode);