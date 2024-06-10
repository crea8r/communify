import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../../components/ui';
import { useState, useContext, useEffect } from 'react';
import { MemberListContext } from '../Admin';
import shortenAddress from '../../funcs/shortenAddress';
import Loading from '../../components/Loading';
import fetchMemberTelegram from '../../services/fetchMemberTelegram';
import { set } from '@coral-xyz/anchor/dist/cjs/utils/features';
import changeMembersTelegram from '../../services/changeMembersTelegram';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';

const AllMembers = () => {
  const [search, setSearch] = useState('');
  const members = useContext(MemberListContext);
  const [filteredMembers, setFilteredMembers] = useState(members);
  // TODO: note somewhere that size should small enough so txn will not fail, e.g: < 9
  const size = 6;
  const [offset, setOffset] = useState(0);
  const [usernames, setUsernames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [originalUsernames, setOriginalUsernames] = useState<any[]>([]);
  const wallet = useAnchorWallet() as anchor.Wallet;
  const [rCount, setRCount] = useState(0);
  useEffect(() => {
    const fetchUsernames = async () => {
      setLoading(true);
      const currentMembers = filteredMembers.slice(offset, offset + size);
      setOriginalUsernames([]);
      const tmp = [];
      for (var i = 0; i < currentMembers.length; i++) {
        const info = await fetchMemberTelegram(currentMembers[i].publicKey);
        tmp.push(info ? info.username : '');
      }
      setOriginalUsernames([...tmp]);
      setUsernames([...tmp]);
      setLoading(false);
    };
    if (members.length > 0) {
      fetchUsernames();
    }
  }, [offset, members, rCount]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>All community members</CardTitle>
        <CardDescription>List of all your members.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loading />
        ) : (
          <div className='grid gap-4'>
            <Input
              placeholder='Search members'
              value={search}
              onChange={(e: any) => {
                if (e.target.value === '') {
                  setFilteredMembers(members);
                } else {
                  const filtered = members.filter((m: any) =>
                    m.member.toBase58().includes(e.target.value)
                  );
                  setFilteredMembers(filtered);
                }
                setSearch(e.target.value);
              }}
            />
            <>
              {filteredMembers
                .slice(offset, offset + size)
                .map((pda: any, idx: any) => {
                  const isActive = pda.status === 0;
                  return (
                    <div
                      key={pda.member.toBase58()}
                      className='flex items-center p-2 hover:bg-gray-100'
                    >
                      <div
                        className='flex items-center flex-1'
                        title={pda.member.toBase58()}
                      >
                        <div
                          className={`w-[10px] h-[10px] flex-none rounded-full mr-2 ${
                            isActive ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        ></div>
                        <div className='grow'>
                          {shortenAddress(pda.member.toBase58())}
                        </div>
                        <div className='flex items-center'>
                          @
                          <Input
                            value={usernames[idx]}
                            onChange={(e: any) => {
                              const tmp = [...usernames];
                              tmp[idx] = e.target.value;
                              setUsernames([...tmp]);
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className='cursor-pointer ml-1'
                        title='Copy to clipboard'
                        onClick={() =>
                          navigator.clipboard.writeText(pda.member.toBase58())
                        }
                      >
                        📋
                      </div>
                    </div>
                  );
                })}
              <div className='flex'>
                <div className='flex-none'>
                  {offset > 0 && offset - size >= 0 ? (
                    <a
                      className='cursor-pointer'
                      onClick={() => {
                        setOffset(offset - size);
                      }}
                    >
                      Prev
                    </a>
                  ) : null}
                </div>
                <div className='grow text-center'>
                  {offset} to{' '}
                  {offset + size > filteredMembers.length
                    ? filteredMembers.length
                    : offset + size}{' '}
                </div>
                <div className='flex-none'>
                  {offset + size < filteredMembers.length ? (
                    <a
                      className='cursor-pointer'
                      onClick={() => setOffset(offset + size)}
                    >
                      Next
                    </a>
                  ) : null}
                </div>
              </div>
            </>
            <div className='flex gap-2'>
              <Button
                onClick={(e: any) => {
                  e.preventDefault();
                  setLoading(true);
                  const memberInfoPDAs = [];
                  const changedUsernames = [];
                  for (var i = 0; i < originalUsernames.length; i++) {
                    if (originalUsernames[i] !== usernames[i]) {
                      memberInfoPDAs.push(
                        filteredMembers[i + offset + offset * size].publicKey
                      );
                      changedUsernames.push(usernames[i]);
                    }
                  }
                  console.log(
                    'memberInfoPDAs: ',
                    memberInfoPDAs,
                    '; changedUsernames: ',
                    changedUsernames
                  );
                  changeMembersTelegram({
                    memberInfos: memberInfoPDAs,
                    admin: wallet,
                    usernames: changedUsernames,
                    success: (data: any) => {
                      setRCount(rCount + 1);
                    },
                    err: (e: any) => {
                      setUsernames([...originalUsernames]);
                    },
                    fin: () => {
                      setLoading(false);
                    },
                  });
                }}
              >
                Save TelegramId
              </Button>
              <Button
                onClick={(e: any) => {
                  e.preventDefault();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllMembers;
