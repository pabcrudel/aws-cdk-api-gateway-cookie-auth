import { InitiateAuthCommandInput, InitiateAuthCommand, UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ServerError, ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, clientId, cognitoClient, ConfirmedUser, UnconfirmedUser } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { password, username } = bodyParser(event.body);

        const input: InitiateAuthCommandInput = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: clientId,
            AuthParameters: { USERNAME: username, PASSWORD: password }
        };

        const response = await cognitoClient.send(new InitiateAuthCommand(input));

        const authenticationResult = response.AuthenticationResult;
        if (authenticationResult === undefined) throw new ServerError("The authentication result is empty");

        return new ApiSuccessResponse(new ConfirmedUser(authenticationResult));
    }
    catch (error) {
        if (error instanceof UserNotConfirmedException) return new ApiSuccessResponse(new UnconfirmedUser());
        else return new ApiErrorResponse(error);
    };
};