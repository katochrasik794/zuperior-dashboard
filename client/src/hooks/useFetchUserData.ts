import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/store";
import { fetchAccessToken } from "@/store/slices/accessCodeSlice";
import { getUser } from "@/store/slices/getUserSlice";

export function useFetchUserData() {
  const dispatch = useDispatch<AppDispatch>();
  const email = useSelector((state: RootState) => state.auth.clientId);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const hasData = store.getState().accounts.data?.length !== 0;

  const fetchAllData = useCallback(async () => {
    if (!email) return;

    try {
      setIsLoading(true);
      const freshToken = await dispatch(fetchAccessToken()).unwrap();
      await dispatch(getUser({ email, access_token: freshToken })).unwrap();
      setBalance(store.getState().accounts.balance);
    } catch (err) {
      console.error("Data fetch failed", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, email]);

  return { fetchAllData, balance, isLoading, hasData };
}
