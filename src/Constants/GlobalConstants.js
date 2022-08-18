let HOSTNAME = window.location.origin; // Storing  a  Host  Name in global variable
if (HOSTNAME !== null && ((HOSTNAME.indexOf('localhost') !== -1) || (HOSTNAME.indexOf('127.0.0.1') !== -1)))
  HOSTNAME = "https://toolgrazp.net"; // Local development sever will be used from now onwards.

const GLOBAL_CONSTANTS = Object.freeze({
    HOSTNAME: HOSTNAME,
    USER_ROLE: {
        SUPERADMIN: "SUPERADMIN",
        DEALER: "DEALER",
        INDIVIDUAL: "INDIVIDUAL"
    },
    USER_TYPE: {
        SELLER: "SELLER",
        BUYER: "BUYER",
        PLATFORM: "PLATFORM"
    },
    LISTING_STATUS: {
        ALL: "ALL",
        OUT_OF_STOCK: "OUT_OF_STOCK",
        EXPIRED: "EXPIRED",
        ACTIVE: "ACTIVE",
        INCOMPLETE: "INCOMPLETE",
        COMPLETED: "COMPLETED",
    },
    ORDER_TYPE: {
        BUY: 'buy',
        BID: 'bid',
        TRADE: 'trade'
    },
    APPROVAL_STATUS: {
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        EXPIRED: "EXPIRED",
    },
    APP_USER_TYPE: {
        INDIVIDUAL: "INDIVIDUAL",
        DEALER: "DEALER"
    },
    DEFAULT_DISTANCE: "50",
    OTP_EXP_LIMIT: 60,
    DEFAULT_FUTURE_DAY_LIMIT: 7,
    DEFAULT_DISTANCE_UNIT: "ml",
    US_NATION_RADIUS: "3881",
    ITEM_TYPE: {
        NOT_FIRE_ARM : "NOT_FIRE_ARM",
        FIRE_ARM: "FIRE_ARM",
        PRE_1968: "PRE_1968"
    },
    CURRENCY: {
        DOLLAR: "8BF00242C993A4CD5EEE5987DBCB256706FB2BD7D78152E20DA3B6068FAD5735", // dollar currency sid
    },
    MSG: {
        SPINNER: {
            LOADING: "Loading... Please wait...",
            PLEASE_WAIT: "Please wait...",
            UPDATING: "Updating... Please wait...",
            CREATING: "Creating... Please wait...",
            DELETING: "Deleting... Please wait...",
        },
        SUCCESS: {
            CREATE: "Created successfully",
        },
        ERROR: {
            INTERNAL: "Internal server error! Please try later!"
        }
    },
    TRANSACTION_TYPE: {
        DEBIT: "DEBIT",
        CREDIT: "CREDIT",
        CANCEL_ORDER: "CANCEL_ORDER",
        REJECT_DISPUTE: "REJECT_DISPUTE"
    },
    DATA: {
        ACTION_OBJ: {
            "isEnable": true,
            "function": "",
            "amount": 0,
            "appliedTo": "",
            "title": ""
        },
        NEW_RES_OBJ: {
            "actions": [
                {
                    "isEnable": true,
                    "function": "",
                    "amount": 0,
                    "appliedTo": ""
                }
            ],
            "title": ""
        },
        ACTION_LIST: [{ "displayName": "Debit", "value": "DEBIT" }, { "displayName": "Credit", "value": "CREDIT" }, { "displayName": "Cancel Order", "value": "CANCEL_ORDER" }],
        APPLIED_TO_LIST: [{ "displayName": "Seller", "value": "SELLER" }, { "displayName": "Buyer", "value": "BUYER" }, { "displayName": "Platform", "value": "PLATFORM" }],
        CATEGORY: [
            {
                "sid": "6206AD081EB447E68E75E448D30FB9DC754F4700B70345939ACEC348215A69D1",
                "name": "Guns & Firearms",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "E1A146C62698493AA810C94CA9A1D2B8C76C5A3C239946C78DC0CE62B3D594AB",
                        "name": "Shotguns",
                        "iconLocation": null,
                        "childCategory": [
                            {
                                "sid": "7C97E5F34E5146B6A5F7C6EF40607EDC65985ED997FA4AC9958DBFFCAA8471AD",
                                "name": "Bolt Action Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "E08BBDBCEF3446478B58795A47A14910757BC9DC6DDC46D2801B6FF95C164EF7",
                                "name": "Other Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "F9874C36576745AE808739D8266D51A2A5658ECE7A47434EBDF8021E56591043",
                                "name": "Pump Action Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "DF538A6CDFF14483A832D20CEEF25851C0298E0FD36A4F58B2BB1813153748DB",
                                "name": "Side By Side Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "A0D2648794B842A59ECD74C3FE231B52BC8077E44E334FED94BDDA5EE6583894",
                                "name": "Single Shot Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "F395B7188E1E4D60A9A9F8360BD747C2CCDD2B00B4634ED29D769378344DEB3F",
                                "name": "Semi Auto Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "05421C9020C74424B14A28C3034F3C0800278F0739E74F589C016228A9B8A3A4",
                                "name": "Lever Action Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "84ED510E74FB40699D9745793A8B9016993A12361CA646399FCD385241E4FA79",
                                "name": "Over Under Shotguns",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            }
                        ],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "027663DA5D9E4F1B83BD2077DF88418227BE15B58B38418F803FD713CCE83611",
                        "name": "Rifles",
                        "iconLocation": null,
                        "childCategory": [
                            {
                                "sid": "2B191657E9DB4E47BB7AEC70E024F92B3B3BF2FE51FB4C3BB7146A4801370238",
                                "name": "Pump Action Rifles",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "94CEFE814E29462DA22AF080A4141FE63BEF545D54E34CEDBB539A038A9B37F1",
                                "name": "Single Shot Rifles",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "57FB970110B74B45885B75D1FC73BBE169DCD8702F264CA1B681FCDB70923911",
                                "name": "Bolt Action Rifles",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "587DCB5DEE054735ADDD786D501B8FD0E801ED71F7AE4AAE936807ADDB0FEEBA",
                                "name": "Other Rifles",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "A3563F0A815B41E3ADA883D6D6B60E82925C54704B4A4AD7A3C8DB4076013F60",
                                "name": "Semi Auto Rifles",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "870830E0894D4C5CAF7BD23AE2C66D29B9625661FAE94BDBA962CEB2268F1DCA",
                                "name": "Lever Action Rifles",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            }
                        ],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "96F29532BE0A484B8B9FEF9FF814ABD5D945520AA9E14EA499F7F975E881D6C5",
                        "name": "Pistols",
                        "iconLocation": null,
                        "childCategory": [
                            {
                                "sid": "A399433F858C42B388DB2B74507C75E823C34DC8ECD246D2949C9DF773D0C490",
                                "name": "Other Pistols",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "963425E123D74F848011EF98D721D020F137BF9349B445828BECF26627543372",
                                "name": "Semi Auto Pistols",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "A433C3800B4345198C95CDE44E4AC5EC658C1CB0D4734A3AA2253DF377E6FEC5",
                                "name": "Single Shot Pistols",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "6236EF6BE7CE416A8B1C9AB9373A229CE3A4790155F841339EA7CC33B7BB3280",
                                "name": "Revolvers",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            }
                        ],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "A08D389D8F584BEFBE6072E4F2FBC9B267B053869D284C24A01D644FBFE9C456",
                        "name": "Cowboy Action Shooting",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\", \"model\", \"caliber\", \"barrel length\", \"capacity\", \"frame finish\", \"grips\"]",
                "enabled": true,
                "firearm": true
            },
            {
                "sid": "BD260A2584EB4BC98600074657C23D41DD7F828F3BBA440D8E670989271D8453",
                "name": "Gun Parts",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "74B311B52A5D4C279AB57828CE45520A8FC0B4D6A5EE45F6B1343423AF6E3037",
                        "name": "Weapon Lights",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "6946A8A8C4C348C8A21845DD7F6A53D39BF106A7954047449FB1D1F9F1BB9D29",
                        "name": "Other Gun Accessories & Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "5D3485EF6EC73CD97C5C50DA6A5C7817346EEA011C4A9BDE8B0A7F8B52AED2DD",
                        "name": "Shotgun Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "4E5AEC331658457E93C751F6BEC95F45032E570BE54C4B52B736DDEA4B2E5178",
                        "name": "AK47 Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "6F67377C15FA458DAC96CD844B9EEC2853C6F0C8946F42C68159762DE51FC1C8",
                        "name": "Slings",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "672E3C5EB22444E887527AA143E0584A3466581251224CA8AE2747D6F1A8D33D",
                        "name": "TC Contender Barrels & Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "08BE3697C70C4B4CBB0B952EFF90C64FAB1BF6FA74984D39833CCF3C42B044E9",
                        "name": "Gun Parts Kit",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "C3F2D83AB73541C596A4DDE01322AAB6A5CBD25D14494949922AAA8C64DC2FC9",
                        "name": "Pistol Parts",
                        "iconLocation": null,
                        "childCategory": [
                            {
                                "sid": "0D96DBADF8AE4F74B30B31A95A7B5C1D5643BCF9158143E8A80ED97694E5E5F9",
                                "name": "Pistol Barrels",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "E5FB2D9EB7B14D59AA2708306EF89CF1322FE9A317E44241A4A6CF804498CA70",
                                "name": "Pistol Magazines & Pistol",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "91279E427A664EDF850BF7388DFA8B54DD29D2E2B5E44E9599FD9C86EDFD9F5D",
                                "name": "Clips",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "7CF9D3AB3E7F4BD9BBD4BFF1112C13EB399FBC9F196345C090D47385364463D8",
                                "name": "Pistol Frames",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "00B9AF684CDB4BA885A1987508F0E1772D521AF9CB664E0B8D57FA3B7ADFD6F8",
                                "name": "Pistol Slides",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "7FA5A26FDE1B4B0B983D0D008963D54B87F34481A3EC44E796C67B3DE6469D99",
                                "name": "Small Pistol Parts",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "0135C2537025456D99411E06E4BA11FA8CE844DBAF8D43FB95BA70EE69AA7F08",
                                "name": "Pistol Grips",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "FA7FCD1D18594A63ACC181C1578E263AB1A3C271116C4DA5B647B5C3F9D78CE8",
                                "name": "other Pistol Accessories & Parts",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            }
                        ],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "5C3837C1A07E4B818E0D4C6022166BEAA6361D99E39148589EC872FECF18B9F0",
                        "name": "Rifle Parts",
                        "iconLocation": null,
                        "childCategory": [
                            {
                                "sid": "7CC391E85DF540DA876205DFE3A271AC62BF65EC35BB4768BE02F67323F23440",
                                "name": "Rifle Barrels",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "862214EA1AB94563906551067EF6D9C0E1BB47766A594B368AF379F73274E7FC",
                                "name": "Rifle Lowers",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "9B3185DE4F644EDA924495B5825C7027BD89EFB0F31944CAB1917CCD0912C9AA",
                                "name": "Rifle Bolts",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "49706378FF884EB3A05E0F5E457A74922C407AC3611D45B886D984764314EC3F",
                                "name": "Rifle Magazines & Rifle Clips",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "9D0029F58FD3469FABC4D4C652276731AF77F595F4F1484AB9E365051A480425",
                                "name": "Small Rifle Parts",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "D86D3D28508941BB8255CD42C014021C75C884E8D2564B6CA7712D66D88384F9",
                                "name": "Other Rifle Accessories & Parts",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "4DA341C3A79B45A396AA5B679AAF336B3C76F1E5080C41789EF51EAD61DDD10D",
                                "name": "Rifle Stocks",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            }
                        ],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "FA53F12ABAD448A084F648EB777CFC0ABDED7590314049F892CCF2B693EB6926",
                        "name": "AR15 Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "86ABB3FF7680425A8307A6807B88037AAD84C077270249A4B9C7646910F64AC0",
                        "name": "Shotgun Parts",
                        "iconLocation": null,
                        "childCategory": [
                            {
                                "sid": "0E0B9CFDF4724734B4D1B51369C1C00CABDF216D25FE4BE8A3B3B70859B8189C",
                                "name": "Other Shotgun Accessories & Parts",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "3A4023073CDD43F4B6F25238743647F1EC823E7935E840229BD712EDE90D9560",
                                "name": "Shotgun Stocks",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "C1369654D51748F0B9F8FBA08E236A4D429518FDC0B54643B0A4A6D3CD8AA925",
                                "name": "Shotgun Receivers",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "C343928C71B844128BE0F811B9B4F8D37DF299A4707F4977BAD23A8F2A51F21A",
                                "name": "Shotgun Chokes",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            },
                            {
                                "sid": "F62F48136A2B493586BB749CD13ACE70D2ACB99B41564A12948E586AE7E73CDD",
                                "name": "Shotgun Barrels",
                                "iconLocation": null,
                                "childCategory": [],
                                "mandatory": null,
                                "enabled": true,
                                "firearm": false
                            }
                        ],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "DED5B146423A41EAA1699A55682F7E77F09CD85450334C45BAA3F767C04388CD",
                        "name": "1911 Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "E390A32E39CD4D6BB4A222A79C05E45EBB02E43C533D43FC815B858AA6A44EED",
                        "name": "SKS Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "71AC81C685A04EA5B492EE03943973F53FE2ED428852428C80D1BF9A26531DA6",
                        "name": "HK Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "2F6AD822890646B1AB10769C93B9D5172EDF81ED1C524871AC14BF4C2296F895",
                        "name": "Glock Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\", \"model\", \"caliber\", \"barrel length\", \"capacity\", \"frame finish\", \"grips\"]",
                "enabled": true,
                "firearm": false
            },
            {
                "sid": "341FD5B5CF774BE995EDF0952AAA99616BC7167B8D904D48BFA0680B065B8520",
                "name": "Scopes,Sights & Optics",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "059EAA4B8C0842DE953062CEDA3547E2D8C29A94E9E14AD5AE10EF99F9D0D356",
                        "name": "Red dot Sights",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "B843AEF278D54FCF9722A7D3BFC089BAD806263866FF4EB2B7C5461167375C40",
                        "name": "Laser Sights",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "E43B805C3C304CD89414C491D023D20BA03F2CD35D5E45B9B88D05E1EAAF57E0",
                        "name": "Thermal Sights",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "67DB314F4EB34BE8BB60805B32EBEB727A2055B0BFBA4290AD16916CD45EEFDC",
                        "name": "Scope Accessories & Scope Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "965CBF4E828A4DF4814D4CD66FEAB91169D1B74208E04C5DB27FEB17B6579CAE",
                        "name": "Spotting Scopes",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "A48308E4987341AD8EC7ACFA2335A17194D175B82EE94566992B78AE044CA775",
                        "name": "Night Vision",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "D9B23D9076B54C348114F903C835E850C0C7498BB7044092993C67FA1E171E5E",
                        "name": "Sight Magnifiers",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "3448BDCF827449F79EA80C4BCF8D13B5DB73275736424E208E122EED60116F1E",
                        "name": "Gun Scopes",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "6B66D702E8F448A39D34C767596849F7F1667079BF3E453F984187EBD19E7526",
                        "name": "Range Finders",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "9E09C3BB57D44A8081416FED943A679F9E2B87A2B9C34359B5D81CC2CD42CCCD",
                        "name": "Binoculars",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "A2601B463FD249AFB3EE3942CC1B33634961A4623A80437F8B591747811F56AA",
                        "name": "Gun Sights",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\", \"model\", \"capacity\", \"grips\"]",
                "enabled": true,
                "firearm": false
            },
            {
                "sid": "D1342F47DE6E4730A9D5226F2FAD4DA1A8E0D3C60E094378AE4AB715B70BE700",
                "name": "Ammunition",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "2C0B7FFA45004392BBA5884CEC1660CEE26D5B6B132D49F983105953F5DB7DC9",
                        "name": "Pistol Ammunition",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "7B4887C42ED048879B0497BBD12CE3C1BEECA2AEF09D4A459BD9458C68F212C7",
                        "name": "Ammo Storage",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "A2F449148D6A453688354BAECC6042341D772E6718774B7E913E2B7FDFC1427F",
                        "name": "Large bore",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "26C4454C4ABE4D66A08500C010FA9FA37889014B2A0A45A98B67D83EE577EFBE",
                        "name": "Vintage Ammo",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "6B1DBD6E4FFF49BE83F370FFEE2A9DBDA09FAEF4AC4C4230BA37C1039AF7FDD3",
                        "name": "Other Ammunition",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "5D7C926E413B4836AB8A7C371FD34E9B22C86696585A4507A582A181998220BC",
                        "name": "Shotgun",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "DA752EF664E60922EE5D4138B62F12FF9A290D66BF8BCE3C994448A6085D5778",
                        "name": "Rifle",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "03AA76A4D0C22EEFF78A434C06369BED7B5A3C4C489EAB7A9AAD390C875756E2",
                        "name": "Inert",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\"]",
                "enabled": true,
                "firearm": false
            },
            {
                "sid": "40281269C1EA46D59073B354378026D76319159B974541BCB5348E897DEF3610",
                "name": "Black Powder & Muzzleloaders",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "DF3FA582FB9D4E4B9DCC90A35F4C4C24E523FA93701949F3A00CDE8A388E6129",
                        "name": "Black Powder Pistols & Muzzleloader Pistol",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "C9F9EEC08A0E47D6B048D16A0145BC57FA3CBCF0E2014DEBAD5E624D1A65E0B1",
                        "name": "Black Powder Bullets",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "91B1A13087A246D0A29F4B6E43D9BC0BCC17D7AD397242899922B259D7D0D604",
                        "name": "Black Powder Rifles & Muzzleloader Rifles",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "D6B43F093AB04A909E56194150A2B3E818B5260E04A74C4F87D762096E991B25",
                        "name": "Muzzleloader Supplies & Black powder Parts",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\"]",
                "enabled": true,
                "firearm": false
            },
            {
                "sid": "17B0B71DA6DA486C8CD9932C4FC851A6D778879051054417A23369307EB90DED",
                "name": "Class 3 Firearms ,NFA & Destructive Devices",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "FB3B6B861C39419B9AE0309F180E63880A51AEDFF411432AAEA3E973B35DD228",
                        "name": "Any Other Weapon(AOW)",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "9ED0C020FD76493C8471C1A2C3AB94C10EA9BFB80A974C8CAD6F3AB60B4879CB",
                        "name": "Destructive Devices",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "E001253C576E4DC6B6DFD6CAD8B1381CBECF4BA38C934A7598A6C5B9723DCE04",
                        "name": "Short Barrel Rifles(SBR)",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "0FAA78C7B87F4D19D23C43EF3387EEF8EE68329807921CDE9EC0191F3E92DCCA",
                        "name": "Short barrel shotguns",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "660A0241D0C04ADBAFB16CEC9D9BBC92F5F3C9D10C0E4AE0A7AD5698E1E9C6ED",
                        "name": "Machine Guns",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "A8F38815D730471096E60C26561A71071FEEB454934C48A39943EA922070C438",
                        "name": "Silencers & Suppressed Firearms",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "B29054D10FF14CBB911B965BFDA60C03ED68C8472B0D4224855076E45BFD0B84",
                        "name": "Class 3 Parts & Accessories",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\", \"model\", \"caliber\", \"barrel length\", \"capacity\", \"frame finish\", \"grips\"]",
                "enabled": true,
                "firearm": false
            },
            {
                "sid": "F4A4D98AA4884D5F8721CC307329505329F44AE28949460886AF35CE98D3C0BD",
                "name": "Collectible Firearms",
                "iconLocation": null,
                "childCategory": [
                    {
                        "sid": "B0139AA28E62421BAA1FB8CD8DB0D6A56C537B53498E4AA4A42FCE8BFE32036B",
                        "name": "Other Collectible Guns",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "9AF381E77BBE431B830878FE35CF5608B147D47878D64921807089181DEC8FB8",
                        "name": "Muzzleloading Collectibles",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "468E424D89004DE69009884A7B1506B304703753346B495A9F7ED1BEBFD1726C",
                        "name": "Collectible Gun Parts & Accessories",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "A04123BFDC934B4DA0923DB9314C6522E64B0B04234E480DA58AF033A97C82FD",
                        "name": "Curios & Relics",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "03D81649A43B4A8E8747A51D28A522278734FD8A630844DCBDDBFC0CE264DFF8",
                        "name": "Commemorative Guns",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    },
                    {
                        "sid": "196ADFFA8A404DBA855A4E01DF987AB82DCD3CAA5C4747D4B193F41C75806165",
                        "name": "Antique Guns",
                        "iconLocation": null,
                        "childCategory": [],
                        "mandatory": null,
                        "enabled": true,
                        "firearm": false
                    }
                ],
                "mandatory": "[\"title\", \"description\", \"category\", \"condition\", \"manufacturer\"]",
                "enabled": true,
                "firearm": false
            }
        ],
        GOOGLE_SEARCH_OPTION: {
            // types: ['(regions)'],
            componentRestrictions: {country: "us"} // restrict search to us only
        },
        DEFAULT_FILTER_VALUE: {
            keyword: '',
            description: '',
            category: '',
            tcondition: [],
            manufacturer: '',
            model: '',
            caliber: '',
            barrelLength: '',
            capacity: '',
            frameFinish: '',
            price: '',
            grips: '',
            distance: '50',
            nationwide: false,
            priceRangeMin: 0,
            priceRangeMax: 100000,
        },
        CREATE_LISTING_DEFAULT: {
            "title": "",
            "description": "",
            "category": "",
            "tcondition": "",
            "manufacturer": "",
            "model": "",
            "caliber": "",
            "barrelLength": "",
            "capacity": "",
            "frameFinish": "",
            "pre1968": false,
            "serialNumber": "",
            "auction": false,
            "auctionReservePrice": "0",
            "googleLocation": "",
            "sell": false,
            "sid": null,
            "price": "",
            "trade": false,
            "tradeReservePrice": "",
            "deliveryType": "BOTH",
            "tradeWith": "open",
            "availableOtherLocation": false,
            "anyOtherLocation": {},
            "returnable": false,
            "isSingle": true,
            "bundleList": [],
            "shipBeyondPreferredDistance": false,
            "shippingFeesLocationBased": true,
            "shippingFree": false,
            "fixedSippingFees": "",
            "fflStoreEnabled": false,
            "fflStore": "",
            "fflStoreLocation": "",
            "listingPreferredDistance": "50",
            "quantity": 1,
            "itemType": "NOT_FIRE_ARM",
            "sheriffOfficeEnabled": false,
            "sheriffOfficeLocation": "",
            "listingType": "INDIVIDUAL",
            "offeredATrade": false,
            "selectedStore": "",
            "platformVariables": {
                "returnPeriod": "",
                "restockingFees": {
                    "percentage": "",
                    "amount": ""
                }
            },
            "isExpired": false
        },
        STORE: {
            BASIC_INFO: {
                "licRegn": "",
                "licDist": "",
                "licSeqn": "",
                "name": "",
                "description": "",
                "firstName": "",
                "lastName": "",
                "email": "",
                "phoneNumber": "",
                "contactEmailAddress": "",
                "contactPhoneNumber": "",
                "fax": "",
                "premiseStreet": "",
                "premiseCity": "",
                "premiseState": "",
                "premiseZipCode": "",
                "expriesOn": "",
                "license": "",
                "licenseExpireOn": "",
                "licenseNumber": "",
                "isFetched": false,
                "latitude": "",
                "longitude": ""
            }
        },
        BUSINESS_HOUR: [
            {
                name: "OO:00AM",
                sid: "00AM"
            },
            {
                name: "O1:00AM",
                sid: "01AM"
            },
            {
                name: "O2:00AM",
                sid: "02AM"
            },
            {
                name: "O3:00AM",
                sid: "03AM"
            },
            {
                name: "O4:00AM",
                sid: "04AM"
            },
            {
                name: "O5:00AM",
                sid: "05AM"
            },
            {
                name: "O6:00AM",
                sid: "06AM"
            },
            {
                name: "O7:00AM",
                sid: "07AM"
            },
            {
                name: "O8:00AM",
                sid: "08AM"
            },
            {
                name: "O9:00AM",
                sid: "09AM"
            },
            {
                name: "10:00AM",
                sid: "10AM"
            },
            {
                name: "11:00AM",
                sid: "11AM"
            },
            {
                name: "12:00PM",
                sid: "12PM"
            },
            {
                name: "01:00PM",
                sid: "01PM"
            },
            {
                name: "02:00PM",
                sid: "02PM"
            },
            {
                name: "03:00PM",
                sid: "03PM"
            },
            {
                name: "04:00PM",
                sid: "04PM"
            },
            {
                name: "05:00PM",
                sid: "05PM"
            },
            {
                name: "06:00PM",
                sid: "06PM"
            },
            {
                name: "07:00PM",
                sid: "07PM"
            },
            {
                name: "08:00PM",
                sid: "08PM"
            },
            {
                name: "09:00PM",
                sid: "09PM"
            },
            {
                name: "10:00PM",
                sid: "10PM"
            },
            {
                name: "11:00PM",
                sid: "11PM"
            }
        ]
    }
})

export default GLOBAL_CONSTANTS;