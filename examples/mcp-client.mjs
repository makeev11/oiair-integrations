/** Public reads only. No form submission, reservations or messages. */
const v1 = process.argv.includes('--v1');
const query = process.argv.find((arg, index) => index > 1 && arg !== '--v1') || 'jiu-jitsu';
const {Client, StreamableHTTPClientTransport} = v1
  ? {Client: (await import('@modelcontextprotocol/sdk/client/index.js')).Client,
     StreamableHTTPClientTransport: (await import('@modelcontextprotocol/sdk/client/streamableHttp.js')).StreamableHTTPClientTransport}
  : await import('@modelcontextprotocol/client');
const client = v1
  ? new Client({name: 'oiair-example-v1', version: '0.1.0'})
  : new Client({name: 'oiair-example', version: '0.1.0'}, {versionNegotiation: {mode: {pin: '2026-07-28'}}});

async function read(name, args) {
  const result = await client.callTool({name, arguments: args});
  if (result.isError) throw new Error(`${name}: ${JSON.stringify(result.content)}`);
  if (!result.structuredContent) throw new Error(`${name}: structured output missing`);
  return result.structuredContent;
}

try {
  await client.connect(new StreamableHTTPClientTransport(new URL('https://oiair.com.br/api/mcp')));
  const {tools} = await client.listTools();
  console.log('Tools:', tools.map(tool => tool.name).join(', '));
  const search = await read('search_activities', {query, locale: 'pt-BR', filters: {city: 'Florianópolis'}, limit: 3});
  console.log('Search:', JSON.stringify({
    queryStatus: search.queryStatus,
    bookingSemantics: search.bookingSemantics,
    items: search.items.map(item => ({
      organizationId: item.id,
      organization: item.organization,
      currentPublishedGroups: item.publishedOffers?.length || 0
    }))
  }, null, 2));
  const match = search.items.find(item => item.publishedOffers?.length);
  if (!match) {
    console.log('No current published group in this shortlist. Refine the search; no form link was prepared.');
  } else {
    const selected = match.publishedOffers[0];
    const profile = await read('get_organization', {organizationId: match.id, locale: 'pt-BR'});
    const groups = await read('list_offerings', {organizationId: match.id, locale: 'pt-BR'});
    const group = groups.items.find(item => item.publicationId === selected.publicationId && item.version === selected.version);
    if (!group) {
      console.log('The selected group changed or became unavailable. Search again; no other group was substituted.');
    } else {
      const offering = await read('get_offering', {publicationId: group.publicationId, expectedVersion: group.version});
      const link = await read('get_booking_link', {organizationId: match.id, publicationId: group.publicationId, expectedVersion: group.version, visit: 'regular'});
      console.log('Organization:', profile.item.organization);
      console.log('Group:', JSON.stringify(offering.item, null, 2));
      console.log('Request form:', link.url);
      console.log('Source:', link.source, 'checkedAt:', link.checkedAt, 'validUntil:', link.validUntil);
      console.log('Availability is unknown. Opening this link does not submit a request or reserve a seat.');
    }
  }
} finally {
  await client.close();
}
