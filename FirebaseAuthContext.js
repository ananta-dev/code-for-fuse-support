import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
// import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import { showMessage } from 'app/store/fuse/messageSlice';
// import { logoutUser, setUser } from 'app/store/userSlice';
import { logoutFirebaseUser, setFirebaseUser } from 'app/store/firebaseUserSlice';
import firebaseAuthService from './services/firebaseAuthService';
import MinervaSplashScreen from '../core/MinervaSplashScreen';
import { firebaseAppAuth } from '../configs/firebaseConfig';

const FirebaseAuthContext = React.createContext();

function FirebaseAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [waitAuthCheck, setWaitAuthCheck] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    firebaseAuthService.on('onAutoLogin', () => {
      dispatch(showMessage({ message: 'Signing in with Firebase Auth token' }));

      /**
       * Sign in and retrieve user data with stored token
       */
      firebaseAuthService
        .signInWithToken()
        .then((user) => {
          success(user, 'Signed in with Firebase Auth token');
        })
        .catch((error) => {
          pass(error.message);
        });
    });

    firebaseAuthService.on('onLogin', (user) => {
      success(user, 'Signed in with Firebase!!!');
    });

    firebaseAuthService.on('onLogout', () => {
      pass('Signed out');
      dispatch(logoutFirebaseUser());
    });

    firebaseAuthService.on('onAutoLogout', (message) => {
      pass(message);

      dispatch(logoutFirebaseUser());
    });

    firebaseAuthService.on('onNoAccessToken', () => {
      pass();
    });

    firebaseAuthService.init();

    function success(user, message) {
      if (message) {
        dispatch(showMessage({ message }));
      }

      Promise.all([
        dispatch(setFirebaseUser(user)),
        // You can receive data in here before app initialization
      ]).then((values) => {
        setWaitAuthCheck(false);
        setIsAuthenticated(true);
      });
    }

    function pass(message) {
      if (message) {
        dispatch(showMessage({ message }));
      }

      setWaitAuthCheck(false);
      setIsAuthenticated(false);
    }

    // Firebase sets user via subscription. No need to collect user and pass it
    const unsubscribe = firebaseAppAuth.onAuthStateChanged((user) => {
      if (user) {
        success(user, 'Signed in with Firebase now in callback for onAuthStateChanged');
      } else {
        pass('User seems to be null/falsy when running onAuthStateChanged callback');
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return waitAuthCheck ? (
    <MinervaSplashScreen />
  ) : (
    // <h1>HEY! I am waiting for Firebase Auth Check!!!</h1>
    <FirebaseAuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

function useFirebaseAuth() {
  const context = React.useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

export { FirebaseAuthProvider, useFirebaseAuth };
