// ── Firebase config ──────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA1yIuvCuplOsaPgRXSCcjOz2z3ful5AeM",
  authDomain: "guardian-os-80042.firebaseapp.com",
  projectId: "guardian-os-80042",
  storageBucket: "guardian-os-80042.firebasestorage.app",
  messagingSenderId: "293568464040",
  appId: "1:293568464040:web:610554596a3803acfd2e9d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── EmailJS ──────────────────────────────────────
emailjs.init('_WKuuF_twjhvg9Y9X');

// ── Colour sync ──────────────────────────────────
function syncColor(val) {
  document.getElementById('primary_color').value = val;
}
function syncPicker(val) {
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
    document.getElementById('colorPicker').value = val;
  }
}

// ── Pricing calculator ───────────────────────────
function updatePricing() {
  const count = parseInt(document.getElementById('device_count').value) || 0;
  const base = 500;
  const perDevice = 50;
  const deviceCost = count * perDevice;
  const total = base + deviceCost;
  document.getElementById('deviceCountLabel').textContent = count;
  document.getElementById('deviceCost').textContent = 'R' + deviceCost;
  document.getElementById('totalCost').textContent = 'R' + total;
  document.getElementById('pricingBox').style.display = count > 0 ? 'block' : 'none';
}

// ── Generate registration code ───────────────────
function generateCode(companyName) {
  const prefix = companyName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return prefix + suffix;
}

// ── Generate company ID ──────────────────────────
function generateCompanyId(companyName) {
  return companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30) + '_' + Date.now();
}

// ── Form submit ──────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.style.display = 'none';

    const companyName = document.getElementById('company_name').value.trim();
    const contactName = document.getElementById('contact_name').value.trim();
    const contactEmail = document.getElementById('contact_email').value.trim();
    const contactPhone = document.getElementById('contact_phone').value.trim();
    const deviceCount = document.getElementById('device_count').value;
    const logoUrl = document.getElementById('logo_url').value.trim();
    const primaryColor = document.getElementById('primary_color').value.trim().replace('#', '');

    if (!deviceCount) {
      errorMsg.textContent = 'Please select the number of devices.';
      errorMsg.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Submitting...';

    try {
      const registrationCode = generateCode(companyName);
      const companyId = generateCompanyId(companyName);

      await db.collection('companies').doc(companyId).set({
        name: companyName,
        contactName: contactName,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        logoUrl: logoUrl,
        primaryColor: primaryColor,
        maxDevices: parseInt(deviceCount),
        registrationCode: registrationCode,
        isActive: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await emailjs.send('service_sxhcn8m', 'template_qox5nkh', {
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        device_count: deviceCount,
        logo_url: logoUrl || 'None provided',
        primary_color: '#' + primaryColor,
        registration_code: registrationCode,
        company_id: companyId,
      });

      document.getElementById('formCard').style.display = 'none';
      document.getElementById('successCard').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Something went wrong: ' + err.message;
      errorMsg.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<span>🚀</span> Submit Registration';
    }
  });
});
