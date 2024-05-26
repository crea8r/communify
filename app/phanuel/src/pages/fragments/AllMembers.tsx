import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../../components/ui';
import { useState, useContext } from 'react';
import { MemberListContext } from '../Admin';
import shortenAddress from '../../funcs/shortenAddress';

const AllMembers = () => {
  const [search, setSearch] = useState('');
  const members = useContext(MemberListContext);
  const [filteredMembers, setFilteredMembers] = useState(members);
  const size = 3;
  const [offset, setOffset] = useState(0);
  console.log(
    filteredMembers.map((m: any) => {
      return {
        member: m.member.toBase58(),
        max: m.max.toNumber(),
        memberInfo: m.publicKey.toBase58(),
      };
    })
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Activity</CardTitle>
        <CardDescription>View the latest community activities.</CardDescription>
      </CardHeader>
      <CardContent>
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
            {filteredMembers.slice(offset, offset + size).map((pda: any) => {
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
                  </div>
                  <div
                    className='cursor-pointer'
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AllMembers;
