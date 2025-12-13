# Chatify - Real-time Chat Application

## 📝 Resume Summary

**Full-Stack Real-time Chat Application** | React • TypeScript • Python • PostgreSQL

A WhatsApp-inspired messaging platform with modern UI/UX, featuring real-time communication, media sharing, and user management.

### Key Achievements:
- 🚀 **Built scalable full-stack architecture** using React 18 with TypeScript frontend and Python Flask REST API backend, handling real-time messaging for multiple concurrent users
- 💬 **Implemented comprehensive chat features** including 1-on-1 conversations, group chats, media sharing (images/files), emoji support, and message status indicators (read receipts)
- 🎨 **Designed WhatsApp-like responsive UI** with dark/light themes, online status indicators, typing notifications, smart timestamps, and advanced search/filter functionality using Styled Components
- 🔐 **Developed secure authentication system** with JWT tokens, password hashing (Werkzeug), and PostgreSQL database integration via Supabase for user and message management
- ⚡ **Optimized performance** using React Query for data caching, Zustand for state management, and implemented automatic UI updates with optimistic rendering for seamless user experience

### Technologies Used:
**Frontend:** React 18, TypeScript, Vite, Styled Components, React Router, Zustand, React Query, Axios  
**Backend:** Python, Flask, Flask-CORS, PyJWT, Werkzeug  
**Database:** PostgreSQL (Supabase), psycopg2  
**Tools:** Git, npm, pip, REST API design

---

# Chatify - Real-time Chat Application

A modern, feature-rich chat application built with React and Python Flask, inspired by WhatsApp's design and functionality.

![Chatify](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### Core Functionality
- **Real-time Messaging** - Send and receive text messages instantly
- **Media Sharing** - Share images, files, and emojis
- **Group Chats** - Create and manage group conversations
- **1-on-1 Conversations** - Private messaging with individual users
- **User Profiles** - Customizable profiles with avatar upload

### WhatsApp-Inspired UI
- **Smart Sidebar** - Search, filter (All/Unread/Groups), and sort conversations
- **Online Status** - Green dot indicators showing who's online
- **Message Status** - ✓✓ read receipts for delivered messages
- **Timestamps** - Smart time display (Today, Yesterday, dates)
- **Media Previews** - 📷 Photo and 📎 File icons in conversation list
- **Contact List** - All users displayed in sidebar for quick access

### User Experience
- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Works on desktop and mobile
- **Profile Editing** - Update display name and profile picture
- **Message Formatting** - Support for emojis and rich text
- **Search Functionality** - Find conversations and contacts quickly

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Styled Components** - CSS-in-JS styling
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and caching
- **React Hot Toast** - Beautiful notifications
- **React Icons** - Icon library
- **Emoji Picker React** - Emoji selection

### Backend
- **Python 3.x** - Backend language
- **Flask** - Lightweight web framework
- **Flask-CORS** - Cross-origin resource sharing
- **PostgreSQL** - Relational database (Supabase)
- **psycopg2** - PostgreSQL adapter
- **PyJWT** - JSON Web Token authentication
- **Werkzeug** - Password hashing and security

### Database
- **Supabase** - PostgreSQL database hosting
- **Tables**: users, conversations, messages, conversation_users

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (via Supabase)
- **npm** or **yarn**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/chatify.git
cd chatify
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# DATABASE_URL=your_supabase_connection_string
# SECRET_KEY=your_secret_key

# Run the backend server
python app.py
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Chatify

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
chatify/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── routes.py           # API routes
│   ├── db.py              # Database connection
│   ├── migrate_db.py      # Database migrations
│   └── requirements.txt   # Python dependencies
│
├── Chatify/               # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Chat/     # Chat-related components
│   │   │   ├── Sidebar/  # Sidebar components
│   │   │   └── Core/     # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── library/      # Utilities and constants
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.tsx       # Main app component
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔑 Key Features Explained

### Authentication
- JWT-based authentication
- Secure password hashing with Werkzeug
- Token stored in localStorage
- Protected routes on both frontend and backend

### Real-time Updates
- Automatic message refresh using React Query
- Optimistic UI updates
- Conversation list updates after sending messages

### File Upload
- Image and file sharing
- Files stored in `/uploads` directory
- Image proxy for secure URL resolution

### Profile Management
- Edit display name
- Upload/change profile picture
- Avatar fallback with user initials

## 🎨 Design Philosophy

Chatify is designed to provide a familiar, WhatsApp-like experience while maintaining clean, modern code architecture:

- **Component-based** - Modular, reusable components
- **Type-safe** - TypeScript for fewer runtime errors
- **Responsive** - Mobile-first design approach
- **Accessible** - Semantic HTML and ARIA labels
- **Performance** - Optimized rendering and lazy loading

## 🔐 Security Features

- Password hashing with Werkzeug
- JWT token authentication
- CORS configuration
- SQL injection prevention with parameterized queries
- XSS protection

## 🚧 Future Enhancements

- [ ] Socket.IO for true real-time messaging
- [ ] Voice and video calls
- [ ] Message encryption
- [ ] Push notifications
- [ ] Message reactions
- [ ] Reply and forward functionality
- [ ] User blocking and reporting
- [ ] Message search
- [ ] Archive conversations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- Inspired by WhatsApp's design
- Icons from React Icons
- UI components styled with Styled Components

---

**Note**: This is a learning project and not intended for production use without proper security audits and enhancements.
