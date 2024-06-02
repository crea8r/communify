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
  return (
    <Card>
      {loading ? (
        <div className='w-full text-center p-2'>
          <Loading />
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Members {`(${members.length})`}</CardTitle>
            <CardDescription>
              Add new, active or disable existing members.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className='flex gap-2'>
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
              </div>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
};
export default ManageMember;
