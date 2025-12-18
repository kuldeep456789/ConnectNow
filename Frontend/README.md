# 🌐 ConnectNow

> **A Modern, Full-Stack Real-Time Messaging Application**

**ConnectNow** is a robust and visually engaging chat application designed to facilitate seamless communication. Built with a modern tech stack ensuring performance and scalability, it offers a premium user experience with features like secure authentication, real-time messaging, and media sharing.

This project demonstrates proficiency in **Full-Stack Development**, **Database Management**, and **UI/UX Design**.

---

## 🚀 Key Features

*   **🔐 Secure Authentication**: 
    *   Custom implementation using **JWT** (JSON Web Tokens) for stateless, secure sessions.
    *   Password hashing and secure user registration/login flows.
*   **💬 Real-time Messaging**:
    *   Instant message delivery.
    *   Support for **Text**, **Emojis**, and **Reactions**.
    *   **Reply System**: Context-aware replies to specific messages.
*   **📂 Media Sharing**:
    *   Robust file and image handling.
    *   **Drag & Drop** functionality for intuitive uploads.
    *   Integrated media viewer for images and files within the chat.
*   **👥 User Management**:
    *   **Profile Customization**: Users can update their display name and profile picture.
    *   **User Discovery**: Efficient search functionality to find and connect with other users.
*   **🎨 Advanced UI/UX**:
    *   **Responsive Design**: Optimized for various screen sizes.
    *   **Dark Mode**: Built-in, system-aware theming.
    *   **Styled Components**: Modular and maintainable CSS-in-JS styling.

---

## 🛠️ Technology Stack

### **Frontend (Client-Side)**
*   **Framework**: [React](https://react.dev/) (v18) via [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Styled Components](https://styled-components.com/) & [Emotion](https://emotion.sh/)
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Networking**: Axios
*   **Utilities**: React Hot Toast (Notifications), Emoji Mart

### **Backend (Server-Side)**
*   **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **Authentication**: PyJWT
*   **Database Adapter**: Psycopg2
*   **CORS**: Flask-CORS

---

## 💻 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites
*   **Node.js** (v18+)
*   **Python** (v3.9+)
*   **PostgreSQL** installed and running

### 1️⃣ Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    *   Create a `.env` file in the `backend` folder.
    *   Add your database credentials and secret key:
        ```env
        DATABASE_URL=postgresql://username:password@localhost:5432/connectnow_db
        SECRET_KEY=your_secure_secret_key
        ```

5.  **Initialize the Database:**
    *   Ensure your PostgreSQL server is running and the database `connectnow_db` exists.
    *   Run the migration script (if available) or use the schema provided in `db.py` / `routes.py`.
    ```bash
    python migrate_db.py
    ```

6.  **Run the Server:**
    ```bash
    python app.py
    ```
    *   The server will start at `http://localhost:5000`

### 2️⃣ Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    *   Access the app at `http://localhost:5173`

---

## 📸 Screenshots

*(Add your screenshots here: Login Screen, Chat Interface, Profile Page, etc.)*

---

## 🔮 Future Enhancements

*   **Video Conferencing**: Integration of WebRTC for face-to-face calls.
*   **AI Integration**: Smart suggestions and sentiment analysis.
*   **Groups**: Enhanced group chat management with admin controls.

---

Made with ❤️ by [Your Name]
