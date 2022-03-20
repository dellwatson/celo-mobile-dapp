import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

import WalletConnectProvider from '@walletconnect/web3-provider';
import { useWalletConnect } from '@walletconnect/react-native-dapp';
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import LocalToken from "../eth-sdk/abis/DellNFT.json";


// const connector = useWalletConnect();
// const provider = new WalletConnectProvider({
//         rpc: {
//             56: 'https://bsc-dataseed1.binance.org:443',
//         },
//         chainId: 56,
//         connector: connector,
//         qrcode: false,
//     });
// await provider.enable();
// const ethers_provider = new ethers.providers.Web3Provider(provider);
// const signer = ethers_provider.getSigner();


const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length
  )}`;
}

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const connector = useWalletConnect();



  const doMint = async () => {

    const provider = new WalletConnectProvider({
      rpc: {
        44787: 'https://alfajores-forno.celo-testnet.org',
      },
      chainId: 44787,
      connector: connector,
      qrcode: false,
    });
    await provider.enable();
    const ethers_provider = new ethers.providers.Web3Provider(provider);
    const signer = ethers_provider.getSigner();

    const contracx = new Contract("0x61C351B5499cE225CCc228A50c04562934eE503c", LocalToken?.abi, signer);
    // console.log(contracx, 'contrac')

    // const res = await contracx.ownerOf(0);

    try {


      let nftTx = await contracx.createDellNFT();
      console.log("Mining....", nftTx.hash);

      let tx = await nftTx.wait();
      console.log("Mined!", tx);
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();

      console.log(tokenId, 'tokenId')

      console.log(
        `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTx.hash}`
      );

    } catch (error) {
      console.log(error, 'error')
    }
  }

  // console.log(connector, 'connector')

  const connectWallet = React.useCallback(() => {
    return connector.connect();
  }, [connector]);

  const killSession = React.useCallback(() => {
    return connector.killSession();
  }, [connector]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {!connector.connected && (
        <TouchableOpacity onPress={connectWallet} style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>Connect a Wallet</Text>
        </TouchableOpacity>
      )}
      {!!connector.connected && (
        <>
          <Text>{shortenAddress(connector.accounts[0])}</Text>


          <TouchableOpacity onPress={doMint} style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>MINT</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  buttonStyle: {
    backgroundColor: "#3399FF",
    borderWidth: 0,
    color: "#FFFFFF",
    borderColor: "#3399FF",
    height: 40,
    alignItems: "center",
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTextStyle: {
    color: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: "600",
  },
});
