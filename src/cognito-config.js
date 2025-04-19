// src/cognito-config.js

// Core configuration
export const cognitoConfig = {
  region: 'us-west-1',
  userPoolId: 'us-west-1_adLsSLM3D',
  userPoolWebClientId: '3ash4s74b0au5n67jgcosims64',
  clientSecret: '1rnqk073nhuouj89hasehul1m0ilj58n2i801gegvh16ffgkoj2f',
  domain: 'us-west-1adlsslm3d.auth.us-west-1.amazoncognito.com',
  redirectSignIn: 'http://localhost:3000/callback',
  redirectSignOut: 'http://localhost:3000/'
};

// Export userPool if needed elsewhere - we create it in the auth helper now
// to avoid circular dependencies

// Helper functions for hosted UI
export const getHostedSignInURL = () => {
  return `https://${cognitoConfig.domain}/login?client_id=${cognitoConfig.userPoolWebClientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(cognitoConfig.redirectSignIn)}`;
};

export const getHostedSignOutURL = () => {
  return `https://${cognitoConfig.domain}/logout?client_id=${cognitoConfig.userPoolWebClientId}&logout_uri=${encodeURIComponent(cognitoConfig.redirectSignOut)}`;
};