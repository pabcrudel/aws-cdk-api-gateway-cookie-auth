import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    SignUpCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import { RequestFunction } from "./types";
import { ApiErrorResponse, ApiSuccessResponse, BadRequestError, ServerError } from "./utils";

const userPoolRegion = process.env.USER_POOL_REGION;
if (userPoolRegion === undefined) throw new ServerError("Could not find the User Pool Region");

const clientId = process.env.USER_POOL_CLIENT_ID;
if (clientId === undefined) throw new ServerError("Could not find the User Pool Client Id");

const cognito = new CognitoIdentityProviderClient({ region: userPoolRegion });

export const signUp: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { password, username, email } = JSON.parse(event.body);

        const input: SignUpCommandInput = {
            ClientId: clientId,
            Password: password,
            Username: username,
            UserAttributes: [
                { Name: "email", Value: email },
            ]
        };

        const response = await cognito.send(new SignUpCommand(input));

        return new ApiSuccessResponse(response);
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};