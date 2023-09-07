import { InitiateAuthCommandInput, InitiateAuthCommand, UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ServerError, ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, clientId, cognitoClient, SuccessfulSignIn, ConfirmedUser, UnconfirmedUser } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { password, username } = bodyParser(event.body);

        const input: InitiateAuthCommandInput = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: clientId,
            AuthParameters: { USERNAME: username, PASSWORD: password }
        };

        const response = await cognitoClient.send(new InitiateAuthCommand(input));

        return new ApiSuccessResponse(new SuccessfulSignIn(new ConfirmedUser(response.AuthenticationResult)));
    }
    catch (error) {
        if (error instanceof UserNotConfirmedException) return new ApiSuccessResponse(new SuccessfulSignIn(new UnconfirmedUser()));
        else return new ApiErrorResponse(error);
    };
};