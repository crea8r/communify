import {
  ActivityIcon,
  UsersIcon,
  WalletIcon,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

const Stat = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Activity</CardTitle>
        <CardDescription>View the latest community activities.</CardDescription>
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
  );
};

export default Stat;
