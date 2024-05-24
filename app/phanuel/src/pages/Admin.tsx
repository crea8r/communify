import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import React, { useEffect, useState } from 'react';
import CreateToken from './fragments/CreateToken';
import { Card } from '../components/ui';
import Loading from '../components/Loading';
import { listMembers } from '../services/Member';
import ManageMember from './fragments/ManageMember';
import Mint from './fragments/Mint';
import Stat from './fragments/Stat';
import AllMembers from './fragments/AllMembers';

export const MemberListContext = React.createContext<any>(null);
export const CommunityAccountContext = React.createContext<any>(null);

const Admin = () => {
  const program = getProgram();
  const wallet = useAnchorWallet() as anchor.Wallet;

  const [communityAccount, setCommunityAccount] = useState<any>(false);
  const [rCounter, setRCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => {
    if (wallet) {
      const [communityAccountPubKey] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from('MINT'), wallet.publicKey.toBuffer()],
          program.programId
        );
      const fetchCommunityAccount = async () => {
        try {
          const data = await program.account.communityAccount.fetch(
            communityAccountPubKey
          );
          setCommunityAccount({ ...data, publicKey: communityAccountPubKey });
          const _members = await listMembers({
            communityAccountPubKey,
          });
          setMembers(_members);
        } catch (e) {
          console.log('There is no community managed by this wallet');
        }
        setLoading(false);
      };
      setLoading(true);
      fetchCommunityAccount();
    }
  }, [wallet, rCounter]);
  return (
    <div>
      {loading ? (
        <Loading />
      ) : communityAccount ? (
        <CommunityAccountContext.Provider value={communityAccount}>
          <MemberListContext.Provider value={members}>
            <Card className='p-6 rounded mb-4 bg-white card'>
              <div className='flex'>
                <div className='mr-2'>Token Name:</div>{' '}
                <div className='font-bold'>${communityAccount.symbol}</div>
              </div>
              <div className='flex'>
                <div className='mr-2'>Expire time: </div>
                <div className='font-bold'>
                  {(communityAccount.decayAfter as anchor.BN).toNumber()} day(s)
                </div>
              </div>
            </Card>
            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
              <Stat />
              <AllMembers />
              <ManageMember
                successCallback={() => {
                  console.log('trigger success callback, try reload');
                  setRCounter(rCounter + 1);
                }}
              />
              <Mint />
            </div>
          </MemberListContext.Provider>
        </CommunityAccountContext.Provider>
      ) : (
        <div>
          <div className='p-4 rounded-lg bg-blue-500 text-white mb-2'>
            ⚠ There is no community managed by your wallet, create one!
          </div>
          <CreateToken
            successCallback={() => {
              setRCounter(rCounter + 1);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Admin;
