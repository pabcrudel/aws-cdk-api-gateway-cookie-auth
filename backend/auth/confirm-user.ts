import { ConfirmSignUpCommandInput, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { BadRequestError, ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { clientId, cognitoClient } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { username, code } = JSON.parse(event.body);

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