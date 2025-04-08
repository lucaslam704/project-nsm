# Firebase Setup Guide for NSM Project

This guide will help you set up Firebase for your NSM project to enable authentication, database, and storage features.

## Step 1: Firebase Console Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "notsocialmedia-9bdb8" or create a new project if needed
3. Make sure you have enabled the following services:
   - Authentication
   - Firestore Database
   - Storage

## Step 2: Update Firebase Security Rules

### Firestore Rules

1. In the Firebase Console, go to Firestore Database
2. Click on the "Rules" tab
3. Replace the existing rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all posts for authenticated users
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read and write their own user data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click "Publish"

### Storage Rules

1. In the Firebase Console, go to Storage
2. Click on the "Rules" tab
3. Replace the existing rules with the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files for authenticated users
    match /status-images/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule - deny access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click "Publish"

## Step 3: Verify Environment Variables

Make sure your `.env.local` file has the correct Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAKY_XTa3iFVOu_9LwHnHW6BMxzAMb7Stw"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="notsocialmedia-9bdb8.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="notsocialmedia-9bdb8"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="notsocialmedia-9bdb8.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="161230721332"
NEXT_PUBLIC_FIREBASE_APP_ID="1:161230721332:web:f39fb943f441ca71be9561"
```

## Step 4: Restart Your Development Server

After making these changes, restart your development server:

```
npm run dev
```

## Troubleshooting

If you're still experiencing issues:

1. **Check the browser console** for specific error messages
2. **Verify authentication** - Make sure you're logged in before trying to post
3. **Check Firebase quotas** - Make sure you haven't exceeded your free tier limits
4. **Verify network connectivity** - Make sure your app can connect to Firebase services
5. **Check CORS settings** - If you're getting CORS errors, you may need to configure CORS in Firebase

## Common Errors and Solutions

### "Permission Denied" Errors
- This usually means your security rules are too restrictive
- Make sure you've updated both Firestore and Storage rules
- Verify that you're properly authenticated

### "Firebase App Already Exists" Error
- This can happen if you're initializing Firebase multiple times
- Make sure you're only initializing Firebase once in your application

### "Storage Bucket Not Found" Error
- Verify your storage bucket name in the `.env.local` file
- The correct format is usually `[PROJECT_ID].appspot.com`

### "Invalid Credentials" Error
- Double-check your Firebase API keys and credentials
- Make sure you've enabled the necessary services in the Firebase Console
