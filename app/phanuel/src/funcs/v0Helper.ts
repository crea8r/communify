import * as anchor from '@coral-xyz/anchor';
import { web3 } from '@coral-xyz/anchor';
import sendTxn from './sendTxn';

export async function sendV0Transaction(
  connection: web3.Connection,
  user: anchor.Wallet,
  instructions: web3.TransactionInstruction[],
  lookupTableAccounts?: web3.AddressLookupTableAccount[]
) {
  // Get the latest blockhash and last valid block height
  const { lastValidBlockHeight, blockhash } =
    await connection.getLatestBlockhash();
  // Create a new transaction message with the provided instructions
  const messageV0 = new web3.TransactionMessage({
    payerKey: user.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message(lookupTableAccounts ? lookupTableAccounts : undefined);

  // Create a new transaction object with the message
  const transaction = new web3.VersionedTransaction(messageV0);

  // Sign the transaction with the user's keypair
  const signedTxn = await user.signTransaction(transaction);

  // Confirm the transaction
  try {
    // Send the transaction to the cluster
    const txid = await connection.sendTransaction(signedTxn, {
      skipPreflight: true,
    });
    await connection.confirmTransaction(
      {
        blockhash,
        lastValidBlockHeight,
        signature: txid,
      },
      'finalized'
    );
    return txid;
  } catch (e) {
    console.error('Error sending transaction: ', e);
    return false;
  }

  // console.log('https://explorer.solana.com/tx/' + txid + '?cluster=devnet');
}

export function waitForNewBlock(
  connection: web3.Connection,
  targetHeight: number
) {
  console.log(`Waiting for ${targetHeight} new blocks...`);
  return new Promise(async (resolve: any) => {
    // Get the last valid block height of the blockchain
    const { lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Set an interval to check for the new blocks every 1000ms
    const intervalId = setInterval(async () => {
      // Get the new valid block height
      const { lastValidBlockHeight: newValidBlockHeight } =
        await connection.getLatestBlockhash();
      // Check if the new valid block height is greater than the target block height
      if (newValidBlockHeight > lastValidBlockHeight + targetHeight) {
        clearInterval(intervalId);
        resolve();
      }
    }, 1000);
  });
}

export const MAX_ADDRESSES_PER_EXTEND_TXN = parseInt(
  import.meta.env.VITE_MAX_ADDRESSES_PER_EXTEND_TXN
);

export async function initializeLookupTable(
  user: anchor.Wallet,
  connection: web3.Connection,
  addresses: web3.PublicKey[],
  inform: (data: any) => void
): Promise<web3.PublicKey> {
  // Get the current slot
  const slot = await connection.getSlot();

  // Create an instruction for creating a lookup table
  // and retrieve the lookup table account address
  const [lookupTableInst, lookupTableAddress] =
    web3.AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey,
      payer: user.publicKey,
      recentSlot: slot,
    });
  console.log('lookup table address: ', lookupTableAddress.toBase58());

  let no_of_slices = Math.ceil(addresses.length / MAX_ADDRESSES_PER_EXTEND_TXN);
  const createLookupTableTxid = await sendV0Transaction(connection, user, [
    lookupTableInst,
  ]);
  inform({
    idx: 0,
    txid: createLookupTableTxid,
    msg:
      'Lookup table created successfully at ' + lookupTableAddress.toBase58(),
  });
  console.log('no of addresses: ', addresses.length);
  console.log('no of extend txn: ', no_of_slices);
  for (var i = 0; i < no_of_slices; i++) {
    const start = i * MAX_ADDRESSES_PER_EXTEND_TXN;
    const tmp = start + MAX_ADDRESSES_PER_EXTEND_TXN;
    console.log('tmp: ', tmp, ' addresses.length: ', addresses.length);
    const end = tmp > addresses.length ? addresses.length : tmp;
    let addresses_slice = addresses.slice(
      i * MAX_ADDRESSES_PER_EXTEND_TXN,
      end
    );
    const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({
      payer: user.publicKey,
      authority: user.publicKey,
      lookupTable: lookupTableAddress,
      addresses: addresses_slice, // The addresses to add to the lookup table
    });
    console.log(
      'prepare to extend addresses from ',
      start,
      ' to ',
      end,
      addresses_slice
    );
    // const extendLookupTableTxid = await sendV0Transaction(connection, user, [
    //   extendInstruction,
    // ]);

    ///
    const transaction = new web3.Transaction().add(extendInstruction);
    const extendLookupTableTxid = await sendTxn(connection, transaction, user);
    ///

    if (extendLookupTableTxid) {
      inform({
        idx: i + 1,
        txid: extendLookupTableTxid,
        msg: 'Lookup table extended at ' + lookupTableAddress.toBase58(),
        status: 2,
      });
    } else {
      inform({
        idx: i + 1,
        txid: '',
        msg: 'Lookup table failed to extend ' + lookupTableAddress.toBase58(),
        status: 1,
      });
    }
  }

  // Create an instruction to extend a lookup table with the provided addresses

  return lookupTableAddress;
}

export const sliceInArrays = (arr: any[], max: number) => {
  const noOfSlices = Math.ceil(arr.length / max);
  const rs = [];
  for (var i = 0; i < noOfSlices; i++) {
    const start = i * max;
    const end = start + max > arr.length ? arr.length : start + max;
    rs.push(arr.slice(start, end));
  }
  return rs;
};

const main = () => {
  const max = 5;
  function test(len: number) {
    const arr = [];
    for (var i = 0; i < len; i++) {
      arr.push(i);
    }
    console.log(sliceInArrays(arr, max));
  }
  test(3);
  test(4);
  test(5);
  test(6);
  test(9);
  test(10);
  test(11);
  test(12);
};
