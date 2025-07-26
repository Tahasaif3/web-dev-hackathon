import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log("🔥 Firebase Config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
})

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Log Firestore initialization
console.log("🔥 Firestore initialized for project:", firebaseConfig.projectId)

// Test Firestore connection
export const testFirestoreConnection = async () => {
  try {
    console.log("🔥 Testing Firestore connection...")

    // Import the functions we need
    const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore")

    // Test document reference
    const testDocRef = doc(db, "test", "connection")

    // Try to write a test document
    await setDoc(testDocRef, {
      test: true,
      timestamp: serverTimestamp(),
      message: "Firestore connection test successful",
    })

    // Try to read it back
    const testDoc = await getDoc(testDocRef)

    if (testDoc.exists()) {
      console.log("✅ Firestore connection successful!")
      console.log("📄 Test document data:", testDoc.data())
      return { success: true, data: testDoc.data() }
    } else {
      console.log("❌ Test document not found")
      return { success: false, error: "Test document not found" }
    }
  } catch (error) {
    console.error("❌ Firestore connection failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
