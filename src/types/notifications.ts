import { models } from '@/types/error';

export type NotificationType =
  | 'slack'
  | 'telegram'
  | 'discord'
  | 'email'
  | 'resend'
  | 'gotify'
  | 'ntfy'
  | 'mattermost'
  | 'pushover'
  | 'custom'
  | 'lark'
  | 'teams';

export type NotificationSlack = {
  slackId: string;
  webhookUrl: string;
  channel: string | null;
};

export type NotificationTelegram = {
  telegramId: string;
  botToken: string;
  chatId: string;
  messageThreadId: string | null;
};

export type NotificationDiscord = {
  discordId: string;
  webhookUrl: string;
  decoration: boolean | null;
};

export type NotificationEmail = {
  emailId: string;
  smtpServer: string;
  smtpPort: number;
  username: string;
  password: string;
  fromAddress: string;
  toAddresses: string[];
};

export type NotificationResend = {
  resendId: string;
  apiKey: string;
  fromAddress: string;
  toAddresses: string[];
};

export type NotificationGotify = {
  gotifyId: string;
  serverUrl: string;
  appToken: string;
  priority: number;
  decoration: boolean | null;
};

export type NotificationNtfy = {
  ntfyId: string;
  serverUrl: string;
  topic: string;
  accessToken: string | null;
  priority: number;
};

export type NotificationMattermost = {
  mattermostId: string;
  webhookUrl: string;
  channel: string | null;
  username: string | null;
};

export type NotificationCustom = {
  customId: string;
  endpoint: string;
  headers: Record<string, string> | null;
};

export type NotificationLark = {
  larkId: string;
  webhookUrl: string;
};

export type NotificationPushover = {
  pushoverId: string;
  userKey: string;
  apiToken: string;
  priority: number;
  retry: number | null;
  expire: number | null;
};

export type NotificationTeams = {
  teamsId: string;
  webhookUrl: string;
};

export type NotificationAllResponseBody = {
  notificationId: string;
  name: string;
  appDeploy: boolean;
  appBuildError: boolean;
  databaseBackup: boolean;
  volumeBackup: boolean;
  dokployRestart: boolean;
  dokployBackup: boolean;
  dockerCleanup: boolean;
  serverThreshold: boolean;
  notificationType: NotificationType;
  createdAt: string;
  organizationId: string;
  slackId?: string | null;
  telegramId?: string | null;
  discordId?: string | null;
  emailId?: string | null;
  resendId?: string | null;
  gotifyId?: string | null;
  ntfyId?: string | null;
  mattermostId?: string | null;
  customId?: string | null;
  larkId?: string | null;
  pushoverId?: string | null;
  teamsId?: string | null;
  slack?: NotificationSlack | null;
  telegram?: NotificationTelegram | null;
  discord?: NotificationDiscord | null;
  email?: NotificationEmail | null;
  resend?: NotificationResend | null;
  gotify?: NotificationGotify | null;
  ntfy?: NotificationNtfy | null;
  mattermost?: NotificationMattermost | null;
  custom?: NotificationCustom | null;
  lark?: NotificationLark | null;
  pushover?: NotificationPushover | null;
  teams?: NotificationTeams | null;
};

export type NotificationAllResponse = models.ErrorT | NotificationAllResponseBody[];
