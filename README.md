# Health Chatbot

A MERN stack application for health-related conversations with an AI chatbot.

## Features

- User authentication (signup/signin)
- Real-time chat interface
- Chat history
- User profile
- Responsive design
- Health-focused AI responses

## Tech Stack

- Frontend: React with TypeScript, Vite, Chakra UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd health-chatbot
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/health-chatbot
   JWT_SECRET=your-secret-key-here
   ```

4. Start MongoDB locally or use MongoDB Atlas

5. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

6. Start the frontend development server:
   ```bash
   cd health-chatbot
   npm run dev
   ```

7. Open http://localhost:5173 in your browser

## Project Structure

```
health-chatbot/
├── src/
│   ├── components/
│   │   ├── Chat.tsx
│   │   ├── Navbar.tsx
│   │   ├── Profile.tsx
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   ├── App.tsx
│   └── main.tsx
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chat.js
│   └── server.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 