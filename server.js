import Fastify from 'fastify';
import fetch from 'node-fetch';

const fastify = Fastify({ logger: true });

// Root route
fastify.get('/', async (request, reply) => {
  return { message: 'Limitless API is live!' };
});

// GET latest tournaments
fastify.get('/get-latest-tournaments', async (request, reply) => {
  const query = `
    {
      tournaments(limit: 5, orderBy: {startDate: desc}, filter: {format: "STANDARD"}) {
        nodes {
          id
          name
          startDate
          format
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.limitlesstcg.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data.tournaments.nodes;
  } catch (err) {
  console.error('[Meta Deck Fetch Error]', err);
  reply.code(500).send({ error: err.message || 'Error fetching meta decks' });
}
});

// GET meta decks
fastify.get('/get-meta-decks', async (request, reply) => {
  const query = `
    {
      tournamentStandings(
        filter: {
          placing: {lte: 8}
          tournament: {format: "STANDARD"}
        }
        orderBy: {tournament: {startDate: desc}}
        limit: 10
      ) {
        nodes {
          placing
          deck {
            name
            archetype
            cards {
              card {
                name
              }
              count
            }
          }
          tournament {
            name
            startDate
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.limitlesstcg.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data.tournamentStandings.nodes;
  } catch (err) {
    console.error(err);
    reply.code(500).send({ error: 'Error fetching meta decks' });
  }
});

// Start server
fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
