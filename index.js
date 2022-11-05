const express = require("express");
const axios = require("axios");
const cors = require("cors");
const moment = require("moment");
var app = express();

app.use(cors());

async function processTransactionData() {
  try {
    let response = await axios.get(
      "https://interview.adpeai.com/api/v2/get-task"
    );
    let alphaTransaction;
    if (response.data.transactions || []) {
      let employeeTransaction = {};
      for (let transaction of response.data.transactions) {
        if (!employeeTransaction[transaction.employee.id]) {
          employeeTransaction[transaction.employee.id] = transaction.amount;
        }
        if (employeeTransaction[transaction.employee.id]) {
          employeeTransaction[transaction.employee.id] =
            employeeTransaction[transaction.employee.id] + transaction.amount;
        }
      }
      let values = [];
      for (let k in employeeTransaction) {
        values.push(employeeTransaction[k]);
      }
      let highAmount = Math.max.apply(Math, values);
      let highEmployeeId;
      for (let g in employeeTransaction) {
        if (employeeTransaction[g] === highAmount) {
          highEmployeeId = g;
        }
      }

      alphaTransaction = response.data.transactions.filter((transaction) => {
        return (
          transaction.type === "alpha" &&
          moment(transaction.timeStamp).year() === 2021 &&
          transaction.employee.id === highEmployeeId
        );
      });
    }

    let transactionIds = alphaTransaction.map(
      (transaction) => transaction.transactionID
    );

    let requestBody = {
      id: response.data.id,
      result: transactionIds,
    };
    let postResponse = await axios.post(
      "https://interview.adpeai.com/api/v2/submit-task",
      requestBody
    );
    console.log( postResponse);
  } catch (ex) {
    console.log(ex);
  }
}

processTransactionData();

app.listen(3001, () => {
  console.log("connected to 3000 port");
});
