import { RequestFunction } from "../types";
import { ApiSuccessResponse, ApiErrorResponse } from "../utils/api";
import { bodyParser, initiateAuthFunction, AuthenticationResponse } from "../utils/auth";

export const handler: RequestFunction = async (event) => {
    try {
        const { refreshToken } = bodyParser(event.body);

        const { AuthenticationResult } = await initiateAuthFunction('REFRESH_TOKEN', { REFRESH_TOKEN: refreshToken });

        return new ApiSuccessResponse(new AuthenticationResponse(AuthenticationResult));
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};