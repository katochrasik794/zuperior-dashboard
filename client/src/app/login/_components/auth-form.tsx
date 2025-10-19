// zuperior-dashboard/client/src/app/login/_components/auth-form.tsx (New File)

"use client";
import { useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { authService } from "@/services/api.service";
import { registerUser } from "@/store/slices/registerSlice";
import { fetchAccessToken } from "@/store/slices/accessCodeSlice";
import { useRouter } from "next/navigation";
import { registrationStep1Schema, loginSchema } from "./auth-schemas";
import { ZodError } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import AuthToggleTabs from "./AuthToggleTabs";
import RegisterStep1Form from "./RegisterStep1Form";
import LoginForm from "./LoginForm";
import SubmitButton from "./SubmitButton";
import { forgetPassword } from "@/services/forgetPassword";

const AuthForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.auth);
  const { loading: globalLoading, setLoading: setGlobalLoading } = useLoading();

  // State
  const [isCreateAccount, setIsCreateAccount] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const [registerBuffer, setRegisterBuffer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    country: "in",
    country_code: "",
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Clear validation errors
  const clearValidationErrors = () => setValidationErrors({});

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Unified registration and login logic
  const handleRegister = async () => {
    try {
      setGlobalLoading(true);
      const freshToken = await dispatch(fetchAccessToken()).unwrap();
      if (!freshToken) return;
      const result = await dispatch(
        registerUser({
          access_token: freshToken,
          first_name: registerBuffer.firstName.trim(),
          last_name: registerBuffer.lastName.trim(),
          email: registerBuffer.email.trim().toLowerCase(),
          phone: registerBuffer.phone.trim(),
          password: registerBuffer.password,
          country: registerBuffer.country.trim(),
          country_code: registerBuffer.country_code.trim(),
          ip: "160.202.38.44",
          platform_name: "MT5",
        })
      ).unwrap();
      if (result.status_code === "1") {
        toast.success("Account created! Welcome aboard.");
        router.push("/");
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.log(
        (error as Error).message || "An error occurred during registration."
      );
    } finally {
      setGlobalLoading(false);
    }
  };

  // Validate registration step 1
  const validateStep1 = () => {
    try {
      registrationStep1Schema.parse(registerBuffer);
      clearValidationErrors();
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: { [key: string]: string } = {};
        (error as ZodError).errors.forEach(
          (err: { path: (string | number)[]; message: string }) => {
            if (err.path.length) errors[err.path[0] as string] = err.message;
          }
        );
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Validate login inputs
  const validateLogin = () => {
    try {
      loginSchema.parse({ email: loginEmail.trim(), password: loginPassword });
      clearValidationErrors();
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: { [key: string]: string } = {};
        (error as ZodError).errors.forEach(
          (err: { path: (string | number)[]; message: string }) => {
            if (err.path.length) errors[err.path[0] as string] = err.message;
          }
        );
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Helper delay for smooth loading
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (forgotMode) {
      setGlobalLoading(true);
      const freshToken = await dispatch(fetchAccessToken()).unwrap();
      if (!freshToken) return;
      const response = await forgetPassword({
        email: loginEmail,
        accessToken: freshToken,
      });
      if (response.status_code === "1") {
        toast.success("Password reset link sent! Check your email.");
        setForgotMode(false);
      } else {
        toast.error(
          response.error || "Failed to send reset link. Please try again."
        );
      }
      setGlobalLoading(false);
      return;
    }
    if (isCreateAccount) {
      if (validateStep1()) {
        // Directly register and login
        await handleRegister();
      }
    } else {
      if (validateLogin()) {
        const freshToken = await dispatch(fetchAccessToken()).unwrap();
        if (!freshToken) return;
        await login(freshToken, loginEmail, loginPassword);
      }
    }
  };

  const login = async (
    freshToken: string,
    email: string,
    password: string,
    toastMsg = "Welcome back! You've successfully logged in."
  ) => {
    const startTime = Date.now();
    const result = await dispatch(
      loginUser({
        email,
        password,
        accessToken: freshToken,
      })
    );
    if (loginUser.fulfilled.match(result)) {
      toast.success(toastMsg);
      setGlobalLoading(true);
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) await delay(1000 - elapsed);
      router.push("/");
    } else {
      toast.error(
        "Oops! We couldn't log you in. Double-check your email and password."
      );
    }
  };

  // Reset form helper
  /* const resetForm = () => {
    setRegisterBuffer({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      country: "",
      country_code: "",
    });
    setValidationErrors({});
  }; */

  return (
    <div className="w-full max-w-md px-6 py-8 h-auto flex flex-col justify-center">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-400">
        Let&apos;s become a Zuperior...
      </h2>
      <AuthToggleTabs
        isCreateAccount={isCreateAccount}
        setIsCreateAccount={(val) => {
          setIsCreateAccount(val);
          setForgotMode(false);
          setStep(1);
          clearValidationErrors();
        }}
        setStep={setStep}
        clearValidationErrors={clearValidationErrors}
      />

      <AnimatePresence mode="wait">
        <motion.form
          key={`${isCreateAccount}-${step}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {isCreateAccount ? (
            <RegisterStep1Form
              registerBuffer={registerBuffer}
              setRegisterBuffer={setRegisterBuffer}
              validationErrors={validationErrors}
              clearFieldError={clearFieldError}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
            />
          ) : (
            <>
              {step === 1 && (
                <LoginForm
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  validationErrors={validationErrors}
                  clearFieldError={clearFieldError}
                  passwordVisible={passwordVisible}
                  setPasswordVisible={setPasswordVisible}
                  forgotMode={forgotMode}
                  setForgotMode={setForgotMode}
                />
              )}
            </>
          )}
          <SubmitButton
            globalLoading={globalLoading}
            loading={loading}
            isCreateAccount={isCreateAccount}
            step={step}
            isForgotPassword={forgotMode}
          />
        </motion.form>
      </AnimatePresence>
    </div>
  );
};

export default AuthForm;