import { ResendConfirmationCodeCommandInput, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { BadRequestError, clientId, cognitoClient, ApiSuccessResponse, ApiErrorResponse } from "../utils";

export const handler: RequestFunction = async (event) => {
    try {
        if (event.body === null) throw new BadRequestError("Empty request body");

        const { username } = JSON.parse(event.body);

        const input: ResendConfirmationCodeCommandInput = {
            ClientId: clientId,
            Username: username,
        };

        const response = await cognitoClient.send(new ResendConfirmationCodeCommand(input));

        return new ApiSuccessResponse(response);
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};