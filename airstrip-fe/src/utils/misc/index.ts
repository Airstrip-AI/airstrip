import { UserProfileResp } from '@/utils/backend/client/auth/types';
import { UserRole } from '@/utils/backend/client/common/types';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * This uses the Mantine notifications library to show a notification, hence must be called
 * in a component within MantineProvider, and Notifications component should be rendered in the app.
 */
export function showErrorNotification(message: string) {
  notifications.show({
    title: 'Error',
    color: 'red',
    autoClose: 7000,
    withBorder: true,
    withCloseButton: true,
    message,
  });
}

/**
 * This uses the Mantine notifications library to show a notification, hence must be called
 * in a component within MantineProvider, and Notifications component should be rendered in the app.
 */
export function showSuccessNotification(message: string) {
  notifications.show({
    title: 'Success',
    color: 'green',
    autoClose: 7000,
    withBorder: true,
    withCloseButton: true,
    message,
  });
}

/**
 * This uses the Mantine notifications library to show a notification, hence must be called
 * in a component within MantineProvider, and Notifications component should be rendered in the app.
 */
export function showLoadingNotification(message: string) {
  return notifications.show({
    loading: true,
    withBorder: true,
    withCloseButton: true,
    message,
  });
}

export function minutesAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000);
}

export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function passwordValidator(password: string): string | null {
  return password.length < 8
    ? 'Password should include at least 8 characters'
    : null;
}

export function isAdminOrAboveInOrg(
  orgId: string,
  userProfile?: UserProfileResp,
): boolean {
  const orgRole = userProfile?.orgs.find((org) => org.id === orgId)?.role;
  return !!(orgRole && isAdminOrAbove(orgRole));
}

export function isAdminOrAbove(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.OWNER;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
