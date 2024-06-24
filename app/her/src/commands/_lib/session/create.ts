// data: {group_id: string}
import supabase from '../../../config/supabase';

const createSession = async (username: string, data: object) => {
  const { error } = await supabase
    .from('sessions')
    .insert([{ telegram_handle: username, data }]);
  if (error) {
    console.error('Error insert session:', error);
    return false;
  }
  return true;
};

export default createSession;
