import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '../../components/ui';
import { useState, useContext } from 'react';
import { MemberListContext, CommunityAccountContext } from '../Admin';
import addMember from '../../services/addMember';
import Loading from '../../components/Loading';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import Papa from 'papaparse';
import addMultipleMember from '../../services/addMultipleMember';
const MAX_UPLOAD_ADDRESSES = import.meta.env.VITE_MAX_UPLOAD_ADDRESSES;

const ManageMember = ({ successCallback }: { successCallback: any }) => {
  const members = useContext(MemberListContext);
  const wallet = useAnchorWallet() as anchor.Wallet;
  const [memberAddress, setMemberAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const communityAccount = useContext(CommunityAccountContext);
  const found = members.filter(
    (m: any) => m.member.toBase58() == memberAddress
  );
  const canAdd = found.length > 0 ? false : true;
  // found = false -> can add
  const canDisable = found.length > 0 && found[0].status == 0 ? true : false;
  const [addTxns, setAddTxns] = useState<any[]>([]);
  const [errorMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members {`(${members.length})`}</CardTitle>
        <CardDescription>
          Add new, active or disable existing members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loading />
        ) : (
          <form className='grid gap-2'>
            <div className='grid gap-2'>
              <Label htmlFor='member-address'>Member Address</Label>
              <Input
                id='member-address'
                value={memberAddress}
                onChange={(e: any) => {
                  setMemberAddress(e.target.value);
                }}
                placeholder='0x789...'
              />
            </div>
            <div className='grid gap-2'>
              {canAdd ? (
                <Button
                  variant='outline'
                  onClick={(e: any) => {
                    e.preventDefault();
                    setLoading(true);
                    addMember({
                      admin: wallet,
                      member: new anchor.web3.PublicKey(memberAddress),
                      communityAccountPubKey: communityAccount.publicKey,
                      success: (data: any) => {
                        console.log('trigger success callback ', data);
                        successCallback();
                      },
                      error: (e: any) => {
                        alert(e.message);
                      },
                      fin: () => {
                        setLoading(false);
                      },
                    });
                  }}
                >
                  Add Member
                </Button>
              ) : (
                <>
                  {canDisable ? (
                    <Button variant='outline' className='bg-red-500'>
                      Disable Member
                    </Button>
                  ) : (
                    <Button variant='outline' className='bg-green-500'>
                      Activate Member
                    </Button>
                  )}
                </>
              )}
              <div className='my-2'>
                Please add less than 100 members add once. The csv file should
                has list of addresses, each in a line
              </div>
              <input
                type='file'
                name='file'
                onChange={(e: any) => {
                  Papa.parse(e.target.files[0], {
                    complete: (result: any) => {
                      if (result.data.length > MAX_UPLOAD_ADDRESSES) {
                        alert(
                          `You can only upload ${MAX_UPLOAD_ADDRESSES} addresses at once.`
                        );
                        return;
                      } else {
                        try {
                          let pubKArr = [];
                          for (var i = 0; i < result.data.length; i++) {
                            const r = result.data[i];
                            if (r[0]) {
                              pubKArr.push(new anchor.web3.PublicKey(r[0]));
                              // check dupplicate
                              const found = members.find(
                                (m: any) => m.member.toBase58() == r[0]
                              );
                              if (found) {
                                alert(
                                  found.member.toBase58() +
                                    ' is already a member'
                                );
                                return;
                              }
                            }
                          }
                          addMultipleMember({
                            admin: wallet,
                            newMembers: pubKArr,
                            info: (data: any) => {
                              console.log(data);
                              setAddTxns([...data]);
                            },
                            success: (data: any) => {
                              alert('Members added successfully');
                              successCallback();
                            },
                            error: (e: any) => {
                              alert(e.message);
                            },
                          });
                        } catch (err: any) {
                          alert('Invalid file format or addresses format');
                        }
                      }
                    },
                  });
                }}
              />
            </div>
          </form>
        )}
        {errorMsg ? <div className='text-red-500'>{errorMsg}</div> : null}
        {successMsg ? <div className='text-green-500'>{successMsg}</div> : null}
        {addTxns.length > 0 ? (
          <div>
            <div>
              Adding with {addTxns.length} transactions, do not close your
              browser till them all turn green.
            </div>
            <div className='flex gap-2 mt-2'>
              {addTxns.map((p, i) => (
                <div
                  className={`rounded-full w-[10px] h-[10px] ${
                    p.status == 0 // 0: pending, 1: processing, 2: success
                      ? 'border-2 border-gray-500'
                      : p.status == 1
                      ? 'bg-red-500'
                      : 'bg-green-500'
                  }`}
                  key={i}
                  title={
                    p.status == 0 // 0: pending, 1: processing, 2: success
                      ? 'Pending'
                      : p.status == 1
                      ? 'Failed'
                      : p.txid
                  }
                ></div>
              ))}
            </div>
            <div className='mt-2'>
              {addTxns.map((p, i) =>
                p.status != 0 ? (
                  <div
                    className='mb-2 p-2 border rounded-md flex'
                    key={'msg-' + i}
                    title={p.txid}
                  >
                    <div className='grow'>{p.msg}</div>
                    <a
                      href={
                        'https://explorer.solana.com/tx/' +
                        p.txid +
                        '?cluster=devnet'
                      }
                      target='_blank'
                    >
                      🔗
                    </a>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
export default ManageMember;
