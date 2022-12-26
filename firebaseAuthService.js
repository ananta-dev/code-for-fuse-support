import FuseUtils from '@fuse/utils/FuseUtils';
import { firebaseAppAuth } from '../../../configs/firebaseConfig';

/* eslint-disable camelcase */

class FirebaseAuthService extends FuseUtils.EventEmitter {
  createUser = (data) => {
    return firebaseAppAuth
      .createUserWithEmailAndPassword(data.email, data.password)
      .then((response) => {
        const updateDisplayNameResult = response.user.updateProfile({
          displayName: data.displayName,
        });

        if (!response?.user)
          throw new Error(
            `Error from Firebase while Signing up ${response.error.message} - User not defined`
          );

        const firebaseUser = {
          data: {
            displayName: data.displayName,
            email: data.email,
            photoURL: 'assets/images/logo/mg-logo-no-text.png',
            shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts'],
          },
          uuid: response.user.uid,
          from: 'firebase-auth',
          role: 'admin',
        };
        this.emit('onLogin', firebaseUser);

        return response?.user;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  signInWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
      firebaseAppAuth.signInWithEmailAndPassword(email, password).then((response) => {
        const firebaseUser = {
          data: {
            displayName: response.user.displayName,
            email: response.user.email,
            photoURL: 'assets/images/logo/mg-logo-no-text.png',
            shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts'],
          },
          uuid: response.user.uid,
          from: 'firebase-auth',
          role: 'admin',
        };

        if (firebaseUser) {
          resolve(firebaseUser);
          this.emit('onLogin', firebaseUser);
        } else {
          reject(new Error('Error trying to sign in with Firebase'));
        }
      });
    });
  };

  logout = () => {
    firebaseAppAuth
      .signOut()
      .then((response) => {})
      .catch((error) => {});
    this.emit('onLogout', 'Logged out (Firebase)');
  };
}
const instance = new FirebaseAuthService();

export default instance;
