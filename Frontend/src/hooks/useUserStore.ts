export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  providerData?: any[];
}

import { create } from "zustand";

interface UserStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
