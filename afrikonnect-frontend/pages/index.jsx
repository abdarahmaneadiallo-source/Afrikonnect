// ===== PAGES/INDEX.JSX — Redirection racine =====
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? '/app' : '/login');
  }, [user, isLoading, router]);

  return null;
}
