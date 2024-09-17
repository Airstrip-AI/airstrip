import { defaultTemperature } from '@/constants';
import { useOptionalFeatures } from '@/hooks/queries/apps';
import { UpdateAppReq } from '@/utils/backend/client/apps/types';
import { IconBulb, IconMessageChatbot, IconProps } from '@tabler/icons-react';
import { ComponentType, useMemo } from 'react';

type Template = Pick<
  UpdateAppReq,
  | 'name'
  | 'description'
  | 'introductionMessage'
  | 'temperature'
  | 'systemPrompt'
  | 'systemPromptJson'
> & {
  icon: ComponentType<IconProps>;
};

const qnaTemplate: Template = {
  name: 'Q&A assistant',
  description: `This app will attempt to answer any questions that it knows based on its model's training data.`,
  introductionMessage: 'Ask me anything!',
  systemPromptJson: [
    {
      id: '02e679ab-89e3-4fa1-9d04-7b64739d961d',
      type: 'paragraph',
      props: {
        textColor: 'default',
        textAlignment: 'left',
        backgroundColor: 'default',
      },
      content: [
        {
          text: `You are trivia master who knows a lot of worldly knowledge. Your role is to answer user's questions to the best of your abilities.`,
          type: 'text',
          styles: {},
        },
      ],
      children: [],
    },
  ],
  systemPrompt: `You are trivia master who knows a lot of worldly knowledge. Your role is to answer user's questions to the best of your abilities.`,
  temperature: defaultTemperature,
  icon: IconMessageChatbot,
};

const knowledgeBaseTemplate: Template = {
  name: 'Knowledge base AI assistant',
  description: `This app will look through database for relevant information to answer user queries.
Add documents into the knowledge base and attach it to the app for the AI assistant to draw on.`,
  introductionMessage:
    'Tell me what you would like to know and I will look through my knowledge base for it!',
  systemPromptJson: [
    {
      id: '02e679ab-89e3-4fa1-9d04-7b64739d961d',
      type: 'paragraph',
      props: {
        textColor: 'default',
        textAlignment: 'left',
        backgroundColor: 'default',
      },
      content: [
        {
          text: 'You are an AI assistant who will look through the knowledge provided to you to answer user questions. If none of the knowledge provided seems relevant, say "I\'m not sure".',
          type: 'text',
          styles: {},
        },
      ],
      children: [],
    },
    {
      id: 'b386f038-b315-45f7-835a-e3974ea63c78',
      type: 'knowledge',
      props: {},
      children: [],
    },
    {
      id: 'fd111e3f-5b3e-41b5-9731-ee5103665d3c',
      type: 'paragraph',
      props: {
        textColor: 'default',
        textAlignment: 'left',
        backgroundColor: 'default',
      },
      content: [],
      children: [],
    },
    {
      id: 'f6cfd3c2-1a8c-4e24-b26b-e68b9edc61c3',
      type: 'temperature',
      props: {},
      children: [],
    },
    {
      id: '3b088c2f-80b4-48f5-8030-cfb28c3b0591',
      type: 'paragraph',
      props: {
        textColor: 'default',
        textAlignment: 'left',
        backgroundColor: 'default',
      },
      content: [],
      children: [],
    },
  ],
  systemPrompt: `You are an AI assistant who will look through the knowledge provided to you to answer user questions. If none of the knowledge provided seems relevant, say "I'm not sure".`,
  temperature: 0,
  icon: IconBulb,
};

export function useAppTemplates(): Template[] {
  const { data: optionalFeatures } = useOptionalFeatures();

  const featureGatedTemplates = useMemo(() => {
    const gatedTemplates: Template[] = [];

    if (!!optionalFeatures?.knowledgeBaseAllowed) {
      gatedTemplates.push(knowledgeBaseTemplate);
    }

    return gatedTemplates;
  }, [optionalFeatures]);

  return [qnaTemplate, ...featureGatedTemplates];
}
