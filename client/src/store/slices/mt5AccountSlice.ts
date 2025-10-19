// client/src/store/slices/mt5AccountSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mt5Service } from '@/services/api.service';

// Types
export interface MT5Account {
  id: string;
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
  createdAt: string;
  updatedAt: string;
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

// Async thunks
export const fetchMt5Groups = createAsyncThunk(
   'mt5/fetchGroups',
   async (_, { rejectWithValue }) => {
     try {
       const response = await mt5Service.getMt5Groups();
       return response.data;
     } catch (error: any) {
       return rejectWithValue(error.response?.data?.message || 'Failed to fetch MT5 groups');
     }
   }
);

export const fetchUserMt5Accounts = createAsyncThunk(
   'mt5/fetchUserAccounts',
   async (_, { rejectWithValue }) => {
     try {
       const response = await mt5Service.getUserMt5Accounts();
       return response.data.accounts;
     } catch (error: any) {
       // Handle authentication errors gracefully
       if (error.response?.status === 401) {
         console.log('User not authenticated, returning empty accounts');
         return [];
       }
       return rejectWithValue(error.response?.data?.message || 'Failed to fetch MT5 accounts');
     }
   }
);


export const createMt5Account = createAsyncThunk(
  'mt5/createAccount',
  async (accountData: {
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
  }, { rejectWithValue }) => {
    try {
      const response = await mt5Service.createMt5Account(accountData);
      return response.data;
    } catch (error: any) {
      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please log in first.');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to create MT5 account');
    }
  }
);

export const depositToMt5Account = createAsyncThunk(
  'mt5/deposit',
  async (data: { login: number; balance: number; comment?: string }, { rejectWithValue }) => {
    try {
      const response = await mt5Service.depositToMt5(data);
      return response.data;
    } catch (error: any) {
      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please log in first.');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to deposit to MT5 account');
    }
  }
);

export const withdrawFromMt5Account = createAsyncThunk(
  'mt5/withdraw',
  async (data: { login: number; balance: number; comment?: string }, { rejectWithValue }) => {
    try {
      const response = await mt5Service.withdrawFromMt5(data);
      return response.data;
    } catch (error: any) {
      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please log in first.');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw from MT5 account');
    }
  }
);

export const refreshMt5AccountProfile = createAsyncThunk(
  'mt5/refreshProfile',
  async (login: number, { rejectWithValue }) => {
    try {
      const response = await mt5Service.getMt5UserProfile(login);
      return response.data;
    } catch (error: any) {
      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please log in first.');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh MT5 profile');
    }
  }
);

// Initial state
const initialState: MT5State = {
  accounts: [],
  groups: [],
  selectedAccount: null,
  totalBalance: 0,
  isLoading: false,
  error: null,
};

// Slice
const mt5AccountSlice = createSlice({
  name: 'mt5',
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<MT5Account | null>) => {
      state.selectedAccount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAccountBalance: (state, action: PayloadAction<{ login: number; balance: number; equity: number }>) => {
      const account = state.accounts.find(acc => acc.accountId === action.payload.login.toString());
      if (account) {
        account.balance = action.payload.balance;
        account.equity = action.payload.equity;
        // Recalculate total balance
        state.totalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchMt5Groups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMt5Groups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchMt5Groups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch user accounts
      .addCase(fetchUserMt5Accounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserMt5Accounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
        state.totalBalance = action.payload.reduce((sum: number, acc: MT5Account) => sum + acc.balance, 0);
      })
      .addCase(fetchUserMt5Accounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })


      // Create account
      .addCase(createMt5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMt5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        // Refresh accounts list after creation
        // The accounts will be refetched by the component
      })
      .addCase(createMt5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Deposit
      .addCase(depositToMt5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(depositToMt5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update balance in the specific account
        const account = state.accounts.find(acc => acc.accountId === action.payload.data.login.toString());
        if (account) {
          account.balance = action.payload.data.newBalance;
          account.equity = action.payload.data.newEquity;
          state.totalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        }
      })
      .addCase(depositToMt5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Withdraw
      .addCase(withdrawFromMt5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawFromMt5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update balance in the specific account
        const account = state.accounts.find(acc => acc.accountId === action.payload.data.login.toString());
        if (account) {
          account.balance = action.payload.data.newBalance;
          account.equity = action.payload.data.newEquity;
          state.totalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        }
      })
      .addCase(withdrawFromMt5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh profile
      .addCase(refreshMt5AccountProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshMt5AccountProfile.fulfilled, (state, action) => {
        // Update account data with fresh profile information
        const account = state.accounts.find(acc => acc.accountId === action.payload.data.login.toString());
        if (account) {
          Object.assign(account, action.payload.data);
          state.totalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        }
      })
      .addCase(refreshMt5AccountProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAccount, clearError, updateAccountBalance } = mt5AccountSlice.actions;
export default mt5AccountSlice.reducer;