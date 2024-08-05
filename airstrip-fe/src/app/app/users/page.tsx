'use client';

import UsersComponent from '@/components/users/UsersComponent';
import { Suspense } from 'react';

export default function UsersPage() {
  return (
    <Suspense>
      <UsersComponent />
    </Suspense>
  );
}
