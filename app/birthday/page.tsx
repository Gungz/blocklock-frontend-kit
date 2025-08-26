"use client";
import React from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useBirthdayGift } from "@/hooks/useBirthdayGift";
import { useBirthdayExplorer } from "@/hooks/useBirthdayExplorer";
import Wallet from "../wallet";
import Header from "../blocklock/header";
import Footer from "@/components/Footer";

const BirthdayGiftPage = () => {
  const { isConnected } = useAccount();
  const {
    activeTab,
    setActiveTab,
    message,
    setMessage,
    birthdayDate,
    setBirthdayDate,
    recipient,
    setRecipient,
    createGift,
  } = useBirthdayGift();

  const { data: gifts, isLoading, refetch } = useBirthdayExplorer();

  const {
    mutateAsync: handleCreateGift,
    isPending: isCreating,
    isError,
    error,
  } = createGift;

  if (!isConnected) return <Wallet />;

  return (
    <div className="bg-white-pattern">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-20 font-sans min-h-screen">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-end mb-6 gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <button
              className={`w-full sm:w-[200px] py-3 font-funnel-sans text-gray-900 border border-gray-200 hover:border-gray-400 transition-colors text-center ${
                activeTab === "create" ? "border-gray-400 bg-white" : ""
              }`}
              onClick={() => setActiveTab("create")}
            >
              Create Gift Card
            </button>
            <button
              className={`w-full sm:w-[200px] py-3 font-funnel-sans text-gray-900 border border-gray-200 hover:border-gray-400 transition-colors text-center ${
                activeTab === "explorer" ? "border-gray-400 bg-white" : ""
              }`}
              onClick={() => {
                setActiveTab("explorer");
                refetch();
              }}
            >
              Gift Card Explorer
            </button>
          </div>
        </div>

        {activeTab === "create" ? (
          <div className="bg-white border border-gray-200 p-4 sm:p-8 h-[550px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
              <div>
                <h2 className="text-xl text-gray-700 mb-4 font-funnel-display">
                  Birthday Gift Message
                </h2>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="font-funnel-display w-full h-[120px] text-gray-700 p-4 border border-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your birthday message..."
                />
                
                <div className="mt-4">
                  <h3 className="text-lg text-gray-700 mb-2 font-funnel-display">
                    Birthday Date
                  </h3>
                  <input
                    type="datetime-local"
                    value={birthdayDate}
                    onChange={(e) => setBirthdayDate(e.target.value)}
                    className="font-funnel-display w-full px-4 py-2 border border-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-lg text-gray-700 mb-2 font-funnel-display">
                    Recipient Address
                  </h3>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="font-funnel-display w-full px-4 py-2 border border-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="w-full h-[280px] flex items-center justify-center">
                  <img
                    src="/assets/images/blocklock.gif"
                    alt="Gift card animation"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleCreateGift({ message, birthdayDate, recipient })}
                disabled={!message || !birthdayDate || !recipient || isCreating}
                className={`font-funnel-display px-8 py-3 text-gray-900 border border-gray-200 hover:border-gray-400 transition-colors ${
                  !message || !birthdayDate || !recipient
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isCreating ? "Creating Gift..." : "Create Gift Card"}
              </button>
            </div>

            {isError && (
              <div className="text-red-500 font-funnel-display mt-4">
                {error?.message}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-4 sm:p-8 max-h-[900px] flex flex-col overflow-y-auto">
            <div className="flex justify-between">
              <h2 className="text-xl text-gray-800 mb-6 font-funnel-display">
                My Birthday Gift Cards
              </h2>
              <button onClick={() => refetch()}>
                <Image
                  className={`${
                    isLoading ? "animate-spin" : ""
                  } cursor-pointer mb-6`}
                  src="/assets/images/refresh.svg"
                  width={15}
                  height={15}
                  alt="Randamu Logo"
                />
              </button>
            </div>

            {gifts && gifts.length > 0 ? (
              <div className="overflow-y-auto flex-1">
                <div className="grid gap-6">
                  {gifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="border border-gray-200 shadow-sm p-6 bg-gray-50"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Gift ID
                          </span>
                          <span className="text-gray-900 font-medium font-funnel-display">
                            {gift.id}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            From
                          </span>
                          <span className="text-gray-900 font-medium font-funnel-display text-xs">
                            {gift.giftedBy}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Unlock Block
                          </span>
                          <span className="text-gray-900 font-medium font-funnel-display">
                            {gift.decryptedAt}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Status
                          </span>
                          <span className={`font-medium font-funnel-display ${gift.claimed ? 'text-green-600' : 'text-orange-600'}`}>
                            {gift.claimed ? 'Claimed' : gift.message ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>
                      </div>
                      
                      {gift.message && (
                        <div className="mt-4">
                          <span className="text-gray-500 text-sm font-funnel-display">
                            Birthday Message
                          </span>
                          <div className="border border-gray-200 p-3 mt-1 bg-white">
                            <p className="text-gray-800 font-funnel-display">
                              {gift.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-funnel-display">
                  {isLoading ? "Loading gift cards..." : "No birthday gift cards found."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BirthdayGiftPage;