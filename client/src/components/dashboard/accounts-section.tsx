"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Tabs, TabsContent } from "../ui/tabs";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RootState } from "../../store";
import AccountDetails from "./account-details";

interface AccountsSectionProps {
  onOpenNewAccount: () => void;
}

export function AccountsSection({ onOpenNewAccount }: AccountsSectionProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  const accounts = useSelector((state: RootState) => state.accounts.data);

  const hasBasicAccountInfo = accounts && accounts.length > 0;

  const [activeTab, setActiveTab] = useState<"live" | "demo" | "archived">(
    "live"
  );

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(100deg, rgba(255, 255, 255, 0.75) 10%, rgba(255, 255, 255, 0.25) 100%)",
    maskImage:
      "linear-gradient(100deg, rgba(255, 255, 255, 0.75) 10%, rgba(255, 255, 255, 0.25) 100%)",
    borderRadius: "15px",
    opacity: 0.75,
    inset: 0,
    overflow: "visible",
    position: "absolute",
    zIndex: 0,
  };

  
  const cardMaskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(212deg,_rgb(49,27,71)_0%,_rgb(20,17,24)_100%)",
    maskImage:
      "linear-gradient(100deg, rgba(0, 0, 0, 0.1) 10%, rgba(0, 0, 0, 0.4) 100%)",
    borderRadius: "15px",
    opacity: 0.25,
    position: "absolute",
    padding: "1px",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: "none",
  };

  return (
    <div className="px-2.5 md:px-0">
      <div className="mb-2.5 flex items-end justify-between w-full">
        <AnimatePresence mode="wait">
          <motion.h2
            key={theme}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut" }}
            className="text-2xl font-bold text-black/85 dark:text-white/85 tracking-tighter px-2 md:px-0"
          >
            Accounts
          </motion.h2>
        </AnimatePresence>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={onOpenNewAccount}
              className="relative gap-1 cursor-pointer font-semibold text-white rounded-[15px] px-6 py-2.5 text-xs leading-6 h-11 
          [background:radial-gradient(ellipse_27%_80%_at_0%_0%,rgba(163,92,162,0.5),rgba(0,0,0,1))]
           hover:bg-transparent dark:[background:black]"
           
              // onMouseEnter={(e) =>
              //   (e.currentTarget.style.background = "rgba(163,92,162,0.5)")
              // }
              // onMouseLeave={(e) =>
              //   (e.currentTarget.style.background =
              //     "radial-gradient(ellipse 27% 80% at 0% 0%,rgba(163,92,162,0.5),rgba(0,0,0,1))")
              // }
            >
              <Plus className="w-3 h-3" /> Open New Account
              <div
                style={maskStyle}
                className="dark:border dark:border-white/50 pointer-events-none"
              />
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
            <Tabs
        defaultValue="live"
        value={activeTab}
        onValueChange={(value) => {
          if (value === "live" || value === "demo" || value === "archived") {
            setActiveTab(value);
          }
        }}
        className="mb-[16px] rounded-[15px] border border-dashed border-white/10 p-[15px] pt-2.5 dark:bg-transparent bg-white"
      >
        <div className="flex justify-center items-center">
          <ToggleGroup
            type="single"
            value={activeTab}
            onValueChange={(value) => {
              if (
                value === "live" ||
                value === "demo" ||
                value === "archived"
              ) {
                setActiveTab(value);
              }
            }}
            className="p-2 relative rounded-[10px]"
          >
           {theme === "dark" ? (
              <div style={cardMaskStyle} className="border border-white/45" />
            ) : (
              <div
                style={{
                  borderRadius: "15px",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 0,
                  pointerEvents: "none",
                }}
                className="border border-[#e7e7e7]"
              />
            )}
            <ToggleGroupItem value="live" className="z-10 cursor-pointer">
              Live
            </ToggleGroupItem>
            <ToggleGroupItem value="demo" className="z-10 cursor-pointer">
              Demo
            </ToggleGroupItem>
            {/* <ToggleGroupItem value="archived" className="z-10 cursor-pointer">
              Archived
            </ToggleGroupItem> */}
          </ToggleGroup>
        </div>

        {/* Live Accounts */}
        <TabsContent value="live">
          {hasBasicAccountInfo ? (
            accounts
              ?.filter(
                (account) =>
                  account.account_type === "Live" && account.acc !== 0
              )
              .map((account) => (
                <AccountDetails
                  key={account.tradingplatformaccountsid}
                  accountId={account.acc}
                  platformName={account.platformname}
                  accountType={account.account_type}
                  accountDetails={account}
                />
              ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No live accounts available
            </div>
          )}
        </TabsContent>

        {/* Demo Accounts */}
        <TabsContent value="demo">
          {(() => {
            const demoAccounts = (accounts || []).filter(
              (account) => account.account_type === "Demo" && account.acc !== 0
            );
            if (demoAccounts.length > 0) {
              return demoAccounts.map((account) => (
                <AccountDetails
                  key={account.tradingplatformaccountsid}
                  accountId={account.acc}
                  platformName={account.platformname}
                  accountType={account.account_type}
                  accountDetails={account}
                />
              ));
            }
            return (
              <div className="text-center py-4 text-gray-500">
                No Demo accounts available
              </div>
            );
          })()}
        </TabsContent>

        {/* Archived Accounts 
        <TabsContent value="archived">
          <div className="text-center py-4 text-gray-500">
            No archived accounts available
          </div>
        </TabsContent>*/}
      </Tabs>
    </div>
  );
}
