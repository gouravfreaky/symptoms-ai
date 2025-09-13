
# Symptom to Diagnosis AI Assistant

**Symptom to Diagnosis AI** is a sophisticated web application designed to serve as an intelligent assistant for preliminary diagnostic analysis. By leveraging a powerful Large Language Model (LLM) from Fireworks AI, users can input their medical symptoms and receive a comprehensive, structured analysis. This tool is built to be intuitive for patients while providing detailed insights that can be valuable for healthcare professionals.


## Application Preview
https://symptoms-ai-diagnosis.vercel.app/


## Application Flow

The user journey is designed to be seamless, secure, and intuitive from start to finish.

1.  **Secure Authentication**: The application is protected by Google Sign-In. Users must first log in with their Google account, ensuring that their analysis history and data remain private and tied to their identity.
2.  **Symptom Input**: On the main screen, the user is presented with a clean interface to describe their symptoms. They can provide rich context, including a timeline, current medications, and lifestyle factors, for a more personalized analysis. A voice-to-text option is available for accessibility and ease of use.
3.  **AI Analysis**: Upon clicking "Analyze," the application securely sends the anonymized symptom data to the Fireworks AI API. A loading indicator keeps the user informed while the AI processes the information.
4.  **View Comprehensive Report**: The AI returns a detailed report, which is displayed in a structured and easy-to-digest format. This includes:
    *   A high-level **Severity Assessment**.
    *   A **Differential Diagnosis** with confidence scores visualized in a bar chart.
    *   An interactive **Symptom Pathways** map to visualize connections.
    *   Suggestions for **Tests** and **Specialists**.
    *   Separate **AI Reasoning** sections for patients and professionals.
5.  **Interact & Clarify**: Users can hover over elements in the report to see visual highlights connecting symptoms to conditions. For deeper understanding, they can use the integrated **Chat** to ask follow-up questions about their results in real-time.
6.  **Manage & Export**: The user can save any analysis to their private history, load previous results, or generate a clean, **Print-Friendly Report** to share with a healthcare provider.

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

## 🚨 Disclaimer

This tool is for informational purposes only and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
