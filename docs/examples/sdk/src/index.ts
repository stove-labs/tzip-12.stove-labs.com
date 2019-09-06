import { TezosNFT, Config } from "@stove-labs/tezos-nft-sdk";

const config: Config = {
  // replace with your real node's RPC address
  serverAddress: "http://localhost:8732",
  // replace with your deployed contract address
  contractAddress: "KT1J4g5sm71ynvr5SevBCU5udzE759SonDvY"
};

const nft = new TezosNFT(config);

nft.getAllTokens()
    .then(tokens => console.log("tokens", tokens));