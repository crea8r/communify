import { useEffect, useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../funcs/config';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import * as borsh from '@coral-xyz/borsh';

const MemberInfoAccountSchema = borsh.struct([
  borsh.str('communityAccountPDA'),
]);

const MembershipList = () => {
  const program = getProgram();
  const wallet = useAnchorWallet() as anchor.Wallet;
  const [memberships, setMemberships] = useState<any[]>([]);
  useEffect(() => {
    const fetchMemberships = async () => {
      const raw = await anchor
        .getProvider()
        .connection.getProgramAccounts(program.programId, {
          dataSlice: { offset: 8, length: 32 },
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
                bytes: wallet.publicKey.toBase58(),
              },
            },
          ],
        });
      const tmp = raw.map((r) => MemberInfoAccountSchema.decode(r));
      const _memberships = [];
      for (let i = 0; i < tmp.length; i++) {
        const communityAccountPDA = new anchor.web3.PublicKey(
          tmp[i].communityAccountPDA
        );
        const communityAccount = await program.account.communityAccount.fetch(
          communityAccountPDA
        );
        _memberships.push(communityAccount);
      }
      setMemberships(_memberships);
    };
    fetchMemberships();
  });
  return (
    <div>
      <h1>Membership List</h1>
    </div>
  );
};
