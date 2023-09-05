import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    SignUpCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import { RequestFunction } from "./types";
import * as utils from "./utils";

const userPoolRegion = process.env.USER_POOL_REGION;
if (userPoolRegion === undefined) throw new utils.ServerError("Could not find the User Pool Region");

const clientId = process.env.USER_POOL_CLIENT_ID;
if (clientId === undefined) throw new utils.ServerError("Could not find the User Pool Client Id");

const cognito = new CognitoIdentityProviderClient({ region: userPoolRegion });

export const signUp: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new utils.BadRequestError("Empty request body");

        const { password, username, email } = JSON.parse(event.body);

        if (typeof email !== 'string') throw new utils.BadRequestError("An email must be provided");
        if (!utils.validateEmail(email)) throw new utils.BadRequestError("The email is not valid");

        const input: SignUpCommandInput = {
            ClientId: clientId,
            Password: password,
            Username: username,
            UserAttributes: [
                { Name: "email", Value: email },
            ]
        };

        const response = await cognito.send(new SignUpCommand(input));

        return new utils.ApiSuccessResponse(response);
    }
    catch (error) {
        return new utils.ApiErrorResponse(error);
    };
};