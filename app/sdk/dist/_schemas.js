"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOCK_LAYOUT = exports.MemoSchema = exports.BagInfoSchema = exports.FullMemberInfoAccountSchema = exports.MemberInfoAccountSchema = void 0;
const borsh = __importStar(require("@coral-xyz/borsh"));
exports.MemberInfoAccountSchema = borsh.struct([
    borsh.publicKey('member'),
    borsh.u64('max'),
    borsh.u8('status'),
]);
exports.FullMemberInfoAccountSchema = borsh.struct([
    borsh.publicKey('community'),
    borsh.publicKey('member'),
    borsh.u64('max'),
    borsh.u8('status'),
]);
exports.BagInfoSchema = borsh.struct([
    borsh.u64('amount'),
    borsh.u64('decayAt'),
]);
exports.MemoSchema = borsh.struct([
    borsh.publicKey('community'),
    borsh.publicKey('from'),
    borsh.publicKey('to'),
    borsh.u64('amount'),
    borsh.str('note'),
]);
exports.CLOCK_LAYOUT = borsh.struct([
    borsh.u64('slot'),
    borsh.u64('epoch_start_timestamp'),
    borsh.u64('epoch'),
    borsh.u64('leader_schedule_epoch'),
    borsh.u64('unix_timestamp'),
]);
//# sourceMappingURL=_schemas.js.map