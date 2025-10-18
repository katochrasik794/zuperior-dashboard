"use client";

import React, { useState, useRef, useEffect } from "react";
import TradingViewSingleTicker from "./TradingViewWidget";
import { useTheme } from "next-themes";
import { store } from "@/store";
import Image from "next/image";
import { ChevronDown, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import zuperFunded from "@/assets/sidebar/zuperFunded.svg";
import zuperLearn from "@/assets/sidebar/zuperLearn.svg";
import { Menu } from "lucide-react";

const TickerSidebar: React.FC = () => {
  const { theme } = useTheme();
  const tvTheme = theme === "dark" ? "dark" : "light";
  const username =
    store.getState().user.data?.accountname.split(" ")[0] || "User";

  // Dropdown logic
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tickers = [
    "OANDA:XAUUSD",
    "OANDA:EURUSD",
    "OANDA:GBPUSD",
    "OANDA:USDJPY",
    "OANDA:BTCUSD",
    "OANDA:USDCAD",
    "OANDA:AUDUSD",
    "OANDA:USDCHF",
    "OANDA:EURJPY",
    "OANDA:GBPJPY",
    "OANDA:ETHUSD",
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);

  return (
    <>
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-5 left-4 z-50 p-1 rounded-md bg-gray-600 text-white lg:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      <div
        className={`w-[300px] xl:w-1/6 py-[11px] space-y-4 bg-white dark:bg-[#01040D] border-r flex flex-col fixed left-0 top-0 h-screen transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative z-40`}
      >
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-5 -right-14 p-1 rounded-md bg-gray-600 text-white lg:hidden z-50"
          >
            <X size={20} />
          </button>
        )}

        {/* Fixed Top Section */}
        <div className="relative w-full flex-shrink-0">
          {/* Logo + Dropdown */}
          <div
            className="flex mx-2 items-center mb-2 relative"
            ref={dropdownRef}
          >
            <Image
              alt="Zuperior Logo"
              src="/logo.png"
              width={63}
              height={63}
              className="w-12 h-12"
            />
            <div className="flex flex-col ml-3">
              <span className="text-[25px] font-bold text-black dark:text-white/75 leading-tight">
                Zuperior
              </span>
              <span className="text-sm text-black dark:text-white/45 tracking-wide">
                Trade Superior
              </span>
            </div>
            <div className="flex-1" />
            <ChevronDown
              onClick={toggleDropdown}
              size={18}
              className="cursor-pointer dark:text-white/75 text-black mr-2"
            />
            {/* Dropdown menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full mt-[14px] w-auto dark:bg-[#000000] bg-white rounded-b-[10px] border border-[#3b334f] z-[99] shadow-lg"
                >
                  <div className="py-2 w-full">
                    <Link
                      href="https://zuperior-staging.onrender.com"
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#9a86cc] dark:hover:bg-[#1E1429]/40 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src="/logo.png"
                          alt="Website"
                          width={25}
                          height={25}
                          className="w-6 h-6"
                        />
                        <span className="dark:text-white/75 text-black text-sm">
                          Zuperior Website
                        </span>
                      </div>
                      <ArrowRight size={18} />
                    </Link>
                    <Link
                      href="#"
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#9a86cc] dark:hover:bg-[#1E1429]/40 transition-colors group relative opacity-60 cursor-not-allowed"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={zuperFunded}
                          alt="Funded"
                          width={25}
                          height={25}
                          className="w-6 h-6"
                        />
                        <span className="dark:text-white/75 text-black group-hover:text-gray-100 text-sm">
                          Zuper Funded
                        </span>
                        <div className="ml-2 text-center bg-[#9F8ACF]/30 px-2 py-[2px] rounded-[5px] font-semibold text-black/75 dark:text-white/75 tracking-tighter text-[10px]">
                          Coming Soon
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="https://zuperlearn.com"
                      className="flex items-center justify-between px-4 py-2 hover:bg-[#9a86cc] dark:hover:bg-[#1E1429]/40 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={zuperLearn}
                          alt="Learn"
                          width={25}
                          height={25}
                          className="w-5 h-5"
                        />
                        <span className="dark:text-white/75 text-black text-sm">
                          Zuper Learn
                        </span>
                      </div>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-full mt-[14px] h-px dark:bg-white/10 bg-black/10" />
        </div>

        {/* Welcome Heading */}
        <div className="relative rounded-xl bg-gradient-to-r from-fuchsia-700/20 via-fuchsia-500/10 to-transparent shadow-lg px-4 py-4 mb-2 mx-4 mt-3 flex flex-col items-start border border-fuchsia-500/10">
          <span className="text-lg font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-1 tracking-wide">
            Hey {username}!
          </span>
          <span className="text-xl font-bold text-black dark:text-white/80 leading-tight drop-shadow">
            Welcome to{" "}
            <span className="text-fuchsia-600 dark:text-fuchsia-400">
              Zuperior
            </span>{" "}
            Web Terminal
          </span>
          <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
            Think Superior. Trade Zuperior.
          </span>
        </div>

        {/* Scrollable Tickers Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mt-2">
          {tickers.map((symbol) => (
            <div
              key={symbol}
              className="rounded-sm h-22 mx-4 flex flex-col gap-2 bg-black/40 border dark:hover:border-fuchsia-500/60 hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,0,255,0.3)]"
            >
              <TradingViewSingleTicker
                symbol={symbol}
                theme={tvTheme}
                width="100%"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TickerSidebar;
