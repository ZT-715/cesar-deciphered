const sha1 = require('sha1');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const concat = require("concat-stream");

async function getCipher() {
  try {
    const response = await axios.get('https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=29c844c3274146cb8ad29855be8ebcb54885944b');
    return response.data;
  } catch (error) {
    return null;
  }
}

function unencript (cipher, shift) {
  let deciphred = "";
  cipher.split('').map((current) => {
    if (97 <= current.charCodeAt(0) && current.charCodeAt(0) <= 122) {
      deciphred += String.fromCharCode((((current.charCodeAt(0)-70)-shift)%26)+96)
    } else deciphred += current
  });
  return deciphred;
}

async function saveFile(filename, data) {
  fs.writeFile(filename, data, "UTF-8", (err) => console.log(err));
}

async function handleObjResponse() {
  let ans = await getCipher();
  ans.decifrado = unencript(ans.cifrado, ans.numero_casas);
  ans.resumo_criptografico = sha1(ans.decifrado);
  saveFile("answer.json", JSON.stringify(ans));
  return ans;
}

async function submitAnswer() {
  let url = "https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=29c844c3274146cb8ad29855be8ebcb54885944b";

  const form = new FormData();
  form.append('answer', fs.createReadStream('./answer.json'), './answer.json');

  form.pipe(concat({ encoding: 'buffer' }, (data) => {
    axios.post(url, data, { headers: form.getHeaders() })
    .then(response => console.log(response))
    .catch(response => console.log(response));
  }));
  
  
}


handleObjResponse().then( () => submitAnswer() );

