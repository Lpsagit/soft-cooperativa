import type { UserAuth } from "@/interfaces/auth.response";
import { create } from "zustand";
import { loginAction } from "../actions/login.action";
import { checkAuthAction } from "../actions/check-auth.action";
import { queryClient } from "@/lib/queryClient";

type AuthStatus = "authenticated" | "not-authenticated" | "checking";

type AuthState = {
  //Properties
  userAuth: UserAuth | null;
  token: string | null;
  authStatus: AuthStatus;
  //Getters
  //Actions
  // aqui solo definimos como luce la funcion
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  // implementacion del store
  userAuth: null,
  token: null,
  authStatus: "checking",
  //actions
  login: async (userName: string, password: string) => {
    try {
      const data = await loginAction(userName, password);
      localStorage.setItem("token", data.token);
      set({
        userAuth: data.user,
        token: data.token,
        authStatus: "authenticated",
      });
      return true;
    } catch (error) {
      //alert(error);
      localStorage.removeItem("token");
      set({ userAuth: null, token: null, authStatus: "not-authenticated" });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    queryClient.clear();
    set({ userAuth: null, token: null, authStatus: "not-authenticated" });
  },
  checkAuthStatus: async () => {
    try {
      const { user, token } = await checkAuthAction();
      set({ userAuth: user, token: token, authStatus: "authenticated" });
      return true;
    } catch (error) {
      console.log(error);
      set({
        userAuth: undefined,
        token: undefined,
        authStatus: "not-authenticated",
      });
      return false;
    }
  },
}));
