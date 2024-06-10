import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import { PublicKey } from '@solana/web3.js';
import { MemberInfoAccountSchema } from './_schemas';

const listMembers = async ({
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
  return (listMemberInfo || [])
    .map((r: any) => {
      return {
        ...MemberInfoAccountSchema.decode(r.account.data),
        publicKey: r.pubkey,
      };
    })
    .sort((a: any, b: any) => {
      const na = new anchor.BN(a.member.toBytes());
      const nb = new anchor.BN(b.member.toBytes());
      return nb.ucmp(na);
    });
};

export default listMembers;
