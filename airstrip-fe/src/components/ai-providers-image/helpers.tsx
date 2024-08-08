import { AiProvider } from '@/utils/backend/client/common/types';
import { IconCode } from '@tabler/icons-react';
import Image from 'next/image';
import { Text } from '@mantine/core';

export function loadImage(aiProvider: AiProvider) {
  const providerLogoSize = 20;

  switch (aiProvider) {
    case AiProvider.OPENAI:
      return (
        <Image
          alt="OpenAI"
          src="/llm-provider-logos/openai.svg"
          width={providerLogoSize}
          height={providerLogoSize}
        />
      );
    case AiProvider.OPENAI_COMPATIBLE:
      return <IconCode size={providerLogoSize} />;
    case AiProvider.MISTRAL:
      return (
        <Image
          alt="Mistral"
          src="/llm-provider-logos/mistral.svg"
          width={providerLogoSize}
          height={providerLogoSize}
        />
      );
    case AiProvider.GOOGLE:
      return (
        <Image
          alt="Google"
          src="/llm-provider-logos/google.svg"
          width={providerLogoSize}
          height={providerLogoSize}
        />
      );
    case AiProvider.COHERE:
      return (
        <Image
          alt="Cohere"
          src="/llm-provider-logos/cohere.png"
          width={providerLogoSize}
          height={providerLogoSize}
        />
      );
    case AiProvider.ANTHROPIC:
      return (
        <Image
          alt="Anthropic"
          src="/llm-provider-logos/anthropic.svg"
          width={providerLogoSize}
          height={providerLogoSize}
        />
      );
    default:
      return <Text>{aiProvider}</Text>;
  }
}
