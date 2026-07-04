import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from './slices/workspaceSlice';
import userReducer from './slices/userSlice';
import campaignsReducer from './slices/campaignsSlice';
import contactsReducer from './slices/contactsSlice';
import domainsReducer from './slices/domainsSlice';
import segmentsReducer from './slices/segmentsSlice';
import workflowsReducer from './slices/workflowsSlice';
import transactionalReducer from './slices/transactionalSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      workspace: workspaceReducer,
      user: userReducer,
      campaigns: campaignsReducer,
      contacts: contactsReducer,
      domains: domainsReducer,
      segments: segmentsReducer,
      workflows: workflowsReducer,
      transactional: transactionalReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
