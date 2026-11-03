<div align="center">

# 📚 StudyLens AI

### AI-Powered Study Companion

An interactive platform that helps students learn, practice, and revise using AI.

</div>

---

## About

StudyLens AI brings study materials, AI tutoring, and quiz generation together in one place to make learning easier and more interactive.

## Features

- AI-powered tutoring and explanations
- Study material uploads
- AI-generated quizzes
- Learning progress tracking
- Student dashboard

## Tech Stack

Next.js · TypeScript · Tailwind CSS · Groq · Supabase

## System Architecture

```mermaid
flowchart TD
    A[Student] --> B[StudyLens AI]
    B --> C[Dashboard and Study Tools]
    C --> D[Next.js API Routes]
    D --> E[Groq AI]
    D --> F[Supabase]
    E --> G[AI Responses and Quizzes]
    F --> H[Authentication and Data]
    G --> I[Results]
    H --> I
    I --> B
```

## Workflow

1. Student accesses StudyLens.
2. Selects a study tool.
3. Sends a question, material, or quiz request.
4. AI or backend services process the request.
5. Results are displayed in the application.

---

<div align="center">

**StudyLens AI — Learn, Practice, and Grow with AI 💜**

</div>
