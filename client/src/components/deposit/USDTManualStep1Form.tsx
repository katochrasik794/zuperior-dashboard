"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { store } from "@/store";
import { MT5Account } from "@/store/slices/mt5AccountSlice";

interface USDTManualStep1FormProps {
  amount: string;
  setAmount: (amount: string) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
  transactionId: string;
  setTransactionId: (id: string) => void;
  proofFile: File | null;
  setProofFile: (file: File | null) => void;
  accounts: MT5Account[];
  lifetimeDeposit: number;
  nextStep: () => void;
}

export function USDTManualStep1Form({
  amount,
  setAmount,
  selectedAccount,
  setSelectedAccount,
  transactionId,
  setTransactionId,
  proofFile,
  setProofFile,
  accounts,
  lifetimeDeposit,
  nextStep,
}: USDTManualStep1FormProps) {
  const [step, setStep] = useState<"unverified" | "partial" | "verified" | "">(
    ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const status = store.getState().kyc.verificationStatus;
    if (
      status === "unverified" ||
      status === "partial" ||
      status === "verified"
    ) {
      setStep(status);
    }
  }, []);

  useEffect(() => {
    if (accounts.length === 0) {
      toast.error("No accounts found", {
        description: "Please check if you have any active trading accounts.",
      });
    }
  }, [accounts.length]);

  // Helper function to extract account type from group name
  const getAccountTypeFromGroup = (group: string): string => {
    if (group.includes('Pro')) return 'Pro';
    if (group.includes('Standard')) return 'Standard';
    return 'Standard'; // Default fallback
  };

  const selectedAccountObj = accounts.find(
    (account) => account.accountId === selectedAccount
  );

  const handleAccountChange = (value: string) => {
    setSelectedAccount(value);
  };

  const validateAmount = () => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    if (amountNum < 10) {
      toast.error("Minimum deposit amount is $10");
      return false;
    }

    const totalAfterDeposit = lifetimeDeposit + amountNum;

    if (step === "unverified" && totalAfterDeposit > 5000) {
      toast.error("Deposit limit is $5,000 for Unverified accounts");
      return false;
    }
    if (step === "partial" && totalAfterDeposit > 10000) {
      toast.error("Deposit limit is $10,000 for Partially Verified accounts");
      return false;
    }

    return true;
  };

  const handleAmountChange = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(value);
    toast.dismiss();

    const amountNum = parseFloat(value);
    if (isNaN(amountNum)) return;
    const totalAfterDeposit = lifetimeDeposit + amountNum;

    if (amountNum < 10) {
      toast.error("Minimum deposit amount is $10");
      return;
    }
    if (step === "unverified" && totalAfterDeposit > 5000) {
      toast.error("Deposit limit is $5,000 for Unverified accounts");
      return;
    }
    if (step === "partial" && totalAfterDeposit > 10000) {
      toast.error("Deposit limit is $10,000 for Partially Verified accounts");
      return;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images and PDFs)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload only images (JPEG, PNG) or PDF files"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "File size must be less than 5MB"
        });
        return;
      }
      
      setProofFile(file);
      toast.success("File uploaded successfully");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setProofFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info("File removed");
  };

  const handleContinue = () => {
    if (!selectedAccount) {
      toast.error("Account selection required", {
        description: "Please select an account to continue.",
      });
      return;
    }
    if (!amount) {
      toast.error("Amount required", {
        description: "Please enter an amount to continue.",
      });
      return;
    }
    if (!validateAmount()) return;

    toast.success("Details verified", {
      description: "Proceeding to the next step.",
    });
    nextStep();
  };

  const getLimitMessage = () => {
    if (step === "verified") {
      return "No deposit limits (Unlimited account)";
    } else if (step === "partial") {
      return "Maximum deposit limit: $10,000";
    } else if (step === "unverified") {
      return "Maximum deposit limit: $5,000";
    }
    return "";
  };

  return (
    <div className="w-full px-6 py-4">
      <div className="-mt-4 w-full">
        <div className="rounded-lg">
          <div className="mt-4">
            <Label className="text-sm dark:text-white/75 text-black mb-1">Account</Label>
            <Select
              onValueChange={handleAccountChange}
              value={selectedAccount}
              disabled={accounts.length === 0}
            >
              <SelectTrigger className="border-[#362e36] p-5 flex items-center w-full text-white focus:ring-[#8046c9]">
                <SelectValue placeholder="Select Account">
                  {selectedAccountObj ? (
                    <span className="flex items-center">
                      <span className="bg-[#9F8ACF]/30 px-2 py-[2px] rounded-[5px] font-semibold text-black dark:text-white/75 tracking-tighter text-[10px]">
                        MT5
                      </span>
                      <span className="ml-2 dark:text-white/75 text-black">
                        {selectedAccountObj.accountId} ({getAccountTypeFromGroup(selectedAccountObj.group || '')})
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ${parseFloat((selectedAccountObj.balance || 0).toString()).toFixed(2)}
                      </span>
                    </span>
                  ) : (
                    "Select Account"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border-[#1e171e] dark:bg-[#060207]">
                {accounts
                  .filter((account) => account.isEnabled)
                  .map((account) => (
                    <SelectItem
                      key={account.accountId}
                      value={account.accountId}
                    >
                      <span className="bg-[#9F8ACF]/30 px-2 py-[2px] rounded-[5px] font-semibold text-black dark:text-white/75 tracking-tighter text-[10px]">
                        MT5
                      </span>
                      <span>
                        {account.accountId} ({getAccountTypeFromGroup(account.group || '')})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ${parseFloat((account.balance || 0).toString()).toFixed(2)}
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transaction ID Field */}
      <div className="mt-4 w-full">
        <div className="rounded-lg">
          <div className="mt-4">
            <Label className="text-sm dark:text-white/75 text-black mb-1">Transaction ID</Label>
            <Input
              placeholder="Enter transaction hash if available"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="dark:text-white/75 text-black border-[#362e36] p-5 focus-visible:ring-blue-600 w-full"
            />
          </div>
        </div>
      </div>

      {/* Amount Field */}
      <div className="mt-4">
        <div className="relative w-full">
          <div className="space-y-2 w-full">
            <Label className="text-sm dark:text-white/75 text-black">Amount</Label>
            <div className="relative w-full">
              <Input
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount"
                className="dark:text-white/75 text-black pr-12 border-[#362e36] p-5 focus-visible:ring-blue-600 w-full"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-white/75 text-black text-sm">
                USDT
              </span>
            </div>
            {step && (
              <p className="text-xs mt-2 text-[#945393]">{getLimitMessage()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Proof Upload */}
      <div className="mt-4 w-full">
        <div className="rounded-lg">
          <div className="mt-4">
            <Label className="text-sm dark:text-white/75 text-black mb-1">Payment Proof</Label>
            <div className="space-y-3">
              {!proofFile ? (
                <div
                  className="border-2 border-dashed border-[#362e36] dark:border-[#362e36] rounded-lg p-6 text-center cursor-pointer hover:border-[#8046c9] transition-colors"
                  onClick={handleFileUpload}
                >
                  <Upload className="mx-auto h-8 w-8 text-[#945393] mb-2" />
                  <p className="text-sm dark:text-white/75 text-black">
                    Click to upload payment proof
                  </p>
                  <p className="text-xs text-[#945393] mt-1">
                    Images (JPEG, PNG) or PDF files up to 5MB
                  </p>
                </div>
              ) : (
                <div className="border border-[#362e36] dark:border-[#362e36] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-[#8046c9]" />
                    <div>
                      <p className="text-sm font-medium dark:text-white/75 text-black">{proofFile.name}</p>
                      <p className="text-xs text-[#945393]">
                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700 border-red-300"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button - Below Payment Proof */}
      <div className="mt-4">
        <Button
          className="flex-1 cursor-pointer bg-gradient-to-r from-[#6242a5] to-[#9f8bcf] text-white hover:bg-[#9d6ad9] w-full mt-3"
          onClick={handleContinue}
          disabled={accounts.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
