import * as cdk from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Rest Api to communicate frontend with the backend */
    const restApi = new apiGateway.RestApi(this, "CookieAuthRestApi", {
      deploy: true,
    });

    /** Cognito User Pool*/
    const userPool = new cognito.UserPool(this, 'UserPool', {
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
  };
};
