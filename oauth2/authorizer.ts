import { CognitoJwtVerifier } from "aws-jwt-verify";
import { GetAccessTokenFromCookies } from "./types";

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