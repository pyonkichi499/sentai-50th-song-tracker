import { signInAnonymously } from 'firebase/auth'
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { initializeFirebaseClient } from '../lib/firebase'

export function createFirestoreSongRepository() {
  const listeners = new Set()
  const statusListeners = new Set()
  let songs = []
  let snapshotUnsubscribe = null
  let status = 'connecting'
  let errorMessage = null

  const emit = () => {
    listeners.forEach((listener) => listener(songs))
  }

  const emitStatus = () => {
    const payload = { status, errorMessage }
    statusListeners.forEach((listener) => listener(payload))
  }

  const { auth, db } = initializeFirebaseClient()

  const ensureSignedIn = async () => {
    if (auth.currentUser) {
      return auth.currentUser
    }

    const credential = await signInAnonymously(auth)
    return credential.user
  }

  const startSnapshot = async () => {
    await ensureSignedIn()

    snapshotUnsubscribe = onSnapshot(
      collection(db, 'songs'),
      (snapshot) => {
        songs = snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        }))
        status = 'ready'
        errorMessage = null
        emit()
        emitStatus()
      },
      (error) => {
        status = 'error'
        errorMessage = error?.message || 'Firestoreからの読み込みに失敗しました。'
        emitStatus()
      },
    )
  }

  startSnapshot().catch((error) => {
    status = 'error'
    errorMessage = error?.message || 'Firestoreへの接続に失敗しました。'
    emitStatus()
    console.error('[firestore] failed to subscribe songs:', error)
  })

  return {
    subscribe(listener) {
      listeners.add(listener)
      listener(songs)

      return () => {
        listeners.delete(listener)
      }
    },

    subscribeStatus(listener) {
      statusListeners.add(listener)
      listener({ status, errorMessage })

      return () => {
        statusListeners.delete(listener)
      }
    },

    async toggleSong(songId) {
      const user = await ensureSignedIn()
      const target = songs.find((song) => song.id === songId)
      if (!target) {
        return
      }

      const nextSung = !target.sung
      const songRef = doc(db, 'songs', songId)

      await updateDoc(songRef, {
        sung: nextSung,
        sungAt: nextSung ? new Date().toISOString() : null,
        sungBy: nextSung ? [user.uid] : [],
      })
    },

    dispose() {
      listeners.clear()
      statusListeners.clear()
      if (snapshotUnsubscribe) {
        snapshotUnsubscribe()
      }
    },
  }
}
