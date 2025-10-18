"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "../../ui/dialog";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchAccessToken } from "@/store/slices/accessCodeSlice";
import { useAppDispatch } from "@/store/hooks";
import { createAdditionalLiveAccount } from "@/store/slices/liveAccountSlice";
import { createAdditionalDemoAccount } from "@/store/slices/demoAccountSlice";
import { toast } from "sonner";
import { StepChooseAccountType } from "./StepChooseAccountType";
import { StepPrepareAccount } from "./StepPrepareAccount";
import { StepAccountCreated } from "./StepAccountCreated";
import { useFetchUserData } from "@/hooks/useFetchUserData";

interface NewAccountResponse {
  status: string;
  status_code: string;
  message: string;
  _token: string;
  object: {
    crm_account_id: number;
    crm_tp_account_id: number;
    tp_id: string;
    tp_creation_error: string;
  };
}

export function NewAccountDialog({
  open,
  onOpenChange,
}: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("Live");
  const [accountPlan, setAccountPlan] = useState("");
  // const [server, setServer] = useState("");
  const [leverage, setLeverage] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [errors, setErrors] = useState<{
    accountName?: string;
    password?: string;
    leverage?: string;
    currency?: string;
  }>({});
  const [loadingStep2, setLoadingStep2] = useState(false);
  // const [platform, setPlatform] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftValue, setScrollLeftValue] = useState(0);
  const crmAccountId = useSelector(
    (state: RootState) => state.user.data?.crm_account_id
  );

  const [latestAccount, setLatestAccount] = useState<NewAccountResponse | null>(
    null
  );

  const { fetchAllData } = useFetchUserData();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftValue(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeftValue - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeftValue - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  const handleScrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -250, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 250, behavior: "smooth" });
  };

  const resetStates = () => {
    setStep(1);
    setAccountPlan("");
    setAccountType("Live");
    setLeverage("");
    setCurrency("USD");
    setAccountName("");
    setPassword("");
    setPasswordVisible(false);
    setErrors({});
    setLoadingStep2(false);
    setLatestAccount(null);
  };

  const arrowMaskStyle = {
    WebkitMaskImage:
      "linear-gradient(100deg, rgba(255, 255, 255, 0.75) 10%, rgba(255, 255, 255, 0.25) 100%)",
    maskImage:
      "linear-gradient(100deg, rgba(255, 255, 255, 0.75) 10%, rgba(255, 255, 255, 0.25) 100%)",
    borderRadius: "100px",
    opacity: 0.75,
    inset: 0,
    overflow: "visible",
    position: "absolute",
    zIndex: 0,
  };

  const validateStep2 = () => {
    const newErrors: typeof errors = {};
    // Account Name validation
    if (!accountName.trim()) {
      newErrors.accountName = "Account name is required.";
    } else if (accountName.length < 3) {
      newErrors.accountName = "Account name must be at least 3 characters.";
    }
    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
      }
    }
    // Leverage required
    if (!leverage) {
      newErrors.leverage = "Leverage is required.";
    }
    // Currency required
    if (!currency) {
      newErrors.currency = "Currency is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    let res: NewAccountResponse | null = null;
    try {
      setLoadingStep2(true);
      const accessToken = await dispatch(fetchAccessToken()).unwrap();

      if (!crmAccountId) {
        console.error("crm_account_id is undefined or empty");
        return;
      }

      const payload = {
        platform_name: "MT5",
        access_token: accessToken,
        currency: currency.trim(),
        password: password.trim(),
        crm_account_id: crmAccountId,
        account_type_requested: accountPlan,
        nickname: accountName.trim(),
        leverage: leverage.trim(),       
      };

      if (accountType === "Live") {
        res = await dispatch(createAdditionalLiveAccount(payload)).unwrap();
      } else if (accountType === "Demo") {
        res = await dispatch(createAdditionalDemoAccount(payload)).unwrap();
      } else {
        console.error("Invalid account type");
        return;
      }

      console.log("Registration successful:", res);
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      await fetchAllData();
      toast.success("Your account has been created successfully!");
      setLoadingStep2(false);
      setLatestAccount(res);
      nextStep();
    }
  };


  const handleAccountChange = (value: string) => {
    setAccountType(value);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetStates();
    }
  }}>
      <DialogContent className="border-3 border-transparent py-10 px-[35px] md:px-[50px] text-white/75 rounded-lg flex flex-col items-center w-full [background:linear-gradient(#fff,#fff)_padding-box,conic-gradient(from_var(--border-angle),#ddd,#f6e6fc,theme(colors.purple.400/48%))_border-box] dark:[background:linear-gradient(#070206,#030103)_padding-box,conic-gradient(from_var(--border-angle),#030103,#030103,theme(colors.purple.400/48%))_border-box] animate-border">
        <DialogHeader className="w-full">
          <div className="flex items-center justify-between ">
            <div className="flex items-center h-[24] w-[400px]">
              <div
                className={`flex h-6 w-6 px-3 mx-0 items-center justify-center rounded-full ${
                  step >= 1 ? "bg-[#9F8BCF]" : "bg-[#594B7A]"
                }`}
              >
                <span className="text-sm font-medium">1</span>
              </div>
              <div
                className={`h-[4px] w-full mx-0 ${
                  step >= 2 ? "bg-[#6B5993]" : "bg-[#392F4F]"
                }`}
              ></div>
              <div
                className={`flex h-6 w-6 px-3 mx-0 items-center justify-center rounded-full ${
                  step >= 2 ? "bg-[#9F8BCF]" : "bg-[#594B7A]"
                }`}
              >
                <span className="text-sm font-medium ">2</span>
              </div>
              <div
                className={`h-[4px] w-full mx-0 ${
                  step >= 3 ? "bg-[#6B5993]" : "bg-[#392F4F]"
                }`}
              ></div>
              <div
                className={`flex h-6 w-6 px-3 items-center justify-center rounded-full ${
                  step >= 3 ? " bg-[#9F8BCF]" : "bg-[#594B7A]"
                }`}
              >
                <span className="text-sm font-medium">3</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {step === 1 && (
          <StepChooseAccountType
            accountPlan={accountPlan}
            setAccountPlan={setAccountPlan}
            nextStep={nextStep}
            scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            isDragging={isDragging}
            handleScrollLeft={handleScrollLeft}
            handleScrollRight={handleScrollRight}
            arrowMaskStyle={arrowMaskStyle as React.CSSProperties}
          />
        )}

        {step === 2 && (
          <StepPrepareAccount
            accountType={accountType}
            handleAccountChange={handleAccountChange}
            leverage={leverage}
            setLeverage={setLeverage}
            currency={currency}
            setCurrency={setCurrency}
            accountName={accountName}
            setAccountName={setAccountName}
            password={password}
            setPassword={setPassword}
            passwordVisible={passwordVisible}
            setPasswordVisible={setPasswordVisible}
            errors={errors}
            loadingStep2={loadingStep2}
            handleSubmit={async () => {
              setLoadingStep2(true);
              await handleSubmit();
              setLoadingStep2(false);
            }}
            prevStep={prevStep}
          />
        )}

        {step === 3 && (
          <StepAccountCreated
            latestAccount={latestAccount}
            password={password}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
