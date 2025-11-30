# CampusTrade - Web Frontend

This repository contains the web frontend for the CampusTrade project, a university student-to-student marketplace. This application is built with Next.js (a React framework) and is responsible for all user-facing web interfaces.

**Note:** This project is for the web frontend only. The backend services and mobile application are developed and maintained by separate teams. This application will consume the APIs provided by the backend team.

## Work Breakdown Structure (WBS) - Frontend Tasks

This section outlines the tasks assigned to the web frontend team, based on the official project WBS.

### T3: UI/UX Design and Prototyping
- **ID T3.1:** [x] Create wireframes and mockups for web.
- **ID T3.2:** [x] Define user flow and interaction guidelines.
- **ID T3.3:** [x] Establish color scheme, typography, and brand consistency.
- **ID T3.4:** [ ] Conduct usability review and refine designs.

### T4: Frontend Setup
- **ID T4.1:** [x] Initialize React (Next.js) project structure.
- **ID T4.2:** [x] Configure routing, dependencies, and build tools.
- **ID T4.3:** [x] Integrate Tailwind and global styling system.

### T5: Authentication and User Management Interface
- **ID T5.1:** [x] Implement login/register UI and validation logic (mock).
- **ID T5.2:** [ ] Integrate frontend with backend authentication API.
- **ID T5.3:** [ ] Enable profile editing and password management.
- **ID T5.4:** [ ] Implement email verification.
- **ID T5.5:** [ ] Display feedback messages and status notifications.

### T6: Listings and Browsing Pages
- **ID T6.1:** [x] Implement product listings page with data fetching (mock).
- **ID T6.2:** [x] Add filtering by category, university, and keywords.
- **ID T6.3:** [x] Support pagination or infinite scrolling.
- **ID T6.4:** [x] Handle empty state and loading indicators.

### T7: Messaging and Interaction UI
- **ID T7.1:** [x] Design chat window and message list UI.
- **ID T7.2:** [ ] Implement UI for sending/receiving messages.
- **ID T7.3:** [ ] Integrate UI with frontend state and socket service.
- **ID T7.4:** [ ] Display user online status/typing indicators.

### T9: Favorites and Profile Management
- **ID T9.1:** [x] Implement “Add to Favorites” and manage saved items.
- **ID T9.2:** [x] Develop profile dashboard with user activity summary (mock).
- **ID T9.3:** [ ] Integrate listings posted, messages, and transaction info.

### T10: Frontend Integration and API Connectivity
- **ID T10.1:** [ ] Connect UI components with backend RESTful APIs.
- **ID T10.2:** [ ] Manage API response states (loading, success, error).
- **ID T10.3:** [ ] Apply caching or local storage optimization.

### T20-T22: Testing (Frontend)
- **ID T21.1:** [ ] Identify possible test scenarios for the frontend.
- **ID T21.2:** [ ] Write comprehensive test cases for the frontend.
- **ID T22.1:** [ ] Conduct unit testing for individual components.
- **ID T22.2:** [ ] Perform integration testing with the backend API.

### T23: Web Deployment
- **ID T23.1:** [ ] Deploy web app to a hosting service (e.g., Vercel, AWS).
- **ID T23.2:** [ ] Verify API and database connectivity post-deployment.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Technology Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Component Library:** shadcn/ui
- **Icons:** Lucide React
- **State Management:** React Context
