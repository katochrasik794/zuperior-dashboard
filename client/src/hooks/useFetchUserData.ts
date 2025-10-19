import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchUserMt5Accounts } from "@/store/slices/mt5AccountSlice";

export function useFetchUserData() {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, totalBalance, isLoading, error } = useSelector((state: RootState) => state.mt5);
  const hasData = accounts.length > 0;

  const fetchAllData = useCallback(async () => {
    try {
      await dispatch(fetchUserMt5Accounts()).unwrap();
    } catch (err) {
      console.error("Data fetch failed", err);
      throw err;
    }
  }, [dispatch]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    fetchAllData,
    balance: totalBalance,
    isLoading,
    hasData,
    error,
    accounts
  };
}
