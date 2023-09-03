import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Rest Api to communicate frontend with the backend */
    const restApi = new apiGateway.RestApi(this, "CookieAuthRestApi", {
      deploy: true,
    });

    /** Cognito User Pool*/
    const userPool = new cognito.UserPool(this, 'CookieAuthUserPool', {
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 10,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /** 
     * This callback URL is used to redirect the user to the protected Api 
     * after they have authenticated with the Cognito User Pool.
    */
    const callbackUrl = restApi.url + "/oauth2/callback";

    /** A user pool client application that can interact with the user pool. */
    const userPoolClient = userPool.addClient('CookieAuthAppClient', {
      oAuth: {
        callbackUrls: [callbackUrl]
      },
    });

    /** Custom domain to the Cognito User Pool. */
    const userPoolDomain = userPool.addDomain("UserPoolDomain", {
      cognitoDomain: {
        domainPrefix: "cookie-auth",
      },
    });

    /** URL that users can use to sign in to the Cognito User Pool. */
    const signInUrl = userPoolDomain.signInUrl(userPoolClient, {
      redirectUri: callbackUrl, // must be a URL configured under 'callbackUrls' with the 'userPoolClient'
    });

    /** This function will handle requests to a protected resource in the API Gateway. */
    const protectedResourceLambdaFunction = new lambda.Function(this, 'ProtectedCookieAuthFunction', {
      functionName: 'ProtectedCookieAuthFunction',
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      code: new lambda.InlineCode(`
        exports.handler = async () => {
          return {
            statusCode: 200,
            body: JSON.stringify("Hello from Protected Lambda!"),
          }; 
        };
      `),
    });
  };
};
