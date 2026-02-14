// src/app/privacy-policy/page.tsx

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, lineHeight: 1.6 }}>
      <h1>Privacy Policy – Gold Live</h1>
      <p>Last updated: {new Date().getFullYear()}</p>

      <h2>1. Introduction</h2>
      <p>
        Gold Live ("we", "our", or "us") operates the Gold Live mobile application.
        This Privacy Policy explains how we collect, use, and protect your information.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>Account information (username, email, profile details)</li>
        <li>Live streaming content</li>
        <li>Device information</li>
        <li>Camera and microphone access (for live streaming)</li>
      </ul>

      <h2>3. Camera & Microphone Usage</h2>
      <p>
        Gold Live requires access to your device camera and microphone 
        only for the purpose of live video streaming and video content creation.
      </p>
      <p>
        We do not access your camera or microphone without your permission.
        Camera and microphone are used only while you actively use live streaming features.
      </p>

      <h2>4. How We Use Information</h2>
      <ul>
        <li>To provide live streaming services</li>
        <li>To improve user experience</li>
        <li>To maintain platform safety and security</li>
      </ul>

      <h2>5. Data Sharing</h2>
      <p>
        We do not sell user data. We may share information with trusted service providers
        strictly for app functionality and security purposes.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We implement appropriate security measures to protect your information.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        Gold Live is not intended for users under the age of 18.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, contact us at:
        goldliveapp@gmail.com
      </p>
    </div>
  );
}
