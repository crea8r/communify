import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import { MemoSchema } from './_schemas';

const listSentNotes = async ({
  member,
  community,
}: {
  member: anchor.web3.PublicKey;
  community: anchor.web3.PublicKey;
}) => {
  const program = getProgram();
  let sentNotes;
  try {
    sentNotes = await program.provider.connection.getProgramAccounts(
      program.programId,
      {
        dataSlice: { offset: 8, length: 32 + 32 + 32 + 64 + 50 },
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(
                idl.accounts.filter((acc) => acc.name === 'Memo')[0]
                  .discriminator
              ),
            },
          },
          {
            memcmp: {
              offset: 8,
              bytes: community.toBase58(),
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
  } catch (err) {}
  return (sentNotes || [])
    .map((r: any) => {
      return {
        ...MemoSchema.decode(r.account.data),
        publicKey: r.pubkey,
      };
    })
    .sort((a, b) => {
      return b.decayAt - a.decayAt;
    });
};

export default listSentNotes;
