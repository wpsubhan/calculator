let expression = [];
let user_history = [];
let history_key = 0;
let user_variables = [];
let variable_key = 0;
const math_constants = { π: 3.14159265, _e: 2.71828183 };
let float_point = false; //Float point flag, it'll reset in case of
let operators = ["+", "-", "*", "x", "/", "&divide;", "÷", "^"]; //array of possible operators
let functions = ["√", "(", ")", "sin(", "cos(", "tan("];

var cal_screen_input = document.getElementById("displayScreen_input");
var cal_screen_output = document.getElementById("displayScreen_output");
var calculator_history = document.getElementById("calculator_history");
var calculator_variables = document.getElementById("calculator_variables");

let update_input = () => {
  cal_screen_input.innerHTML = expression.join("");
};

let refine = () => {
  //replace variable with it's value
  expression.map((expression_variable) => {
    if (
      typeof expression_variable == "string" &&
      !operators.includes(expression_variable) &&
      !functions.includes(expression_variable) &&
      expression_variable !== "." &&
      user_variables.find(
        (variable) => variable.name == expression_variable
      ) !== undefined
    ) {
      expression[expression.indexOf(expression_variable)] = user_variables.find(
        (variable) => variable.name == expression_variable
      ).value;
    }
  });
  return expression
    .join("")
    .replace(/\.(\D|$)/g, ".0$1") //replace "." with .0 if no digit next to it
    .replace(/÷/g, "/")
    .replace(/&divide;/g, "/")
    .replace(/x/g, "*")
    .replace(/\^/g, "**")
    .replace(/(?<=\d)\(/g, "*(") //replace "(" with *( if found digit prior to it
    .replace(/\)(\d)/g, ")*$1") //replace ")" with )* if found digit after it
    .replace(/√\s*((\d+(\.\d+)?)|(\(\s*.+?\s*\)))/g, "Math.sqrt($1)") // replace √4.5 to Math.sqrt(4.5)
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/_e/g, 2.71828183)
    .replace(/π/g, 3.14159265);
};

let calculation = () => {
  try {
    eval(refine());
    if (
      eval(refine()) == Infinity ||
      eval(refine()) == -Infinity
       ||isNaN(eval(refine()))
    ) {
      cal_screen_output.innerHTML = "Divided by 0";
    } else {
      // The output should be fixed to 4 decimal points.
      cal_screen_output.innerHTML = eval(refine())
        .toFixed(4)
        .replace(/[.,]0000$/, "");
      calc_history();
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      cal_screen_output.innerHTML = "Syntax Error";
    } else {
      // throw error;
      cal_screen_output.innerHTML = error.message;
    }
  }
  return eval(refine());
};

//Clear Screen
let clearScreen = () => {
  expression = [];
  cal_screen_input.innerHTML = "";
  cal_screen_output.innerHTML = "0";
  float_point = false;
  update_input();
};

let deleteChar = () => {
  let second_last_index = expression.length - 1;
  if (Number.isInteger(expression[second_last_index])) {
    let arr = Array.from(expression.pop().toString(), (num) => Number(num));
    arr.pop();
    if (arr.length > 0) {
      arr = arr.join("");
      let num = parseInt(arr);
      expression.push(num);
    }
  } else if (
    typeof expression[second_last_index] == "string" &&
    expression[second_last_index].length > 1 &&
    !(expression[second_last_index] in math_constants) &&
    !operators.includes(expression[second_last_index]) &&
    !functions.includes(expression[second_last_index])
  ) {
    let arr = expression.pop().split("");
    arr.pop();
    expression.push(arr.join(""));
  } else {
    let del_char = expression.pop();
    del_char == "." ? (float_point = false) : "";
  }
  expression[second_last_index - 2] == "." ? (float_point = true) : "";
  update_input();
};

//Display and store pressed button
let displaychar = (value) => {
  length = expression.length;
  second_last_index = expression.length - 1;

  if (Number.isInteger(value)) {
    // consective number will push in same index
    if (Number.isInteger(parseFloat(expression[second_last_index]))) {
      value = expression.pop().toString() + value.toString();
      float_point
        ? expression.push(parseFloat(value)).toFixed(2)
        : expression.push(parseFloat(value));
    } else {
      expression.push(value);
    }
  }
  //In case of pressing point(.)
  else if (value == "." && float_point == false) {
    float_point ? "" : expression.push(value);
    float_point = true;
  } else if (value in math_constants) {
    if (
      !operators.includes(expression[second_last_index]) &&
      !functions.includes(expression[second_last_index]) &&
      expression.length !== 0
    ) {
      expression.push("x");
    }
    expression.push(value);
  } else if (operators.includes(value)) {
    //In case user is on start, so no operator is allowed except "-"
    if (length == 0) {
      value == "-" ? expression.push(value) : "";
    }
    //No operator can replace "-"" sign on very start
    else if (expression.length > 0 || expression[0] == "-") {
      //In case of 2 consective operator's 2nd will remain and 1st will discard
      operators.includes(expression[second_last_index])
        ? (expression[second_last_index] = value)
        : expression.push(value);
    }
    float_point = false;
  } else if (functions.includes(value)) {
    if (
      !operators.includes(expression[second_last_index]) &&
      !functions.includes(expression[second_last_index]) &&
      expression.length !== 0 &&
      value !== ")"
    ) {
      expression.push("*");
    }
    expression.push(value);
  } else if (/^[A-Za-z_]$/.test(value)) {
    // consective alphabets will push in same index
    if (
      typeof expression[second_last_index] == "string" &&
      expression[second_last_index] !== "." &&
      !operators.includes(expression[second_last_index]) &&
      !functions.includes(expression[second_last_index]) &&
      !(expression[second_last_index] in math_constants)
    ) {
      value = expression.pop() + value;
      expression.push(value);
    } else {
      expression.push(value);
    }
  }
  update_input();
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
      displaychar(parseInt(key));
    } else if (
      (e.keyCode >= 65 && e.keyCode <= 90 && e.altKey == false) ||
      e.key == "_"
    ) {
      displaychar(e.key);
    } else {
      switch (key) {
        case "Escape":
          clearScreen();
          break;
        case "Backspace":
          deleteChar();
          break;
        case "/":
          displaychar("&divide;");
          break;
        case "≈":
          displaychar("x");
          break;
        case "*":
          displaychar("x");
          break;
        case "-":
          displaychar("-");
          break;
        case "+":
          displaychar("+");
          break;
        case ".":
          displaychar(".");
          break;
        case "Enter":
          calculation();
          break;
        case "^":
          displaychar("^");
          break;
        case "√": //option+v
          displaychar("√");
          break;
        case "(":
          displaychar("(");
          break;
        case ")":
          displaychar(")");
          break;
        case "π": //option+p
          displaychar("π");
          break;
        case "Dead": //option+e
          displaychar("_e");
          break;
        case "ß": //option+s
          displaychar("sin(");
          break;
        case "ç": //option+c
          displaychar("cos(");
          break;
        case "†": //option+t
          displaychar("tan(");
          break;
        default:
          // console.log("Key event not found", e);
      }
    }
  }
});
// 7. History
let clear_history = () => {
  calculator_history.innerHTML = "";
  user_history = [];
};
let calc_history = () => {
  if (
    user_history.length <= 0 ||
    user_history[user_history.length - 1].str_expression !== refine()
  ) {
    save_history();
  }
};
let save_history = () => {
  let expression_clone = JSON.parse(JSON.stringify(expression));
  var history_item = new Object();
  history_item.key = history_key++;
  history_item.expression = expression_clone;
  history_item.str_expression = refine();
  history_item.result = eval(refine())
    .toFixed(4)
    .replace(/[.,]0000$/, "");
  history_item.float_point = float_point;
  user_history.push(history_item);
  calculator_history.innerHTML += `<div id="history_item_${
    history_item.key
  }" class="history_item">
    <div id="retrieve_history_item_${
      history_item.key
    }" class="retrieve_history_item" onclick='retrieve_history(${
    history_item.key
  })'></div>
    <p> ${history_item.expression.join("")} </p>
    <p> =${history_item.result}</p>
    <div id="clear_history_item_${
      history_item.key
    }" class="clear_history_item" onclick='clear_history_item(${
    history_item.key
  })'>X</div>
  <div>`;
};
let retrieve_history = (e) => {
  var history_item = user_history.filter((obj) => obj.key == e)[0];
  expression = history_item.expression;
  float_point = history_item.float_point;
  cal_screen_output.innerHTML = history_item.result;
  update_input();
};
let clear_history_item = (e) => {
  document.getElementById(`history_item_${e}`).remove();
  user_history = user_history.filter((obj) => obj.key !== e);
  update_input();
};

let validateInput = (event) => {
  !/^[A-Za-z_]+$/.test(event.target.value)
    ? (event.target.value = event.target.value.replace(/[^A-Za-z_]/g, ""))
    : "";
};
let clear_variables = () => {
  calculator_variables.innerHTML = "";
  user_variables = [];
};
let save_variable = () => {
  if (document.getElementById(`variable_item_name`).value in math_constants) {
    alert(
      document.getElementById(`variable_item_name`).value +
        " is a constant name, can't use as variable"
    );
  } else {
    var variable_item = new Object();
    variable_item.key = variable_key;
    variable_item.name = document.getElementById(`variable_item_name`).value;
    variable_item.value = parseFloat(
      document.getElementById(`variable_item_value`).value
    );
    if (
      variable_item.name == "" ||
      isNaN(variable_item.value) ||
      variable_item.name == "_"
    ) {
      alert("Correct Variable Name and Value is required");
    } else {
      //if variable already exist with same name so update its value only (key and name will remain same)
      if (
        user_variables.find((obj) => obj.name == variable_item.name) !==
        undefined
      ) {
        update_variable(variable_item);
      } else {
        user_variables.push(variable_item);
        display_variable(variable_item);
      }
    }
  }
};
let display_variable = (variable_item) => {
  calculator_variables.innerHTML += `<div id="variable_item_${variable_key}" class="variable_item">
  <div id="clear_variable_item_${variable_key}" class="clear_variable_item" onclick='clear_variable_item(${variable_key})'>X</div>
  <span id="variable_item_${variable_key}_name" class="variable_item_name">${variable_item.name}</span>
  <span>=</span>
  <span id="variable_item_${variable_key}_value" class="variable_item_value">${variable_item.value}</span>
  <div id="retrieve_variable__${
    variable_key
  }" class="retrieve_variable" onclick='retrieve_variable(${
  variable_key
})'></div>`;
  
  variable_key++;
};
let update_variable = (variable_item) => {
  var existing_variable = user_variables.find(
    (obj) => obj.name == variable_item.name
  );
  document.getElementById(
    `variable_item_${existing_variable.key}_value`
  ).innerHTML = parseFloat(variable_item.value);
  existing_variable.value = variable_item.value;
};
let  retrieve_variable = (e) =>{
  console.log(user_variables.find(obj => obj.key == e).name);
  expression.push(user_variables.find(obj => obj.key == e).name);
  update_input();
}
let clear_variable_item = (e) => {
  document.getElementById(`variable_item_${e}`).remove();
  user_variables = user_variables.filter((obj) => obj.key !== e);
};
