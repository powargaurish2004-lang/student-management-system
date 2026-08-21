# Student Management System

## Run locally

1. Start the API from `student-management-backend` with `npm run dev`.
2. Start this frontend with `npm run dev`.
3. Open the Vite URL shown in the terminal, normally `http://localhost:5174`.

The frontend uses `VITE_API_URL` from `.env`. Database, JWT, and admin credentials belong only in the backend `.env`; never put them in a `VITE_*` variable.

Admin registration requires the configured backend admin name, email, password, and `ADMIN_SIGNUP_CODE`. Users can register normally. Users can add and edit only their own students; admins can manage all students.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
