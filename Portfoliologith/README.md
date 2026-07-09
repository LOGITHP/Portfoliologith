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

### Step 5: Realtime Database Schema & Data Structure
The application structure is dynamic. The database uses two types of nodes: a configuration object (`content/`) and root-level collections for list-based items (like projects, achievements, etc.).

Below is the complete database schema layout if you want to initialize or inspect the data structure:

```json
{
  "content": {
    "hero": {
      "name": "Your Name",
      "slogan": "Creative Developer & IoT Specialist",
      "photoUrl": "https://example.com/profile.jpg",
      "logoUrl": "https://example.com/logo.png",
      "siteTitle": "My Portfolio",
      "isVisible": true
    },
    "about": {
      "text": "Write something about yourself here...",
      "isVisible": true
    },
    "education": {
      "description": "Details about your degrees, majors, and GPA.",
      "isVisible": true
    },
    "resume": {
      "description": "Details or Google Drive download link for your Resume.",
      "isVisible": true
    },
    "skills": {
      "text": "Detail your skill set, languages, and technologies.",
      "isVisible": true
    },
    "contact": {
      "email": "your.email@example.com",
      "phone": "+1234567890",
      "github": "https://github.com/yourusername",
      "linkedin": "https://linkedin.com/in/yourusername",
      "location": "Your City, Country",
      "isVisible": true
    },
    "settings": {
      "theme": "default",
      "background": "default",
      "customBackgroundUrl": "",
      "layout": [
        { "id": "about", "title": "About Me", "width": "half" },
        { "id": "resume", "title": "Resume", "width": "half" },
        { "id": "education", "title": "Education & Academic Performance", "width": "half" },
        { "id": "skills", "title": "Skill Set", "width": "half" },
        { "id": "achievements", "title": "Achievements", "width": "half" },
        { "id": "patents", "title": "Patents", "width": "half" },
        { "id": "projects", "title": "Projects", "width": "half" },
        { "id": "interests", "title": "Interests & Learning", "width": "full" },
        { "id": "participations", "title": "Participations & Details", "width": "full" },
        { "id": "contact", "title": "Contact Me", "width": "full" }
      ]
    },
    "titles": {
      "about": "About Me",
      "resume": "Resume",
      "education": "Education & Academic Performance",
      "skills": "Skill Set",
      "achievements": "Achievements",
      "patents": "Patents",
      "projects": "Projects",
      "interests": "Interests & Learning",
      "participations": "Participations & Details",
      "contact": "Contact Me"
    },
    "visibility": {
      "achievements": true,
      "patents": true,
      "projects": true,
      "interests": true,
      "participations": true
    }
  },
  "projects": {
    "unique_project_id_1": {
      "title": "Project Title",
      "description": "Project description and technical details.",
      "link": "https://github.com/example/project",
      "screenshotUrl": "https://example.com/screenshot.jpg"
    }
  },
  "achievements": {
    "unique_achievement_id_1": {
      "title": "Certification / Honor Name",
      "description": "Achievement details and context.",
      "imageUrl": "https://example.com/certificate.jpg"
    }
  },
  "patents": {
    "unique_patent_id_1": {
      "title": "Patent Title / Application",
      "description": "Patent numbers and specifications.",
      "imageUrl": "https://example.com/patent-doc.jpg"
    }
  },
  "participations": {
    "unique_participation_id_1": {
      "title": "Hackathon / Workshop Name",
      "description": "Details of role and experience.",
      "imageUrl": "https://example.com/participation-photo.jpg"
    }
  }
}
```

> [!NOTE]  
> - **Collection Nodes (`projects`, `achievements`, `patents`, `participations`)**: These list items are stored directly at the root level using unique push IDs generated by Firebase Realtime Database.
> - **Image URLs**: For fields supporting `imageUrl` and `screenshotUrl`, you can provide multiple URLs separated by commas. Google Drive sharing links are automatically detected and converted by the app's link converter helper.

---

## 🚀 Deployment Guide (Firebase Hosting)

Deploy the portfolio directly to the web using the official Firebase Hosting.

> [!WARNING]  
> **Crucial configuration for Vite + React projects:**  
> When deploying to Firebase Hosting, you must set the public directory to `dist` (since Vite bundles the final production assets into `/dist`), **NOT** `public`. 
> - **Do I need to copy files manually?** **No!** You do **not** need to manually copy or replace any files from `/dist` to `/public`. The configuration in [firebase.json](file:///firebase.json) tells the Firebase CLI to upload directly from the `/dist` folder.
> - The included [firebase.json](file:///firebase.json) file already has `"public": "dist"` pre-configured, meaning `firebase deploy` will automatically upload everything inside `/dist` for you.

> [!TIP]
> **Still seeing the default "Firebase Hosting Setup Complete" welcome page?**  
> This is a common issue caused by aggressive **browser caching** or **Firebase CDN caching** of the initial placeholder index page. 
> 1. Try opening your URL in **Incognito / Private Window**.
> 2. Force-reload the page to bypass cache: press **Ctrl + F5** (Windows/Linux) or **Cmd + Shift + R** (Mac).
> 3. In the Chrome DevTools Network tab, check the **Disable cache** checkbox and reload the page.

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

