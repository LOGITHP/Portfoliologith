# Premium Glassmorphism Portfolio & Dashboard

A beautiful, interactive portfolio website featuring glassmorphism design, custom layout customization via drag-and-drop, theme configurations, and a live administration dashboard powered by Firebase Realtime Database and Firebase Authentication.


## 🛠️ Getting Started & Installation

### Prerequisites
Make sure you have **Node.js** (v18 or higher) installed on your system.

### 1. Clone & Install Dependencies
Navigate into your project folder and run:
```bash
npm install
```

### 2. Run Locally in Development Mode
To boot up the Vite local dev server:
```bash
npm run dev
```
Open your browser and visit: `http://localhost:5173`.

### 3. Build for Production
To bundle the files for web hosting:
```bash
npm run build
```
This builds static assets into the `/dist` directory.

---

## 🔥 Firebase Setup Guide

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and give it a name (e.g. `my-portfolio`).
3. (Optional) Enable/disable Google Analytics according to your preference and click **Create Project**.

### Step 2: Register a Web Application
1. Inside your project overview panel, click on the **Web (`</>`)** icon to add a web application.
2. Register the app with a nickname.
3. Firebase will show a `firebaseConfig` credentials script containing keys.
4. Open [src/firebase.js](file:///src/firebase.js) in your codebase and update the `firebaseConfig` configuration object with your keys:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Step 3: Enable Firebase Authentication
This project uses Firebase Authentication for secure admin edits.
1. In the Firebase Console left-sidebar, expand the **Build** menu and click **Authentication**.
2. Click **Get Started** and navigate to the **Sign-in method** tab.
3. Select and enable the **Email/Password** provider, then save changes.
4. Go to the **Users** tab, click **Add User**, and create the administrator user account:
   - **Email:** The administrator email (e.g. `admin@yourdomain.com`).
   - **Password:** A strong administrative password.
5. Save the user. These credentials will be used on your portfolio site to log in.

> [!NOTE]  
> The login screen is accessed on your site by clicking the top-left logo inside the navigation bar **5 times**.

### Step 4: Setup Firebase Realtime Database
The dynamic content, theme, and layout ordering are loaded from and stored in the Realtime Database.
1. Under **Build** in the left-sidebar, select **Realtime Database**.
2. Click **Create Database**, select a region closest to your traffic (e.g., `asia-southeast1` or `us-central1`), and proceed.
3. Choose **Start in locked mode** and click **Enable**.
4. Go to the **Rules** tab, replace the existing rules with the contents of your `database.rules.json` file, and click **Publish**:
   ```json
   {
     "rules": {
       ".read": "true",
       ".write": "auth != null"
     }
   }
   ```
   *Explanation: Anyone can read/view your portfolio content (`.read: true`), but only authenticated admin users can modify/save it (`.write: auth != null`).*

---

## 🚀 Deployment Guide (Firebase Hosting)

Deploy the portfolio directly to the web using the official Firebase Hosting.

> [!WARNING]  
> **Crucial configuration for Vite + React projects:**  
> When deploying to Firebase Hosting, you must set the public directory to `dist` (since Vite bundles the final production assets into `/dist`), **NOT** `public`. 
> - If you run `firebase init` manually, select `dist` when asked for your public directory.
> - The included [firebase.json](file:///firebase.json) file already has `"public": "dist"` pre-configured.

### 1. Install Firebase CLI
Install the Firebase command-line tools globally on your terminal:
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
Authenticate the CLI tool with your Google account:
```bash
firebase login
```

### 3. Link your Firebase Project
Since the project configuration files ([firebase.json](file:///firebase.json) and [.firebaserc](file:///.firebaserc)) are already provided, you just need to point Firebase to your project:
```bash
firebase use --add
```
Choose your Firebase project ID from the list, and when prompted for an alias, enter `default` (to overwrite or set it as the default target).

Alternatively, you can switch directly by running:
```bash
firebase use YOUR_PROJECT_ID
```

### 4. Build and Deploy
Run the Vite build script first to generate the production bundle, then deploy using the Firebase CLI:
```bash
npm run build
firebase deploy
```
Once completed, Firebase will print the live URL of your portfolio website (e.g. `https://your-project.web.app`).

