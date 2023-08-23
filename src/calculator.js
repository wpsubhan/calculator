let expression = [],
  userHistory = [],
  userVariables = [];
let variableKey = 0,
  historyKey = 0;
let floatPoint = false;
let mathOperators = ["+", "-", "*", "x", "/", "&divide;", "÷", "^"];
let mathFunctions = ["√", "(", ")", "sin(", "cos(", "tan("];
const mathConstants = { π: 3.14159265, _e: 2.71828183 };

let calScreenInput = document.getElementById("displayScreen_input");
let calScreenOutput = document.getElementById("displayScreen_output");
let calculatorHistory = document.getElementById("calculator_history");
let calculatorVariables = document.getElementById("calculator_variables");

let updateInputScreen = () => {
  calScreenInput.innerHTML = expression.join("");
  console.log(expression);
};

let refineExpression = () => {
  //replace variable with it's value
  expression.map((expressionVariable) => {
    if (
      typeof expressionVariable == "string" &&
      !mathOperators.includes(expressionVariable) &&
      !mathFunctions.includes(expressionVariable) &&
      expressionVariable !== "." &&
      userVariables.find((variable) => variable.name == expressionVariable) !==
        undefined
    ) {
      expression[expression.indexOf(expressionVariable)] = userVariables.find(
        (variable) => variable.name == expressionVariable
      ).value;
    }
  });
  return (
    expression
      .join("")
      .replace(/\.(\D|$)/g, ".0$1") //replace "." with .0 if no digit next to it
      .replace(/÷/g, "/")
      .replace(/&divide;/g, "/")
      // .replace(/x/g, "*")
      .replace(/\^/g, "**")
      .replace(/(?<=\d)\(/g, "*(") //replace "(" with *( if found digit prior to it
      .replace(/\)(\d)/g, ")*$1") //replace ")" with )* if found digit after it
      .replace(/√\s*((\d+(\.\d+)?)|(\(\s*.+?\s*\)))/g, "Math.sqrt($1)") // replace √4.5 to Math.sqrt(4.5)
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/_e/g, 2.71828183)
      .replace(/π/g, 3.14159265)
  );
};

let calculation = () => {
  try {
    eval(refineExpression());
    if (
      eval(refineExpression()) == Infinity ||
      eval(refineExpression()) == -Infinity ||
      isNaN(eval(refineExpression()))
    ) {
      calScreenOutput.innerHTML = "Divided by 0";
    } else {
      // The output should be fixed to 4 decimal points.
      calScreenOutput.innerHTML = eval(refineExpression())
        .toFixed(4)
        .replace(/[.,]0000$/, "");
      if (
        userHistory.length <= 0 ||
        userHistory[userHistory.length - 1].str_expression !==
          refineExpression()
      ) {
        saveHistoryItem();
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      calScreenOutput.innerHTML = "Syntax Error";
    } else {
      // throw error;
      calScreenOutput.innerHTML = error.message;
    }
  }
  return eval(refineExpression());
};

//Clear Screen
let clearScreen = () => {
  expression = [];
  calScreenInput.innerHTML = "";
  calScreenOutput.innerHTML = "0";
  floatPoint = false;
  updateInputScreen();
};

let deleteChar = () => {
  let secondLastIndex = expression.length - 1;
  if (Number.isInteger(expression[secondLastIndex])) {
    let arr = Array.from(expression.pop().toString(), (num) => Number(num));
    arr.pop();
    if (arr.length > 0) {
      arr = arr.join("");
      let num = parseInt(arr);
      expression.push(num);
    }
  } else if (
    typeof expression[secondLastIndex] == "string" &&
    expression[secondLastIndex].length > 1 &&
    !(expression[secondLastIndex] in mathConstants) &&
    !mathOperators.includes(expression[secondLastIndex]) &&
    !mathFunctions.includes(expression[secondLastIndex])
  ) {
    let arr = expression.pop().split("");
    arr.pop();
    expression.push(arr.join(""));
  } else {
    let delChar = expression.pop();
    delChar == "." ? (floatPoint = false) : "";
  }
  expression[secondLastIndex - 2] == "." ? (floatPoint = true) : "";
  updateInputScreen();
};

//Display and store pressed button
let displayChar = (value) => {
  secondLastIndex = expression.length - 1;

  if (Number.isInteger(value)) {
    // consective number will push in same index
    if (Number.isInteger(parseFloat(expression[secondLastIndex]))) {
      value = expression.pop().toString() + value.toString();
      floatPoint
        ? expression.push(parseFloat(value)).toFixed(2)
        : expression.push(parseFloat(value));
    } else {
      expression.push(value);
    }
  }
  //In case of pressing point(.)
  else if (value == "." && floatPoint == false) {
    floatPoint ? "" : expression.push(value);
    floatPoint = true;
  } else if (value in mathConstants) {
    if (
      !mathOperators.includes(expression[secondLastIndex]) &&
      !mathFunctions.includes(expression[secondLastIndex]) &&
      expression.length !== 0
    ) {
      expression.push("x");
    }
    expression.push(value);
  } else if (mathOperators.includes(value)) {
    //In case user is on start, so no operator is allowed except "-"
    if (expression.length == 0) {
      value == "-" ? expression.push(value) : "";
    }
    //No operator can replace "-"" sign on very start
    else if (expression.length > 0 || expression[0] == "-") {
      //In case of 2 consective operator's 2nd will remain and 1st will discard
      mathOperators.includes(expression[secondLastIndex])
        ? (expression[secondLastIndex] = value)
        : expression.push(value);
    }
    floatPoint = false;
  } else if (mathFunctions.includes(value)) {
    if (
      !mathOperators.includes(expression[secondLastIndex]) &&
      !mathFunctions.includes(expression[secondLastIndex]) &&
      expression.length !== 0 &&
      value !== ")"
    ) {
      expression.push("*");
    }
    expression.push(value);
  } else if (/^[A-Za-z_]$/.test(value)) {
    // consective alphabets will push in same index
    if (
      typeof expression[secondLastIndex] == "string" &&
      expression[secondLastIndex] !== "." &&
      !mathOperators.includes(expression[secondLastIndex]) &&
      !mathFunctions.includes(expression[secondLastIndex]) &&
      !(expression[secondLastIndex] in mathConstants)
    ) {
      value = expression.pop() + value;
      expression.push(value);
    } else {
      expression.push(value);
    }
  }
  updateInputScreen();
};

//Keyboard Events
let key;
document.addEventListener("keyup", (e) => {
  if (
    document.activeElement !== document.getElementById("variable_item_name") &&
    document.activeElement !== document.getElementById("variable_item_value") &&
    document.activeElement !== document.getElementById("variable_save_btn")
  ) {
    key = e.key;
    if (key >= 0 && key <= 9) {
      displayChar(parseInt(key));
    } else if (
      (e.keyCode >= 65 && e.keyCode <= 90 && e.altKey == false) ||
      e.key == "_" || true
    ) {
      displayChar(e.key);
    } else {
      switch (key) {
        case "Escape":
          clearScreen();
          break;
        case "Backspace":
          deleteChar();
          break;
        case "Enter":
          calculation();
          break;
        case "Dead": //option+e
          displayChar("_e");
          break;
        case "ß": //option+s
          displayChar("sin(");
          break;
        case "ç": //option+c
          displayChar("cos(");
          break;
        case "†": //option+t
          displayChar("tan(");
          break;
        // case "≈":
        //   displayChar("x");
        //   break;

        case "/":
          displayChar("/");
          break;
        case "*":
          displayChar("*");
          break;
        case "-":
          displayChar("-");
          break;
        case "+":
          displayChar("+");
          break;
        case ".":
          displayChar(".");
          break;
        case "^":
          displayChar("^");
          break;
        case "√": //option+v
          displayChar("√");
          break;
        case "(":
          displayChar("(");
          break;
        case ")":
          displayChar(")");
          break;
        case "π": //option+p
          displayChar("π");
          break;
        default:
        // console.log("Key event not found", e);
      }
    }
  }
});

let validateInput = (event) => {
  !/^[A-Za-z_]+$/.test(event.target.value)
    ? (event.target.value = event.target.value.replace(/[^A-Za-z_]/g, ""))
    : "";
};
let clearVariables = () => {
  calculatorVariables.innerHTML = "";
  userVariables = [];
};
let saveVariable = () => {
  if (document.getElementById(`variable_item_name`).value in mathConstants) {
    alert(
      document.getElementById(`variable_item_name`).value +
        " is a constant name, can't use as variable"
    );
  } else {
    let variableItem = new Object();
    variableItem.key = variableKey;
    variableItem.name = document.getElementById(`variable_item_name`).value;
    variableItem.value = parseFloat(
      document.getElementById(`variable_item_value`).value
    );
    if (
      variableItem.name == "" ||
      isNaN(variableItem.value) ||
      variableItem.name == "_"
    ) {
      alert("Correct Variable Name and Value is required");
    } else {
      //if variable already exist with same name so update its value only (key and name will remain same)
      if (
        userVariables.find((obj) => obj.name == variableItem.name) !== undefined
      ) {
        updateVariable(variableItem);
      } else {
        userVariables.push(variableItem);
        displayVariable(variableItem);
      }
    }
  }
};
let displayVariable = (variableItem) => {
  calculatorVariables.innerHTML += `<div id="variable_item_${variableKey}" class="variable_item">
  <div id="clear_variable_item_${variableKey}" class="clear_variable_item" onclick='clearvariableItem(${variableKey})'>X</div>
  <span id="variable_item_${variableKey}_name" class="variable_item_name">${variableItem.name}</span>
  <span>=</span>
  <span id="variable_item_${variableKey}_value" class="variable_item_value">${variableItem.value}</span>
  <div id="retrieve_variable__${variableKey}" class="retrieve_variable" onclick='retrieveVariable(${variableKey})'></div>`;

  variableKey++;
};
let updateVariable = (variableItem) => {
  let existingVariable = userVariables.find(
    (obj) => obj.name == variableItem.name
  );
  document.getElementById(
    `variable_item_${existingVariable.key}_value`
  ).innerHTML = parseFloat(variableItem.value);
  existingVariable.value = variableItem.value;
};
let retrieveVariable = (e) => {
  console.log(userVariables.find((obj) => obj.key == e).name);
  expression.push(userVariables.find((obj) => obj.key == e).name);
  updateInputScreen();
};
let clearvariableItem = (e) => {
  document.getElementById(`variable_item_${e}`).remove();
  userVariables = userVariables.filter((obj) => obj.key !== e);
};

// 7. History
let clearHistory = () => {
  calculatorHistory.innerHTML = "";
  userHistory = [];
};
let saveHistoryItem = () => {
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
let retrieveHistoryItem = (e) => {
  let historyItem = userHistory.filter((obj) => obj.key == e)[0];
  expression = historyItem.expression;
  floatPoint = historyItem.floatPoint;
  calScreenOutput.innerHTML = historyItem.result;
  updateInputScreen();
};
let clearHistoryItem = (e) => {
  document.getElementById(`history_item_${e}`).remove();
  userHistory = userHistory.filter((obj) => obj.key !== e);
  updateInputScreen();
};

// Divide code into meaningful parts. Create files and store things in a contextual manner.
// Remove big switch case statements. Use objects as a map/dictionary.
// Search for class and id naming in css and html. Use that naming throughout.
