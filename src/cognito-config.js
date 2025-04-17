// src/cognito-config.js
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'us-west-1_adLsSLM3D',
  ClientId: '3ash4s74b0au5n67jgcosims64',
};

export const userPool = new CognitoUserPool(poolData);

// Find your domain in Cognito console - it should be under the "Domain name" section
// Look for something like "your-domain-prefix.auth.us-west-1.amazoncognito.com"
const DOMAIN = 'us-west-1adlsslm3d.auth.us-west-1.amazoncognito.com';

export const getHostedSignInURL = () => {
  return `https://${DOMAIN}/login?client_id=${poolData.ClientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}`;
};

export const getHostedSignOutURL = () => {
  return `https://${DOMAIN}/logout?client_id=${poolData.ClientId}&logout_uri=${encodeURIComponent('http://localhost:3000')}`;
};