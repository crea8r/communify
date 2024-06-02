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
import * as anchor from '@coral-xyz/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import Loading from '../../components/Loading';
import create from '../../services/createCommunity';

const CreateToken = ({ successCallback }: { successCallback: any }) => {
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decayTime, setDecayTime] = useState(0);
  const wallet = useAnchorWallet() as anchor.Wallet;
  const [loading, setLoading] = useState(false);
  const createToken = async () => {
    setLoading(true);
    if (!tokenSymbol || !decayTime) {
      alert('Please fill in all fields.');
      return;
    }
    if (tokenSymbol.length > 5) {
      alert('Token name must be less than 5 characters.');
      return;
    }
    if (decayTime > 90) {
      alert('Decay time must be less than 90 days.');
      return;
    }
    create({
      admin: wallet,
      tokenSymbol,
      decayTime,
      success: successCallback,
      fin: () => setLoading(false),
    });
  };
  return (
    <div>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Create Token</CardTitle>
          <CardDescription>Create a new community token.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-2' onSubmit={(e) => e.preventDefault()}>
            <div className='grid gap-2'>
              <Label htmlFor='token-name'>Token Name</Label>
              <Input
                id='token-name'
                maxLength={5}
                placeholder='Token Name (up to 5 characters)'
                value={tokenSymbol}
                onChange={(e: any) => setTokenSymbol(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='decay-time'>Decay Time</Label>
              <Input
                id='decay-time'
                max='90'
                min='1'
                placeholder='Decay days (up to 90 days)'
                type='number'
                value={decayTime}
                onChange={(e: any) => setDecayTime(e.target.value)}
              />
            </div>
            {loading ? (
              <Loading />
            ) : (
              <Button
                className='mt-2'
                onClick={(e: any) => {
                  createToken();
                  e.preventDefault();
                }}
              >
                Create Token
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateToken;
