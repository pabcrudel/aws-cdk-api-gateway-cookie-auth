import { UserNotConfirmedException } from "@aws-sdk/client-cognito-identity-provider";
import { RequestFunction } from "../types";
import { ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, initiateAuthFunction, SuccessfulSignIn, ConfirmedUser, UnconfirmedUser } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { password, username } = bodyParser(event.body);

        const { AuthenticationResult } = await initiateAuthFunction('USER_PASSWORD_AUTH', { USERNAME: username, PASSWORD: password });

        return new ApiSuccessResponse(new SuccessfulSignIn(new ConfirmedUser(AuthenticationResult)));
    }
    catch (error) {
        if (error instanceof UserNotConfirmedException) return new ApiSuccessResponse(new SuccessfulSignIn(new UnconfirmedUser()));
        else return new ApiErrorResponse(error);
    };
};