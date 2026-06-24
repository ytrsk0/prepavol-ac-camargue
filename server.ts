import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3000;

app.use(express.json());

// AeroGest Proxy
app.post('/api/aerogest/login', async (req, res) => {
  const { username, password } = req.body;
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true }));

  try {
    const loginUrl = 'https://online.aerogest.fr/Connection/logon';
    
    // 1. Get login page to extract CSRF token
    const getResponse = await client.get(loginUrl);
    const $ = cheerio.load(getResponse.data);
    const token = $('input[name="__RequestVerificationToken"]').val() as string;

    // 2. Perform login
    const loginResponse = await client.post(loginUrl, new URLSearchParams({
      login: username,
      password: password,
      rememberMe: 'true',
      __RequestVerificationToken: token
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // 3. Check if logged in (usually redirects to dashboard)
    const dashboardUrl = 'https://online.aerogest.fr/FlightManagement/Flight/indexPilot';
    const dashboardResponse = await client.get(dashboardUrl);
    const $dash = cheerio.load(dashboardResponse.data);
    const pilotId = $dash('#idPilot').val() as string;

    if (!pilotId) {
      return res.status(401).json({ error: 'Login failed' });
    }

    // 4. Fetch flight logs
    const apiUrl = 'https://online.aerogest.fr/api/FlightManagement/FlightAPI/getPilot';
    const flightData = new URLSearchParams({
      date1: '1970-01-01',
      date2: new Date().toISOString().split('T')[0],
      idPilot: pilotId
    });

    const apiResponse = await client.post(apiUrl, flightData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // The API returns a JSON string inside a body tag sometimes in the original app logic
    const $api = cheerio.load(apiResponse.data);
    const rawData = $api('body').text() || apiResponse.data;
    const logs = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    res.json({ pilotId, logs });
  } catch (error: any) {
    console.error('AeroGest Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
