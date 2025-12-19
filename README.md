# ConnectNow 🚀

**Real-time Communication Platform with AI-Powered Interactivity**

ConnectNow is a full-stack, real-time messaging and video conferencing application designed to bridge distances with high-performance communication tools. Built with a focus on scalability and user experience, it integrates advanced features like real-time socket communication, WebRTC-based video calls, and AI-driven hand gesture recognition for a futuristic interaction model.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: `React 18` with `TypeScript`
- **Build Tool**: `Vite` for optimized development and bundling
- **State Management**: `Zustand` for lightweight, scalable global state
- **UI & Styling**: `Material UI (MUI)`, `Styled Components`, `Framer Motion` (for fluid animations)
- **Real-time Engine**: `Socket.io-client`
- **Communications**: `Simple-peer` (WebRTC) for P2P video/audio streams
- **AI/ML**: `TensorFlow.js` & `MediaPipe` for real-time hand gesture detection

### **Backend**
- **Framework**: `Flask` (Python)
- **Database**: `PostgreSQL` (hosted on Neon/Supabase)
- **Authentication**: `JWT (JSON Web Tokens)` with `Werkzeug` for password hashing
- **Socket Server**: `Flask-SocketIO` with `eventlet` for high concurrency
- **Environment Management**: `python-dotenv`

### **Deployment & DevOps**
- **Hosting**: `Render` (Standard Blueprint setup)
- **CORS Management**: `Flask-CORS`
- **Production Server**: `Gunicorn`

---

## ✨ Key Features

- **🔐 Secure Authentication**: Robust signup/signin flow using JWT for persistent and secure user sessions.
- **💬 Real-time Messaging**: Instant messaging powered by Socket.io, featuring:
    - Message persistence in PostgreSQL.
    - **Reply Functionality**: Contextual replies to specific messages.
    - **Message Reactions**: Expressive emoji reactions for better engagement.
    - **Soft Delete**: Securely remove messages while maintaining chat integrity.
    - Online/offline status indicators.
- **📁 File Sharing**: Support for uploading and sharing files within chat conversations.
- **🔍 Active User Search**: Real-time user discovery to start new conversations instantly.
- **📞 HD Video & Audio Calls**: Seamless P2P communication utilizing WebRTC (Simple-peer) for low-latency interactions.
- **🖐️ AI Gesture Integration**: Interactive UI control using hand gestures, powered by pre-trained TensorFlow.js models.
- **👤 Profile Management**: Customizable user profiles with display names and photo URLs.
- **📱 Responsive Design**: Fully mobile-responsive interface crafted with a "Mobile-First" approach using MUI and custom CSS.
- **🎨 Modern UI/UX**: Dark mode, glassmorphism effects, and micro-animations for a premium feel.

---

## 🏗️ Architecture Overview

ConnectNow follows a client-server architecture:
1.  **Client**: A React Single Page Application (SPA) that communicates with the API via REST (Axios) and maintains a persistent bi-directional connection via WebSockets.
2.  **Server**: A Flask API handling authentication, database transactions, and real-time event broadcasting.
3.  **Real-time Layer**: Socket.io handles message delivery, status updates, and signaling for WebRTC.
4.  **AI Layer**: On-device processing using MediaPipe to ensure low latency and user privacy.

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL Database

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/ConnectNow.git
cd ConnectNow
```

### **2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create .env file with DATABASE_URL and SECRET_KEY
python app.py
```

### **3. Frontend Setup**
```bash
cd ../Frontend
npm install
npm run dev
```

---

## 💡 Key Technical Challenges & Solutions

### **Challenge 1: WebRTC Signaling**
**Problem**: Establishing a direct P2P connection between two users behind different NATs.
**Solution**: Implemented a Socket.io signaling server to exchange 'offers', 'answers', and 'ICE candidates' between peers, ensuring successful handshake and stream initialization.

### **Challenge 2: State Synchronization**
**Problem**: Ensuring chat lists, message history, and online status remain synced across multiple clients.
**Solution**: Leveraged **Zustand** for centralized state management and integrated Socket.io listeners that trigger state updates in real-time, preventing race conditions.

### **Challenge 3: AI Inference Performance**
**Problem**: Running hand gesture recognition without lagging the main UI thread.
**Solution**: Optimized TensorFlow.js model loading and utilized requestAnimationFrame for efficient camera feed processing, ensuring smooth 60fps interaction.

---

## 📈 Future Roadmap
- [ ] Group Video Conferencing.
- [ ] End-to-End Encryption for messages.
- [ ] Voice-to-Text messaging.

---

## 🎓 Learning Outcomes
- **Full-Stack Integration**: Mastered the interaction between a Python/Flask backend and a React/TypeScript frontend.
- **WebSocket Protocols**: Gained deep understanding of bi-directional communication for real-time applications.
- **WebRTC Implementation**: Learned the intricacies of P2P networking, signaling servers, and media stream handling.
- **AI in Web Apps**: Successfully integrated on-device machine learning models for non-traditional user interactions.
- **State Management**: Optimized performance using `Zustand` to manage complex, multi-layered application states.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Created with ❤️ by [Kuldeep]*


---

## 👔 Interview & Placement Guide

### **The 30-Second Pitch**
> "ConnectNow is a full-stack real-time communication platform I built that combines instant messaging, HD video calling, and AI-powered gesture recognition. I used React with TypeScript on the frontend and Flask with PostgreSQL on the backend, implementing WebSocket communication through Socket.io for real-time features. What makes it unique is the integration of TensorFlow.js for hand gesture controls, allowing users to interact with the UI through hand movements. The app handles concurrent users efficiently using eventlet, and I deployed it on Render with proper CORS and authentication using JWT."

### 🔑 Key Technical Talking Points

#### **1. Real-Time Communication Architecture**
*   **What you built**: Bi-directional socket communication for instant messaging.
*   **Be ready to explain**:
    *   How Socket.io maintains persistent connections between client and server.
    *   Event-driven architecture: client emits events, server broadcasts to relevant users.
    *   Handling connection failures and reconnection logic.
    *   Scaling considerations: how would you handle 10,000+ concurrent users? (Redis adapter, horizontal scaling).
*   **Sample answer**: *"I implemented Socket.io on both client and server sides. When a user sends a message, the client emits a socket event, the Flask-SocketIO server receives it, stores it in PostgreSQL, then broadcasts it to the recipient's socket room. I used eventlet for high concurrency support, which allows the server to handle thousands of simultaneous connections efficiently."*

#### **2. WebRTC Video Implementation**
*   **What you built**: P2P video/call infrastructure using Simple-peer.
*   **Be ready to explain**:
    *   Signaling server concept: exchanging SDP offers/answers and ICE candidates.
    *   NAT traversal: how WebRTC establishes direct peer connections.
    *   Why P2P vs server-mediated (cost, latency).
    *   Limitations: what happens when P2P fails? (TURN server fallback).
*   **Sample answer**: *"I used Simple-peer as a wrapper around WebRTC. The signaling process works through my Socket.io server: when User A initiates a call, they create an offer with their connection info (SDP), send it via socket to User B, who creates an answer. They exchange ICE candidates to find the best network path. Once the handshake completes, media streams directly peer-to-peer, bypassing my server entirely for optimal performance."*

#### **3. AI Gesture Recognition**
*   **What you built**: Hand gesture detection using TensorFlow.js and MediaPipe.
*   **Be ready to explain**:
    *   Why client-side processing? (privacy, latency).
    *   How MediaPipe works: pose estimation, landmark detection.
    *   Performance optimization: frame rate, model size.
*   **Sample answer**: *"I integrated MediaPipe Hands, which detects 21 hand landmarks in real-time. The model runs entirely in the browser using TensorFlow.js, processing video frames at ~30fps. I implemented gesture recognition for actions like muting audio or ending calls. Client-side processing ensures user privacy since video never leaves their device and reduces server costs."*

#### **4. State Management with Zustand**
*   **Why Zustand over Redux/Context?**: Minimal boilerplate, better performance (selective re-renders), and simpler learning curve.
*   **Sample answer**: *"I chose Zustand for its simplicity and performance. Unlike Redux, it doesn't require actions, reducers, or providers. I can create stores with minimal code, and components only re-render when the specific state slice they subscribe to changes. For example, my chat store manages messages, active conversations, and typing indicators independently."*

#### **5. Authentication Flow**
*   **Be ready to explain**: JWT structure (header, payload, signature), secure storage strategies, and password hashing in Python.
*   **Sample answer**: *"Users register with credentials that get hashed using Werkzeug's security utilities. On login, the server validates credentials and returns a JWT containing the user ID and expiration. The client stores this token and includes it in the Authorization header for protected routes. The server verifies the signature on each request using a secret key."*

---

### 🧠 Deep Technical Preparation

#### **Database & Backend**
*   **Q: How do you handle message persistence?**
    *   *PostgreSQL schema design with users, messages, and conversations tables. Indexing strategies for fast queries (user_id, conversation_id, timestamp).*
*   **Q: How would you implement end-to-end encryption?**
    *   *Client-side encryption before sending; Key exchange mechanism (Diffie-Hellman).*
*   **Q: What if two users send messages simultaneously?**
    *   *Database transactions, ACID properties, and timestamp-based ordering.*

#### **Frontend & Performance**
*   **Q: How do you optimize React performance for real-time updates?**
    *   *React.memo for message components, virtual scrolling for long histories, and debouncing typing indicators.*
*   **Q: How do you handle reconnection scenarios?**
    *   *Socket.io automatic reconnection and fetching missed messages on reconnect.*

#### **System Design (Scaling to Millions)**
*   **Horizontal scaling**: Multiple Instances + Load Balancer.
*   **Message queue**: Redis/RabbitMQ for inter-server communication.
*   **WebSocket scaling**: Sticky sessions with a Redis adapter.

---

### � Common Challenges & Solutions

*   **Challenge 1: CORS Configuration**: Fixed initial connection errors between frontend and backend by configuring Flask-CORS and transport protocols.
*   **Challenge 2: NAT Traversal**: Handled P2P connection failures behind restrictive firewalls using ICE candidates.
*   **Challenge 3: State Sync**: Resolved message ordering issues caused by network latency using timestamp-based sorting.

---

### 🎬 Demo Strategy (Live Order)
1.  **Authentication (30s)**: Quick login flow.
2.  **Messaging (1m)**: Send messages, show replies and reactions.
3.  **Video Call (1m)**: Initiate P2P call.
4.  **AI Gesture (30s)**: Demonstrate UI control via hand movements.
5.  **Architecture (1m)**: Explain the tech stack visually.

---
*Created with ❤️ by [Kuldeep]*