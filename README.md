## Scrambleo: Collaborative Real-time Color Grid
![Demo Image](https://raw.githubusercontent.com/2105789/Scrambleo/master/public/Screenshot.png)
**Live Demo:** https://scrambleo.onrender.com/

**Description:**

Scrambleo is a collaborative, real-time web application that allows multiple users to paint a massive color grid together. Users can click on individual cells to change their color, fostering a collaborative and creative experience.

**Key Features:**

- **Real-time Collaboration:** Changes made by one user are instantly reflected for all other connected users.
- **Massive Scalability:** Handles a grid of 100,000 rows by 10,000 columns, totaling a billion cells.
- **Efficient Rendering:** Employs techniques like cell virtualization and memoization to ensure smooth performance even with a vast grid.
- **Intuitive UI:** Provides a simple and user-friendly interface with cell highlighting and hover details.
- **Persistent Data:** Uses Redis to store the grid data, ensuring persistence across sessions.

**Technologies Used:**

- **Frontend:**
  - Next.js
  - React
  - Tailwind CSS
  - Socket.io Client
- **Backend:**
  - Socket.io
  - Node.js
  - Redis
- **Database:**
  - Redis

**Installation and Setup:**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/2105789/Scrambleo
   cd realtime-grid-app
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and set the following:

   ```
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_PASSWORD=your_redis_password
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

**Contributing:**

Contributions are welcome! Please open an issue or pull request if you have any suggestions, bug reports, or feature requests.

**License:**

This project is licensed under the [MIT License](LICENSE). 
