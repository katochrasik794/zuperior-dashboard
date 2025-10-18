import {
  configureStore,
  combineReducers,
  Reducer,
  AnyAction,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import transactionsReducer from "./slices/transactionsSlice";
import userReducer from "./slices/getUserSlice";
import accountsReducer from "./slices/accountsSlice";
import kycReducer from "./slices/kycSlice";

// Step 1: Combine reducers
const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  accounts: accountsReducer,
  transactions: transactionsReducer,
  kyc: kycReducer,
});

// Step 2: Custom root reducer with logout reset
const rootReducer: Reducer<ReturnType<typeof appReducer>, AnyAction> = (
  state,
  action
) => {
  if (action.type === "auth/logout") {
    // Clear persisted storage on logout
    if (typeof window !== "undefined") {
    }

    // Reset specific slices
    return appReducer(
      {
        ...state,
        auth: authReducer(undefined, action),
        user: userReducer(undefined, action),
        accounts: accountsReducer(undefined, action),
        transactions: transactionsReducer(undefined, action),
        kyc: kycReducer(undefined, action),
      },
      action
    );
  }

  return appReducer(state, action);
};

// Step 3: Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user", "accounts", "transactions", "kyc"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Step 4: Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/FLUSH",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Step 5: Export types and persistor
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
