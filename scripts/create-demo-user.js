// Demo user creation script for testing
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase.js"

async function createDemoUser() {
  try {
    console.log("Creating demo user...")

    const userCredential = await createUserWithEmailAndPassword(auth, "demo@example.com", "demo123")

    await updateProfile(userCredential.user, {
      displayName: "Demo User",
    })

    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: "Demo User",
      email: "demo@example.com",
      phone: "+1234567890",
      createdAt: new Date(),
      totalAppointments: 0,
      totalHelpRequests: 0,
    })

    console.log("✅ Demo user created successfully!")
    console.log("Email: demo@example.com")
    console.log("Password: demo123")
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("✅ Demo user already exists!")
      console.log("Email: demo@example.com")
      console.log("Password: demo123")
    } else {
      console.error("❌ Error creating demo user:", error)
    }
  }
}

createDemoUser()
