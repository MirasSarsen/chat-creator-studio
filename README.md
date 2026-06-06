🧠 Chat Creator Studio

A modern AI chat playground for building, testing, and improving conversational experiences.

🚀 Overview

Chat Creator Studio is a frontend-focused application designed to experiment with AI chat interfaces and workflows.

It provides a flexible environment where you can:

- interact with AI in a structured chat UI
- manage multiple conversations
- experiment with agent behavior
- configure tools and extensions
- collect feedback on responses

The goal of this project is to explore how modern AI chat systems are designed — from UX to extensibility.

---

✨ Features

- 💬 Chat Interface
  Clean, responsive UI for real-time conversations

- 📂 Chat Management
  Sidebar with multiple chats and navigation

- 🧠 Model Selection (UI-ready)
  Switch between different models (ready for API integration)

- ⚙️ Agent Improver
  UI for experimenting with improving AI responses

- 👍 Feedback System
  Like / dislike messages for evaluation

- 🧰 MCP Tools Configuration
  Extensible system for adding external tools

- 🧾 Support / Tickets UI
  Built-in interface for handling user issues

- 📱 Responsive Design
  Works across desktop and mobile devices

---

🛠️ Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

---

📦 Installation

git clone https://github.com/MirasSarsen/chat-creator-studio.git
cd chat-creator-studio
npm install
npm run dev

Open in browser:

http://localhost:5173

---

📁 Project Structure

src/
 ├── components/
 │   ├── chat/        # chat UI & logic
 │   ├── mcp/         # tools configuration system
 │   ├── support/     # support/tickets UI
 │   └── ui/          # reusable components
 │
 ├── hooks/           # custom hooks
 ├── lib/             # utilities
 └── main.tsx         # entry point

---

🎯 Purpose

This is a pet project built to:

- explore AI chat UX patterns
- practice scalable frontend architecture
- simulate a real-world AI product interface
- experiment with modular and extensible systems

---

🔮 Future Improvements

- [ ] Backend integration (OpenAI / local models)
- [ ] Persistent chat storage
- [ ] Authentication system
- [ ] Real-time sync
- [ ] Plugin system for tools

---

📌 Notes

Currently, this project focuses on frontend architecture and UI/UX rather than full AI integration.

---

🤝 Contact

- GitHub: https://github.com/MirasSarsen

---

«Built as an experiment in designing my own version of ChatGPT.»
