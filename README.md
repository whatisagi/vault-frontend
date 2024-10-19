# vault-frontend

This is a Next.js application. It is deployed on

https://vault-frontend-five.vercel.app/

To test locally, clone the repo and run

```
npm install
npm run dev
```

To run the tests, run

```
npm run test
```

## Structure

- The main component is `OnboardingForm`, located in [./components/onboarding-form.tsx](./components/onboarding-form.tsx).

- The test file is located in [./components/onboarding-form.test.tsx](./components/onboarding-form.test.tsx).

- The application looks like this:

![app1](shots/app1.png)

## Error handling and form validation

- If **Submit** is clicked right away without any inputs:

![error1](shots/error1.png)

- Fields are validated on blur:

![error2](shots/error2.png)

- When the form is submitted: the form is disabled and data is sent to the
  backend for validation:

![v1](shots/v1.png)

- When the form is validated successfully: the form is cleared, a toast is shown:

![v2](shots/v2.png)

- If there is a problem with validation from the backend, the respective field
  is indicated:

![v3](shots/v3.png)

## Note

- We're not writing the test cases for invalid first name and invalid last name from the
backend. This is because the backend seems to always accepted any first and last names
as long as they're not empty (which we check in the frontend). However, we still do handle
these error cases.

- The UI/UX could be optimized some more.
