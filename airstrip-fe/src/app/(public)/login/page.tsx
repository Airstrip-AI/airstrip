'use client';

import AuthenticationForm from '@/components/auth/AuthenticationForm';
import { Container } from '@mantine/core';
import { Suspense } from 'react';

export default function Login() {
  return (
    <Suspense>
      <Container size="xs" p="xl">
        <AuthenticationForm type="login" />
      </Container>
    </Suspense>
  );
}
