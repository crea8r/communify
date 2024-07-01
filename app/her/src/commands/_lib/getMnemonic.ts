import * as bip39 from 'bip39';
import supabase from '../../config/supabase';

const getMnemonic = async (username: string) => {
  const { data, error } = await supabase
    .from('keypair')
    .select()
    .eq('telegram_handle', username);
  if (error) {
    console.error('Error fetching mnemonic:', error);
    return null;
  } else if (data.length > 0) {
    return data[0].mnemonic;
  } else {
    const mnemonic = bip39.generateMnemonic();
    // Store the mnemonic in the database
    const { error } = await supabase.from('keypair').insert({
      telegram_handle: username,
      mnemonic,
    });
    if (!error) {
      return mnemonic;
    } else {
      console.error(
        'Error creating new mnemonic for ',
        username,
        '; error: ',
        error
      );
      return null;
    }
  }
};

export default getMnemonic;
