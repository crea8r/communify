import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import { PublicKey } from '@solana/web3.js';
import {
  MemberInfoAccountSchema,
  FullMemberInfoAccountSchema,
  BagInfoSchema,
} from './_schemas';
import sendTxn from '../funcs/sendTxn';
import { MutMemberProps } from './_types';

const addMember = async ({
  admin,
  communityAccountPubKey,
  member,
  success,
  error,
  fin,
}: MutMemberProps) => {
  const program = getProgram();
  const [memberInfo] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), communityAccountPubKey.toBuffer(), member.toBuffer()],
    program.programId
  );
  console.log(
    'accounts: ',
    communityAccountPubKey.toBase58(),
    memberInfo.toBase58(),
    member.toBase58(),
    admin.publicKey.toBase58(),
    program.programId.toBase58()
  );
  const accounts = {
    communityAccount: communityAccountPubKey,
    memberInfo,
    member,
    admin: admin.publicKey,
    phanuelProgram: program.programId,
  };
  const txn = await program.methods
    .addMember()
    .accounts(accounts)
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      if (data.err) {
        console.error(data.err);
        if (error) {
          error(data.err);
        }
      } else {
        success(data);
      }
    })
    .catch((e) => {
      if (error) {
        error(e);
      }
    })
    .finally(() => {
      if (fin) {
        fin();
      }
    });
};

export default addMember;
