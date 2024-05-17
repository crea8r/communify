/* eslint-disable react/prop-types */
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/JV1TCqpNIgN
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button, MountainIcon } from '../components/ui';

const Draft = () => {
  return (
    <div className='flex flex-col w-full min-h-screen bg-gray-100 dark:bg-gray-800'>
      <header className='bg-white dark:bg-gray-900 shadow-sm'>
        <div className='container mx-auto py-4 px-4 md:px-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MountainIcon className='h-6 w-6 text-gray-600 dark:text-gray-400' />
            <h1 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
              Community Dashboard
            </h1>
          </div>
          <div className='flex items-center gap-4'>
            <Button className='rounded-full' size='icon' variant='ghost'>
              <img
                alt='Avatar'
                className='rounded-full border'
                height='32'
                src='/placeholder.svg'
                style={{
                  aspectRatio: '32/32',
                  objectFit: 'cover',
                }}
                width='32'
              />
              <span className='sr-only'>Toggle user menu</span>
            </Button>
          </div>
        </div>
      </header>
      <main className='container mx-auto py-8 px-4 md:px-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'></main>
    </div>
  );
};

export default Draft;
