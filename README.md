# TaskHub

TaskHub is a comprehensive task management and marketplace application designed to connect users who need tasks done with those who can perform them. It features real-time updates, geolocation services, and a secure environment for transactions.

## Features

- **Task Management**: Post, browse, and manage tasks easily.
- **Real-time Updates**: Instant notifications and status updates using Socket.io.
- **Geolocation**: Find tasks or workers near you.
- **Secure Authentication**: Robust user authentication and authorization.
- **Multi-language Support**: Available in multiple languages (English, Turkish, etc.).
- **Dark/Light Mode**: Customizable user interface themes.
- **Dispute Resolution**: Integrated system for handling task disputes.

## Tech Stack

### Frontend (Mobile App)

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State/Data**: Supabase, Axios
- **Styling**: Expo System UI, Vector Icons
- **Internationalization**: i18next
- **Maps**: React Native Maps

### Backend (API)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **File Storage**: Supabase Storage

## Project Structure

The project is divided into two main directories:

- **`TaskHubApp/`**: Contains the frontend React Native (Expo) application code.
- **`backend/`**: Contains the backend Node.js/Express API code.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) app on your mobile device (for testing)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/TaskHub.git
   cd TaskHub
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   npm install
   ```

   - Create a `.env` file in the `backend` directory with the following variables (example):
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup:**
   - Open a new terminal window and navigate to the app directory:
     ```bash
     cd TaskHubApp
     npm install
     ```
   - Create a `.env` file in the `TaskHubApp` directory if necessary (refer to project config).
   - Start the Expo development server:
     ```bash
     npx expo start
     ```
   - Scan the QR code with the Expo Go app on your phone.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
