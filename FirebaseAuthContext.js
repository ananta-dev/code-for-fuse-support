import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import { logoutFirebaseUser, setFirebaseUser } from 'app/store/firebaseUserSlice';
import firebaseAuthService from './services/firebaseAuthService';
import MinervaSplashScreen from '../core/MinervaSplashScreen';
import { firebaseAppAuth } from '../configs/firebaseConfig';

const FirebaseAuthContext = React.createContext();

function FirebaseAuthProvider({ children }) {
  const [waitAuthCheck, setWaitAuthCheck] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    firebaseAuthService.on('onLogin', (user) => {
      success(user, 'Signed in with Firebase Authentication');
    });

    firebaseAuthService.on('onLogout', () => {
      pass('Signed out from Firebase Authentication');
      dispatch(logoutFirebaseUser());
    });

    // firebaseAuthService.init();

    function success(user, message) {
      if (message) {
        dispatch(showMessage({ message }));
      }

      Promise.all([dispatch(setFirebaseUser(user))]).then((values) => {
        setWaitAuthCheck(false);
      });
    }

    function pass(message) {
      if (message) {
        dispatch(showMessage({ message }));
      }
      setWaitAuthCheck(false);
    }

    const unsubscribe = firebaseAppAuth.onAuthStateChanged((user) => {
      if (user) {
        const firebaseUser = {
          data: {
            displayName: user.displayName,
            email: user.email,
            photoURL: 'assets/images/logo/mg-logo-no-text.png',
            shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts'],
          },
          uuid: user.uid,
          from: 'firebase-auth',
          role: 'admin',
        };
        success(firebaseUser, 'Signed in with Firebase Authentication token');
      } else {
        pass();
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return waitAuthCheck ? (
    <MinervaSplashScreen />
  ) : (
    // <h1>HEY! I am waiting for Firebase Auth Check!!!</h1>
    // <FirebaseAuthContext.Provider value={{ isAuthenticated }}>
    <FirebaseAuthContext.Provider>{children}</FirebaseAuthContext.Provider>
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
