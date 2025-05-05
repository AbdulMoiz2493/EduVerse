# 📚 EduVerse – Platform for Tutor and Students

**EduVerse** is a modern, AI-integrated EdTech platform built using the MERN stack. It’s designed to transform online learning by focusing on **accessibility**, **interactivity**, and **inclusiveness**. Whether you're a tutor creating courses or a student navigating learning content, EduVerse ensures a smooth, engaging, and immersive experience.

🌐 [Live Demo]()  
💻 [GitHub Repository](https://github.com/AbdulMoiz2493/EduVerse)

---

## 🚀 Features

### ✅ Core Capabilities
- **AI-Powered Transcription:** Automatic transcript generation using Whisper for uploaded videos.
- **Real-Time Chat:** Interactive course chatrooms via WebSockets.
- **Stripe Payments:** Secure enrollment powered by Stripe.
- **Immersive 3D Landing Page:** Stunning visuals using Three.js, Spline, and GSAP.
- **Course Management:** Simplified content upload/edit for tutors.
- **Student Progress Tracking:** View enrollments and engagement stats.

---

## 👨‍🏫 Tutor Flow

1. **Sign Up / Login**
   - Email/password or OAuth-based login
2. **Dashboard Access**
   - View your courses and stats (enrollments)
3. **Course Creation**
   - Add title, description, thumbnail, and videos
   - Get automatic AI-generated transcripts
4. **Manage Content**
   - Reorder or replace video content
5. **Real-Time Chatroom**
   - Connect with students in real-time
6. **View Enrollments**
   - See enrolled students and their progress

---

## 👩‍🎓 Student Flow

1. **Sign Up / Login**
2. **Browse Courses**
   - Search catalog, preview, view tutor profiles
3. **Enroll in Courses**
4. **Watch Videos + Transcripts**
   - AI-synced transcripts for better learning
5. **Real-Time Chat**
   - Course-wide discussion with tutor and peers

---

## 💡 Technologies Used

| Layer            | Tools / Libraries |
|------------------|-------------------|
| **Frontend**     | React, ReactBits, Three.js, GSAP, Spline, shadcn@ui |
| **Backend**      | Node.js, Express.js, MongoDB |
| **AI Services**  | Whisper |
| **Authentication** | JWT, OAuth |
| **Payments**     | Stripe |
| **Real-Time**    | Socket.IO |
| **Media Handling** | FFmpeg, Video.js |
| **3D Experience**| Three.js, Custom Shaders, GSAP, ReactBits |

---

## 🎨 Immersive 3D Landing Page

EduVerse uses **Three.js**, **Spline**, and **GSAP** to build a stunning WebGL-based landing experience. These 3D and interactive elements are meant to:

- Wow users from the first scroll
- Deliver next-gen storytelling
- Showcase EdTech innovation

---

## 🛠️ Installation & Setup

### 🔧 Backend (Server)
```bash
git clone https://github.com/AbdulMoiz2493/EduVerse
cd EduVerse
npm install
node server.js
```

Create a `.env` file in the root with the following:
```
MONGO_URI=your_mongo_uri
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_whisper_key
```

---

### 💻 Frontend (Client)
```bash
cd client
npm install
npm run dev
```

---

## 📄 License

MIT License – Free to use, modify, and contribute.

---

## 🙌 Acknowledgements

- **OpenAI Whisper** – Speech-to-text magic  
- **Stripe** – Seamless payment experience  
- **ReactBits** – Clean component-based UI  
- **Socket.IO** – Real-time engagement  
- **Three.js / GSAP / Spline** – Visual wow factor

---

### 📬 Contact

For any queries, feedback, or collaboration opportunities, feel free to reach out:

**Abdul Moiz**  
- 📧 Email: abdulmoiz8895@gmail.com  
- 🔗 GitHub: [@AbdulMoiz2493](https://github.com/AbdulMoiz2493)
- 🔗 Portfolio: [abdul-moiz.tech](https://www.abdul-moiz.tech)

--- 

**The goal:** _“Wow users from the very first scroll.”_
