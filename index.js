let express = require("express");
let app = express();
let port = 3003;
let cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/momo", function (req, res) {
  let partnerCode = "MOMO";
  let accessKey = "F8BBA842ECF85";
  let secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  let requestId = req.query.requestId;
  let orderId = requestId;
  let orderInfo = "Thanh toan cho don hang " + orderId;
  let redirectUrl =
    "http://d397-2001-ee0-4b8b-a520-6986-e225-83b0-5dcf.ngrok.io/handle-result-payment";
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
    console.log(`Status: ${resp.statusCode}`);
    console.log(`Headers: ${JSON.stringify(resp.headers)}`);
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
  if (paymentStatus == 0) {
    res.redirect("http://localhost:3000/payment-success/" + req.query.orderId);
  } else res.redirect("http://localhost:3000/payment-fail");
});

// app.get("/estimate-shipping-fee", function (req, res) {
//   let token =
//     "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhaGEiLCJ0eXAiOiJ1c2VyIiwiY2lkIjoiODQ5MDg4NDIyODAiLCJzdGF0dXMiOiJPTkxJTkUiLCJlb2MiOiJ0ZXN0QGdtYWlsLmNvbSIsIm5vYyI6IkRyaW5raWVzIFRlc3QgQWNjb3VudCIsImN0eSI6IlNHTiIsImFjY291bnRfc3RhdHVzIjoiQUNUSVZBVEVEIiwiZXhwIjoxNjM3MDYwNjIwLCJwYXJ0bmVyIjoidGVzdF9rZXkiLCJ0eXBlIjoiYXBpIn0.0JcO9Pjag39247XB2hAjxivKyOjt2HeVQZgvwyh5tQ4";
//   let service_id = "SGN-BIKE";
//   let request = "[]";
//   let order_time = "0";
//   let from_address = "268 Lý Thường Kiệt, phường 14, quận 10, TP. Hồ Chí Minh";
//   let to_address = "66 Trần Não, Quận 2, TP. Hồ Chí Minh";
//   let query_param =
//     "?token=" +
//     token +
//     "&service_id=" +
//     service_id +
//     "&request=" +
//     request +
//     "&order_time=" +
//     order_time +
//     '&path=[{"address":"' +
//     from_address +
//     '"}, {"address":"' +
//     to_address +
//     '"}]';
//   const https = require("https");
//   query_param = encodeURI(query_param);
//   const options = {
//     hostname: "apistg.ahamove.com",
//     port: 443,
//     path: "/v1/order/estimated_fee" + query_param,
//     method: "GET",
//     headers: {
//       "Accept": "*/*",
//       "Cache-Control": "no-cache"
//     },
//   };
//   let response = 0;
//   const reqCreateOrder = https.request(options, (resp) => {
//     console.log(`Status: ${resp.statusCode}`);
//     console.log(`Headers: ${JSON.stringify(resp.headers)}`);
//     resp.setEncoding("utf8");
//     resp.on("data", (body) => {
//       response += JSON.parse(body).total_price;
//     });
//     resp.on("end", () => {
//       res.json(response);
//     });
//   });

//   reqCreateOrder.on("error", (e) => {
//     console.log(`problem with request: ${e.message}`);
//   });
//   // write data to request body
//   console.log("Sending....");
//   reqCreateOrder.end();
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
