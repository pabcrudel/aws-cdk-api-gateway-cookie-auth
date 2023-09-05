import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    SignUpCommandInput,
    InitiateAuthCommand,
    InitiateAuthCommandInput,
    ConfirmSignUpCommand,
    ConfirmSignUpCommandInput,
    ResendConfirmationCodeCommand,
    ResendConfirmationCodeCommandInput
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

        if (email === null) throw new utils.BadRequestError("An email must be provided");
        if (!utils.validateEmail(email)) throw new utils.BadRequestError("The email is not valid");

        const input: SignUpCommandInput = {
            ClientId: clientId,
            Username: username,
            Password: password,
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

export const confirmSignUp: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new utils.BadRequestError("Empty request body");

        const { username, code } = JSON.parse(event.body);

        const input: ConfirmSignUpCommandInput = {
            ClientId: clientId,
            Username: username,
            ConfirmationCode: code,
        };

        const response = await cognito.send(new ConfirmSignUpCommand(input));

        return new utils.ApiSuccessResponse(response);
    }
    catch (error) {
        return new utils.ApiErrorResponse(error);
    };
};

export const resendConfirmationCode: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new utils.BadRequestError("Empty request body");

        const { username } = JSON.parse(event.body);

        const input: ResendConfirmationCodeCommandInput = {
            ClientId: clientId,
            Username: username,
        };

        const response = await cognito.send(new ResendConfirmationCodeCommand(input));

        return new utils.ApiSuccessResponse(response);
    }
    catch (error) {
        return new utils.ApiErrorResponse(error);
    };
};

export const signIn: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new utils.BadRequestError("Empty request body");

        const { password, username } = JSON.parse(event.body);

        const input: InitiateAuthCommandInput = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: clientId,
            AuthParameters: { USERNAME: username, PASSWORD: password }
        };

        const response = await cognito.send(new InitiateAuthCommand(input));

        return new utils.ApiSuccessResponse(response);
    }
    catch (error) {
        return new utils.ApiErrorResponse(error);
    };
};