# Othello Fullstack Project

## Overview
This project is a fullstack implementation of the classic board game Othello (also known as Reversi). It includes both a frontend and a backend, allowing users to play the game in a web browser.

## Project Structure
The project is divided into two main parts:
- **Frontend**: Located in the `frontend` directory, this part of the project is responsible for the user interface and user experience.
- **Backend**: Located in the `backend` directory, this part of the project handles the game logic, user authentication, and data storage.

## Technologies Used
- **Frontend**:
    - React
    - Redux
    - CSS
    - HTML

- **Backend**:
    - Node.js
    - Express
    - MongoDB
    - JWT for authentication

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Installation
1. Clone the repository:
     ```bash
     git clone https://github.com/yourusername/othello-fullstack.git
     cd othello-fullstack
     ```

2. Install dependencies for both frontend and backend:
     ```bash
     cd frontend
     npm install
     cd ../backend
     npm install
     ```

3. Create a `.env` file in the `backend` directory and add the following environment variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

### Running the Application
1. Start the backend server:
     ```bash
     cd backend
     npm start
     ```

2. Start the frontend development server:
     ```bash
     cd frontend
     npm start
     ```

3. Open your web browser and navigate to `http://localhost:3000` to play the game.

## Features
- User authentication (signup/login)
- Interactive game board
- Real-time game updates
- Score tracking

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For any questions or feedback, please contact [yourname@example.com](mailto:yourname@example.com).
