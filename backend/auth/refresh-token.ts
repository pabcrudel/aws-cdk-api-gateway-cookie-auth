import { InitiateAuthCommandInput, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, clientId, cognitoClient, AuthenticationResponse } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { refreshToken } = bodyParser(event.body);

        const input: InitiateAuthCommandInput = {
            AuthFlow: 'REFRESH_TOKEN',
            ClientId: clientId,
            AuthParameters: { REFRESH_TOKEN: refreshToken }
        };

        const response = await cognitoClient.send(new InitiateAuthCommand(input));

        return new ApiSuccessResponse(new AuthenticationResponse(response.AuthenticationResult));
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};