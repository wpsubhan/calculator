class History {
  userHistory = [];
  historyKey = 0;

  clearHistory = () => {
    calculatorHistory.innerHTML = "";
    this.userHistory = [];
  };

  saveHistoryItem = () => {
    let expression_clone = JSON.parse(JSON.stringify(expression));
    let historyItem = new Object();
    historyItem.key = historyKey++;
    historyItem.expression = expression_clone;
    historyItem.str_expression = refineExpression();
    historyItem.result = eval(refineExpression())
      .toFixed(4)
      .replace(/[.,]0000$/, "");
    historyItem.floatPoint = floatPoint;
    userHistory.push(historyItem);
    calculatorHistory.innerHTML += `<div id="history_item_${
      historyItem.key
    }" class="history_item">
      <div id="retrieve_history_item_${
        historyItem.key
      }" class="retrieve_history_item" onclick='retrieveHistoryItem(${
      historyItem.key
    })'></div>
      <p> ${historyItem.expression.join("")} </p>
      <p> =${historyItem.result}</p>
      <div id="clear_history_item_${
        historyItem.key
      }" class="clear_history_item" onclick='clearHistoryItem(${
      historyItem.key
    })'>X</div>
    <div>`;
  };

  retrieveHistoryItem = (e) => {
    let historyItem = userHistory.filter((obj) => obj.key == e)[0];
    expression = historyItem.expression;
    floatPoint = historyItem.floatPoint;
    calScreenOutput.innerHTML = historyItem.result;
    updateInputScreen();
  };

  clearHistoryItem = (e) => {
    document.getElementById(`history_item_${e}`).remove();
    userHistory = userHistory.filter((obj) => obj.key !== e);
    updateInputScreen();
  };
}
