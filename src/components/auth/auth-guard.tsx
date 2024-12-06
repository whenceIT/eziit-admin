{/*'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkPermissions = async (): Promise<void> => {
      if (isLoading) {
        return;
      }

      if (error) {
        logger.error('[AuthGuard]: Error checking user permissions', error);
        setIsChecking(false);
        return;
      }

      if (!user) {
        logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');
        try {
          await router.replace(paths.auth.signIn);
        } catch (routerError) {
          logger.error('[AuthGuard]: Error during redirection', routerError);
        }
        return;
      }

      setIsChecking(false);
    };

    checkPermissions().catch((err) => {
      logger.error('[AuthGuard]: Unexpected error during permission check', err);
      setIsChecking(false);
    });
  }, [user, error, isLoading, router]);

  if (isLoading || isChecking) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error}
          <br />
          Please try refreshing the page or contact support if the problem persists.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}*/}