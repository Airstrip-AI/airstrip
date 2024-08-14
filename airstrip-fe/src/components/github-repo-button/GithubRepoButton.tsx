'use client';

import { GITHUB_REPO_URL, PRODUCT_NAME } from '@/constants';
import { Button } from '@mantine/core';
import Image from 'next/image';
import githubMark from '../../../public/github-mark.svg';

export default function GithubRepoButton({ variant }: { variant?: string }) {
  return (
    <Button
      variant={variant || 'outline'}
      component="a"
      href={GITHUB_REPO_URL}
      target="_blank"
      leftSection={
        <Image alt="github" src={githubMark} width={20} height={20} />
      }
    >
      Check out {PRODUCT_NAME} on GitHub
    </Button>
  );
}
