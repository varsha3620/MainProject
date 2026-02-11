# Setup Guide for AI Interview App - Job Recommendation Feature

## Prerequisites
- Node.js 18+ installed
- A Firebase project set up
- Google Gemini API key

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
The Firebase credentials are already configured in `lib/firebase.ts`. Verify:
- ✅ API Key
- ✅ Auth Domain
- ✅ Project ID
- ✅ Storage Bucket
- ✅ Messaging Sender ID
- ✅ App ID

If you need to update, edit `lib/firebase.ts` with your Firebase project credentials.

### 3. Firestore Setup
In Firebase Console:

1. **Create Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Start with these security rules:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userProfiles/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId || request.auth.uid == request.auth.uid;
    }
  }
}
```

2. **Create Collection** (optional - auto-created on first write)
   - Collection: `userProfiles`
   - This will be created automatically when a user saves their profile

### 4. Google Gemini API Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Click "Get API Key"
   - Create a new API key in Google Cloud Console
   - Copy the API key

2. **Add to Environment**
   - Create `.env.local` file in project root:
   ```env
   NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
   ```
   - Replace `your_api_key_here` with your actual API key

3. **Verify API is Enabled**
   - Go to Google Cloud Console
   - Enable "Google Generative AI API"

### 5. Run the Application

**Development Mode:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Production Build:**
```bash
npm run build
npm start
```

## Testing the Features

### Test User Flow

1. **Create Account**
   - Go to `/signin`
   - Create a new account with email and password

2. **Complete Profile**
   - You'll be redirected to `/profile`
   - Fill in all required fields:
     - Full Name
     - Phone (optional)
     - Experience Level
     - Skills (comma-separated)
     - Professional Summary
     - Job Preferences (optional)
   - Click "Save Profile"

3. **View Recommendations**
   - Dashboard will load recommended jobs
   - Each job shows:
     - Match score
     - Company and location
     - Salary range
     - Why it's a match

4. **Practice Interviews**
   - Click "Practice" on any job
   - Or use "Practice Interviews" section

### Test Different Scenarios

**Scenario 1: IT Professional**
- Skills: JavaScript, React, Node.js, MongoDB
- Experience: 3-5 years
- Summary: Full-stack developer
- Expected: Frontend/Backend Developer roles

**Scenario 2: Marketing Professional**
- Skills: Marketing, Social Media, Content Creation, Analytics
- Experience: 1-3 years
- Summary: Marketing specialist
- Expected: Digital Marketing Manager, Content Writer

**Scenario 3: Finance Professional**
- Skills: Accounting, Excel, Financial Analysis, Tax
- Experience: 5-10 years
- Summary: Accounting professional
- Expected: Accounting Manager, Financial Analyst

## Troubleshooting

### Issue: "No matches found"
**Solutions:**
1. Check that all required profile fields are filled
2. Verify Google Gemini API key is correctly set
3. Check browser console for error messages
4. Ensure Firestore rules allow read/write

### Issue: "Failed to save profile"
**Solutions:**
1. Check Firestore database is created
2. Verify Firebase rules:
   ```rules
   allow write: if request.auth != null;
   ```
3. Check user is authenticated
4. Check browser console for specific error

### Issue: "AI API Error"
**Solutions:**
1. Verify API key is correct in `.env.local`
2. Check Google Cloud Console quota
3. Ensure "Google Generative AI API" is enabled
4. Check API key has necessary permissions
5. Try the fallback basic matching (auto-enabled if AI fails)

### Issue: "Profile not loading"
**Solutions:**
1. Check Firebase authentication
2. Verify Firestore collection name is `userProfiles`
3. Check that user data is saved correctly:
   - Go to Firebase Console
   - Firestore Database
   - Check `userProfiles` collection
   - Verify document exists with correct user ID

## Firebase Security Rules

For production, update Firestore Rules in Firebase Console:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - only owner can read/write
    match /userProfiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Interview records - only owner can read/write
    match /interviews/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## File Storage (Resume Upload)

Currently, resume filenames are stored in Firestore but files aren't uploaded to Firebase Storage.

To implement actual file storage:

1. **Enable Storage**
   - Firebase Console → Storage
   - Create a new storage bucket

2. **Update Security Rules**
   ```rules
   service firebase.storage {
     match /b/{bucket}/o {
       match /resumes/{userId}/{allPaths=**} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

3. **Update Profile Page**
   - Import `ref, uploadBytes` from `firebase/storage`
   - Add upload logic before saving profile

## API Endpoints (Future)

For API integration, consider creating Next.js API routes:

```
/api/profiles/[userId]
/api/jobs/recommendations
/api/interviews/[interviewId]
```

See Next.js App Router documentation for creating these.

## Monitoring & Debugging

### Enable Debug Logging
In `lib/firebase.ts`, add:
```typescript
enableLogging(true); // For Authentication debugging
```

### Monitor Firestore Reads
- Firebase Console → Firestore → Usage tab
- Track daily read/write operations

### Check Job Recommendation Logs
- Browser Console → Network tab
- Monitor API calls to Google Generative AI
- Check response times and errors

## Deployment Checklist

- [ ] Set environment variables in deployment platform
- [ ] Test all user flows in production
- [ ] Verify Firebase rules are secure
- [ ] Set up monitoring/logging
- [ ] Test with real Google Gemini API quota limits
- [ ] Backup Firestore data
- [ ] Set up automated backups
- [ ] Create admin dashboard for managing jobs
- [ ] Add user support/feedback mechanism

## Performance Optimization

1. **Caching**: Consider caching recommendations for 24 hours
2. **Batch Processing**: Process job recommendations in background
3. **Database Indexing**: Create Firestore indexes for faster queries
4. **CDN**: Deploy to edge locations for faster response

## Next Steps

1. Test thoroughly with multiple user profiles
2. Add job application tracking
3. Implement resume parsing from PDF
4. Create admin dashboard to manage jobs
5. Add email notifications for new matches
6. Implement skill assessments
7. Add interview scheduling

---

**Need Help?**
- Check browser console for detailed error messages
- Review Firebase Console for data and security issues
- Test API responses using Postman or browser DevTools
