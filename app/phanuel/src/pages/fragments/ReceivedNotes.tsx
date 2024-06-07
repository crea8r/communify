import * as anchor from '@coral-xyz/anchor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import listReceivedNotes from '../../services/listReceivedNotes';
import { useEffect, useState } from 'react';
import shortenAddress from '../../funcs/shortenAddress';

const ReceivedNotes = ({
  member,
  community,
}: {
  member: anchor.web3.PublicKey;
  community: anchor.web3.PublicKey;
}) => {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    const loadNotes = async () => {
      const _notes = await listReceivedNotes({ member, community });
      setNotes(_notes);
    };
    if (member && community) {
      loadNotes();
    }
  }, [member, community]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 3;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Received notes</CardTitle>
      </CardHeader>

      <CardContent className='grid gap-2'>
        {notes.length === 0 && <p>No notes received. Try to help others!</p>}
        {notes
          .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
          .map((n, idx) => {
            return (
              <div key={`note-${idx}`}>
                <p>
                  From: {shortenAddress(n.from.toBase58())},{' '}
                  {n.amount.toNumber()} tokens
                </p>
                <div className='p-2 border rounded-lg'>{n.note}</div>
              </div>
            );
          })}
        <div className='flex gap-2'>
          <div
            className='cursor-pointer hover:text-blue-500'
            onClick={() => {
              if (pageIndex > 0) {
                setPageIndex(pageIndex - 1);
              }
            }}
          >
            Prev
          </div>
          <div
            className='cursor-pointer hover:text-blue-500'
            onClick={() => {
              if (notes.length > (pageIndex + 1) * pageSize) {
                setPageIndex(pageIndex + 1);
              }
            }}
          >
            Next
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceivedNotes;
