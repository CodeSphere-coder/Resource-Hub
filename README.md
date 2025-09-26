# CSE Resource Sharing Platform

A comprehensive web application for Computer Science Engineering students to share and access academic resources across all 8 semesters.

## 🚀 Features

- **User Authentication**: Secure signup/login system using Firebase Auth
- **Resource Management**: Upload, browse, and download study materials
- **Semester Organization**: Resources organized by semester (1st to 8th)
- **Subject Categorization**: Easy navigation through different subjects
- **Search & Filter**: Advanced search functionality to find specific resources
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Vite** as build tool

### Backend Services
- **Firebase Authentication** for user management
- **Firebase Firestore** for database
- **Firebase Storage** for file uploads

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   └── layout/          # Layout components (Navbar, Footer)
├── contexts/            # React contexts (AuthContext)
├── pages/              # Page components
├── config/             # Configuration files
└── hooks/              # Custom React hooks
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage
3. Copy your Firebase configuration
4. Replace the placeholder config in `src/config/firebase.ts` with your actual Firebase config

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 Available Resources

The platform supports various types of educational resources:

- **Study Notes**: Comprehensive notes for all subjects
- **Code Examples**: Programming assignments and projects
- **Previous Year Papers**: Examination papers and solutions
- **Reference Books**: Digital textbooks and reference materials
- **Lab Manuals**: Practical assignments and lab exercises

## 🎯 Semester Coverage

### Currently Available:
- **Semester 1**: Engineering Mathematics, Physics, Chemistry, Programming
- **Semester 2**: Data Structures, OOP, Digital Logic, Mathematics II
- **Semester 3**: Algorithms, DBMS, Computer Networks, Operating Systems
- **Semester 4**: Machine Learning, Web Development, Software Engineering

### Coming Soon:
- **Semesters 5-8**: Advanced topics, specializations, and final year projects

## 🔐 Authentication

The platform uses Firebase Authentication with:
- Email/Password authentication
- Secure user session management
- Protected routes for authenticated users only

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Mobile**: Phones and small devices
- **Tablet**: iPad and medium-sized screens
- **Desktop**: Large screens and monitors

## 🤝 Contributing

We welcome contributions from CSE students! Here's how you can help:

1. **Upload Resources**: Share your notes, assignments, and projects
2. **Report Issues**: Help us improve by reporting bugs or suggesting features
3. **Code Contributions**: Submit pull requests for new features or improvements


## 📞 Support

For support, questions, or feature requests, please contact:
- Email: support@cseresources.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

**Made with ❤️ for CSE students by CSE students**
