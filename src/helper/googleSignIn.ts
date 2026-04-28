import { GoogleSignin } from "@react-native-google-signin/google-signin";

// From `android/app/google-services.json` (oauth_client client_type: 3).
const WEB_CLIENT_ID =
  "3827966986-hgo9fq0oo96v56be6ppl256mguo5o8kb.apps.googleusercontent.com";

let configured = false;

export function ensureGoogleSigninConfigured() {
  if (configured) return;

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });

  configured = true;
}

