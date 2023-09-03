import axios from "axios";
import * as qs from "qs";
import { RequestFunction } from "./types";
import { ApiErrorResponse, BadRequestError, ServerError } from "./utils";

export const handler: RequestFunction = async (event) => {
    try {
        const queryStringParams = event.queryStringParameters;
        if (queryStringParams === null) throw new BadRequestError("Empty Query String Params");

        const code = queryStringParams.code;
        if (code === undefined) throw new BadRequestError("Code Query String Param required");

        const redirectURI = process.env.REDIRECT_URI;
        if (redirectURI === undefined) throw new ServerError("Could not find a Redirect URI");

        // qs.stringify converts a JavaScript object into a URL query string.
        const CTEQueryParams = qs.stringify({
            grant_type: "authorization_code",
            client_id: process.env.CLIENT_ID,
            // The redirect has already happened, but you still need to pass the URI for validation, so a valid oAuth2 access token can be generated
            redirect_uri: encodeURI(redirectURI),
            code: code,
        });

        const cognitoTokenEndpoint = process.env.TOKEN_ENDPOINT;
        if (cognitoTokenEndpoint === undefined) throw new ServerError("Could not find the Cognito Token Endpoint");

        const response = await axios.post(cognitoTokenEndpoint, CTEQueryParams, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        const cognitoJsonWebToken = response.data.access_token;

        if (cognitoJsonWebToken === undefined) throw new ServerError("Could not find the Cognito JSON Web Token");

        return {
            statusCode: 302,
            // These headers are returned as part of the response to the browser.
            headers: {
                // The Location header tells the browser it should redirect to the root of the URL
                Location: "/",
                // The Set-Cookie header tells the browser to persist the access token in the cookie store
                "Set-Cookie": `accessToken=${cognitoJsonWebToken}; Secure; HttpOnly; SameSite=Lax; Path=/`,
            },
        };
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};