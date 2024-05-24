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
import { useState } from 'react';

const Mint = () => {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint Tokens</CardTitle>
        <CardDescription>
          Mint and send tokens to all active community members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='token-amount'>Amount Per Member</Label>
            <Input
              id='token-amount'
              min='1'
              placeholder='100'
              type='number'
              value={tokenAmount}
              onChange={(e: any) => {
                setTokenAmount(parseInt((e.target.value || 0).toString()));
              }}
              disabled={loading}
            />
          </div>
          {loading ? (
            <></>
          ) : (
            <Button
              onClick={(e: any) => {
                if (loading) {
                  return;
                }
                e.preventDefault();
              }}
            >
              Mint and Send{' '}
              {tokenAmount
                ? parseInt(tokenAmount.toString()) + ' token(s) per member'
                : ''}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default Mint;
