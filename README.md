# Chat App - Frontend

This is the frontend of the Chat Application built with Next.js and React. The application allows users to chat in real-time, manage contacts, and create groups with admin privileges.

## Features

- User authentication (Sign Up & Login)
- Real-time messaging
- Online status indication
- Typing and last seen indicators
- Message delivery and read status (✔ = Delivered, ✔✔ = Read)
- Contact management (Add & Search Users)
- Group chat functionality
  - Create groups
  - Add or remove members (Admin only)
  - Assign group admin privileges
  - Update group name
- Notifications and unread message count
- Fully responsive UI
- Profile management (update profile picture, username, name, and bio)

## Installation & Setup

### Prerequisites
Make sure you have the following installed:
- Node.js (latest LTS version recommended)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/muhammedsavadtp/chatapp_frontend.git
cd chatapp_frontend
```

### Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Environment Variables
Create a `.env` file in the project root and add the following:
```env
NODE_ENV="development"
NEXT_PUBLIC_API_URL=http://localhost:5000 

```

### Run the Application
```bash
npm run dev  # For development mode
# OR
npm start    # To start the app
```

## Usage

1. **Create an account** and log in.
2. Click the **“+”** button on the left sidebar to **add a contact**.
3. Create another account in a separate browser for the recipient.
4. **Search for the user** and click **Add** (both users need to add each other).
5. Start chatting in real-time.
6. To **create a group**, click the **“+”** button → Select **Create Group** → Provide a group name → Select members → Click **Create**.
7. To **update group settings**, open a group chat and click on the **group name** to:
   - Update the **group name**
   - **Add or remove members** (Admin only)
   - **Assign group admin privileges** to a member

## Notes
- If something is not working, **refresh the page** and try again.
- This project is optimized for all devices (mobile, tablet, and desktop).

<!-- ## License
This project is open-source and available under the [MIT License](LICENSE). -->

## Contact
For any issues or inquiries, feel free to reach out to **Muhammed Savad**.
