// client/src/store/slices/mt5AccountSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { mt5Service } from "@/services/api.service";

// --------------------
// Type Definitions
// --------------------
export interface MT5Account {
  accountId: string;
  name: string;
  group: string;
  leverage: number;
  balance: number;
  equity: number;
  credit: number;
  margin: number;
  marginFree: number;
  marginLevel: number;
  profit: number;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MT5Group {
  Group: string;
  Server: number;
  Company: string;
  Currency: string;
  CurrencyDigits: number;
  MarginCall: number;
  MarginStopOut: number;
  DemoLeverage: number;
}

export interface MT5State {
  accounts: MT5Account[];
  groups: MT5Group[];
  selectedAccount: MT5Account | null;
  totalBalance: number;
  isLoading: boolean;
  error: string | null;
}

// --------------------
// Async Thunks
// --------------------

// ✅ Get Groups
export const fetchMt5Groups = createAsyncThunk(
   "mt5/fetchGroups",
   async (_, { rejectWithValue }) => {
     try {
       const response = await mt5Service.getMt5Groups();
       return response.data;
     } catch (error: any) {
       return rejectWithValue(
         error.response?.data?.message || "Failed to fetch MT5 groups"
       );
     }
   }
);

// ✅ Get User MT5 Accounts
export const fetchUserMt5Accounts = createAsyncThunk(
   "mt5/fetchUserAccounts",
   async (_, { rejectWithValue }) => {
     try {
       const response = await mt5Service.getUserMt5Accounts();
       return response.data.accounts || [];
     } catch (error: any) {
       if (error.response?.status === 401) {
         console.log("User not authenticated, returning empty accounts");
         return [];
       }
       return rejectWithValue(
         error.response?.data?.message || "Failed to fetch MT5 accounts"
       );
     }
   }
);

// ✅ Create MT5 Account
export const createMt5Account = createAsyncThunk(
  "mt5/createAccount",
  async (
    data: {
      name: string;
      group: string;
      leverage?: number;
      masterPassword: string;
      investorPassword: string;
      email?: string;
      country?: string;
      city?: string;
      phone?: string;
      comment?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await mt5Service.createMt5Account(data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401)
        return rejectWithValue("Authentication required. Please log in first.");
      return rejectWithValue(
        error.response?.data?.message || "Failed to create MT5 account"
      );
    }
  }
);

// ✅ Deposit Funds
export const depositToMt5Account = createAsyncThunk(
  "mt5/deposit",
  async (
    data: { login: number; balance: number; comment?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await mt5Service.depositToMt5(data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401)
        return rejectWithValue("Authentication required. Please log in first.");
      return rejectWithValue(
        error.response?.data?.message || "Failed to deposit funds"
      );
    }
  }
);

// ✅ Withdraw Funds
export const withdrawFromMt5Account = createAsyncThunk(
  "mt5/withdraw",
  async (
    data: { login: number; balance: number; comment?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await mt5Service.withdrawFromMt5(data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401)
        return rejectWithValue("Authentication required. Please log in first.");
      return rejectWithValue(
        error.response?.data?.message || "Failed to withdraw funds"
      );
    }
  }
);

// ✅ Get Client Profile
export const refreshMt5AccountProfile = createAsyncThunk(
  "mt5/refreshProfile",
  async (login: number, { rejectWithValue }) => {
    try {
      const response = await mt5Service.getMt5UserProfile(login);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401)
        return rejectWithValue("Authentication required. Please log in first.");
      return rejectWithValue(
        error.response?.data?.message || "Failed to refresh MT5 profile"
      );
    }
  }
);

// --------------------
// Initial State
// --------------------
const initialState: MT5State = {
  accounts: [],
  groups: [],
  selectedAccount: null,
  totalBalance: 0,
  isLoading: false,
  error: null,
};

// --------------------
// Slice Definition
// --------------------
const mt5AccountSlice = createSlice({
  name: "mt5",
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<MT5Account | null>) => {
      state.selectedAccount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAccountBalance: (
      state,
      action: PayloadAction<{ login: number; balance: number; equity: number }>
    ) => {
      const account = state.accounts.find(
        (acc) => acc.accountId === String(action.payload.login)
      );
      if (account) {
        account.balance = action.payload.balance;
        account.equity = action.payload.equity;
        state.totalBalance = state.accounts.reduce(
          (sum, acc) => sum + acc.balance,
          0
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchMt5Groups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMt5Groups.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ Only include supported groups
        state.groups = action.payload.filter((g: MT5Group) =>
          [
            "real\\Bbook\\Pro\\dynamic-2000x-10P",
            "real\\Bbook\\Standard\\dynamic-2000x-20Pips",
          ].includes(g.Group)
        );
      })
      .addCase(fetchMt5Groups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Account
      .addCase(createMt5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMt5Account.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createMt5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Deposit Funds
      .addCase(depositToMt5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(depositToMt5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        const { login, newBalance, newEquity } = action.payload?.data || {};
        const account = state.accounts.find(
          (acc) => acc.accountId === String(login)
        );
        if (account) {
          account.balance = newBalance;
          account.equity = newEquity;
          state.totalBalance = state.accounts.reduce(
            (sum, acc) => sum + acc.balance,
            0
          );
        }
      })
      .addCase(depositToMt5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Withdraw Funds
      .addCase(withdrawFromMt5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawFromMt5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        const { login, newBalance, newEquity } = action.payload?.data || {};
        const account = state.accounts.find(
          (acc) => acc.accountId === String(login)
        );
        if (account) {
          account.balance = newBalance;
          account.equity = newEquity;
          state.totalBalance = state.accounts.reduce(
            (sum, acc) => sum + acc.balance,
            0
          );
        }
      })
      .addCase(withdrawFromMt5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh Profile
      .addCase(refreshMt5AccountProfile.fulfilled, (state, action) => {
        const data = action.payload?.data;
        if (!data) return;
        const account = state.accounts.find(
          (acc) => acc.accountId === String(data.login)
        );
        if (account) {
          Object.assign(account, data);
          state.totalBalance = state.accounts.reduce(
            (sum, acc) => sum + acc.balance,
            0
          );
        }
      })
      .addCase(refreshMt5AccountProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// --------------------
// Exports
// --------------------
export const { setSelectedAccount, clearError, updateAccountBalance } =
  mt5AccountSlice.actions;
export default mt5AccountSlice.reducer;
