# Saylani Appointment Booking System Hackathon Project

A modern, real-time appointment booking and help request management system built with Next.js, Firebase, and TypeScript. This system provides a seamless experience for users to book appointments and request help, while giving administrators powerful tools to manage all requests in real-time.

## Features

### User Features

- **User Authentication**: Secure signup/login with Firebase Auth
- **Profile Management**: Update personal information and contact details
- **Appointment Booking**: Schedule appointments with detailed information
- **Help Requests**: Submit various types of help requests with urgency levels
- **Real-time Updates**: Live status updates for all bookings and requests
- **My Bookings**: Track all appointments and help requests with filtering
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Bottom Navigation**: Easy navigation with intuitive bottom tab bar


### ️ Admin Features

- **Admin Dashboard**: Comprehensive overview with real-time statistics
- **Request Management**: Approve/reject appointments and help requests
- **Real-time Monitoring**: Live updates of all user activities
- **Status Tracking**: Monitor pending, approved, and rejected requests
- **User Information**: Access complete user details and contact information
- **Bulk Operations**: Efficient management of multiple requests
- **Connection Status**: Real-time Firebase connection monitoring


### Technical Features

- **Real-time Database**: Firebase Firestore for instant data synchronization
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication**: Secure Firebase Authentication
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Smooth loading animations and states
- **Toast Notifications**: Real-time feedback for user actions
- **Debug Tools**: Built-in Firebase connection testing and debugging


## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Deployment**: Vercel-ready


## Screenshots

### User Interface

- **Login/Signup**: Secure authentication with validation
- **Home Dashboard**: Overview of user statistics and quick actions
- **Appointment Booking**: Detailed form for scheduling appointments
- **Help Requests**: Submit various types of help requests
- **My Bookings**: Track all requests with real-time status updates


### Admin Interface

- **Admin Dashboard**: Real-time statistics and management tools
- **Request Management**: Approve/reject requests with detailed information
- **Live Updates**: Real-time monitoring of all user activities


## ️ Installation

1. **Clone the repository**

```shellscript
git clone https://github.com/Tahasaif3/web-dev-hackathon
cd web-dev-hackathon
```


2. **Install dependencies**

```shellscript
npm install
```


3. **Set up Firebase**

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your Firebase configuration



4. **Environment Variables**
Create a `.env.local` file in the root directory:

```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```


5. **Run the development server**

```shellscript
npm run dev
```


6. **Open your browser**
Navigate to `http://localhost:3000`


## Configuration

### Firebase Setup

1. **Authentication**: Enable Email/Password authentication
2. **Firestore**: Create database in test mode (for development)
3. **Security Rules**: Configure Firestore security rules for production


### Demo Credentials

- **User Account**:

- Email: `Enter your gmail`
- Password: `Enter your password`



- **Admin Account**:

- Username: `admin`
- Password: `admin123`





## Database Structure

### Collections

#### `users`

```javascript
{
  name: string,
  email: string,
  phone: string,
  createdAt: timestamp,
  totalAppointments: number,
  totalHelpRequests: number
}
```

#### `appointments`

```javascript
{
  userId: string,
  bookerName: string,
  bookerPhone: string,
  bookerEmail: string,
  appointeeName: string,
  appointeePhone: string,
  appointeeEmail: string,
  relationship: string,
  reason: string,
  department: string,
  preferredDate: string,
  preferredTime: string,
  additionalNotes: string,
  status: "Pending" | "Approved" | "Rejected",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `helpRequests`

```javascript
{
  userId: string,
  name: string,
  phone: string,
  email: string,
  helpType: string,
  urgencyLevel: "Low" | "Medium" | "High" | "Emergency",
  description: string,
  contactPreference: string,
  additionalContact: string,
  status: "Pending" | "Approved" | "Rejected",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Usage

### For Users

1. **Sign Up**: Create an account with email and password
2. **Book Appointment**: Fill out the appointment form with required details
3. **Request Help**: Submit help requests with urgency levels
4. **Track Status**: Monitor your requests in the "My Bookings" section
5. **Update Profile**: Keep your contact information up to date


### For Administrators

1. **Login**: Use admin credentials to access the dashboard
2. **Monitor Requests**: View all appointments and help requests in real-time
3. **Manage Status**: Approve or reject requests with one click
4. **View Statistics**: Monitor system usage and pending requests
5. **Debug Tools**: Use built-in tools to test Firebase connectivity


## Key Features Explained

### Real-time Updates

- Uses Firebase Firestore's `onSnapshot` for live data synchronization
- Automatic UI updates when data changes
- Connection status monitoring


### Type Safety

- Full TypeScript implementation
- Proper interfaces for all data structures
- Type-safe Firebase operations


### Mobile-First Design

- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Bottom navigation for easy mobile access


### Error Handling

- Comprehensive error handling for all operations
- User-friendly error messages
- Automatic retry mechanisms


## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically


### Other Platforms

The app can be deployed to any platform that supports Next.js applications.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Lucide](https://lucide.dev/) for icons


## Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

---

**Built with ❤️ for Saylani Welfare Trust**
