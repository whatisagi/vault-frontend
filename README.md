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

[app1](shots/app1.png)

## Error handling and form validation

- If **Submit** is clicked right away without any inputs:

[error1](shots/error1.png)

- Fields are validated on blur:

[error2](shots/error2.png)

- When the form is submitted: the form is disabled and data is sent to the
  backend for validation:

[v1](shots/v1.png)

- When the form is validated successfully: the form is cleared, a toast is shown:

[v2](shots/v2.png)
