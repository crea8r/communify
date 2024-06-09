import * as anchor from '@coral-xyz/anchor';
import PhanuelIdl from '../idl.json';
import { Phanuel as PhanuelType } from '../type';
const config: { program: any } = {
  program: undefined,
};

export const setConfig = ({ provider }: { provider: anchor.Provider }) => {
  config.program = new anchor.Program(PhanuelIdl as anchor.Idl, provider);
};

export const getProgram = (): anchor.Program<PhanuelType> => {
  return config.program;
};

export default {
  setConfig,
  getProgram,
};
