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
import { useContext, useState } from 'react';
import { mintTo } from '../../services/Community';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { MemberListContext } from '../Admin';
import shortenAddress from '../../funcs/shortenAddress';

const Mint = () => {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const admin = useAnchorWallet() as anchor.Wallet;
  const memberPDAs = useContext(MemberListContext);
  const [mintProgresses, setMintProgresses] = useState<any[]>([]);
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
          <Button
            onClick={async (e: any) => {
              e.preventDefault();
              if (loading) {
                return;
              }

              let i = 0;
              const mint = () => {
                // if (i >= memberPDAs.length) {
                if (i >= 1) {
                  setLoading(false);
                  return;
                }
                mintTo({
                  admin,
                  receiver: memberPDAs[i].member,
                  amount: tokenAmount,
                  success,
                  error,
                });
              };
              const success = () => {
                const msg =
                  'SUCCESS - ' +
                  shortenAddress(memberPDAs[i].member.toBase58());
                console.log(msg);
                setMintProgresses([...mintProgresses, msg]);
                i++;
                mint();
              };
              const error = (e: any) => {
                console.error(e);
                const msg =
                  'FAILED - ' + shortenAddress(memberPDAs[i].member.toBase58());
                console.log(msg);
                setMintProgresses([...mintProgresses, msg]);
                i++;
                mint();
              };
              console.log('Minting');
              mint();
              setLoading(true);
            }}
          >
            Mint and Send{' '}
            {tokenAmount
              ? parseInt(tokenAmount.toString()) + ' token(s) per member'
              : ''}
          </Button>
          {mintProgresses.length > 0 ? (
            <div>
              <div>Minting, do not close your browser</div>
              <div className='h-[100px] overflow-auto'>
                {mintProgresses.map((p, i) => (
                  <div key={i} className='mb-2 border rounded-lg'>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
};

export default Mint;
