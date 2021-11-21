let express = require("express");
let app = express();
let port = process.env.PORT || 3003;
let cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/momo", function (req, res) {
  let partnerCode = "MOMO";
  let accessKey = "F8BBA842ECF85";
  let secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  let requestId = req.query.requestId;
  let orderId = "MOMO" + (new Date().getTime() % 10000 + requestId);
  let orderInfo = "Thanh toan cho don hang " + requestId;
  let redirectUrl =
    "https://quiet-retreat-13947.herokuapp.com/handle-result-payment";
  let ipnUrl = "https://momo.vn";
  let amount = "12000";
  let requestType = "captureWallet";
  let extraData = "email=nghia.tran.179@hcmut.edu.vn";
  let rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  const crypto = require("crypto");
  let signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  console.log("--------------------SIGNATURE----------------");
  console.log(signature);
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  const https = require("https");
  let response = "";
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    body: requestBody,
  };

  const reqmomo = https.request(options, (resp) => {
    resp.setEncoding("utf8");
    resp.on("data", (body) => {
      try {
        JSON.parse(body);
        console.log(JSON.parse(body).payUrl);
        response += JSON.parse(body).payUrl;
      } catch (e) {
        response = "502 Bad Request";
      }
    });
    resp.on("end", () => {
      res.json(response);
    });
  });

  reqmomo.on("error", (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  // write data to request body
  console.log("Sending....");
  reqmomo.write(requestBody);
  reqmomo.end();
});

app.get("/handle-result-payment", function (req, res) {
  let paymentStatus = req.query.resultCode;
  console.log(paymentStatus);
  console.log(req.query.message);
  if (paymentStatus == 0) {
    res.redirect("http://localhost:3000/payment-success/" + req.query.requestId);
  } else res.redirect("http://localhost:3000/payment-fail");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
