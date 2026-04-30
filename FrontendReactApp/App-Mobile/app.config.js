require('dotenv/config');
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      EXPO_PUBLIC_ODOO_URL: process.env.EXPO_PUBLIC_ODOO_URL ?? '',
      EXPO_PUBLIC_ODOO_TIMEOUT_MS: process.env.EXPO_PUBLIC_ODOO_TIMEOUT_MS ?? '',
    },
  },
};
