const Settings = require('../config/');
const ElectrumCli = require('electrum-client');

const Client = new ElectrumCli(
  Settings['electrumx']['port'],
  Settings['electrumx']['uri'],
  Settings['electrumx']['type']);

const Sleep = (ms) => new Promise((resolve, _) => setTimeout(() => resolve(), ms))

exitHandler = async () => {
  await Client.close();
  console.log('Closed?');
  process.exit();
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

//catches uncaught exceptions
// process.on('uncaughtException', exitHandler);

pingClient = async () => {
  try {
    while(true) {
      await Sleep(1000);

      if (typeof Client.server_version === 'function') {
        console.log('--ping');
        await Client.server_version("2.7.11", "1.1");
      }
    }
  } catch(e) {
    console.log('ElectrumX Client Error', e);
    process.exit(0);
  }
}

const main = async () => {
try {
    await Client.connect();
    let version = await Client.server_version("2.7.11", "1.1");

    console.log(`ElectrumX Connected - ${version}`);
    module.exports = Client;
    pingClient();
  } catch(e) {
    console.log('ElectrumX Client Error', e);
    process.exit(0);
  }
};

main().catch(console.log)
