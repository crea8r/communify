# Phanuel

Address: `Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok`

This is a token program with following characteristic:

- Transferable within a member list
- Decayed after a configurable time, e.g: 7 days
- Token lifetime renewed everytime transfer to a new wallet address

## Application

Serve community, encourage activity not hoarding.

## Further

Read more [here](https://hieub.notion.site/phanuel-Help-Token-aca5e5ecd74c47ff8091456067414bae?pvs=4)

## Scripts

To increase program size: `solana program extend Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok 10000`

To deploy on devnet: `anchor deploy -p phanuel --provider.cluster devnet`

### Todo

- [x] Fix netlify deployment
- [x] Mint token for multiple users using Versioned Transaction
  - [x] New instruction for multiple mint
  - [x] Tutorial on Versioned Transaction
  - [x] UI implementation: a dialog to show how many transaction would need (incld. new ALT every mint ~ later improvement)
- [x] UI to change token configuration
- [x] Deploy on communify.online
- [ ] Contact Blowfish to whitelist
- [x] Admin can upload csv file to add mutiple members
  - [x] New instruction for adding multiple members
  - [x] UI implementation
- [x] Admin can mint token to individuals
- [ ] Special functions for Superteam
  - [ ] Members can send request & other can fulfill the request through a telegram bot
  - [ ] Telegram bot for token transfer
- [ ] Add telegram account, linked to memberInfo and communityAccount
- [ ] Delete memberInfo & close bags
  - [ ] Instructions
  - [ ] UI implementation
- [ ] One bag per 24 hour (tranfer)
- [x] Transfer with Memo
- [ ] Fee to AdminAccount
- [ ] MemberInfo is only destroyable if all bags are removed

### Authors

k2 & Jay, SuperteamUK
