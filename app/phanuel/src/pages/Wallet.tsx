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
import listCommunityAccounts from '../services/listCommunityAccounts';
import listAllBagAccounts from '../services/listAllBagAccounts';
import transfer from '../services/transfer';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../funcs/config';
import moment from 'moment';
import listMembers from '../services/listMembers';
import Loading from '../components/Loading';
import SentNotes from './fragments/SentNotes';
import ReceivedNotes from './fragments/ReceivedNotes';

const Wallet = () => {
  const member = useAnchorWallet() as anchor.Wallet;
  const [communityAccounts, setCommunityAccounts] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [bags, setBags] = useState<any[]>([]);
  const program = getProgram();
  const [total, setTotal] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [correctReceiver, setCorrectReceiver] = useState(false);
  const [rCounter, setRCounter] = useState(0);
  useEffect(() => {
    const fetchCommunityAccount = async () => {
      try {
        // await program.account.communityAccount.fetch(
        //   new anchor.web3.PublicKey(selectedCommunity)
        // );
        const _members = await listMembers({
          communityAccountPubKey: new anchor.web3.PublicKey(selectedCommunity),
        });
        setMembers(_members);
      } catch (e) {
        console.log('There is no community managed by this wallet');
      }
      setLoading(false);
    };
    const loadBag = async (community: any) => {
      const bags = await listAllBagAccounts({
        community,
        member: member.publicKey,
      });
      setBags(bags);
      let _total = 0;
      bags.map((bag) => {
        let d = new Date(bag.decayAt.toNumber() * 1000);
        if (d < new Date()) {
          bag.decayed = true;
        } else {
          _total += bag.amount.toNumber();
        }
      });
      setTotal(_total);
    };
    if (selectedCommunity) {
      setLoading(true);
      fetchCommunityAccount();
      loadBag(new anchor.web3.PublicKey(selectedCommunity));
    }
  }, [selectedCommunity, rCounter]);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  useEffect(() => {
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
        if (rs.length > 0) {
          setSelectedCommunity(rs[0].address.toBase58());
        }
      }
    };
    load();
  }, [member]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 9;
  return (
    <div>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Communities</CardTitle>
          <CardDescription>Communities that you are in</CardDescription>
        </CardHeader>
        <CardContent className='mt-0'>
          {loading ? (
            <Loading />
          ) : (
            <>
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
            </>
          )}
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
              {loading ? (
                <Loading />
              ) : (
                <>
                  <div className='my-2'>
                    Total: {total} $
                    {
                      communityAccounts.find((ac: any) => {
                        return ac.address.toBase58() === selectedCommunity;
                      }).symbol
                    }
                  </div>
                  <div className='flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2'>
                    {bags
                      .slice(
                        currentPage * pageSize,
                        (currentPage + 1) * pageSize
                      )
                      .map((bag) => {
                        return (
                          <div
                            className={`flex flex-col gap-2 border p-3 rounded ${
                              bag.decayed ? 'bg-gray-100 text-gray-400' : ''
                            }`}
                            key={bag.publicKey.toBase58()}
                          >
                            <Label>💰 {bag.amount.toNumber()}</Label>
                            <Label>
                              {moment(bag.decayAt.toNumber() * 1000).fromNow()}
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                  <div className='flex gap-2 mt-2'>
                    <div
                      className='cursor-pointer hover:text-blue-500'
                      onClick={() => {
                        currentPage > 0
                          ? setCurrentPage(currentPage - 1)
                          : null;
                      }}
                    >
                      Prev
                    </div>
                    <div
                      className='cursor-pointer hover:text-blue-500'
                      onClick={() => {
                        currentPage * pageSize < bags.length
                          ? setCurrentPage(currentPage + 1)
                          : null;
                      }}
                    >
                      Next
                    </div>
                  </div>
                </>
              )}
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
                {loading ? (
                  <Loading />
                ) : (
                  <>
                    <div className='grid gap-2'>
                      <Label htmlFor='recipient-address'>
                        Recipient Address
                        {correctReceiver ? (
                          <span className='ml-2'>✅</span>
                        ) : (
                          <span className='ml-2'>❌</span>
                        )}
                      </Label>
                      <Input
                        id='recipient-address'
                        value={receiver}
                        onChange={(e: any) => {
                          setReceiver(e.target.value);
                          const idx = members?.findIndex((m) => {
                            if (m.member.toBase58() === e.target.value) {
                              return true;
                            }
                          });
                          if (idx >= 0) {
                            setCorrectReceiver(true);
                          } else {
                            setCorrectReceiver(false);
                          }
                        }}
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='token-amount'>Token Amount</Label>
                      <Input
                        id='token-amount'
                        value={amount}
                        placeholder='100'
                        type='number'
                        onChange={(e: any) => {
                          setAmount(e.target.value);
                        }}
                      />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='token-amount'>Note</Label>
                      <Input
                        id='token-amount'
                        type='text'
                        value={note}
                        onChange={(e: any) => {
                          setNote(e.target.value);
                        }}
                      />
                    </div>
                    <Button
                      onClick={(e: any) => {
                        e.preventDefault();
                        try {
                          setLoading(true);
                          transfer({
                            sender: member,
                            receiver: new anchor.web3.PublicKey(receiver),
                            amount: amount,
                            senderBags: bags,
                            communityAccount: new anchor.web3.PublicKey(
                              selectedCommunity
                            ),
                            note,
                            success: (data: any) => {
                              alert('Transfer successfully!');
                              setAmount(0);
                              setNote('');
                              setReceiver('');
                              setRCounter(rCounter + 1);
                            },
                            error: (e: any) => {
                              alert('Cannot transfer!');
                            },
                            fin: () => {
                              setLoading(false);
                            },
                          });
                        } catch (e: any) {
                          setLoading(false);
                        }
                      }}
                    >
                      Transfer Tokens
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
          <SentNotes
            community={new anchor.web3.PublicKey(selectedCommunity)}
            member={member.publicKey}
          />
          <ReceivedNotes
            community={new anchor.web3.PublicKey(selectedCommunity)}
            member={member.publicKey}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Wallet;
