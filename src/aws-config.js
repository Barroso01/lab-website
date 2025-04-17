// src/aws-config.js
const awsConfig = {
  Auth: {
    region: 'us-west-1', // Your region (derived from your client's region)
    userPoolId: 'us-west-1_adLsSLM3D', // Your User Pool ID
    userPoolWebClientId: '3ash4s74b0au5n67jgcosims64', // Your Client ID
    
    // Add OAuth configuration
    oauth: {
      domain: 'https://us-west-1adlsslm3d.auth.us-west-1.amazoncognito.com', // Replace with your domain from step 2
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:3000/callback',
      redirectSignOut: 'http://localhost:3000/',
      responseType: 'code'
    }
  }
};

export default awsConfig;