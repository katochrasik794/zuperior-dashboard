"use client";

import VerificationAlert from "../verification-alert";
import { useState, useMemo, useEffect, useRef } from "react";
import { TextAnimate } from "@/components/ui/text-animate";

// Components
import { BalanceSection } from "./balance-section";
import { AccountsSection } from "./accounts-section";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { NewAccountDialog } from "./new-account";
import { store } from "@/store";
import { useFetchUserData } from "@/hooks/useFetchUserData";

export function DashboardContent() {
  const name = store.getState().user.data?.accountname;
  const [newAccountDialogOpen, setNewAccountDialogOpen] = useState(false);
  const verificationStatus = store.getState().kyc.verificationStatus;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { fetchAllData, balance: totalBalance, isLoading, hasData } = useFetchUserData();

  //auto refetch every 2 mins
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    fetchAllData();

    intervalRef.current = setInterval(() => {
      fetchAllData();
    }, 120000); // 2 min

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAllData]);

  // Memoized wallet balance calculation
  const walletBalance = useMemo(
    () => (totalBalance > 0 ? `$${totalBalance.toFixed(2)}` : "$0.00"),
    [totalBalance]
  );

  // Handle new account dialog close with data refresh
  const handleNewAccountDialogClose = (open: boolean) => {
    setNewAccountDialogOpen(open);
  };

  // Show skeleton when loading
  if (isLoading && !hasData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-[25px]">
      <TextAnimate className="text-2xl font-bold text-black/85 dark:text-white/85 tracking-tighter px-2 md:px-0">
        {`Welcome, ${name || "User"}`}
      </TextAnimate>

      <VerificationAlert
        name={name || "User"}
        verificationStatus={verificationStatus}
      />
      <BalanceSection balance={walletBalance} />
      <AccountsSection onOpenNewAccount={() => setNewAccountDialogOpen(true)} />
      <NewAccountDialog
        open={newAccountDialogOpen}
        onOpenChange={handleNewAccountDialogClose}
      />
    </div>
  );
}
