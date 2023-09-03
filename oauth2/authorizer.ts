import { CognitoJwtVerifier } from "aws-jwt-verify";
import { GetAccessTokenFromCookies } from "./types";
import { ApiErrorResponse, BadRequestError, ServerError } from "./utils";

const getAccessTokenFromCookies: GetAccessTokenFromCookies = (cookies) => {
    let accessToken = null;

    let lock = true;
    for (let i = 0; lock && i < cookies.length; i++) {
        const [name, value] = cookies[i].split("=");
        if (name === 'cognitoAccessToken') {
            accessToken = value;
            lock = false;
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