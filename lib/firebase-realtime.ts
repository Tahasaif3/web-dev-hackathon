import { onSnapshot, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./firebase"

// Enhanced logging for debugging
const log = (message: string, data?: any) => {
  console.log(`🔥 Firebase: ${message}`, data || "")
}

// Define proper types for our data
interface AppointmentData {
  id: string
  userId: string
  bookerName: string
  bookerPhone: string
  bookerEmail: string
  appointeeName: string
  appointeePhone: string
  appointeeEmail: string
  relationship: string
  reason: string
  department: string
  preferredDate: string
  preferredTime: string
  additionalNotes: string
  status: string
  createdAt: any
  updatedAt: any
  [key: string]: any // Allow additional properties
}

interface HelpRequestData {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  helpType: string
  urgencyLevel: string
  description: string
  contactPreference: string
  additionalContact: string
  status: string
  createdAt: any
  updatedAt: any
  [key: string]: any // Allow additional properties
}

export const subscribeToUserAppointments = (userId: string, callback: (appointments: AppointmentData[]) => void) => {
  log("Setting up user appointments subscription", { userId })

  // First, try to get data immediately
  const getUserAppointments = async () => {
    try {
      const q = query(collection(db, "appointments"), where("userId", "==", userId))
      const snapshot = await getDocs(q)
      const appointments: AppointmentData[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as AppointmentData,
      )
      log("Initial user appointments loaded", { count: appointments.length })
      callback(appointments)
    } catch (error) {
      log("Error getting initial user appointments", error)
    }
  }

  // Get initial data
  getUserAppointments()

  // Set up real-time listener
  const q = query(collection(db, "appointments"), where("userId", "==", userId))

  return onSnapshot(
    q,
    (snapshot) => {
      log("User appointments snapshot received", { size: snapshot.size })
      const appointments: AppointmentData[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
        } as AppointmentData
      })

      // Sort by creation date (newest first)
      appointments.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          try {
            return b.createdAt.toDate() - a.createdAt.toDate()
          } catch {
            return 0
          }
        }
        return 0
      })

      log("Processed user appointments", { count: appointments.length })
      callback(appointments)
    },
    (error) => {
      log("Error in user appointments listener", error)
      callback([])
    },
  )
}

export const subscribeToUserHelpRequests = (userId: string, callback: (helpRequests: HelpRequestData[]) => void) => {
  log("Setting up user help requests subscription", { userId })

  // First, try to get data immediately
  const getUserHelpRequests = async () => {
    try {
      const q = query(collection(db, "helpRequests"), where("userId", "==", userId))
      const snapshot = await getDocs(q)
      const helpRequests: HelpRequestData[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as HelpRequestData,
      )
      log("Initial user help requests loaded", { count: helpRequests.length })
      callback(helpRequests)
    } catch (error) {
      log("Error getting initial user help requests", error)
    }
  }

  // Get initial data
  getUserHelpRequests()

  // Set up real-time listener
  const q = query(collection(db, "helpRequests"), where("userId", "==", userId))

  return onSnapshot(
    q,
    (snapshot) => {
      log("User help requests snapshot received", { size: snapshot.size })
      const helpRequests: HelpRequestData[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
        } as HelpRequestData
      })

      // Sort by creation date (newest first)
      helpRequests.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          try {
            return b.createdAt.toDate() - a.createdAt.toDate()
          } catch {
            return 0
          }
        }
        return 0
      })

      log("Processed user help requests", { count: helpRequests.length })
      callback(helpRequests)
    },
    (error) => {
      log("Error in user help requests listener", error)
      callback([])
    },
  )
}

export const subscribeToAllAppointments = (callback: (appointments: AppointmentData[]) => void) => {
  log("Setting up admin appointments subscription")

  // First, try to get data immediately
  const getAllAppointments = async () => {
    try {
      const snapshot = await getDocs(collection(db, "appointments"))
      const appointments: AppointmentData[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as AppointmentData,
      )
      log("Initial admin appointments loaded", { count: appointments.length })
      callback(appointments)
    } catch (error) {
      log("Error getting initial admin appointments", error)
    }
  }

  // Get initial data
  getAllAppointments()

  // Set up real-time listener
  return onSnapshot(
    collection(db, "appointments"),
    (snapshot) => {
      log("Admin appointments snapshot received", { size: snapshot.size })
      const appointments: AppointmentData[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        log("Appointment document", { id: doc.id, data })
        return {
          id: doc.id,
          ...data,
        } as AppointmentData
      })

      // Sort by creation date (newest first)
      appointments.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          try {
            return b.createdAt.toDate() - a.createdAt.toDate()
          } catch {
            return 0
          }
        }
        return 0
      })

      log("Processed admin appointments", { count: appointments.length })
      callback(appointments)
    },
    (error) => {
      log("Error in admin appointments listener", error)
      callback([])
    },
  )
}

export const subscribeToAllHelpRequests = (callback: (helpRequests: HelpRequestData[]) => void) => {
  log("Setting up admin help requests subscription")

  // First, try to get data immediately
  const getAllHelpRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "helpRequests"))
      const helpRequests: HelpRequestData[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as HelpRequestData,
      )
      log("Initial admin help requests loaded", { count: helpRequests.length })
      callback(helpRequests)
    } catch (error) {
      log("Error getting initial admin help requests", error)
    }
  }

  // Get initial data
  getAllHelpRequests()

  // Set up real-time listener
  return onSnapshot(
    collection(db, "helpRequests"),
    (snapshot) => {
      log("Admin help requests snapshot received", { size: snapshot.size })
      const helpRequests: HelpRequestData[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        log("Help request document", { id: doc.id, data })
        return {
          id: doc.id,
          ...data,
        } as HelpRequestData
      })

      // Sort by creation date (newest first)
      helpRequests.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          try {
            return b.createdAt.toDate() - a.createdAt.toDate()
          } catch {
            return 0
          }
        }
        return 0
      })

      log("Processed admin help requests", { count: helpRequests.length })
      callback(helpRequests)
    },
    (error) => {
      log("Error in admin help requests listener", error)
      callback([])
    },
  )
}

// Debug function to check Firebase connection
export const testFirebaseConnection = async () => {
  try {
    log("Testing Firebase connection...")

    // Test appointments collection
    const appointmentsSnapshot = await getDocs(collection(db, "appointments"))
    log("Appointments collection test", { size: appointmentsSnapshot.size })

    // Test help requests collection
    const helpRequestsSnapshot = await getDocs(collection(db, "helpRequests"))
    log("Help requests collection test", { size: helpRequestsSnapshot.size })

    // Test users collection
    const usersSnapshot = await getDocs(collection(db, "users"))
    log("Users collection test", { size: usersSnapshot.size })

    return {
      appointments: appointmentsSnapshot.size,
      helpRequests: helpRequestsSnapshot.size,
      users: usersSnapshot.size,
    }
  } catch (error) {
    log("Firebase connection test failed", error)
    throw error
  }
}


// import { onSnapshot, collection, query, where, getDocs } from "firebase/firestore"
// import { db } from "./firebase"

// // Enhanced logging for debugging
// const log = (message: string, data?: any) => {
//   console.log(`🔥 Firebase: ${message}`, data || "")
// }

// export const subscribeToUserAppointments = (userId: string, callback: (appointments: any[]) => void) => {
//   log("Setting up user appointments subscription", { userId })

//   // First, try to get data immediately
//   const getUserAppointments = async () => {
//     try {
//       const q = query(collection(db, "appointments"), where("userId", "==", userId))
//       const snapshot = await getDocs(q)
//       const appointments = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       log("Initial user appointments loaded", { count: appointments.length })
//       callback(appointments)
//     } catch (error) {
//       log("Error getting initial user appointments", error)
//     }
//   }

//   // Get initial data
//   getUserAppointments()

//   // Set up real-time listener
//   const q = query(collection(db, "appointments"), where("userId", "==", userId))

//   return onSnapshot(
//     q,
//     (snapshot) => {
//       log("User appointments snapshot received", { size: snapshot.size })
//       const appointments = snapshot.docs.map((doc) => {
//         const data = doc.data()
//         return {
//           id: doc.id,
//           ...data,
//         }
//       })

//       // Sort by creation date (newest first)
//       appointments.sort((a, b) => {
//         if (a.createdAt && b.createdAt) {
//           try {
//             return b.createdAt.toDate() - a.createdAt.toDate()
//           } catch {
//             return 0
//           }
//         }
//         return 0
//       })

//       log("Processed user appointments", { count: appointments.length })
//       callback(appointments)
//     },
//     (error) => {
//       log("Error in user appointments listener", error)
//       callback([])
//     },
//   )
// }

// export const subscribeToUserHelpRequests = (userId: string, callback: (helpRequests: any[]) => void) => {
//   log("Setting up user help requests subscription", { userId })

//   // First, try to get data immediately
//   const getUserHelpRequests = async () => {
//     try {
//       const q = query(collection(db, "helpRequests"), where("userId", "==", userId))
//       const snapshot = await getDocs(q)
//       const helpRequests = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       log("Initial user help requests loaded", { count: helpRequests.length })
//       callback(helpRequests)
//     } catch (error) {
//       log("Error getting initial user help requests", error)
//     }
//   }

//   // Get initial data
//   getUserHelpRequests()

//   // Set up real-time listener
//   const q = query(collection(db, "helpRequests"), where("userId", "==", userId))

//   return onSnapshot(
//     q,
//     (snapshot) => {
//       log("User help requests snapshot received", { size: snapshot.size })
//       const helpRequests = snapshot.docs.map((doc) => {
//         const data = doc.data()
//         return {
//           id: doc.id,
//           ...data,
//         }
//       })

//       // Sort by creation date (newest first)
//       helpRequests.sort((a, b) => {
//         if (a.createdAt && b.createdAt) {
//           try {
//             return b.createdAt.toDate() - a.createdAt.toDate()
//           } catch {
//             return 0
//           }
//         }
//         return 0
//       })

//       log("Processed user help requests", { count: helpRequests.length })
//       callback(helpRequests)
//     },
//     (error) => {
//       log("Error in user help requests listener", error)
//       callback([])
//     },
//   )
// }

// export const subscribeToAllAppointments = (callback: (appointments: any[]) => void) => {
//   log("Setting up admin appointments subscription")

//   // First, try to get data immediately
//   const getAllAppointments = async () => {
//     try {
//       const snapshot = await getDocs(collection(db, "appointments"))
//       const appointments = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       log("Initial admin appointments loaded", { count: appointments.length })
//       callback(appointments)
//     } catch (error) {
//       log("Error getting initial admin appointments", error)
//     }
//   }

//   // Get initial data
//   getAllAppointments()

//   // Set up real-time listener
//   return onSnapshot(
//     collection(db, "appointments"),
//     (snapshot) => {
//       log("Admin appointments snapshot received", { size: snapshot.size })
//       const appointments = snapshot.docs.map((doc) => {
//         const data = doc.data()
//         log("Appointment document", { id: doc.id, data })
//         return {
//           id: doc.id,
//           ...data,
//         }
//       })

//       // Sort by creation date (newest first)
//       appointments.sort((a, b) => {
//         if (a.createdAt && b.createdAt) {
//           try {
//             return b.createdAt.toDate() - a.createdAt.toDate()
//           } catch {
//             return 0
//           }
//         }
//         return 0
//       })

//       log("Processed admin appointments", { count: appointments.length })
//       callback(appointments)
//     },
//     (error) => {
//       log("Error in admin appointments listener", error)
//       callback([])
//     },
//   )
// }

// export const subscribeToAllHelpRequests = (callback: (helpRequests: any[]) => void) => {
//   log("Setting up admin help requests subscription")

//   // First, try to get data immediately
//   const getAllHelpRequests = async () => {
//     try {
//       const snapshot = await getDocs(collection(db, "helpRequests"))
//       const helpRequests = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       log("Initial admin help requests loaded", { count: helpRequests.length })
//       callback(helpRequests)
//     } catch (error) {
//       log("Error getting initial admin help requests", error)
//     }
//   }

//   // Get initial data
//   getAllHelpRequests()

//   // Set up real-time listener
//   return onSnapshot(
//     collection(db, "helpRequests"),
//     (snapshot) => {
//       log("Admin help requests snapshot received", { size: snapshot.size })
//       const helpRequests = snapshot.docs.map((doc) => {
//         const data = doc.data()
//         log("Help request document", { id: doc.id, data })
//         return {
//           id: doc.id,
//           ...data,
//         }
//       })

//       // Sort by creation date (newest first)
//       helpRequests.sort((a, b) => {
//         if (a.createdAt && b.createdAt) {
//           try {
//             return b.createdAt.toDate() - a.createdAt.toDate()
//           } catch {
//             return 0
//           }
//         }
//         return 0
//       })

//       log("Processed admin help requests", { count: helpRequests.length })
//       callback(helpRequests)
//     },
//     (error) => {
//       log("Error in admin help requests listener", error)
//       callback([])
//     },
//   )
// }

// // Debug function to check Firebase connection
// export const testFirebaseConnection = async () => {
//   try {
//     log("Testing Firebase connection...")

//     // Test appointments collection
//     const appointmentsSnapshot = await getDocs(collection(db, "appointments"))
//     log("Appointments collection test", { size: appointmentsSnapshot.size })

//     // Test help requests collection
//     const helpRequestsSnapshot = await getDocs(collection(db, "helpRequests"))
//     log("Help requests collection test", { size: helpRequestsSnapshot.size })

//     // Test users collection
//     const usersSnapshot = await getDocs(collection(db, "users"))
//     log("Users collection test", { size: usersSnapshot.size })

//     return {
//       appointments: appointmentsSnapshot.size,
//       helpRequests: helpRequestsSnapshot.size,
//       users: usersSnapshot.size,
//     }
//   } catch (error) {
//     log("Firebase connection test failed", error)
//     throw error
//   }
// }
