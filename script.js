import { ethers } from 'https://cdn-cors.ethers.io/lib/ethers-5.5.4.esm.min.js';

import { CONTRACT_ADDRESS, ABI } from '/constants.js';
const connectButton = document.getElementById('connect-wallet');
const fundMeFormField = document.getElementById('fund');
const fundMeButton = document.getElementById('fundme-button');
const withdrawButton = document.getElementById('withdraw-button');
const refreshBalance = document.getElementById('refresh-balance');

const amountInWallet = async () => {
  const { contract, provider } = await connect();
  const balance = await provider.getBalance(contract.address);
  return balance;
};
const getBalanceHelper = async () => {
  const balance = await amountInWallet();

  document.getElementById('balance-amount').textContent =
    'you currently have \t' + ethers.utils.formatEther(balance) + ' ether \n';
};

refreshBalance.addEventListener('click', async () => {
  await getBalanceHelper();
});

//get balance on page load
document.addEventListener('DOMContentLoaded', async () => {
  const { contract, provider } = await connect();
  const balance = await provider.getBalance(contract.address);
  console.log(balance.toString());
  document.getElementById('balance-amount-loading').remove();
  document.getElementById('balance-amount').textContent =
    'you currently have \t' + ethers.utils.formatEther(balance) + ' ether\n';
});

//withdraw
withdrawButton.addEventListener('click', async () => {
  await withdraw();
});

//fund
fundMeButton.addEventListener('click', async () => {
  const amountToBeFunded = fundMeFormField.value;
  //validate
  console.log(amountToBeFunded);
  parseInt(amountToBeFunded) <= 0 && console.log('Amount must be grater');
  await fund(ethers.utils.parseEther(amountToBeFunded));
});

connectButton.onclick = connect;

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    //connect to the wallet
    console.log('Wallet is installed');
    try {
      //   await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const signer = await provider.getSigner();
      return {
        contract: new ethers.Contract(CONTRACT_ADDRESS, ABI, signer),
        provider,
      };
    } catch (error) {
      console.log(error.message);
    }
  } else {
    console.log('Download Metamask extension');
  }
}

async function withdraw() {
  try {
    const { contract } = await connect();
    const transactionResponse = await contract.optimizedwithdraw();
    const recepit = await transactionResponse.wait(1);
    console.log(recepit);
    document.getElementById(
      'withdraw-text'
    ).textContent = ` Amount ${await amountInWallet()} have been withdrawn hurray!!!! `;
    await getBalanceHelper();
  } catch (error) {
    console.log(error);
  }
}

async function fund(amount) {
  try {
    const { contract } = await connect();

    const transactionResponse = await contract.fund({ value: amount });
    const { to, from } = await transactionResponse.wait(1);
    window.alert(
      `Transfered ${ethers.utils.formatEther(
        amount
      )} ethers from ${from} to ${to} sucessfully`
    );
    await getBalanceHelper();
  } catch (error) {
    console.log(error);
  }
}
