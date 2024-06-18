module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
    networks: {
        development: {
            url: "https://chain.alteregofiere.com",
            // host: "127.0.0.1",
            // port: 7545,
            network_id: "*", // Match any network id
            gasLimit: 100000000000
        },
        develop: {
            port: 7545
        }
    },
    compilers: {
        solc: {
            version: "0.7.3"
        }
    }
}
