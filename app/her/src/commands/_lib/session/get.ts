import supabase from '../../../config/supabase';

const getSession = async (username: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select()
    .eq('telegramt_handle', username);
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return data[0].data;
};

export default getSession;
