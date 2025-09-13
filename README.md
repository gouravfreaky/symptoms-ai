
# Symptom to Diagnosis AI Assistant

**Symptom to Diagnosis AI** is a sophisticated web application designed to serve as an intelligent assistant for preliminary diagnostic analysis. By leveraging a powerful Large Language Model (LLM) from Fireworks AI, users can input their medical symptoms and receive a comprehensive, structured analysis. This tool is built to be intuitive for patients while providing detailed insights that can be valuable for healthcare professionals.


## Application Preview
https://symptoms-ai-diagnosis.vercel.app/


## Application Flow

(public/flowchart.png)

---

## Core Features

This application is packed with features to provide a comprehensive and user-centric experience.

### Input & Context
-   **Rich Text Input**: A large text area for detailed symptom descriptions.
-   **Voice-to-Text**: A microphone button allows users to dictate their symptoms using the browser's SpeechRecognition API.
-   **Detailed Patient Context**: Optional fields for timeline, medications, allergies, and lifestyle factors to improve AI accuracy.

### AI-Powered Analysis
-   **Severity Assessment**: A triage system that classifies the situation as "Urgent," "Doctor Visit Recommended," or "Self-care."
-   **Differential Diagnosis**: A list of potential conditions, each with a confidence score, severity level, and brief description.
-   **Interactive Data Visualizations**:
    -   A **bar chart** to easily compare confidence scores across diagnoses.
    -   A **Causal Pathways** map with interactive highlighting to visually connect symptoms to the conditions they might indicate.
-   **Actionable Suggestions**: AI-generated recommendations for relevant lab tests and medical specialists.
-   **Dual-Perspective Reasoning**: Separate, tailored explanations of the AI's reasoning for both patients (in simple terms) and healthcare professionals (with more technical detail).

### Interactivity & Usability
-   **Follow-up Chat**: An integrated, real-time chat component allows users to ask clarifying questions about their analysis.
-   **Multilingual Support**: Users can select their preferred language for both the UI and the AI-generated analysis.
-   **Persistent User History**: Analyses can be saved and are tied to the user's Google account, allowing them to review their history at any time.

### User Experience & Interface
-   **Secure Google Authentication**: Ensures user data and history are private and secure.
-   **Light & Dark Mode**: A theme toggle for user comfort, with the preference saved locally.
-   **Responsive Design**: A modern and clean UI that works seamlessly on desktop and mobile devices.
-   **Print-Friendly Export**: Generates a clean, professional report summary, formatted for printing and sharing with a doctor.

---

## Technology Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) for a modern, type-safe user interface.
-   **AI Backend**: [Fireworks AI](https://fireworks.ai/) (using the `dobby-unhinged-llama-3-3-70b-new` model) for generating the diagnostic analysis and powering the chat.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first, responsive, and customizable design system.
-   **Authentication**: [Google Identity Services](https://developers.google.com/identity) for secure and easy user login.

---

## Configuration

To run this project locally, you will need to configure two things:

1.  **Google Client ID**: In `config.ts`, replace the placeholder value for `GOOGLE_CLIENT_ID` with your own ID from the Google Cloud Console.
2.  **Fireworks AI API Key**: In `services/fireworksService.ts` and `components/ChatComponent.tsx`, the API key is moved to a secure environment variable.

---

## Local Development Setup

Follow these steps to get the application running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

First, clone the project repository from GitHub:

```bash
git clone https://github.com/your-username/symptom-ai-assistant.git
cd symptom-ai-assistant
```

### 2. Install Dependencies

Install the necessary Node.js packages:

```bash
npm install
```
*(Or `yarn install` if you use Yarn)*

### 3. Configure API Keys

The application requires API keys for Google Sign-In and Fireworks AI.

#### A. Google Client ID

You need a Google Client ID to enable user authentication.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Create a new project or select an existing one.
3.  Navigate to **APIs & Services > Credentials**.
4.  Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
5.  Choose **Web application** as the application type.
6.  Under **Authorized JavaScript origins**, add your local development URL (e.g., `http://localhost:5173`).
7.  Click **Create**. You will be given a **Client ID**.
8.  In the project root, open the file `config.ts` and replace the placeholder with your Client ID:

    ```typescript
    // config.ts
    export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
    ```

#### B. Fireworks AI API Key

The AI functionalities are powered by Fireworks AI.

1.  Sign up for an account at [Fireworks AI](https://fireworks.ai/).
2.  Navigate to your API Keys section and generate a new key.
3.  Open the following two files and replace the placeholder API key with your own:
    -   `services/fireworksService.ts`
    -   `components/ChatComponent.tsx`

    ```typescript
    // In both files, find this line and replace the key:
    const FIREWORKS_API_KEY = 'YOUR_FIREWORKS_AI_API_KEY_HERE';
    ```

    > **Note for Production:** For a real-world application, it is strongly recommended to move API keys to a secure `.env` file and access them via environment variables, rather than hardcoding them in the source code.

### 4. Run the Application

Start the local development server:

```bash
npm run dev
```

The application should now be running and accessible at `http://localhost:5173` (or another port if specified in your setup). You should see the Google login page.

---

## 🚨 Disclaimer

This tool is for informational purposes only and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
