'use client';

import { useLogin as useClientSideLogin } from '@/hooks/user';
import { Links } from '@/utils/misc/links';
import {
  passwordValidator,
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/misc';
import {
  Alert,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst } from '@mantine/hooks';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Logo from '../logo/Logo';
import { useLogin, useRegister } from '@/hooks/queries/user-auth';

type FormValuesType = {
  email: string;
  password: string;
};

export default function AuthenticationForm({
  type,
}: {
  type: 'login' | 'register';
}) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || undefined;
  const inviteToken = searchParams.get('inviteToken') || undefined;
  const inviteEmail = searchParams.get('email') || undefined;

  const form = useForm<FormValuesType>({
    initialValues: {
      email: inviteEmail || '',
      password: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: passwordValidator,
    },
  });

  const { login } = useClientSideLogin();

  const { mutate: loginMutationFn, isLoading: isLoggingIn } = useLogin({
    onSuccess: (userLoginResp) => {
      login(
        {
          id: userLoginResp.id,
          email: userLoginResp.email,
          firstName: userLoginResp.firstName,
          orgs: userLoginResp.orgs.map((org) => ({
            id: org.id,
            name: org.name,
            role: org.role,
          })),
        },
        userLoginResp.token,
        redirectTo ? decodeURIComponent(redirectTo) : undefined,
      );
    },
    onError: (error) => {
      showErrorNotification(error.message || 'An error occurred.');
    },
  });

  const { mutate: registerMutationFn, isLoading: isRegistering } = useRegister({
    onSuccess: (results) => {
      showSuccessNotification(results.message);
      loginMutationFn({
        email: form.values.email,
        password: form.values.password,
      });
    },
    onError: (error) => {
      showErrorNotification(error.message || 'An error occurred.');
    },
  });

  const submitValues = (type: 'login' | 'register', values: FormValuesType) => {
    if (type === 'register') {
      registerMutationFn({
        email: values.email,
        password: values.password,
        firstName: values.email.split('@')[0],
      });
    } else {
      loginMutationFn({ email: values.email, password: values.password });
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Center>
        <Logo size={30} withText withLink />
      </Center>
      {type === 'register' && inviteToken && inviteEmail && (
        <Alert
          color="blue"
          title="You have been invited to join an organization"
          mt="md"
        >
          <Stack>
            <Text size="sm">
              You have been invited to join an organization. Please register to
              continue. After registering, you can accept or reject invites in
              the Invites page.
            </Text>
            <Text size="sm">
              Already have an account? Login{' '}
              <Link href={`${Links.login()}?redirectTo=${Links.invites()}`}>
                here
              </Link>{' '}
              instead.
            </Text>
          </Stack>
        </Alert>
      )}
      <Text size="lg" fw={500} ta="center" m="sm">
        Welcome, please {type} to continue
      </Text>
      <Link
        href={
          type === 'register'
            ? `${Links.login()}${redirectTo ? `?redirectTo=${redirectTo}` : ''}`
            : Links.register()
        }
        style={{ textDecoration: 'none' }}
      >
        <Text c="dimmed" size="sm" ta="center">
          {type === 'register'
            ? 'Already have an account? Click here to login'
            : "Don't have an account? Click here to register"}
        </Text>
      </Link>

      <form onSubmit={form.onSubmit((values) => submitValues(type, values))}>
        <Stack>
          <TextInput
            withAsterisk
            placeholder="Enter your email"
            label="Email"
            autoFocus
            {...form.getInputProps('email')}
            disabled={isLoggingIn || isRegistering}
          />

          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
            disabled={isLoggingIn || isRegistering}
          />
        </Stack>
        <Group mt="xl">
          {type === 'login' && (
            <Link
              href={Links.requestResetPassword()}
              style={{ textDecoration: 'none' }}
            >
              <Text c="dimmed" size="xs">
                {/* TODO: reset password flow */}
                Forgot your password? Reset it here.
              </Text>
            </Link>
          )}
        </Group>
        <Group justify="flex-end" mt="sm">
          <Button
            type="submit"
            variant={type === 'login' ? 'outline' : 'filled'}
            color={type === 'login' ? undefined : 'dark'}
            disabled={isLoggingIn || isRegistering}
          >
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
