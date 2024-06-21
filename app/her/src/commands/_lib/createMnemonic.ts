import bip39 from 'bip39';
import supabase from '../../config/supabase';

const createMnemonic = async (username: string) => {
  // Generate a new mnemonic
  const mnemonic = bip39.generateMnemonic();
  // Store the mnemonic in the database
  const { error } = await supabase.from('keypair').insert({
    telegram_handle: username,
    mnemonic,
  });
  if (error) {
    const { data, error } = await supabase
      .from('keypair')
      .select()
      .eq('telegram_handle', username);
    if (error) {
      console.error('Error fetching mnemonic:', error);
      return null;
    }
    return data[0].mnemonic;
  }
  return mnemonic;
};

export default createMnemonic;
