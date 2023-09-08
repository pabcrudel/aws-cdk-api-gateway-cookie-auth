import { AuthenticationResultType } from '@aws-sdk/client-cognito-identity-provider';

export class CognitoUser {
    readonly isConfirmed: boolean;
    readonly username: string;

    constructor(username: string, isConfirmed: boolean) {
        this.username = username;
        this.isConfirmed = isConfirmed;
    };
};
export class ConfirmedUser extends CognitoUser {
    readonly authenticationResponse: AuthenticationResultType;

    constructor(username: string, authenticationResult: AuthenticationResultType) {
        super(username, true);

        this.authenticationResponse = authenticationResult;
    };
};
export class UnconfirmedUser extends CognitoUser {
    constructor(username: string) { super(username, false); };
};