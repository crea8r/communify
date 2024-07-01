// @ts-nocheck
import * as anchor from '@coral-xyz/anchor';
import idl from './_idl.json';
import { Phanuel as PhanuelType } from './_program';
import { PublicKey } from '@solana/web3.js';
let connection: anchor.web3.Connection;
let program: anchor.Program<PhanuelType>;

const init = (_connection: anchor.web3.Connection, sender: PublicKey) => {
  connection = _connection;
  const _signAllTransactions = () => {};
  const provider = new anchor.AnchorProvider(
    connection,
    {
      publicKey: sender,
      signTransaction: connection.sendTransaction,
      signAllTransactions: _signAllTransactions,
    },
    { preflightCommitment: 'confirmed' }
  );
  anchor.setProvider(provider);
  program = new anchor.Program(idl as PhanuelType, provider);
};

export const getProgram = () => {
  return program;
};

export default init;
