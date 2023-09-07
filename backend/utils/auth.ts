import { AuthenticationResultType, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { ServerError } from "./api";

class CognitoUser {
    readonly isConfirmed: boolean;

    constructor(isConfirmed: boolean) {
        this.isConfirmed = isConfirmed;
    };
};
export class ConfirmedUser extends CognitoUser {
    readonly authenticationResult: AuthenticationResultType;

    constructor(authenticationResult: AuthenticationResultType) {
        super(true);

        this.authenticationResult = authenticationResult;
    };
};
export class UnconfirmedUser extends CognitoUser {
    constructor() { super(false); };
};

export const validateEmail = (email: string) => {
    const validEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    return validEmail.test(email);
};

const userPoolRegion = process.env.USER_POOL_REGION;
if (userPoolRegion === undefined) throw new ServerError("Could not find the User Pool Region");

export const clientId = process.env.USER_POOL_CLIENT_ID;
if (clientId === undefined) throw new ServerError("Could not find the User Pool Client Id");

export const cognitoClient = new CognitoIdentityProviderClient({ region: userPoolRegion });