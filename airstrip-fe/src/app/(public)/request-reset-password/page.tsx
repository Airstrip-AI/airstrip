'use client';

import Logo from '@/components/logo/Logo';
import { useRequestResetPassword } from '@/hooks/queries/user-auth';
import { showErrorNotification, showSuccessNotification } from '@/utils/misc';
import { Links } from '@/utils/misc/links';
import {
  Button,
  Center,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useState } from 'react';

type FormValuesType = {
  email: string;
};

export default function RequestResetPasswordPage() {
  const form = useForm<FormValuesType>({
    initialValues: {
      email: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const [hideForm, setHideForm] = useState<boolean>(false);

  const { mutate: requestResetPasswordMutation, isLoading } =
    useRequestResetPassword({
      onSuccess: (messageResp) => {
        showSuccessNotification(messageResp.message);
        setHideForm(true);
      },
      onError: (error) => {
        showErrorNotification(error.message || 'An error occurred.');
      },
    });
  const submitValues = (values: FormValuesType) => {
    requestResetPasswordMutation({
      email: values.email,
    });
  };

  return (
    <Container size="xs" p="xl">
      <Paper radius="md" p="xl" withBorder>
        <Center>
          <Logo size={30} withText withLink />
        </Center>
        <Text size="lg" fw={500} ta="center" m="sm">
          Forgot your password? Enter your email to reset it.
        </Text>

        {!hideForm && (
          <form onSubmit={form.onSubmit((values) => submitValues(values))}>
            <Stack>
              <TextInput
                withAsterisk
                placeholder="Enter your email"
                label="Email"
                autoFocus
                {...form.getInputProps('email')}
                disabled={isLoading}
              />

              <Group justify="space-between" mt="sm">
                <Link href={Links.login()} style={{ textDecoration: 'none' }}>
                  <Text c="dimmed" size="xs">
                    Remembered your password? Login
                  </Text>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  Send reset link
                </Button>
              </Group>
            </Stack>
          </form>
        )}
        {hideForm && (
          <Text>
            Please check your email for a reset link. If you don't see it, check
            your spam folder.
          </Text>
        )}
      </Paper>
    </Container>
  );
}
