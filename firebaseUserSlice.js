/* eslint import/no-extraneous-dependencies: off */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import history from '@history';
import _ from '@lodash';
import { setInitialSettings } from 'app/store/fuse/settingsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import settingsConfig from 'app/configs/settingsConfig';
import firebaseAuthService from '../auth/services/firebaseAuthService';

export const setFirebaseUser = createAsyncThunk(
  'firebaseUser/setUser',
  async (firebaseUser, { dispatch, getState }) => {
    /*
    You can redirect the logged-in user to a specific route depending on his role
    */
    if (firebaseUser.loginRedirectUrl) {
      settingsConfig.loginRedirectUrl = firebaseUser.loginRedirectUrl; // for example 'apps/academy'
    }
    return firebaseUser;
  }
);

export const updateFirebaseUserSettings = createAsyncThunk(
  'firebaseUser/updateSettings',
  async (settings, { dispatch, getState }) => {
    const { firebaseUser } = getState();
    const newUser = _.merge({}, firebaseUser, { data: { settings } });
    dispatch(updateFirebaseUserData(newUser));
    return newUser;
  }
);

export const updateFirebaseUserShortcuts = createAsyncThunk(
  'fireabseUser/updateShortucts',
  async (shortcuts, { dispatch, getState }) => {
    const { firebaseUser } = getState();
    const newUser = {
      ...firebaseUser,
      data: {
        ...firebaseUser.data,
        shortcuts,
      },
    };
    dispatch(updateFirebaseUserData(newUser));
    return newUser;
  }
);

export const logoutFirebaseUser = () => async (dispatch, getState) => {
  const { firebaseUser } = getState();

  if (!firebaseUser.role || firebaseUser.role.length === 0) {
    // It is a guest
    return null;
  }
  history.push({ pathname: '/' });
  dispatch(setInitialSettings());
  return dispatch(userLoggedOut());
};

export const updateFirebaseUserData = (firebaseUser) => async (dispatch, getState) => {
  if (!firebaseUser.role || firebaseUser.role.length === 0) {
    // It is a guest
    return;
  }
  firebaseAuthService
    .updateFirebaseUserData(firebaseUser)
    .then(() => {
      dispatch(showMessage({ message: 'User data updated' }));
    })
    .catch((error) => {
      dispatch(showMessage({ message: error.message }));
    });
};

const initialState = {
  role: [], // guest
  data: {
    displayName: 'Guest User',
    photoURL: 'assets/images/avatars/female-01.jpg',
    email: 'guest.user@minervaglobal.co.uk',
    shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts', 'apps.tasks'],
  },
};

const firebaseUserSlice = createSlice({
  name: 'firebaseUser',
  initialState,
  reducers: {
    userLoggedOut: (state, action) => initialState,
  },
  extraReducers: {
    [updateFirebaseUserSettings.fulfilled]: (state, action) => action.payload,
    [updateFirebaseUserShortcuts.fulfilled]: (state, action) => action.payload,
    [setFirebaseUser.fulfilled]: (state, action) => action.payload,
  },
});

export const { userLoggedOut } = firebaseUserSlice.actions;

export const selectFirebaseUser = ({ firebaseUser }) => {
  return firebaseUser;
};

export const selectFirebaseUserShortcuts = ({ firebaseUser }) => firebaseUser.data.shortcuts;

export default firebaseUserSlice.reducer;
