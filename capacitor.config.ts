import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rupeetracker.app',
  appName: 'Rupee Tracker',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
