#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoSecuredRestApi } from '../lib/cognito-secured-rest-api';
import { WebsiteDeployment } from '../lib/website-deployment';

const app = new cdk.App();
new CognitoSecuredRestApi(app, 'CognitoSecuredRestApi');
new WebsiteDeployment(app, 'CognitoSecuredWebsite');
