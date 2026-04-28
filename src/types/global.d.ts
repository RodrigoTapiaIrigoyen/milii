declare global {
  var emitNotificationToUser: ((userId: string, notification: any) => void) | undefined;
  var broadcastNotification: ((notification: any) => void) | undefined;
}

export {};
