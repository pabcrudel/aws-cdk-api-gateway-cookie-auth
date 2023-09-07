import { ResendConfirmationCodeCommandInput, ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ServerError, ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, clientId, cognitoClient } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { username } = bodyParser(event.body);

        const input: ResendConfirmationCodeCommandInput = {
            ClientId: clientId,
            Username: username,
        };

        const response = await cognitoClient.send(new ResendConfirmationCodeCommand(input));

        if (response.CodeDeliveryDetails === undefined || response.CodeDeliveryDetails.Destination === undefined)
            throw new ServerError('Could not find where to send the confirmation code');

        return new ApiSuccessResponse({ message: 'A new confirmation code has been sent', destination: response.CodeDeliveryDetails.Destination });
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};