import * as anchor from '@coral-xyz/anchor';
import { AddMemberProps } from '../_props';
import { getProgram } from '../init';

const addMember = async ({
  admin,
  community,
  member,
  renter,
}: AddMemberProps) => {
  const program = getProgram();
  const [memberInfo] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), community.toBuffer(), member.toBuffer()],
    program.programId
  );
  const accounts = {
    communityAccount: community,
    memberInfo,
    member,
    admin,
    phanuelProgram: program.programId,
    renter,
  };
  const txn = await program.methods
    .addMember()
    .accounts(accounts)
    .transaction();
  return {
    transaction: txn,
    data: {
      memberInfo,
    },
  };
};

export default addMember;
