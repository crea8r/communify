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

const Wallet = () => {
  return (
    <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>View Token Balance</CardTitle>
          <CardDescription>
            Check the balance of your community tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='wallet-address'>Wallet Address</Label>
              <Input id='wallet-address' placeholder='0x123...' />
            </div>
            <Button>View Balance</Button>
          </form>
          <div className='my-2'>Total: 11.3 $STUK</div>
          <div className='flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2'>
            <div className='flex flex-col gap-2 border p-3 rounded'>
              <Label>💰 7.5 tokens</Label>
              <Label>Decay in 15 days</Label>
            </div>
            <div className='flex flex-col gap-2 border p-3 rounded'>
              <Label>💰 3.8 tokens</Label>
              <Label>Decay in 6 days</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
          <CardDescription>Send tokens to a wallet address.</CardDescription>
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
            <Button>Transfer Tokens</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
