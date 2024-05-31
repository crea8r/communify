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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Received notes</CardTitle>
      </CardHeader>

      <CardContent className='grid gap-2'>
        {notes.length === 0 && <p>No notes received. Try to help others!</p>}
        {notes.map((n, idx) => {
          return (
            <div key={`note-${idx}`}>
              <p>
                From: {shortenAddress(n.from.toBase58())}, {n.amount.toNumber()}{' '}
                tokens
              </p>
              <div className='p-2 border rounded-lg'>{n.note}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ReceivedNotes;
