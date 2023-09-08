import { GlobalSignOutCommand, GlobalSignOutCommandInput, UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, SuccessfulSignIn, SuccessfulAction, UnconfirmedUser, cognitoClient } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { accessToken } = bodyParser(event.body);

        const input: GlobalSignOutCommandInput = { AccessToken: accessToken };

        await cognitoClient.send(new GlobalSignOutCommand(input));

        return new ApiSuccessResponse(new SuccessfulAction('logged out'));
    }
    catch (error) {
        if (error instanceof UserNotConfirmedException) return new ApiSuccessResponse(new SuccessfulSignIn(new UnconfirmedUser()));
        else return new ApiErrorResponse(error);
    };
};