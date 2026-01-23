# How to Host on Vercel

The easiest way to host this application is using **Vercel**.

## Option 1: Command Line (Fastest)
You can deploy directly from your terminal without creating a GitHub repository first.

1.  **Run the deploy command:**
    ```bash
    npx vercel
    ```

2.  **Follow the prompts:**
    -   Need to install Vercel CLI? -> **Y**
    -   Log in to Vercel (It will open your browser).
    -   Set up and deploy? -> **Y**
    -   Which scope? -> (Select your account)
    -   Link to existing project? -> **N**
    -   Project Name? -> `multi-view-bot` (or press Enter)
    -   In which directory? -> `./` (Press Enter)
    -   **Auto-detect settings**: Vercel will automatically detect `Vite` and `React`. Just press Enter for all build settings.

3.  **Wait for Deployment:**
    -   It will upload your files.
    -   It will build the site (less than 1 min).
    -   **Done!** It will give you a `Production: https://...` link.

## Option 2: GitHub (Recommended for Updates)
If you want the site to update automatically when you save code:

1.  Create a new repository on GitHub.
2.  Push this code to GitHub.
3.  Go to [Vercel.com](https://vercel.com) -> "Add New..." -> "Project".
4.  Select your GitHub repository.
5.  Click **Deploy**.

## post-deployment Note
**Important:** Your browser might block "Autoplay" on the hosted site because it is a new domain.
-   You may need to click the "Lock/Permissions" icon in your URL bar and allow **Audio/Sound** or **Autoplay** for the site to function perfectly.
