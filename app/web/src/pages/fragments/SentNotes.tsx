import * as anchor from '@coral-xyz/anchor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import listSentNotes from '../../services/listSentNotes';
import { useEffect, useState } from 'react';
import shortenAddress from '../../funcs/shortenAddress';

const SentNotes = ({
  member,
  community,
}: {
  member: anchor.web3.PublicKey;
  community: anchor.web3.PublicKey;
}) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 3;
  useEffect(() => {
    const loadNotes = async () => {
      const _notes = await listSentNotes({ member, community });
      setNotes(_notes);
    };
    if (member && community) {
      loadNotes();
    }
  }, [member, community]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent notes</CardTitle>
      </CardHeader>

      <CardContent className='grid gap-2'>
        {notes.length === 0 && (
          <p>No notes sent. There is no issue with asking for help!</p>
        )}
        {notes
          .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
          .map((n, idx) => {
            return (
              <div key={`note-${idx}`}>
                <p>
                  To: {shortenAddress(n.to.toBase58())}, {n.amount.toNumber()}{' '}
                  tokens
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

export default SentNotes;
