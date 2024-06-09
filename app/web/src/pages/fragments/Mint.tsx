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
import multipleMint from '../../services/multipleMint';
import mintTo from '../../services/mintTo';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { MemberListContext } from '../Admin';
import shortenAddress from '../../funcs/shortenAddress';
import Loading from '../../components/Loading';
import { set } from '@coral-xyz/anchor/dist/cjs/utils/features';

const Mint = () => {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const admin = useAnchorWallet() as anchor.Wallet;
  const memberPDAs = useContext(MemberListContext);
  const [mintTxns, setMintTxns] = useState<any[]>([]);
  const [errorMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [memberAddress, setMemberAddress] = useState('');
  const reset = () => {
    setTokenAmount(0);
    setMemberAddress('');
  };
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
            <Label htmlFor='token-amount'>Member Address</Label>
            <Input
              type='string'
              value={memberAddress}
              onChange={(e: any) => {
                setMemberAddress(e.target.value);
              }}
              disabled={loading}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='token-amount'>Amount (Per Member)</Label>
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
            onClick={(e: any) => {
              setErrMsg('');
              setSuccessMsg('');
              setMintTxns([]);
              e.preventDefault();
              setLoading(true);
              if (memberAddress) {
                try {
                  let member = new anchor.web3.PublicKey(memberAddress);
                  if (!memberPDAs.find((m: any) => m.member.equals(member))) {
                    throw new Error('Member not found');
                  }
                  mintTo({
                    admin,
                    receiver: member,
                    amount: tokenAmount,
                    success: () => {
                      setSuccessMsg('Mint successfully!');
                      setLoading(false);
                      reset();
                    },
                    error: () => {
                      setErrMsg('Cannot mint');
                      setLoading(false);
                    },
                  });
                } catch (e: any) {
                  setErrMsg(e.message);
                  setLoading(false);
                  return;
                }
              } else {
                multipleMint({
                  admin,
                  receivers: memberPDAs.map((m: any) => m.member),
                  amount: tokenAmount,
                  info: (data: any[]) => {
                    console.log('set info: ', [...data]);
                    setMintTxns([...data]);
                  },
                  success: (msg: any) => {
                    setSuccessMsg(msg);
                    setLoading(false);
                    reset();
                  },
                  error: (msg: any) => {
                    setErrMsg(msg);
                    setLoading(false);
                  },
                });
              }
            }}
            disabled={loading}
          >
            Mint and Send{' '}
            {tokenAmount
              ? parseInt(tokenAmount.toString()) + ' token(s) per member'
              : ''}
          </Button>
          {errorMsg ? <div className='text-red-500'>{errorMsg}</div> : null}
          {successMsg ? (
            <div className='text-green-500'>{successMsg}</div>
          ) : null}
          {loading ? <Loading /> : null}
          {mintTxns.length > 0 ? (
            <div>
              <div>
                Minting with {mintTxns.length} transactions, do not close your
                browser till them all turn green.
              </div>
              <div className='flex gap-2 mt-2'>
                {mintTxns.map((p, i) => (
                  <div
                    className={`rounded-full w-[10px] h-[10px] ${
                      p.status == 0 // 0: pending, 1: processing, 2: success
                        ? 'border-2 border-gray-500'
                        : p.status == 1
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                    key={i}
                    title={
                      p.status == 0 // 0: pending, 1: processing, 2: success
                        ? 'Pending'
                        : p.status == 1
                        ? 'Failed'
                        : p.txid
                    }
                  ></div>
                ))}
              </div>
              <div className='mt-2'>
                {mintTxns.map((p, i) =>
                  p.status != 0 ? (
                    <div
                      className='mb-2 p-2 border rounded-md flex'
                      key={'msg-' + i}
                      title={p.txid}
                    >
                      <div className='grow'>{p.msg}</div>
                      <a
                        href={
                          'https://explorer.solana.com/tx/' +
                          p.txid +
                          '?cluster=devnet'
                        }
                        target='_blank'
                      >
                        🔗
                      </a>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
};

export default Mint;
