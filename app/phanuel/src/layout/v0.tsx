/* eslint-disable react/prop-types */
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/JV1TCqpNIgN
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { MountainIcon } from '../components/ui';
import {
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as web3 from '@solana/web3.js';
import { useMemo } from 'react';
import { setConfig } from '../funcs/config';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Display = ({ children }: { children: any }) => {
  const cluster = import.meta.env.VITE_CLUSTER;
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet as Wallet, {});
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.includes('admin');
  const isMember = location.pathname.includes('member');

  setConfig({ provider });
  return (
    <div className='flex flex-col w-full min-h-screen bg-gray-100 dark:bg-gray-800'>
      {cluster === 'devnet' ? (
        <div className='w-ful text-sm bg-yellow-500 text-center text-black font-bold'>
          <span className='text-red-500 mr-2'>Dev net</span>
          <span>
            <a
              className='underline'
              href='https://faucet.solana.com/'
              target='_blank'
            >
              Get gas here
            </a>
          </span>
        </div>
      ) : null}
      <header className='bg-white dark:bg-gray-900 shadow-sm'>
        <div className='container mx-auto py-4 px-4 md:px-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <a href='/' className='flex gap-2'>
              <MountainIcon className='h-6 w-6 text-gray-600 dark:text-gray-400' />
              <h1 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                Community Bloodline
              </h1>
            </a>
          </div>
          <div className='flex items-center gap-4'>
            <div
              className={`px-3 py-2 rounded-full border hover:bg-gray-100  ${
                isAdmin
                  ? 'bg-gray-100 text-gray-500 select-none'
                  : 'bg-white cursor-pointer'
              }`}
              onClick={() => {
                navigate('/admin');
              }}
            >
              Admin
            </div>
            <div
              className={`px-3 py-2 rounded-full border hover:bg-gray-100  ${
                isMember
                  ? 'bg-gray-100 text-gray-500 select-none'
                  : 'bg-white cursor-pointer'
              }`}
              onClick={() => {
                navigate('/member');
              }}
            >
              Member
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </header>
      {/* <main className='container mx-auto py-8 px-4 md:px-6 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'> */}
      <main className='container mx-auto py-8 px-4 md:px-6 flex-1 '>
        {children}
      </main>
    </div>
  );
};

const V0 = (props: any) => {
  const cluster = import.meta.env.VITE_CLUSTER;
  //https://devnet.helius-rpc.com/?api-key=8f88217f-c97b-4309-a38a-f5935725082e
  //const endpoint = web3.clusterApiUrl(cluster);
  const endpoint =
    'https://devnet.helius-rpc.com/?api-key=8f88217f-c97b-4309-a38a-f5935725082e';
  const wallets = useMemo(() => [], []);
  return (
    <div className='flex flex-col w-full'>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <Display>{props.children}</Display>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};

export default V0;
