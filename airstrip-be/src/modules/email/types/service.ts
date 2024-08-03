export type SendTransactionalEmailRequest = {
  subject: string;
  htmlContent: string;
  to: {
    name?: string;
    email: string;
  }[];
};
