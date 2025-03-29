import CryptoJS from "crypto-js";

/* const ESEWA_LINK = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; */


export const createSignature = (message) => {
  const secret = "8gBm/:&EnhH.1/q";

  try {
    const hmac = CryptoJS.HmacSHA256(message, secret);
    return CryptoJS.enc.Base64.stringify(hmac);
  } catch (error) {
    console.error("Error creating HMAC:", error);
    throw new Error("HMAC not created");
  }
};

export const esewaCall = (formData) => {
  const path = ESEWA_LINK;
  var form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action", path);

  for (const key in formData) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", formData[key]);
    hiddenField.required = true;
    form.appendChild(hiddenField);
  }

  document.body.appendChild(form);
  console.log(form);
  form.submit();
};
