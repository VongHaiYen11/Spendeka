import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";

export type UserProfile = {
  fullName: string;
  dob: string | null;
  avatarUrl: string | null;
};

type UserProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const defaultProfile: UserProfile = {
  fullName: "User",
  dob: null,
  avatarUrl: null,
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
      const fullName =
        (data.fullName as string)?.trim() ||
        user.displayName?.trim() ||
        "User";
      const dob = (data.dob as string) ?? null;
      const avatarUrl = (data.avatarUrl as string) ?? user.photoURL ?? null;
      setProfile({ fullName, dob, avatarUrl });
    } catch {
      setProfile({
        fullName: user.displayName?.trim() || "User",
        dob: null,
        avatarUrl: user.photoURL ?? null,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.displayName, user?.photoURL]);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    refreshProfile();
  }, [user?.uid, refreshProfile]);

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, refreshProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return ctx;
}

/** Display name: profile fullName or Auth displayName/email fallback */
export function useDisplayName(): string {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  return (
    profile?.fullName?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")?.[0] ||
    "User"
  );
}

/** Avatar URL: profile avatarUrl or Auth photoURL fallback */
export function useAvatarUrl(): string | null {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  return profile?.avatarUrl ?? user?.photoURL ?? null;
}
