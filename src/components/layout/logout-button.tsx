'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface LogoutButtonProps {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  onLogout?: () => void;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'sm',
  className,
  onLogout,
}: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    onLogout?.();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
    >
      יציאה
    </Button>
  );
}
