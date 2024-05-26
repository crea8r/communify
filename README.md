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

- [ ] Fix netlify deployment
- [ ] Transfer with Memo
- [ ] One bag per 24 hour
- [ ] Fee to AdminAccount
- [ ] MemberInfo is only destroyable if all bags are removed

### Authors

k2 & Jay, SuperteamUK
