import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
} from '../components/ui';
import { listAllBagAccounts, listCommunityAccounts } from '../services/Member';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../funcs/config';

const Wallet = () => {
  const member = useAnchorWallet() as anchor.Wallet;
  const [communityAccounts, setCommunityAccounts] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [bags, setBags] = useState<any[]>([]);
  const program = getProgram();
  let total = 0;

  useEffect(() => {
    console.log('** Wallet useEffect - selectedCommunity **');
    const loadBag = async (community: any) => {
      const bags = await listAllBagAccounts({
        community,
        member: member.publicKey,
      });
      console.log('bags: ', bags);
      setBags(bags);
      bags.map((bag) => {
        let d = new Date(bag.decayAt.toNumber() * 1000);
        if (d < new Date()) {
          bag.decayed = true;
        } else {
          total += bag.amount.toNumber();
        }
      });
    };
    if (selectedCommunity) {
      loadBag(new anchor.web3.PublicKey(selectedCommunity));
    }
  }, [selectedCommunity]);
  useEffect(() => {
    console.log('** Wallet useEffect - member **', member);
    const load = async () => {
      if (member) {
        const raw = await listCommunityAccounts({ member: member.publicKey });
        const rs: any[] = [];
        for (var i = 0; i < raw.length; i++) {
          const data = raw[i];
          const info = await program.account.communityAccount.fetch(
            data.community
          );
          rs.push({ ...info, address: data.community });
        }
        setCommunityAccounts(rs);
      }
    };
    load();
  }, [member]);
  return (
    <div>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Communities</CardTitle>
          <CardDescription>Communities that you are in</CardDescription>
        </CardHeader>
        <CardContent className='mt-0'>
          <div className='flex'>
            {communityAccounts.map((acc: any) => {
              return (
                <div
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-100 max-w-[100px] ${
                    selectedCommunity == acc.address.toBase58()
                      ? 'bg-gray-100'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedCommunity(acc.address.toBase58());
                  }}
                  key={acc.address.toBase58()}
                >
                  {acc.symbol}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {selectedCommunity ? (
        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>View Token Balance</CardTitle>
              <CardDescription>
                Check the balance of your community tokens.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='my-2'>
                Total: {total} $
                {
                  communityAccounts.find((ac: any) => {
                    return ac.address.toBase58() === selectedCommunity;
                  }).symbol
                }
              </div>
              <div className='flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2'>
                {bags.map((bag) => {
                  console.log(bag.decayAt.toNumber());
                  let d = new Date(bag.decayAt.toNumber() * 1000);
                  return (
                    <div
                      className={`flex flex-col gap-2 border p-3 rounded ${
                        bag.decayed ? 'bg-gray-100 text-gray-400' : ''
                      }`}
                      key={bag.publicKey.toBase58()}
                    >
                      <Label>💰 {bag.amount.toNumber()}</Label>
                      <Label>{d.toTimeString()}</Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Say thank you</CardTitle>
              <CardDescription>
                Send tokens to a wallet address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='grid gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='recipient-address'>Recipient Address</Label>
                  <Input id='recipient-address' placeholder='0x456...' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='token-amount'>Token Amount</Label>
                  <Input
                    id='token-amount'
                    min='1'
                    placeholder='100'
                    type='number'
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='token-amount'>Note</Label>
                  <Input
                    id='token-amount'
                    min='1'
                    placeholder='100'
                    type='text'
                  />
                </div>
                <Button>Transfer Tokens</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default Wallet;
