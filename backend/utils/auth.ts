import { AuthenticationResultType, CodeDeliveryDetailsType, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { ServerError, BadRequestError } from "./api";

class CognitoUser {
    readonly isConfirmed: boolean;

    constructor(isConfirmed: boolean) {
        this.isConfirmed = isConfirmed;
    };
};
export class ConfirmedUser extends CognitoUser {
    readonly authenticationResponse: AuthenticationResponse;

    constructor(authenticationResult: AuthenticationResultType | undefined) {
        super(true);

        this.authenticationResponse = new AuthenticationResponse(authenticationResult);
    };
};
export class UnconfirmedUser extends CognitoUser {
    constructor() { super(false); };
};

export class AuthenticationResponse {
    readonly message: string = 'Successfully generated tokens';
    readonly authenticationResult: AuthenticationResultType;

    constructor(authenticationResult: AuthenticationResultType | undefined) {
        if (authenticationResult === undefined) throw new ServerError("The authentication result is empty");

        this.authenticationResult = authenticationResult;
    };
};
export class SuccessfulCodeSubmission {
    readonly message: string = 'Confirmation code has been sent';
    readonly sentTo: string;

    constructor(CodeDeliveryDetails: CodeDeliveryDetailsType | undefined) {
        if (CodeDeliveryDetails === undefined || CodeDeliveryDetails.Destination === undefined)
            throw new ServerError('Could not find where to send the confirmation code');

        this.sentTo = CodeDeliveryDetails.Destination;
    };
};
class SuccessfulUserAction {
    readonly message: string;
    readonly user: CognitoUser;

    constructor(userAction: string, user: CognitoUser) {
        this.message = `User ${userAction} successfully`;
        this.user = user;
    };
};
export class SuccessfulSignUp extends SuccessfulUserAction {
    readonly confirmationCode: SuccessfulCodeSubmission;

    constructor(user: CognitoUser, CodeDeliveryDetails: CodeDeliveryDetailsType | undefined) {
        super('registered', user);

        this.confirmationCode = new SuccessfulCodeSubmission(CodeDeliveryDetails);
    };
};
export class SuccessfulSignIn extends SuccessfulUserAction {
    constructor(user: CognitoUser) {
        super('logged', user);
    };
};

export const validateEmail = (email: string) => {
    const validEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    return validEmail.test(email);
};

export const bodyParser = (body: string | null) => {
    if (body === null) throw new BadRequestError("Empty request body");

    return JSON.parse(body);
};

const userPoolRegion = process.env.USER_POOL_REGION;
if (userPoolRegion === undefined) throw new ServerError("Could not find the User Pool Region");

export const clientId = process.env.USER_POOL_CLIENT_ID;
if (clientId === undefined) throw new ServerError("Could not find the User Pool Client Id");

export const cognitoClient = new CognitoIdentityProviderClient({ region: userPoolRegion });