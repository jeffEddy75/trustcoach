import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trustcoach.app',
  appName: 'TrustCoach',
  webDir: 'out',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
    },
  },
  server: {
    // Pour le développement sur device réel
    // url: 'http://192.168.x.x:3000',
    // cleartext: true,
  },
};

export default config;
