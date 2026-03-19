import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bjc.app',
  appName: 'bjc',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
