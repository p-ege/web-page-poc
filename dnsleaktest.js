/**
 * Minimal DNS Leak Test
 * Based on dnsleaktest.com's implementation
 */
async function dnsLeakTest(options = {}) {
  const config = {
    rounds: options.rounds || 1,
    queries: options.queries || 6,
    host: options.host || 'test.dnsleaktest.com',
    apiBase: options.apiBase || 'https://dns.mfa.workers.dev'
  };

  // Generate UUIDs
  const ids = [];
  for (let i = 0; i < config.rounds * config.queries; i++) {
    ids.push(crypto.randomUUID());
  }

  // Register identifiers with server
  await fetch(`${config.apiBase}/api/v1/identifiers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiers: ids })
  });

  // Trigger DNS lookups via image requests
  const loadImage = (id) => new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = `//${id}.${config.host}`;
  });

  for (let i = 0; i < ids.length; i++) {
    await loadImage(ids[i]);
  }

  // Get results
  const res = await fetch(`${config.apiBase}/api/v1/servers-for-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries: ids })
  });

  return res.json();
}
