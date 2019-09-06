import { TezosNFT, Config } from './TezosNFT';
import * as fetchMock from "fetch-mock";
import { StoreType, KeyStore } from "conseiljs";

const serverAddress = "http://localhost:8732";
const contractAddress = "KT1JooU649TWnvjqzciUngQP3zdZpWxkNREE";
const singleNFTStorage = {"prim":"Pair","args":[{"string":"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"},[{"prim":"Elt","args":[{"int":"1"},{"string":"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"}]}]]};
const multipleNFTStorage = {"prim":"Pair","args":[{"string":"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"},[{"prim":"Elt","args":[{"int":"1"},{"string":"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"}]},{"prim":"Elt","args":[{"int":"2"},{"string":"tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"}]},{"prim":"Elt","args":[{"int":"3"},{"string":"tz1TGu6TN5GSez2ndXXeDX6LgUDvLzPLqgYV"}]}]]}

const mockURL = `${serverAddress}/chains/main/blocks/head/context/contracts/${contractAddress}/storage`;
const mockSingleNFTStorage = () => {
    fetchMock
        .get(
            mockURL,
            singleNFTStorage
        )
};

const mockMultipleNFTStorage = () => {
    fetchMock
        .get(
            mockURL,
            multipleNFTStorage
        )
}

describe("TezosNFT", () => {
    var nft: TezosNFT;
    var config: Config = {
        serverAddress,
        contractAddress
    };

    beforeEach(() => {
        nft = new TezosNFT(config);
    });

    afterEach(() => {
        fetchMock.reset();
    });

    it("should accept a configuration object with a contract address", () => {
        const config: Config = {
            serverAddress,
            contractAddress
        }
        const nft = new TezosNFT(config);
    });

    describe("getContractOwner", () => {
        it("should return the address of the contract's owner", async () => {
            mockSingleNFTStorage();
            const owner = await nft.getContractOwner();
            expect(owner).toEqual((singleNFTStorage.args[0] as any).string);
        });
    });

    describe("getStorage", () => {
        it("should fetch the contrat storage from the RPC", async () => {
            mockSingleNFTStorage();
            const storage = await nft.getStorage();
            expect(storage).toEqual(singleNFTStorage.args);
        });
    });

    describe("getTokensCount", () => {
        it("should return the count of existing NFTs, when a single token exists", async () => {
            mockSingleNFTStorage();
            const count = await nft.getTokensCount();
            expect(count).toEqual(1);
        });

        it("should return the count of existing NFTs, when multiple tokens exist", async () => {
            mockMultipleNFTStorage();
            const count = await nft.getTokensCount();
            expect(count).toEqual(3);
        });
    });

    describe("getAllTokens", () => {
        it("should return a list of existing tokens", async () => {
            mockMultipleNFTStorage();
            const tokens = await nft.getAllTokens();
            expect(tokens.length).toEqual(3);
        });
    });

    describe("forgeTransferTokenOperation", () => {
        it("should transfer token ownership to the given address", async() => {
            const publicKeyHash = "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx";
    
            const operation = await nft.forgeTransferTokenOperation(publicKeyHash, "1", "tz1TGu6TN5GSez2ndXXeDX6LgUDvLzPLqgYV");
        });
    });
});
