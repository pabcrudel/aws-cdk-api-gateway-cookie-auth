import { ConfirmSignUpCommandInput, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, clientId, cognitoClient } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { username, code } = bodyParser(event.body);

        const input: ConfirmSignUpCommandInput = {
            ClientId: clientId,
            Username: username,
            ConfirmationCode: code,
        };

        const response = await cognitoClient.send(new ConfirmSignUpCommand(input));

        return new ApiSuccessResponse(response);
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};