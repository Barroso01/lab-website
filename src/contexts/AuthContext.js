// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { 
  CognitoUser, 
  AuthenticationDetails,
  CognitoUserAttribute 
} from 'amazon-cognito-identity-js';
import { userPool, getHostedSignInURL } from '../cognito-config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error('Session error:', err);
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        if (session.isValid()) {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error('Get attributes error:', err);
              setCurrentUser(null);
            } else {
              const userAttributes = {};
              if (attributes) {
                attributes.forEach(attribute => {
                  userAttributes[attribute.Name] = attribute.Value;
                });
              }
              
              setCurrentUser({
                username: cognitoUser.getUsername(),
                ...userAttributes
              });
            }
            setLoading(false);
          });
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      });
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const signIn = (username, password) => {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      });
      
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });
      
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          checkUser();
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  };

  const hostedUISignIn = () => {
    window.location.href = getHostedSignInURL();
  };
  
  const logout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      setCurrentUser(null);
    }
  };

  const signUp = (username, password, attributes) => {
    return new Promise((resolve, reject) => {
      const attributeList = [];
      
      for (const key in attributes) {
        attributeList.push(
          new CognitoUserAttribute({
            Name: key,
            Value: attributes[key]
          })
        );
      }
      
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
          resolve(result);
        }
      );
    });
  };

  const value = {
    currentUser,
    signIn,
    signUp,
    hostedUISignIn,
    logout,
    loading,
    checkUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};