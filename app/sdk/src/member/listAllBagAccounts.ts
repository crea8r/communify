import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../_idl.json';
import { BagInfoSchema } from '../_schemas';
import { getProgram } from '../init';
import { MemberReaderProps } from '../_props';

const listAllBagAccounts = async ({ member, community }: MemberReaderProps) => {
  const program = getProgram();
  let listBagInfo;
  try {
    listBagInfo = await program.provider.connection.getProgramAccounts(
      program.programId,
      {
        dataSlice: { offset: 8 + 32 + 32, length: 8 + 8 },
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(
                idl.accounts.filter((acc) => acc.name === 'Bag')[0]
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
          {
            memcmp: {
              offset: 8,
              bytes: community.toBase58(),
            },
          },
        ],
      }
    );
  } catch (e) {
    console.error(e);
  }
  return (listBagInfo || [])
    .map((r: any) => {
      return {
        ...BagInfoSchema.decode(r.account.data),
        publicKey: r.pubkey,
      };
    })
    .sort((a, b) => {
      return b.decayAt - a.decayAt;
    });
};

export default listAllBagAccounts;
