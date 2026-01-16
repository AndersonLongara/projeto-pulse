/**
 * Privacy Store - Global state for sensitive data visibility
 *
 * Controls whether sensitive financial data (salaries, values) should be
 * displayed or hidden (replaced with "R$ •••••").
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrivacyState {
  hideMoneyValues: boolean;
  toggleMoneyVisibility: () => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      hideMoneyValues: false,
      toggleMoneyVisibility: () =>
        set((state) => ({ hideMoneyValues: !state.hideMoneyValues })),
    }),
    {
      name: "pulse-privacy-settings",
    }
  )
);
