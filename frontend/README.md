# Connect without Boundaries - NextGen Social Platform

Welcome to the frontend repository of **SocialApp**, a cutting-edge social media platform designed for real-time connection. Connect with strangers worldwide via random video chats, manage private conversations, and experience crystal-clear audio/video calls—all wrapped in a premium, modern dark-mode UI.

## 🚀 Key Features

*   **Random Video Chat**: Instant P2P video matching with users globally. Optimized for low latency.
*   **Complete Communication Suite**:
    *   **Private 1:1 Chat**: Secure direct messaging.
    *   **Group Chat**: Create and manage unlimited group conversations.
    *   **HD Audio/Video Calls**: High-quality signaling for seamless calls.
    *   **Rich Media Sharing**: Share images, videos, and files.
*   **Modern UI/UX**:
    *   **Dark Mode First**: Sleek, professional aesthetic using Tailwind CSS.
    *   **Glassmorphism**: Premium transparency effects.
    *   **Smooth Animations**: Powered by Framer Motion for engaging interactions.
*   **Secure Authentication**: Integrated with Google, GitHub, and secure Email/Password (JWT).

## 🛠️ Tech Stack

*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Real-time**: Socket.io-client
*   **WebRTC**: Native WebRTC API (mesh/star hybrid logic handled client-side with backend signaling)
*   **Icons**: Lucide React
*   **Notifications**: Sonner

## 📦 Installation & Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root of the frontend directory:
    ```env
    VITE_API_URL=http://localhost:3000
    VITE_SOCKET_URL=http://localhost:3000
    # Add other provider IDs if needed
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will behave live at `http://localhost:5173`.

## 🏗️ Project Structure

*   `/src/components`: Reusable UI components (Buttons, Inputs, Navbar).
*   `/src/pages`: Main views (Home, Login, Register, Chat, RandomVideoPage).
*   `/src/services`: API and Socket service layers.
*   `/src/context`: React Context for global state (Auth, Theme).

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.
