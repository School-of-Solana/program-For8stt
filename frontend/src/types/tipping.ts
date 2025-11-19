/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tipping.json`.
 */
export type Tipping = {
  "address": "46SS66ojgt3YBDmDPJci7tvnQLSKzXd2t5tiVmHiY3D3",
  "metadata": {
    "name": "tipping",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cashout",
      "discriminator": [
        20,
        216,
        18,
        249,
        215,
        11,
        214,
        83
      ],
      "accounts": [
        {
          "name": "profile",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "profile"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "closeProfile",
      "discriminator": [
        167,
        36,
        181,
        8,
        136,
        158,
        46,
        207
      ],
      "accounts": [
        {
          "name": "profile",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "profile"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createProfile",
      "discriminator": [
        225,
        205,
        234,
        143,
        17,
        186,
        50,
        220
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "profile",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "slot",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "giveTip",
      "discriminator": [
        175,
        160,
        164,
        211,
        225,
        118,
        228,
        110
      ],
      "accounts": [
        {
          "name": "profile",
          "writable": true
        },
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "tipLog",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  108,
                  111,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "profile"
              },
              {
                "kind": "account",
                "path": "profile.next_comment_id",
                "account": "profileAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "profileAccount",
      "discriminator": [
        105,
        84,
        179,
        172,
        116,
        226,
        171,
        52
      ]
    },
    {
      "name": "tipLog",
      "discriminator": [
        195,
        199,
        252,
        218,
        182,
        119,
        216,
        221
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientAmount",
      "msg": "Tip amount did not meet the minimum threshold."
    },
    {
      "code": 6001,
      "name": "selfTippingForbidden",
      "msg": "You cannot reward your own profile."
    },
    {
      "code": 6002,
      "name": "invalidAccountOwner",
      "msg": "Only the profile authority can perform this action."
    },
    {
      "code": 6003,
      "name": "balanceTooLow",
      "msg": "Requested amount exceeds the profile balance."
    },
    {
      "code": 6004,
      "name": "invalidSlot",
      "msg": "Profile slot is outside the allowed range."
    },
    {
      "code": 6005,
      "name": "nameTooLong",
      "msg": "Profile name exceeds the allowed length."
    },
    {
      "code": 6006,
      "name": "messageTooLong",
      "msg": "Tip message is too long."
    },
    {
      "code": 6007,
      "name": "mathOverflow",
      "msg": "Mathematical overflow detected."
    }
  ],
  "types": [
    {
      "name": "profileAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tipCount",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "slot",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "nextCommentId",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tipLog",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profile",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "lamports",
            "type": "u64"
          },
          {
            "name": "recordedAt",
            "type": "i64"
          },
          {
            "name": "message",
            "type": "string"
          }
        ]
      }
    }
  ]
};
