/** Focused live acceptance: public reads and intentionally rejected stale version. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Client, StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {Client as V1Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport as V1Transport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const origin = 'https://oiair.com.br';
const localJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const get = async path => {
  const response = await fetch(new URL(path, origin), {signal: AbortSignal.timeout(30000)});
  assert.equal(response.status, 200, path);
  return response.json();
};
const contract = await localJson('../contracts/public-read.openapi.json');
assert.deepEqual(await get('/api/v1/openapi.json'), contract, 'Published REST contract changed; review before updating the snapshot');
const registry = await localJson('../server.json');
assert.equal(registry.remotes[0].url, `${origin}/api/mcp`);
const expectedTools = await localJson('../contracts/mcp-tools.json');
const capabilities = await get('/api/v1/agent-capabilities');
assert.equal(capabilities.mcp.enabled, true);
assert.equal(capabilities.capabilities.reservation, false);
const current = await get('/api/v1/offerings');
assert.ok(current.items.length, 'A current public group is required to check all five tools');
const group = current.items[0];
const calls = [
  ['search_activities', {query: 'jiu-jitsu', locale: 'pt-BR', filters: {city: 'Florianópolis'}, limit: 3}],
  ['get_organization', {organizationId: group.organizationId, locale: 'pt-BR'}],
  ['list_offerings', {organizationId: group.organizationId, locale: 'pt-BR'}],
  ['get_offering', {publicationId: group.id, expectedVersion: group.version}],
  ['get_booking_link', {organizationId: group.organizationId, publicationId: group.id, expectedVersion: group.version, visit: 'regular'}]
];
const checked = [];
for (const v1 of [false, true]) {
  const client = v1
    ? new V1Client({name: 'oiair-integrations-check-v1', version: '0.1.0'})
    : new Client({name: 'oiair-integrations-check', version: '0.1.0'}, {versionNegotiation: {mode: {pin: '2026-07-28'}}});
  try {
    await client.connect(v1 ? new V1Transport(new URL('/api/mcp', origin)) : new StreamableHTTPClientTransport(new URL('/api/mcp', origin)));
    assert.equal(client.getServerVersion().version, registry.version, 'Registry version must match the released server');
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map(tool => tool.name), expectedTools.map(tool => tool.name));
    assert.ok(listed.tools.every(tool => tool.annotations?.readOnlyHint === true && tool.annotations.destructiveHint === false));
    for (const [name, args] of calls) {
      const result = await client.callTool({name, arguments: args});
      assert.notEqual(result.isError, true, `${name}: ${JSON.stringify(result.content)}`);
      const data = result.structuredContent;
      assert.ok(data, `${name}: structured output`);
      assert.equal(data.bookingSemantics.availability, 'unknown');
      assert.equal(data.bookingSemantics.createsRequest, false);
      assert.equal(data.bookingSemantics.reservesSeat, false);
      if (name === 'get_booking_link') {
        const url = new URL(data.url);
        assert.equal(url.origin, origin);
        assert.ok(url.pathname.startsWith('/organizacao/'));
        assert.equal(url.searchParams.get('publication'), group.id);
        assert.equal(url.searchParams.get('booking'), '1');
        assert.equal(data.version, group.version);
        assert.ok(Date.parse(data.checkedAt) <= Date.now() && Date.parse(data.validUntil) > Date.now());
      }
    }
    const stale = await client.callTool({name: 'get_booking_link', arguments: {organizationId: group.organizationId, publicationId: group.id, expectedVersion: group.version + 1, visit: 'regular'}});
    assert.equal(stale.isError, true, 'Stale version must be rejected');
    checked.push({client: v1 ? 'sdk-1.30.0' : 'client-2.0.0', tools: calls.map(([name]) => name), staleVersionRejected: true});
  } finally {
    await client.close();
  }
}
console.log(JSON.stringify({checkedAt: new Date().toISOString(), origin, contractMatches: true, serverVersion: registry.version, checked, businessWrites: false, thirdPartyHostAccountTested: false}, null, 2));
