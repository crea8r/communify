import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  UsersIcon,
  WalletIcon,
  ActivityIcon,
} from '../components/ui';

const ManageToken = () => {
  return (
    <div className='flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Community Activity</CardTitle>
          <CardDescription>
            View the latest community activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4'>
            <div className='grid grid-cols-[40px_1fr] items-start gap-4'>
              <div className='flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white'>
                <UsersIcon className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>New Members</h3>
                <p className='text-gray-500 dark:text-gray-400'>
                  10 new members joined the community this week.
                </p>
              </div>
            </div>
            <div className='grid grid-cols-[40px_1fr] items-start gap-4'>
              <div className='flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white'>
                <WalletIcon className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Token Transfers</h3>
                <p className='text-gray-500 dark:text-gray-400'>
                  $5,000 worth of tokens were transferred this week.
                </p>
              </div>
            </div>
            <div className='grid grid-cols-[40px_1fr] items-start gap-4'>
              <div className='flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500 text-white'>
                <ActivityIcon className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Community Discussions</h3>
                <p className='text-gray-500 dark:text-gray-400'>
                  15 new discussions were started this week.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mint and Send Tokens</CardTitle>
          <CardDescription>
            Mint and send tokens to a wallet address.
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
            <Button>Mint and Send Tokens</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manage Community Members</CardTitle>
          <CardDescription>
            Add or remove members from the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='member-address'>Member Address</Label>
              <Input id='member-address' placeholder='0x789...' />
            </div>
            <div className='flex gap-2'>
              <Button variant='outline'>Add Member</Button>
              <Button variant='outline'>Remove Member</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageToken;
