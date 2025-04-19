// src/utils/cognito-auth-helper.js
import { 
    CognitoUser, 
    AuthenticationDetails, 
    CognitoUserPool} from 'amazon-cognito-identity-js';
  import * as CryptoJS from 'crypto-js';
  import { cognitoConfig } from '../cognito-config'; 
  import AWS from 'aws-sdk';
  
  // Create user pool instance for direct SDK usage
  const userPool = new CognitoUserPool({
    UserPoolId: cognitoConfig.userPoolId,
    ClientId: cognitoConfig.userPoolWebClientId
  });
  
  /**
   * Calculates the SECRET_HASH value required for Cognito operations
   * when a client secret is configured.
   */
  export const calculateSecretHash = (username) => {
    try {
      const clientSecret = cognitoConfig.clientSecret;
      const clientId = cognitoConfig.userPoolWebClientId;
      
      if (!clientSecret) {
        console.error("Client secret is missing in configuration");
        return '';
      }
      
      // The message is the username + clientId
      const message = username + clientId;
      
      // Calculate HMAC with SHA256
      const hashResult = CryptoJS.HmacSHA256(message, clientSecret);
      
      // Convert to base64
      const secretHash = CryptoJS.enc.Base64.stringify(hashResult);
      
      console.log("Generated SECRET_HASH for user:", username);
      return secretHash;
    } catch (error) {
      console.error("Error generating SECRET_HASH:", error);
      throw error;
    }
  };
  
  /**
   * Register a new user
   */

  export const registerUser = (username, password, email, onSuccess, onFailure) => {
    try {
      // Generate the SECRET_HASH
      const secretHash = calculateSecretHash(username);
      console.log("Generated SECRET_HASH:", secretHash);
      
      // Prepare user attributes
      const attributeList = [
        {
          Name: 'email',
          Value: email
        }
      ];
  
      // Create params directly instead of using the callback with options
      const params = {
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: username,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: attributeList
      };
  
      console.log("Registration params:", {...params, Password: '***', SecretHash: '***'});
      
      // Use AWS.CognitoIdentityServiceProvider directly to make the signUp call
      const serviceProvider = new AWS.CognitoIdentityServiceProvider({
        region: cognitoConfig.region
      });
      
      serviceProvider.signUp(params, (err, data) => {
        if (err) {
          console.error("Registration error:", err);
          onFailure(err);
          return;
        }
        console.log("Registration successful:", data);
        onSuccess(data);
      });
    } catch (error) {
      console.error("Unexpected error in registerUser:", error);
      onFailure(error);
    }
  };

  /**
   * Login user with username/email and password using AWS SDK directly
   */
  export const loginUser = (username, password, onSuccess, onFailure) => {
    try {
      // Generate the SECRET_HASH
      const secretHash = calculateSecretHash(username);
      console.log("Generated SECRET_HASH for user:", username);
      
      // Create params for direct API call
      const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: cognitoConfig.userPoolWebClientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: secretHash
        }
      };
      
      console.log("Login params:", {...params, AuthParameters: {...params.AuthParameters, PASSWORD: '***', SECRET_HASH: '***'}});
      
      // Use AWS.CognitoIdentityServiceProvider directly
      const serviceProvider = new AWS.CognitoIdentityServiceProvider({
        region: cognitoConfig.region
      });
      
      serviceProvider.initiateAuth(params, (err, data) => {
        if (err) {
          console.error("Authentication failed:", err);
          onFailure(err);
          return;
        }
        
        console.log("Authentication successful:", data);
        
        // Extract user information from tokens
        try {
          const idToken = data.AuthenticationResult.IdToken;
          const accessToken = data.AuthenticationResult.AccessToken;
          const refreshToken = data.AuthenticationResult.RefreshToken;
          
          // Store tokens securely - use sessionStorage not localStorage
          sessionStorage.setItem('idToken', idToken);
          sessionStorage.setItem('accessToken', accessToken);
          sessionStorage.setItem('refreshToken', refreshToken);
          
          // Decode the ID token to get user info (in production, verify token signature)
          const payload = idToken.split('.')[1];
          const decodedPayload = JSON.parse(atob(payload));
          
          onSuccess({
            idToken: {
              jwtToken: idToken,
              payload: decodedPayload
            },
            accessToken: {
              jwtToken: accessToken
            },
            refreshToken: {
              token: refreshToken
            }
          });
        } catch (decodeError) {
          console.error("Error processing tokens:", decodeError);
          onFailure(new Error("Failed to process authentication result"));
        }
      });
    } catch (error) {
      console.error("Unexpected error in loginUser:", error);
      onFailure(error);
    }
  };
  
  export const getCurrentUser = () => {
    return userPool.getCurrentUser();
  };
  
  export const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  };

  /*** Get the user's session if they're authenticated*/
export const getCurrentSession = async () => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      return null;
    }
    
    return new Promise((resolve, reject) => {
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(session);
      });
    });
  };
/**
 * Confirm registration with verification code
 */
export const confirmRegistration = (username, confirmationCode, onSuccess, onFailure) => {
  try {
    // Generate the SECRET_HASH
    const secretHash = calculateSecretHash(username);
    
    // Create the params for direct API call
    const params = {
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      SecretHash: secretHash
    };
    
    console.log("Confirming registration for user:", username);
    
    // Use AWS SDK directly
    const serviceProvider = new AWS.CognitoIdentityServiceProvider({
      region: cognitoConfig.region
    });
    
    serviceProvider.confirmSignUp(params, (err, data) => {
      if (err) {
        console.error("Confirmation error:", err);
        onFailure(err);
        return;
      }
      console.log("Confirmation successful:", data);
      onSuccess(data);
    });
  } catch (error) {
    console.error("Unexpected error in confirmRegistration:", error);
    onFailure(error);
  }
};

// Add this function to your cognito-auth-helper.js file

/**
 * Resend confirmation code
 */
export const resendConfirmationCode = (username, onSuccess, onFailure) => {
  try {
    // Generate the SECRET_HASH
    const secretHash = calculateSecretHash(username);
    
    // Create the params for direct API call
    const params = {
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
      SecretHash: secretHash
    };
    
    console.log("Resending confirmation code for user:", username);
    
    // Use AWS SDK directly
    const serviceProvider = new AWS.CognitoIdentityServiceProvider({
      region: cognitoConfig.region
    });
    
    serviceProvider.resendConfirmationCode(params, (err, data) => {
      if (err) {
        console.error("Resend confirmation code error:", err);
        onFailure(err);
        return;
      }
      console.log("Confirmation code resent successfully:", data);
      onSuccess(data);
    });
  } catch (error) {
    console.error("Unexpected error in resendConfirmationCode:", error);
    onFailure(error);
  }
};

/**
 * Check if the user has valid tokens and is authenticated
 * Returns user data if authenticated, null if not
 */
export const checkAuth = () => {
  try {
    // Get stored tokens
    const idToken = sessionStorage.getItem('idToken');
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    
    // If no tokens, user is not authenticated
    if (!idToken || !accessToken) {
      return null;
    }
    
    // Decode ID token to get user info
    // In production, you should verify token signature
    try {
      const payload = idToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp < currentTime) {
        console.log("Token expired, attempting refresh...");
        // You could implement token refresh here
        return null;
      }
      
      // Return user information
      return {
        username: decodedPayload['cognito:username'] || decodedPayload.username,
        email: decodedPayload.email,
        isAuthenticated: true
      };
    } catch (decodeError) {
      console.error("Error decoding token:", decodeError);
      return null;
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return null;
  }
};