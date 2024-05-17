import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '../components/ui';

const CreateToken = () => {
  return (
    <>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Create Token</CardTitle>
          <CardDescription>Create a new community token.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='token-name'>Token Name</Label>
              <Input
                id='token-name'
                maxLength={5}
                placeholder='Token Name (up to 5 characters)'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='decay-time'>Decay Time</Label>
              <Input
                id='decay-time'
                max='90'
                min='1'
                placeholder='Decay Time (up to 90 days)'
                type='number'
              />
            </div>
            <Button>Create Token</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default CreateToken;
