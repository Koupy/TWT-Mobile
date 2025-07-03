// Crée un objet d'application Expo avec les configurations nécessaires
module.exports = {
  expo: {
    assetBundlePatterns: [
      "**/*",
      "./assets/fonts/*",
      "./node_modules/react-native-vector-icons/Fonts/*"
    ],
    fonts: [
      {
        "asset": "./node_modules/react-native-vector-icons/Fonts/Ionicons.ttf"
      },
      {
        "asset": "./node_modules/react-native-vector-icons/Fonts/AntDesign.ttf"
      },
      {
        "asset": "./node_modules/react-native-vector-icons/Fonts/FontAwesome.ttf"
      },
      {
        "asset": "./node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf"
      },
      {
        "asset": "./node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"
      }
    ],
    name: "t-wallet",
    slug: "t-wallet",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
      runtimeVersion: {
        policy: "appVersion"
      }
    },
    android: {
      package: "com.twallet",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      buildType: "apk",
      jsEngine: "hermes",
      targetSdkVersion: 34,
      runtimeVersion: "1.0.0"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen"
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    
    updates: {
      url: "https://u.expo.dev/6844d12b-864a-4ad4-aa01-50b54062c768"
    },
    
    extra: {
      eas: {
        "projectId": "6844d12b-864a-4ad4-aa01-50b54062c768"
      },
      disableADB: true
    }
  }
};
