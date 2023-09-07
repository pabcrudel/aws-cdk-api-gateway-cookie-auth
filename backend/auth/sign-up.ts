import { SignUpCommandInput, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { BadRequestError, validateEmail, clientId, cognitoClient, ApiSuccessResponse, ApiErrorResponse } from "../utils";

export const handler: RequestFunction = async (event) => {
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

        const response = await cognitoClient.send(new SignUpCommand(input));

        return new ApiSuccessResponse(response);
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};