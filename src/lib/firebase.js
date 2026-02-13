import { initializeApp } from 'firebase/app'
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import * as firebaseConfigModule from './firebase.web.config'

let initialized = null

function readFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  const moduleRecord = firebaseConfigModule
  const fileConfig =
    moduleRecord['firebaseWebConfig'] || moduleRecord['firebaseConfig'] || moduleRecord['default'] || {}

  if (hasRequiredConfig(fileConfig)) {
    return fileConfig
  }

  return envConfig
}

function hasRequiredConfig(config) {
  return Boolean(config.apiKey && config.projectId && config.appId)
}

export function initializeFirebaseClient() {
  if (initialized) {
    return initialized
  }

  const config = readFirebaseConfig()
  if (!hasRequiredConfig(config)) {
    throw new Error(
      'Firebase config is missing. Set src/lib/firebase.web.config.js or VITE_FIREBASE_* in .env.local',
    )
  }

  const app = initializeApp(config)

  const appCheckSiteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY
  if (appCheckSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      tokenAutoRefreshEnabled: true,
    })
  }

  const auth = getAuth(app)
  const db = getFirestore(app)

  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
  if (useEmulator) {
    const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1'
    const firestorePort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080)
    const authHost = import.meta.env.VITE_AUTH_EMULATOR_HOST || '127.0.0.1'
    const authPort = Number(import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099)

    connectFirestoreEmulator(db, firestoreHost, firestorePort)
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true })
  }

  initialized = { app, auth, db }
  return initialized
}
