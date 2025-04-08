# Firestore Database Setup Guide for NSM Project

This guide will help you set up Firestore Database for your NSM project to enable storing post data.

## Step 1: Enable Firestore Database in Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "notsocialmedia-9bdb8"
3. In the left sidebar, click on "Firestore Database"
4. Click "Create database"
5. Choose "Start in test mode" for now (we'll update the security rules later)
6. Choose a location that's closest to your users (e.g., "us-central")
7. Click "Enable"

## Step 2: Update Firestore Security Rules

1. In the Firestore Database section, click on the "Rules" tab
2. Replace the existing rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all posts for authenticated users
    match /posts/{postId} {
      allow read: if true;  // Allow anyone to read posts
      allow create: if request.auth != null;  // Only authenticated users can create posts
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;  // Only post owners can update/delete
    }
    
    // Allow users to read and write their own user data
    match /users/{userId} {
      allow read: if true;  // Allow anyone to read user profiles
      allow write: if request.auth != null && request.auth.uid == userId;  // Only users can write their own data
    }
  }
}
```

3. Click "Publish"

## Step 3: Create the Posts Collection

You don't need to manually create the collection - it will be created automatically when the first document is added. However, it's good to understand the structure:

### Posts Collection Structure

Each document in the "posts" collection will have the following fields:

- `userId`: The ID of the user who created the post
- `username`: The display name of the user
- `text`: The caption/text of the post
- `imageUrl`: The data URL of the image (in our implementation)
- `localPath`: A reference to where the image would be stored locally
- `createdAt`: Timestamp when the post was created

## Step 4: Testing Your Setup

After setting up Firestore:

1. Restart your development server
2. Log in to your application
3. Try creating a new post with an image and caption
4. Check the Firestore Database in the Firebase Console to see if the document was created

## Troubleshooting

If you're still experiencing issues:

1. **Check the browser console** for specific error messages
2. **Verify authentication** - Make sure you're logged in before trying to post
3. **Check Firestore rules** - Make sure your rules allow the operations you're trying to perform
4. **Check network connectivity** - Make sure your app can connect to Firebase services

## Common Errors and Solutions

### "Permission Denied" Errors
- This usually means your security rules are too restrictive
- Make sure you've updated the Firestore rules as shown above
- Verify that you're properly authenticated when creating posts

### "Missing or Insufficient Permissions" Error
- This typically means your security rules don't allow the operation
- Check that your rules match the ones provided above
- Make sure you're authenticated when creating posts

### "Document Too Large" Error
- This can happen if your image data URL is very large
- Consider compressing images before uploading
- In a production app, you would use Firebase Storage instead of data URLs
