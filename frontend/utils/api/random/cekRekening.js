import axios from "axios";


/* ================================
   BANK LIST
================================ */
const bankList = [

    { code: "002", name: "Bank Rakyat Indonesia (BRI)" },
    { code: "008", name: "Bank Mandiri" },
    { code: "009", name: "Bank Negara Indonesia (BNI)" },
    { code: "200", name: "Bank Tabungan Negara (BTN)" },

    { code: "014", name: "Bank Central Asia (BCA)" },
    { code: "011", name: "Bank Danamon" },
    { code: "013", name: "Bank Permata" },
    { code: "016", name: "Maybank Indonesia" },
    { code: "019", name: "Bank Panin" },
    { code: "022", name: "CIMB Niaga" },
    { code: "023", name: "Bank UOB Indonesia" },
    { code: "028", name: "OCBC NISP" },

    { code: "031", name: "Citibank Indonesia" },
    { code: "036", name: "China Construction Bank Indonesia" },
    { code: "037", name: "Bank Artha Graha Internasional" },
    { code: "042", name: "MUFG Bank Indonesia" },
    { code: "046", name: "DBS Indonesia" },
    { code: "050", name: "Standard Chartered Indonesia" },
    { code: "054", name: "Bank Capital Indonesia" },
    { code: "069", name: "Bank of China Indonesia" },
    { code: "076", name: "Bank Bumi Arta" },
    { code: "087", name: "HSBC Indonesia" },
    { code: "095", name: "Bank JTrust Indonesia" },
    { code: "097", name: "Bank Mayapada" },

    { code: "110", name: "Bank BJB" },
    { code: "111", name: "Bank DKI" },
    { code: "112", name: "Bank BPD DIY" },
    { code: "113", name: "Bank Jateng" },
    { code: "114", name: "Bank Jatim" },

    { code: "147", name: "Bank Muamalat" },
    { code: "451", name: "Bank Syariah Indonesia (BSI)" },

    { code: "213", name: "Bank BTPN / Jenius" },
    { code: "426", name: "Bank Mega" },
    { code: "441", name: "KB Bukopin" },

    { code: "dana", name: "DANA" },
    { code: "gopay", name: "GoPay" },
    { code: "ovo", name: "OVO" },
    { code: "shopeepay", name: "ShopeePay" },
    { code: "linkaja", name: "LinkAja" }

];
/* ================================
   MODULE EXPORT
================================ */
export default {
    name: "cekRekening",
    category: "random",
    path: "/v1/random/cekRekening",
    method: "GET",
    params: [
        { mode: "query", name: "bank", type: "string", required: true },
        { mode: "query", name: "account", type: "string", required: true }
    ],
description: `
List bank:

- 002 : Bank Rakyat Indonesia (BRI)
- 008 : Bank Mandiri
- 009 : Bank Negara Indonesia (BNI)
- 200 : Bank Tabungan Negara (BTN)
- 014 : Bank Central Asia (BCA)
- 011 : Bank Danamon
- 013 : Bank Permata
- 016 : Maybank Indonesia
- 019 : Bank Panin
- 022 : CIMB Niaga
- 023 : Bank UOB Indonesia
- 028 : OCBC NISP
- 031 : Citibank Indonesia
- 036 : China Construction Bank Indonesia
- 037 : Bank Artha Graha Internasional
- 042 : MUFG Bank Indonesia
- 046 : DBS Indonesia
- 050 : Standard Chartered Indonesia
- 054 : Bank Capital Indonesia
- 069 : Bank of China Indonesia
- 076 : Bank Bumi Arta
- 087 : HSBC Indonesia
- 095 : Bank JTrust Indonesia
- 097 : Bank Mayapada
- 110 : Bank BJB
- 111 : Bank DKI
- 112 : Bank BPD DIY
- 113 : Bank Jateng
- 114 : Bank Jatim
- 147 : Bank Muamalat
- 451 : Bank Syariah Indonesia (BSI)
- 213 : Bank BTPN / Jenius
- 426 : Bank Mega
- 441 : KB Bukopin
- dana : DANA
- gopay : GoPay
- ovo : OVO
- shopeepay : ShopeePay
- linkaja : LinkAja
`,
    code: async (params) => {
        try {
 

            const { bank, account } = params;
            if (!bank || !account) {
                return { code: 400, status: false, message: "bank dan account wajib diisi" };
            }

            const bankExist = bankList.find(b => b.code === bank);
            if (!bankExist) {
                return { code: 400, status: false, message: "kode bank tidak tersedia" };
            }

            // POST ke API target tanpa JSON.stringify
            const res = await axios.post(
                "https://laey.dev/cek-rekening/api/check",
                { bank: bankExist.code, accountNumber: account },
                { headers: { "Content-Type": "application/json","X-Api-Key":"FREE" }, timeout: 10000 }
            );

            return { code: 200, status: true, message: "Success", data: res.data.data };

        } catch (err) {
            return { code: 500, status: false, message: err.response?.data ?? err.message };
        }
    }
};