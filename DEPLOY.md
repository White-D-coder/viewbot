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

## Why Views Might Not Count
If you notice that the "views" on the YouTube video are not increasing despite running this bot, it is likely due to YouTube's fraud detection systems:

1.  **Duplicate IP Address**: YouTube ignores multiple views coming from the same IP address within a short time. Running 30 instances on one machine appears as 1 IP.
2.  **Autoplay & Muted**: Use of `autoplay` and `muted` players (required for this wall of videos) is often discounted by YouTube as "passive" or "low value" traffic.
3.  **Browser Throttling**: Processors (Chrome/Edge/Safari) will stop rendering iframes that are not "visible" or focused to save battery. This signals to YouTube that the user isn't actually watching.
4.  **Bot Detection**: YouTube can detect that the playback is embedded in a specific way and may flag it as non-human traffic.

**Mitigation Tips:**
-   **Use Proxies**: If you really need to simulate distinct users, each iframe would need to be routed through a different proxy (technically difficult with simple iframes).
-   **Interact**: Unmute occasionally or play manually.
-   **Spread Out**: Run the site on multiple devices (phones, laptops) on different networks (WiFi vs Data).
