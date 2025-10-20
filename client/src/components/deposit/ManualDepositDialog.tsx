"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { store } from "../../store";
import { fetchUserMt5Accounts } from "../../store/slices/mt5AccountSlice";
import { NewAccountDialogProps } from "./types";
import { USDTManualStep1Form } from "./USDTManualStep1Form";
import { USDTManualStep3Form } from "./USDTManualStep3Form";

export function ManualDepositDialog({
  open,
  onOpenChange,
  selectedCrypto,
  lifetimeDeposit,
}: NewAccountDialogProps & { lifetimeDeposit: number }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [depositRequestId, setDepositRequestId] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();
  const mt5Accounts = useSelector((state: RootState) => state.mt5.accounts);
  const filteredAccounts = mt5Accounts.filter(
    (account) => account.isEnabled
  );

  const resetAllStates = useCallback(() => {
    setStep(1);
    setAmount("");
    setIsProcessing(false);
    setError(null);
    setSelectedAccount("");
    setTransactionId("");
    setProofFile(null);
    setDepositRequestId("");
  }, []);

  useEffect(() => {
    if (!open) {
      resetAllStates();
      return;
    }
  }, [open, resetAllStates]);

  // Fetch MT5 accounts when dialog opens
  useEffect(() => {
    if (open && mt5Accounts.length === 0) {
      console.log('🔄 ManualDepositDialog: Fetching MT5 accounts...');
      dispatch(fetchUserMt5Accounts());
    }
  }, [open, dispatch, mt5Accounts.length]);

  const handleStep1Continue = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create manual deposit request
      const formData = new FormData();
      formData.append('mt5AccountId', selectedAccount);
      formData.append('amount', amount);
      if (transactionId) {
        formData.append('transactionHash', transactionId);
      }
      if (proofFile) {
        formData.append('proofFile', proofFile);
      }

      // Get token from Redux state
      const state = store.getState();
      const token = state.auth.token || localStorage.getItem('userToken');

      if (!token) {
        setError('No authentication token found. Please log in first.');
        setIsProcessing(false);
        return;
      }

      console.log('🔑 Using token for manual deposit:', token.substring(0, 20) + '...');

      const response = await fetch('/api/manual-deposit/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('📡 Server response:', result);

      if (result.success) {
        setDepositRequestId(result.data.id);
        setStep(2);
        console.log('✅ Manual deposit request created:', result.data.id);
      } else {
        setError(result.message || 'Failed to create deposit request');
        console.error('❌ Server error:', result.message);
      }
    } catch (error) {
      console.error('Error creating manual deposit:', error);
      setError('Failed to create deposit request');
    } finally {
      setIsProcessing(false);
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <USDTManualStep1Form
            amount={amount}
            setAmount={setAmount}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
            proofFile={proofFile}
            setProofFile={setProofFile}
            accounts={filteredAccounts}
            lifetimeDeposit={lifetimeDeposit}
            nextStep={handleStep1Continue}
          />
        );
      case 2:
        return (
          <USDTManualStep3Form
            amount={amount}
            selectedAccount={selectedAccount}
            depositRequestId={depositRequestId}
            onClose={() => onOpenChange(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90%] sm:max-w-lg gap-4 bg-background shadow-lg border-2 border-transparent p-6 text-white rounded-[18px] flex flex-col items-center w-full [background:linear-gradient(#fff,#fff)_padding-box,conic-gradient(from_var(--border-angle),#ddd,#f6e6fc,theme(colors.purple.400/48%))_border-box] dark:[background:linear-gradient(#070206,#030103)_padding-box,conic-gradient(from_var(--border-angle),#030103,#030103,theme(colors.purple.400/48%))_border-box] animate-border">
        {/* Step indicator */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 w-full mx-10">
              <div className={`flex h-8 w-8 px-4 mx-0 items-center justify-center rounded-full ${
                step >= 1 ? "bg-[#9F8BCF]" : "bg-[#594B7A]"
              }`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className={`h-[4px] w-full mx-0 ${
                step >= 2 ? "bg-[#6B5993]" : "bg-[#392F4F]"
              }`}></div>
              <div className={`flex h-8 w-8 px-4 mx-0 items-center justify-center rounded-full ${
                step >= 2 ? "bg-[#9F8BCF]" : "bg-[#594B7A]"
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
          </div>
        </div>

        <VisuallyHidden>
          <DialogTitle>Deposit Funds</DialogTitle>
        </VisuallyHidden>

        <div className="w-full px-6">
          <h2 className="text-2xl text-center font-bold dark:text-white/75 text-black">
            Pay USDT Manual
          </h2>
          {renderStepContent()}
        </div>

        {/* Close button */}
        <button
          type="button"
          className="absolute cursor-pointer right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={() => onOpenChange(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4 dark:text-white/75 text-black" aria-hidden="true">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
