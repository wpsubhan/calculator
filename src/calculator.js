var expression = [];
const constants = [
  pi = 3.14159265,
  euler = 2.71828183
];
var variables = {
  a: 0, b: 0, c: 0
};

var cal_screen_input = document.getElementById("displayScreen_input");
var cal_screen_output = document.getElementById("displayScreen_output");

result = () => {
  // console.log("Expression : ", expression);
  cal_screen_input.innerHTML = expression.join("");
};

refine = () => {
  var str_expression = expression.join("")
  str_expression = str_expression.replace(/÷/g, "/").replace(/&divide;/g, "/").replace(/x/g, "*").replace(/sqrt\(/g, "Math.sqrt\(").replace(/\^/g, "**").replace(/(?<=\d)\(/g, "*(");
  // str_expression = str_expression.split("").reverse().join("").replace(/\)(?!.*\))/g, "*(").split("").reverse().join("");
  // .replace(/\.(\D|$)/g, ".0$1") //replace "." with .0 if no digit next to it
  str_expression = str_expression.replace(/sin\(/g, "Math.sin\(").replace(/cos\(/g, "Math.cos\(").replace(/tan\(/g, "Math.tan\(");
  return str_expression;
}

//calculate
// a. Divided by 0 
// b. Incomplete/wrong expression

let error = false;

calculation = () => {
  // console.log("String refined expression : ", refine());
  try {
    eval(refine());
  } catch (error) {
    if (error.message.includes("Unexpected end of input")) {
      error = "Error: Unexpected end of input.";
    }
    else {
      console.log("Error:", error);
    }
  }
  return eval(refine());
}

//Show Output Results
output = () => {
  let final_result = calculation();
  // The output should be fixed to 4 decimal points.
  final_result == Infinity || final_result == -Infinity ? error = "Division by zero occurred." : "";
  cal_screen_output.innerHTML = final_result.toFixed(4);
  error ? cal_screen_output.innerHTML = error : "";
  // console.log("Output", final_result);
};

//Clear Screen
clearScreen = () => {
  expression = [];
  cal_screen_input.innerHTML = "";
  cal_screen_output.innerHTML = "0";
  float_point = false;
  result();
};

let length = expression.length;
let second_last_index = expression.length - 1;
let float_point = false; //Float point flag, it'll reset in case of
let operators = ["+", "-", "*", "x", "/", "&divide;", "÷", "^"]; //array of possible operators
let functions = ["sqrt(", "(", ")", "sin(", "cos(", "tan("];


deleteChar = () => {
  second_last_index = expression.length - 1;
  if (Number.isInteger(parseInt(expression[second_last_index]))) {
    let arr = Array.from(expression.pop().toString(), (num) => Number(num));
    arr.pop();
    if (arr.length > 0) {
      arr = arr.join("");
      let num = parseInt(arr);
      expression.push(num);
    }
  } else {
    let del_char = expression.pop();
    (del_char == ".") ? float_point = false : "";
  };
  expression[second_last_index - 2] == "." ? float_point = true : "";
  result();
};

//Display and store pressed button
displaychar = (value) => {

  // console.log("Value : ", value);
  length = expression.length;
  second_last_index = expression.length - 1;

  if (Number.isInteger(value)) {
    // consective number will push in same index 
    if (Number.isInteger(parseInt(expression[second_last_index]))) { //not worked for 1st index
      value = expression.pop().toString() + value.toString();
      expression.push(value);
    }
    else {
      expression.push(value);
    }
  }
  //In case of pressing point(.)
  //  set float_point to false again if any operator enter or if press clear or if deleted character is "."
  else if (value == "." && float_point == false) {
    float_point ? "" : expression.push(value);
    float_point = true;
  }
  else if (constants.includes(value)) {
    console.log("Constant pressed");
    if (!operators.includes(expression[second_last_index])) {
      expression.push("x");
    }
    expression.push(value);
  }
  else if (operators.includes(value)) {
    //In case user is on start, so no operator is allowed except "-"
    if (length == 0) {
      value == "-" ? expression.push(value) : "";
    }
    //No operator can replace "-"" sign on very start
    else if (expression.length > 0 || expression[0] == "-") {
      //In case of 2 consective operator's 2nd will remain and 1st will discard
      operators.includes(expression[second_last_index]) ? expression[second_last_index] = value : expression.push(value);
    }
    float_point = false;
  }
  else if (functions.includes(value)) {
    expression.push(value);
  }
  result();
};

//Keyboard Events
var key;
document.addEventListener("keyup", (e) => {
  key = e.key;
  // console.log(key);
  if (key >= 0 && key <= 9) displaychar(parseInt(key));
  else {
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
      case "x":
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
        output();
        break;
      case "^":
        displaychar("^");
        break;
      case "s":
        displaychar("sqrt(");
        break;
      case "(":
        displaychar("(");
        break;
      case ")":
        displaychar(")");
        break;
      case "p":
        displaychar('&pi');
        break;
      case "e":
        displaychar("e");
        break;
      default:
      // console.log("Key event not found");
    }
  }
});