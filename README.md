# Reddit Clone

A simple Reddit-style social app built with React and Firebase. Step 3 is optional.

---

## Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/your-username/reddit-clone.git
cd reddit-clone/reddit-clone
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Set up Firebase** (Optional!!!!!, if you want to use the included Firebase project for testing, you can skip the above and just run the app)

**However, for your own app or production use, you should create your own Firebase project:**


- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Authentication** (Email/Password).
- Enable **Cloud Firestore**.
- Copy your Firebase config and add it to a `.env` file in the root of `reddit-clone/reddit-clone`:

  ```
  REACT_APP_FIREBASE_API_KEY=your_api_key
  REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
  REACT_APP_FIREBASE_PROJECT_ID=your_project_id
  REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
  REACT_APP_FIREBASE_APP_ID=your_app_id
  ```

- Set your Firestore rules to allow authenticated users:

  ```js
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

### 4. **Run the app**

```bash
npm start
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

- User registration and login (with random username#tag that can be updated and must be unique)
- Session management and user authentication through firebase
- Create, upvote, downvote, and delete posts (along with ordering based on score -> total upvotes -> newest)
- Edit your username and tag (updates all your posts/comments)
- Real-time updates for posts and comments
- Secure authentication state across page reloads and browser sessions


- To be added: Add comments to posts and work on design

---

## Project Structure

- `src/components/` — React components (Navbar, PostForm, PostFeed, Auth, etc.)
- `src/pages/` — Page components (Home)
- `src/firebase.js` — Firebase config and initialization

---

## Scripts

- `npm start` — Run the app in development mode
- `npm run build` — Build for production
- `npm test` — Run tests
