import { CognitoJwtVerifier } from "aws-jwt-verify";
import { GetAccessTokenFromCookies } from "./types";
import { RequestFunction } from "./types";
import { ApiErrorResponse, BadRequestError, ServerError } from "../utils";

const getAccessTokenFromCookies: GetAccessTokenFromCookies = (cookies) => {
    let accessToken = undefined;

    if (cookies !== undefined) {
        let lock = true;
        for (let i = 0; lock && i < cookies.length; i++) {
            const [name, value] = cookies[i].split("=");
            if (name === 'cognitoAccessToken') {
                accessToken = value;
                lock = false;
            };
        };
    };

    return accessToken;
};

const userPoolId = process.env.USER_POOL_ID;
if (userPoolId === undefined) throw new ServerError("Could not find the User Pool ID");

const clientId = process.env.CLIENT_ID;
if (clientId === undefined) throw new ServerError("Could not find the User Pool Client ID");

const verifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: "access",
    clientId: clientId,
});

export const handler: RequestFunction = async (event) => {
    try {
        const accessToken = getAccessTokenFromCookies(event.headers['Cookie']);
        if (accessToken === undefined) throw new BadRequestError("Could not find the Cognito Access Token Cookie");

        await verifier.verify(accessToken);

        return { isAuthorized: true };
    }
    catch (error) {
        return new ApiErrorResponse(error);
    };
};