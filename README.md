# 🌐 ConnectNow

> **A Modern, Full-Stack Real-Time Messaging Application with AI-Powered Video Calls**

**ConnectNow** is a robust and visually engaging chat application designed to facilitate seamless communication. Built with a modern tech stack ensuring performance and scalability, it offers a premium user experience with features like secure authentication, real-time messaging, and **AI-powered video conferencing**.

---

## 🚀 Key Features

*   **🤖 AI Video Assistant (Mediapipe)**:
    *   **Vision & Brain**: Real-time hand skeleton and bounding box tracking.
    *   **Gesture Actions**: Gesture-driven messaging (Thumbs Up 👍 -> "Great!", Peace ✌️ -> ❤️).
    *   **Robot Guide**: Interactive documentation for AI gestures within the call UI.
*   **📹 Real-time Video Calls**:
    *   **WebRTC Integration**: Seamless peer-to-peer video/audio streaming.
    *   **Floating Board**: Draggable and resizable video window for better multitasking.
*   **💬 Real-time Messaging**:
    *   Instant message delivery via Socket.io.
    *   Support for **Text**, **Emojis**, and **Reactions**.
    *   **Reply System**: Context-aware replies to specific messages.
*   **🔐 Secure Authentication**: 
    *   Custom implementation using **JWT** (JSON Web Tokens).
    *   Secure user registration, login, and profile management.
*   **📂 Media Sharing**:
    *   **Drag & Drop** file and image uploads.
    *   Integrated media viewer and downloader.
*   **🎨 Premium UI/UX**:
    *   **Responsive Design**: Desktop and mobile-ready.
    *   **Dark Mode**: Sleek, eye-friendly design system.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **AI Backend**: [@mediapipe/hands](https://developers.google.com/mediapipe)
*   **WebRTC**: `simple-peer`
*   **Real-time**: `socket.io-client`
*   **Styling**: `styled-components` & `emotion`
*   **State**: `zustand`

### **Backend**
*   **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **Real-time Server**: `Flask-SocketIO` with `eventlet`
*   **Auth**: `pyjwt`

---

## 💻 Installation & Setup

### 1️⃣ Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
4. `pip install -r requirements.txt`
5. Create `.env` with `DATABASE_URL` and `SECRET_KEY`.
6. `python app.py`

### 2️⃣ Frontend Setup
1. `cd Frontend`
2. `npm install`
3. `npm run dev`

---

Made with ❤️ by [Kuldeep](https://github.com/kuldeep456789)
