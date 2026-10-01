/** Public GET only; do not put personal information into search queries. */
const url = new URL('https://oiair.com.br/api/v1/search');
url.searchParams.set('q', process.argv[2] || 'jiu-jitsu');
url.searchParams.set('city', 'Florianópolis');
url.searchParams.set('locale', 'pt-BR');
url.searchParams.set('limit', '3');
const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
if (!response.ok) throw new Error(`Public API returned HTTP ${response.status}`);
console.log(JSON.stringify(await response.json(), null, 2));
