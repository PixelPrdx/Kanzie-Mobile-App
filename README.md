# Kanzie 🚀

Kanzie is a modern social networking and activity planning application designed to help friends connect and decide on their next outing—whether it's coffee, dinner, or a night out.

## 🏗 Project Structure

The project is divided into two main components:

- **`client/`**: A mobile application built with **React Native** and **Expo**.
- **`server/`**: A backend API built with **ASP.NET Core** and **Entity Framework Core**.

---

## 📱 Client (Mobile App)

The frontend is a cross-platform mobile application utilizing Expo Router for navigation and SignalR for real-time communication.

### 🛠 Tech Stack
- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Real-time:** [@microsoft/signalr](https://learn.microsoft.com/en-us/aspnet/core/signalr/?view=aspnetcore-9.0)
- **State/Animations:** React Native Reanimated, Gesture Handler
- **Icons:** @expo/vector-icons

### 🚀 Getting Started
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```

---

## 🖥 Server (Backend API)

The backend is a robust RESTful API that handles user authentication, data persistence, and real-time messaging.

### 🛠 Tech Stack
- **Framework:** ASP.NET Core
- **Database:** SQLite (via Entity Framework Core)
- **Real-time:** SignalR Hubs
- **Documentation:** Swagger (OpenAPI)

### 🚀 Getting Started
1. Navigate to the server directory:
   ```bash
   cd server/Kanzie.Api
   ```
2. Restore dependencies:
   ```bash
   dotnet restore
   ```
3. Update the database (if needed):
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5000` (or similar), and you can access the Swagger UI at the root path `/` or `/swagger`.

---

## ✨ Features
- **Real-time Chat:** Seamless communication using SignalR.
- **Venue Discovery:** Explore and find venues for your activities.
- **User Profiles:** Manage your identity and connect with friends.
- **Activity Planning:** Coordinate plans with your social circle.

## 📄 License
This project is private.
