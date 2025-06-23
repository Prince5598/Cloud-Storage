# 📁 Cloud-Storage — A File Storage App

Cloud-Storage is a modern, full-stack file-Storage built with **Next.js**, **Clerk authentication**, **Neon DB**, **Drizzle ORM**, and **ImageKit** for file uploads. It allows users to securely upload, organize, preview, and download their files and folders with rich features like starring, trash management, and more.

---

## ✨ Features

- 🔐 **Authentication**: Secure user login/signup with [Clerk.dev](https://clerk.dev)
- 📤 **File Upload**:
  - Upload **images and documents** up to **5MB**
  - Supported extensions: `All image extension`, `.PDF`, `.DOC`, `.DOCX`, `.XLS`, `.XLSX`, `.TXT`.
 
- 📁 **Folder Management**:
  - Users can **create folders**
  - Upload files directly into folders
  - Uses **self-relation** in the database to represent folder nesting
- ⭐ **Starred Items**:
  - Mark important files/folders as starred
- 🗑️ **Trash System**:
  - Soft-delete: move files/folders to trash
  - Restore or permanently delete
  - **Empty Trash** to clear all deleted items at once
- 🖼️ **File & Image Preview**:
  - View images and documents (PDF, JPG, PNG, etc.) directly in the app
- ⬇️ **Download Files**:
  - Users can download uploaded files anytime

---

## 🛠 Tech Stack

| Layer            | Technology |
|------------------|------------|
| Frontend & Backend  | [Next.js](https://nextjs.org/) |
| Authentication   | [Clerk](https://clerk.dev) |
| Database         | [Neon DB](https://neon.tech) |
| ORM              | [Drizzle ORM](https://orm.drizzle.team/) |
| File Storage     | [ImageKit](https://imagekit.io) |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
https://github.com/Prince5598/Cloud-Storage.git
cd your-folder-name
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup .env.local
```env
CLERK_PUBLISHABLE_KEY=your_clerk_public_key
CLERK_SECRET_KEY=your_clerk_secret_key

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

DATABASE_URL=your_neon_postgres_url
```

### 4. Create & Run database 
```bash
npm run db:generate
npm run db:push
```

### 5. Start the dev server
```bash
npm run dev
```
 - Open http://localhost:3000 to view the app.

---
## 🧠 How It Works (Architecture)
- Clerk handles authentication and user sessions.

- Files/Folders are stored relationally using Drizzle ORM and Neon DB, supporting self-referencing folder structures.

- Uploads are sent to ImageKit with metadata saved in the database.

- Previews use direct URLs from ImageKit (for images, PDFs, etc.).

- Trash logic uses soft-trash flags (isTrashed), and emptying trash deletes records permanently.
