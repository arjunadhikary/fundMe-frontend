import { ethers } from 'https://cdn-cors.ethers.io/lib/ethers-5.5.4.esm.min.js';

import { CONTRACT_ADDRESS, ABI } from '/constants.js';
const connectButton = document.getElementById('connect-wallet');
const fundMeFormField = document.getElementById('fund');
const fundMeButton = document.getElementById('fundme-button');
const withdrawButton = document.getElementById('withdraw-button');

withdrawButton.addEventListener('click', async () => {
  await withdraw();
});

fundMeButton.addEventListener('click', async () => {
  const amountToBeFunded = fundMeFormField.value;
  //validate
  console.log(amountToBeFunded);
  parseInt(amountToBeFunded) <= 0 && console.log('Amount must be grater');
  await fund(ethers.utils.parseEther(amountToBeFunded));
});

let fundMeContact;
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
      fundMeContact = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    } catch (error) {
      console.log(error.message);
    }
  } else {
    console.log('Download Metamask extension');
  }
}

async function withdraw() {
  try {
    const transactionResponse = await fundMeContact.optimizedwithdraw();
    const recepit = await transactionResponse.wait(1);
    console.log(recepit);
  } catch (error) {}
}

async function fund(amount) {
  try {
    const transactionResponse = await fundMeContact.fund({ value: amount });
    const { to, from } = await transactionResponse.wait(1);
    window.alert(
      `Transfered ${ethers.utils.formatEther(
        amount
      )} ethers from ${from} to ${to} sucessfully`
    );
  } catch (error) {
    console.log(error);
  }
}
