import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, ModulePermission } from '../types';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  permissions: ModulePermission[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasPermission: (moduleKey: string, action: keyof Omit<ModulePermission, 'module_key'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUserData(userId: string) {
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    setProfile(profileData ?? null);

    // Aggregate permissions across all roles assigned to the user
    const { data: permData } = await supabase
      .from('role_permissions')
      .select('can_view, can_create, can_edit, can_delete, can_approve, can_export, modules(key), roles!inner(user_roles!inner(user_id))')
      .eq('roles.user_roles.user_id', userId);

    if (permData) {
      const merged: Record<string, ModulePermission> = {};
      for (const row of permData as any[]) {
        const key = row.modules?.key;
        if (!key) continue;
        if (!merged[key]) {
          merged[key] = { module_key: key, can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false, can_export: false };
        }
        merged[key].can_view ||= row.can_view;
        merged[key].can_create ||= row.can_create;
        merged[key].can_edit ||= row.can_edit;
        merged[key].can_delete ||= row.can_delete;
        merged[key].can_approve ||= row.can_approve;
        merged[key].can_export ||= row.can_export;
      }
      setPermissions(Object.values(merged));
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadUserData(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) loadUserData(newSession.user.id);
      else { setProfile(null); setPermissions([]); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  const hasPermission: AuthContextType['hasPermission'] = (moduleKey, action) => {
    const perm = permissions.find((p) => p.module_key === moduleKey);
    return perm ? Boolean(perm[action]) : false;
  };

  return (
    <AuthContext.Provider value={{ session, profile, permissions, loading, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
