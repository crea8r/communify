import { MutMemberProps } from '../_props';
import { getProgram } from '../init';

// TODO: Implement disableMember
const disableMember = async ({
  community,
  memberInfo,
  admin,
}: MutMemberProps) => {
  const program = getProgram();
  const accounts = {
    communityAccount: community,
    memberInfo,
    admin,
    phanuelProgram: program.programId,
  };
  const txn = await program.methods
    .disableMember()
    .accounts(accounts)
    .transaction();
  return {
    transaction: txn,
    data: {
      memberInfo,
    },
  };
};

export default disableMember;
