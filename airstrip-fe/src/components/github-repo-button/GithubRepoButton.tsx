'use client';

import { GITHUB_REPO_URL, PRODUCT_NAME } from '@/constants';
import { Button } from '@mantine/core';
import Image from 'next/image';

export default function GithubRepoButton({ variant }: { variant?: string }) {
  return (
    <Button
      variant={variant || 'outline'}
      component="a"
      href={GITHUB_REPO_URL}
      target="_blank"
      leftSection={
        <Image alt="github" src="/github-mark.svg" width={20} height={20} />
      }
    >
      {PRODUCT_NAME}
    </Button>
  );
}
