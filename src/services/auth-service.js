// src/services/auth-service.js
import { CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool, cognitoConfig } from '../cognito-config';
import CryptoJS from 'crypto-js';

// Function to calculate the secret hash
const calculateSecretHash = (username) => {
  const message = username + cognitoConfig.userPoolWebClientId;
  return CryptoJS.HmacSHA256(message, cognitoConfig.clientSecret).toString(CryptoJS.enc.Base64);
};

export const authService = {
  // Register a new user
  register: (username, email, password) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email })
      ];

      userPool.signUp(
        username, 
        password, 
        attributeList, 
        null, 
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result.user);
        },
        {
          SecretHash: calculateSecretHash(username)
        }
      );
    });
  },

  // Sign in existing user
  signIn: (username, password) => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
        SecretHash: calculateSecretHash(username)
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // Get current session
  getCurrentSession: () => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (session.isValid()) {
          // Get user attributes
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              resolve({ session });
              return;
            }
            
            // Format user data
            const userData = {};
            attributes.forEach(attr => {
              userData[attr.Name] = attr.Value;
            });
            
            resolve({ session, user: userData });
          });
        } else {
          resolve(null);
        }
      });
    });
  },

  // Sign out
  signOut: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  },

  // Request password reset
  forgotPassword: (username) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  //confirmRegistration ////////////////////////////////
  confirmRegistration: (username, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      }, {
        SecretHash: calculateSecretHash(username)
      });
    });
  },


  // Complete password reset
  confirmPassword: (username, verificationCode, newPassword) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  }
};