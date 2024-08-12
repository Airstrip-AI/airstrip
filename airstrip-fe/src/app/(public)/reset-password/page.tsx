'use client';

import Logo from '@/components/logo/Logo';
import { useResetPassword } from '@/hooks/queries/user-auth';
import {
  passwordValidator,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  Container,
  Paper,
  Center,
  Stack,
  Group,
  Button,
  Text,
  PasswordInput,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

type FormValuesType = {
  password: string;
  resetToken: string;
  email: string;
};

function ResetPasswordComponent() {
  const searchParams = useSearchParams();

  const resetToken = searchParams.get('reset-token') || '';
  const email = searchParams.get('email') || '';

  const [hideForm, setHideForm] = useState<boolean>(false);

  const form = useForm<FormValuesType>({
    initialValues: {
      password: '',
      resetToken,
      email,
    },

    validate: {
      password: passwordValidator,
      resetToken: (val) => (val ? null : 'Invalid reset token'),
      email: (val) => (val ? null : 'Invalid email'),
    },
  });

  const { mutate: resetPasswordFn, isLoading } = useResetPassword({
    onSuccess: (messageResp) => {
      showSuccessNotification(messageResp.message);
      setHideForm(true);
    },
    onError: (error) => {
      showErrorNotification(error.message || 'An error occurred.');
    },
  });
  const submitValues = (values: FormValuesType) => {
    resetPasswordFn({
      password: values.password,
      token: values.resetToken,
      email: values.email,
    });
  };

  return (
    <Container size="xs" p="xl">
      <Paper radius="md" p="xl" withBorder>
        {(!form.getValues().resetToken || !form.getValues().email) && (
          <Alert color="red" title="Invalid reset link">
            Reset link is invalid.
          </Alert>
        )}
        <Center>
          <Logo size={30} withText withLink />
        </Center>
        <Text size="lg" fw={500} ta="center" m="sm">
          Reset your password
        </Text>

        {!hideForm && (
          <form onSubmit={form.onSubmit((values) => submitValues(values))}>
            <Stack>
              <PasswordInput
                withAsterisk
                placeholder="Password"
                label="Password"
                autoFocus
                {...form.getInputProps('password')}
                disabled={isLoading}
              />

              <Group justify="space-between" mt="sm">
                <Link href={Links.login()} style={{ textDecoration: 'none' }}>
                  <Text c="dimmed" size="sm">
                    Remembered your password? Login
                  </Text>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  Reset
                </Button>
              </Group>
            </Stack>
          </form>
        )}
        {hideForm && (
          <Text>
            Password reset successful. Please login with your new password{' '}
            <Link href={Links.login()}>here</Link>.
          </Text>
        )}
      </Paper>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordComponent />
    </Suspense>
  );
}
