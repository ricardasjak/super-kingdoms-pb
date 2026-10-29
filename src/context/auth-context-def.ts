import { createContext } from "react";
import type { PocketBaseUser } from "../lib/pocketbase";

export interface RegisterPayload {
	email: string;
	password: string;
	passwordConfirm: string;
	name?: string;
}

export interface AuthContextType {
	user: PocketBaseUser | null;
	token: string;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<PocketBaseUser>;
	loginWithDiscord: () => Promise<PocketBaseUser>;
	register: (payload: RegisterPayload) => Promise<PocketBaseUser>;
	logout: () => void;
	refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);
