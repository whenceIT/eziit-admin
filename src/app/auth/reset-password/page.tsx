/*'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/auth/layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage(): React.JSX.Element {
  const params = useParams();
  const token = params.token as string;

  return (
    <Layout>
      <ResetPasswordForm token={token} />
    </Layout>
  );
}*/