import { KeyStore, TezosNodeWriter, TezosParameterFormat, TezosNodeReader, TezosLanguageUtil } from "conseiljs";
export interface Config {
  serverAddress: string,
  contractAddress: string
}

export interface Token {
  owner: string
}

export class TezosNFT {
  
  /**
   * 
   * @param config Configuration object for the NFT instance
   */
  constructor(public config: Config) {}

  /**
   * @returns Whole storage as received from the RPC
   */
  async getStorage() {
    const url = `${this.config.serverAddress}/chains/main/blocks/head/context/contracts/${this.config.contractAddress}/storage`;
    return fetch(
      url, 
      { method: 'get' }
    )
    .then(response => response.json())
    .then(json => json.args);
  }

  /**
   * @returns string Address assigned as the contract owner
   */
  async getContractOwner(): Promise<string> {
    const storage = await this.getStorage();
    return storage[0].string;
  }

  async getAllTokens(): Promise<Token[]> {
    const storage = await this.getStorage();
    return storage[1]
      // @TODO: define types for RPC storage accordingly
      .map((storageToken: any) => {
        return storageToken.args
      })
      .map((storageToken: any) => {
        return {
          id: storageToken[0].int,
          owner: storageToken[1].string
        }
      })
  }

  /**
   * @returns Promise<number> Count of existing tokens
   */
  async getTokensCount(): Promise<number> {
    const tokens = await this.getAllTokens();
    return tokens.length;
  }

  async forgeTransferTokenOperation(publicKeyHash: string, id: string, destination: string): Promise<string> {
    const counter = await TezosNodeReader.getCounterForAccount(this.config.serverAddress, publicKeyHash) + 1;
    const blockHead = await TezosNodeReader.getBlockHead(this.config.serverAddress);

    let transaction: any = {
      destination: this.config.contractAddress,
      amount: "0",
      storage_limit: "1000",
      gas_limit: "100000",
      counter: counter.toString(),
      fee: "100000",
      source: publicKeyHash,
      kind: 'transaction'
    };

    /**
     * LIGO:
     * Transfer(record nftToTransfer = 1n ; destination = ("tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx" : address) end)
     * 
     * Michelson:
     * (Right (Pair "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx" 1))
     */
    const michelsonParameters = `(Right (Pair "${destination}" ${id}))`;
    transaction.parameters = JSON.parse(
      TezosLanguageUtil.translateMichelsonToMicheline(michelsonParameters)
    )

    return await TezosNodeWriter.forgeOperationsRemotely(this.config.serverAddress, (blockHead as any), [transaction])
  }
}

export default TezosNFT;
