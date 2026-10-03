const { getTransactions } = require('./lib/actions/transaction.actions');

async function test() {
  console.log('Testing getTransactions...');
  // Note: auth() will return null because there's no Next.js request context in pure node
}
