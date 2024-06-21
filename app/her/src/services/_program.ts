import getConnection from '../config/connection';
import * as anchor from '@coral-xyz/anchor';
import idl from './idl.json';

const getProgram = (keypair: anchor.web3.Keypair) => {
  const connection = getConnection();
  const w = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, w, {
    preflightCommitment: 'confirmed',
  });
  anchor.setProvider(provider);
  const program = new anchor.Program(idl as anchor.Idl, provider);
  return program;
};

export default getProgram;
