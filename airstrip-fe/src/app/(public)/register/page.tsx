'use client';

import AuthenticationForm from '@/components/auth/AuthenticationForm';
import { Container } from '@mantine/core';
import { Suspense } from 'react';

export default function Register() {
  return (
    <Suspense>
      <Container size="xs" p="xl">
        <AuthenticationForm type="register" />
      </Container>
    </Suspense>
  );
}
