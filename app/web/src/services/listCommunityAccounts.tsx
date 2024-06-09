import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import { PublicKey } from '@solana/web3.js';
import { FullMemberInfoAccountSchema } from './_schemas';

const listCommunityAccounts = async ({ member }: { member: PublicKey }) => {
  const program = getProgram();
  let listCommunityInfo;
  try {
    listCommunityInfo = await program.provider.connection.getProgramAccounts(
      program.programId,
      {
        dataSlice: { offset: 8, length: 32 + 32 + 8 + 1 },
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
              offset: 8 + 32,
              bytes: member.toBase58(),
            },
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
  }
  return (listCommunityInfo || []).map((r: any) => {
    return {
      ...FullMemberInfoAccountSchema.decode(r.account.data),
      publicKey: r.pubkey,
    };
  });
};

export default listCommunityAccounts;
