import { notifications } from '@mantine/notifications';

export function notifyOk(message: string) {
  notifications.show({
    title: 'Success',
    message,
    color: 'green',
  });
}

export function notifyError(message: string) {
  notifications.show({
    title: 'Error',
    message,
    color: 'yellow',
  });
}

export function notifyLoading(message: string) {
  const notificationId = notifications.show({
    message,
    loading: true,
    autoClose: false,
  });

  return () => {
    notifications.hide(notificationId);
  };
}
