# mediindiaa

# 🩺 MediIndia - Digital Health & AI-Driven Clinical Assistant

MediIndia is a cross-platform healthcare management platform with intelligent doctor and patient dashboards, AI-powered diagnostics, and digital prescription workflows. Built with a focus on usability, automation, and secure access, it empowers both practitioners and patients with real-time tools and insights.

---

## 🚀 Features

### 🧑‍⚕️ Doctor Dashboard
- Patient intake via conversational AI (Botpress)
- Smart prescription editor with:
  - Voice-to-text + AI summary
  - Medication autofill based on diagnosis
  - PDF export + sharable QR / URL
- Medical knowledge base access
- Nursing scenario assistant (AI benchmarked)

### 🧑‍💻 Patient Dashboard
- View digital prescriptions (linked by QR or shared URL)
- Mobile-first quick registration (via phone input)
- Manage full profile, health reports, family members
- Secure uploads (lab reports, diagnostics)

---

## 🧠 AI Capabilities

- **LLM Node (Bolt.new)**:
  - Symptom-to-diagnosis pipeline
  - Medication and treatment recommendations
  - Summary generation for prescriptions & notes

- **Voice Transcription**:
  - In-browser mic capture → real-time summary via Bolt.new or Whisper

---

## 🗂️ Tech Stack

| Layer             | Tech                                              |
|------------------|---------------------------------------------------|
| Frontend (Web)   | React + Tailwind + Shadcn UI                      |
| Backend (API)    | Node.js + Express (Supabase in dev mode)          |
| Database         | PostgreSQL (via Supabase)                         |
| AI Layer         | Bolt.new LLM Node (`gpt-4.1-mini`)                |
| Auth             | Supabase Auth with RLS                            |
| Realtime Sync    | Supabase Subscriptions (optional)                 |
| File Storage     | Supabase Storage (PDFs, reports, ID proofs)       |

---

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/<your-org>/mediindia.git
cd mediindia
