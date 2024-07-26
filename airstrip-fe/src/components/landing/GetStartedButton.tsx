'use client';

import { Links } from '@/utils/misc/links';
import { Button } from '@mantine/core';

export default function GetStartedButton({
  variant,
  className,
}: {
  variant?: string;
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      component="a"
      href={Links.login()}
      className={className}
    >
      Get Started
    </Button>
  );
}
