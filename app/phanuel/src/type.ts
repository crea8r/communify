/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/phanuel.json`.
 */
export type Phanuel = {
  "address": "Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok",
  "metadata": {
    "name": "phanuel",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addMember",
      "discriminator": [
        13,
        116,
        123,
        130,
        126,
        198,
        57,
        34
      ],
      "accounts": [
        {
          "name": "communityAccount",
          "writable": true
        },
        {
          "name": "memberInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "communityAccount"
              },
              {
                "kind": "account",
                "path": "member"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "communityAccount"
          ]
        },
        {
          "name": "member"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "phanuelProgram",
          "address": "Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok"
        }
      ],
      "args": []
    },
    {
      "name": "closeBag",
      "discriminator": [
        9,
        91,
        182,
        165,
        56,
        11,
        65,
        214
      ],
      "accounts": [
        {
          "name": "account",
          "writable": true
        },
        {
          "name": "member",
          "writable": true,
          "signer": true,
          "relations": [
            "account"
          ]
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "forced",
          "type": "bool"
        }
      ]
    },
    {
      "name": "create",
      "discriminator": [
        24,
        30,
        200,
        40,
        5,
        28,
        7,
        119
      ],
      "accounts": [
        {
          "name": "communityAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  77,
                  73,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "decayAfter",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintTo",
      "discriminator": [
        241,
        34,
        48,
        186,
        37,
        179,
        123,
        192
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "communityAccount",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "communityAccount"
          ]
        },
        {
          "name": "bag",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  97,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "memberInfo"
              },
              {
                "kind": "account",
                "path": "member_info.max",
                "account": "memberInfo"
              }
            ]
          }
        },
        {
          "name": "memberInfo",
          "writable": true
        },
        {
          "name": "member",
          "relations": [
            "memberInfo"
          ]
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "phanuelProgram",
          "address": "Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeMember",
      "discriminator": [
        171,
        57,
        231,
        150,
        167,
        128,
        18,
        55
      ],
      "accounts": [
        {
          "name": "memberInfo",
          "writable": true
        },
        {
          "name": "communityAccount"
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "communityAccount"
          ]
        },
        {
          "name": "member",
          "relations": [
            "memberInfo"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "transfer",
      "discriminator": [
        163,
        52,
        200,
        231,
        140,
        3,
        69,
        186
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "member",
          "relations": [
            "receiverInfo"
          ]
        },
        {
          "name": "receiverInfo",
          "writable": true
        },
        {
          "name": "bag",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  66,
                  97,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "receiverInfo"
              },
              {
                "kind": "account",
                "path": "receiver_info.max",
                "account": "memberInfo"
              }
            ]
          }
        },
        {
          "name": "communityAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "phanuelProgram",
          "address": "Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amountEachBags",
          "type": {
            "vec": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bag",
      "discriminator": [
        209,
        73,
        132,
        189,
        4,
        169,
        188,
        103
      ]
    },
    {
      "name": "communityAccount",
      "discriminator": [
        111,
        62,
        119,
        115,
        144,
        161,
        149,
        151
      ]
    },
    {
      "name": "memberInfo",
      "discriminator": [
        136,
        12,
        253,
        251,
        18,
        27,
        161,
        167
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6001,
      "name": "invalidBagOwner",
      "msg": "Invalid bag owner"
    },
    {
      "code": 6002,
      "name": "bagDecayed",
      "msg": "Bag decayed"
    },
    {
      "code": 6003,
      "name": "bagNotDecayed",
      "msg": "Bag not decayed"
    }
  ],
  "types": [
    {
      "name": "bag",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "community",
            "type": "pubkey"
          },
          {
            "name": "member",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "decayAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "communityAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "decayAfter",
            "type": "u64"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "memberInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "community",
            "type": "pubkey"
          },
          {
            "name": "member",
            "type": "pubkey"
          },
          {
            "name": "max",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
