import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    SignUpCommandInput,
    InitiateAuthCommand,
    InitiateAuthCommandInput,
    ConfirmSignUpCommand,
    ConfirmSignUpCommandInput,
    ResendConfirmationCodeCommand,
    ResendConfirmationCodeCommandInput,
    UserNotConfirmedException
} from '@aws-sdk/client-cognito-identity-provider';
import { RequestFunction } from "./types";
import {
    ApiErrorResponse,
    ApiSuccessResponse,
    BadRequestError,
    ConfirmedUser,
    UnconfirmedUser,
    ServerError,
    validateEmail
} from "./utils";

const userPoolRegion = process.env.USER_POOL_REGION;
if (userPoolRegion === undefined) throw new ServerError("Could not find the User Pool Region");

const clientId = process.env.USER_POOL_CLIENT_ID;
if (clientId === undefined) throw new ServerError("Could not find the User Pool Client Id");

const cognito = new CognitoIdentityProviderClient({ region: userPoolRegion });

export const signUp: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { password, username, email } = JSON.parse(event.body);

        if (email === null) throw new BadRequestError("An email must be provided");
        if (!validateEmail(email)) throw new BadRequestError("The email is not valid");

        const input: SignUpCommandInput = {
            ClientId: clientId,
            Username: username,
            Password: password,
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

export const confirmSignUp: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { username, code } = JSON.parse(event.body);

        const input: ConfirmSignUpCommandInput = {
            ClientId: clientId,
            Username: username,
            ConfirmationCode: code,
        };

        const response = await cognito.send(new ConfirmSignUpCommand(input));

        return new ApiSuccessResponse(response);
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};

export const resendConfirmationCode: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { username } = JSON.parse(event.body);

        const input: ResendConfirmationCodeCommandInput = {
            ClientId: clientId,
            Username: username,
        };

        const response = await cognito.send(new ResendConfirmationCodeCommand(input));

        return new ApiSuccessResponse(response);
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};

export const signIn: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { password, username } = JSON.parse(event.body);

        const input: InitiateAuthCommandInput = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: clientId,
            AuthParameters: { USERNAME: username, PASSWORD: password }
        };

        const response = await cognito.send(new InitiateAuthCommand(input));

        const authenticationResult = response.AuthenticationResult;
        if (authenticationResult === undefined) throw new ServerError("The authentication result is empty");

        return new ApiSuccessResponse(new ConfirmedUser(authenticationResult));
    }
    catch (error) {
        if (error instanceof UserNotConfirmedException) return new ApiSuccessResponse(new UnconfirmedUser());
        else return new ApiErrorResponse(error);
    };
};