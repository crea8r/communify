import { getSessions } from '../state/sessions';
const start = async (ctx: any) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  const group_id = ctx.update.message.chat.id;
  sessions[username] = {
    private_group_id: group_id,
  };
  ctx.replyWithHTML(
    `Hello! I am Badge God. I am here to help you manage badges in your group.\n
✅ Step 1: Invite me to the group that you are an admin of.\n
✅ Step 2: In the group, type /register then comeback to this chat for further instruction\n`
  );
};

export default start;
