import { SignUpCommandInput, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { BadRequestError, ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, validateEmail, clientId, cognitoClient } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { password, username, email } = bodyParser(event.body);

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