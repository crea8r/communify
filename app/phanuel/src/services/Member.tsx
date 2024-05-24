import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import { PublicKey } from '@solana/web3.js';
import * as borsh from '@coral-xyz/borsh';
import sendTxn from '../funcs/sendTxn';
import { publicKey } from '@coral-xyz/anchor/dist/cjs/utils';

const MemberInfoAccountSchema = borsh.struct([
  borsh.publicKey('member'),
  borsh.u64('max'),
  borsh.u8('status'),
]);

export type MutMemberProps = {
  admin: anchor.Wallet;
  communityAccountPubKey: PublicKey;
  member: PublicKey;
  success: (data: any) => void;
  error?: (err: any) => void;
  fin?: () => void;
};

export const listMembers = async ({
  communityAccountPubKey,
}: {
  communityAccountPubKey: PublicKey;
}) => {
  const program = getProgram();
  let listMemberInfo;
  try {
    listMemberInfo = await program.provider.connection.getProgramAccounts(
      program.programId,
      {
        dataSlice: { offset: 8 + 32, length: 32 + 8 + 1 },
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(
                idl.accounts.filter((acc) => acc.name === 'MemberInfo')[0]
                  .discriminator
              ),
            },
          },
          {
            memcmp: {
              offset: 8,
              bytes: communityAccountPubKey.toBase58(),
            },
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
  }
  return (listMemberInfo || []).map((r: any) => {
    return {
      ...MemberInfoAccountSchema.decode(r.account.data),
      publicKey: r.pubkey,
    };
  });
};

export const addMember = async ({
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
  const txn = await program.methods
    .addMember()
    .accounts({
      communityAccount: communityAccountPubKey,
      memberInfo,
      member,
      admin: admin.publicKey,
      phanuelProgram: program.programId,
    })
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      success(data);
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

export const disableMember = async ({
  communityAccountPubKey,
  member,
  success,
  error,
}: MutMemberProps) => {};

export const mintToAll = async (
  communityAccountAddress: PublicKey,
  successCallback: any
) => {};

export default {
  listMembers,
  addMember,
  disableMember,
};
