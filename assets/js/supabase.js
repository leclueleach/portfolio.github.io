/* ============================================================
   SUPABASE.JS — Le Clue Portfolio
   Initialises the Supabase client and exposes helper
   functions for all data operations across the site.

   SETUP:
   1. Create a free project at https://supabase.com
   2. Go to Project Settings → API
   3. Replace the two placeholder values below with your
      Project URL and anon/public key.
   4. Never commit your service_role key here — anon only.
   ============================================================ */

/* ----------------------------------------------------------
   CONFIG — replace these two values before going live
---------------------------------------------------------- */
const SUPABASE_URL  = 'https://mmvwiopsxawckcbuebfk.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdndpb3BzeGF3Y2tjYnVlYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTkzMDUsImV4cCI6MjA5NDE3NTMwNX0.YAZJMGFNTFh9tf4JUyEmWxKKW_OLjvxdycdcGhoM1Lk';

/* ----------------------------------------------------------
   CLIENT INIT
   Uses the Supabase CDN client (loaded via script tag).
   Add this to every page's <head> before supabase.js:

   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   <script src="../assets/js/supabase.js" defer></script>

   For index.html (root level), use:
   <script src="./assets/js/supabase.js" defer></script>
---------------------------------------------------------- */
let _client = null;

function getClient() {
  if (!_client) {
    if (typeof supabase === 'undefined') {
      console.warn('[LC] Supabase SDK not loaded. Check your script tag order.');
      return null;
    }
    _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _client;
}

/* ----------------------------------------------------------
   HELPER — get metadata attached to every log entry
---------------------------------------------------------- */
function getMeta() {
  return {
    referrer:    document.referrer   || null,
    user_agent:  navigator.userAgent || null,
  };
}

/* ----------------------------------------------------------
   LOG DEMO VIEW
   Call this when a visitor clicks "Launch Demo" on a
   portfolio card. Logs which demo was launched.

   Usage:
     await logDemoView('vaultic');

   Table: demo_views
   Columns: id, demo_name, viewed_at, referrer, user_agent
---------------------------------------------------------- */
async function logDemoView(demoName) {
  const client = getClient();
  if (!client) return;

  const { error } = await client
    .from('demo_views')
    .insert([{
      demo_name:  demoName,
      viewed_at:  new Date().toISOString(),
      ...getMeta(),
    }]);

  if (error) console.warn('[LC] logDemoView error:', error.message);
}

/* ----------------------------------------------------------
   LOG CV DOWNLOAD
   Call this when a visitor clicks the CV download button.

   Usage:
     await logCvDownload();

   Table: cv_downloads
   Columns: id, downloaded_at, referrer, user_agent
---------------------------------------------------------- */
async function logCvDownload() {
  const client = getClient();
  if (!client) return;

  const { error } = await client
    .from('cv_downloads')
    .insert([{
      downloaded_at: new Date().toISOString(),
      ...getMeta(),
    }]);

  if (error) console.warn('[LC] logCvDownload error:', error.message);
}

/* ----------------------------------------------------------
   SUBMIT CONTACT FORM
   Call this on contact form submission. Returns true on
   success, false on failure so the form can show feedback.

   Usage:
     const ok = await submitContact({ name, email, message });
     if (ok) { showSuccess(); } else { showError(); }

   Table: contact_submissions
   Columns: id, name, email, message, created_at
---------------------------------------------------------- */
async function submitContact({ name, email, message }) {
  const client = getClient();
  if (!client) return false;

  if (!name || !email || !message) {
    console.warn('[LC] submitContact: missing required fields.');
    return false;
  }

  const { error } = await client
    .from('contact_submissions')
    .insert([{
      name,
      email,
      message,
      created_at: new Date().toISOString(),
    }]);

  if (error) {
    console.warn('[LC] submitContact error:', error.message);
    return false;
  }

  return true;
}

/* ----------------------------------------------------------
   EXPORTS
   All functions are attached to window so any page script
   can call them without module imports.
---------------------------------------------------------- */
window.LC = window.LC || {};
window.LC.logDemoView   = logDemoView;
window.LC.logCvDownload = logCvDownload;
window.LC.submitContact = submitContact;
