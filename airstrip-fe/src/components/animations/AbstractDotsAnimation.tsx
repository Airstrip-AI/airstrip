'use client';

import Lottie from 'react-lottie-player';
import animationData from '../../../public/abstract-dots-animation.json';

export default function AbstractDotsAnimation({
  size,
  loop,
}: {
  size: number;
  loop: boolean;
}) {
  return (
    <Lottie
      loop={loop}
      play
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice',
      }}
      animationData={animationData}
      style={{ width: size, height: size }}
    />
  );
}
