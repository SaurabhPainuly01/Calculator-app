let input = document.getElementById("calculator-display");
let allBtns = document.querySelectorAll(".btn");

let currentInput = "";

function tokenize(expr) {
    // let tokens = expr.match(/(\d+\.?\d*%?|\+|\-|\*|\/)/g);
    let tokens = expr.match(/(\d+\.?\d*%?|\.\d+%?|[+\-*/%])/g);
    console.log(tokens);

    if(!tokens) return "Error";

    // remove any trailing operator (e.g. "12+"), avoids undefined nextToken
    while (tokens.length && /^[+\-*/%]$/.test(tokens[tokens.length - 1])) tokens.pop();

    // handle negative numbers
    let processedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '-' && (i === 0 || ['+', '-', '*', '/'].includes(tokens[i - 1]))) {
            let next = tokens[i + 1];

            if(typeof next === 'undefined' || ['+', '-', '*', '/'].includes(next)) return "Error"; // If the next token is also an operator or undefined, return "Error"

            processedTokens.push('-' + next);
            i++; // Skip the next token as it's already processed
        } else {
            processedTokens.push(tokens[i]);    
        }
    }
    tokens = processedTokens;

    // handle * and /
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '*' || tokens[i] === '/') {
            if (i === 0 || i === tokens.length - 1) return "Error"; // If * or / is at the start or end, return "Error"

            let leftToken = tokens[i - 1];
            let rightToken = tokens[i + 1];

            if (isNaN(leftToken) || isNaN(rightToken)) return "Error";

            let leftValue = leftToken.endsWith('%') ? parseFloat(leftToken.replace('%', '')) / 100 : parseFloat(leftToken);

            let rightValue = rightToken.endsWith('%') ? parseFloat(rightToken.replace('%', '')) / 100 : parseFloat(rightToken);

            let computed = tokens[i] === '*' ? leftValue * rightValue : leftValue / rightValue;
            tokens.splice(i - 1, 3, computed.toString());
            i--;  
        }
    }

    // handle + and -
    let result = (typeof tokens[0] === 'string' && tokens[0].endsWith('%')) ? parseFloat(tokens[0].replace('%', '')) / 100 : parseFloat(tokens[0]);

    for (let i = 1; i < tokens.length; i += 2) {
        let operator = tokens[i];
        let nextToken = tokens[i + 1];

        let nextValue = parseFloat(nextToken);

        if(nextToken.endsWith('%')) {
            let percentValue = parseFloat(nextToken.replace('%', '')) / 100;
            nextValue = result * percentValue;
        }

        if (operator === '+') result += nextValue;
        if (operator === '-') result -= nextValue;
    }

    return Number(result.toFixed(6));
}

allBtns.forEach(btn => {
    let result = null;
    btn.addEventListener("click", function(e) {
        const value = e.target.dataset.value;
        const action = e.target.dataset.action;

        if (value) {
            if (value === '.') {
                let parts = currentInput.split(/[\+\-\/\*]/);

                let lastPart = parts[parts.length - 1];

                if (lastPart.includes('.')) return;
                if (lastPart === '') currentInput += '0.';
                else currentInput += '.';
            } else {
                currentInput += value;
            }

            input.value = currentInput;
            return;

        } 
        
        if (action) {
            if (action === '%') {
                if (!currentInput || currentInput.endsWith('%')) {
                    return;  // Prevent adding % at the start or after another %
                } else if(/[0-9.]$/.test(currentInput)) {
                    currentInput += '%';
                    input.value = currentInput;
                    return;
                }
            }
            if (action === 'clear') {
                currentInput = '';
                input.value = currentInput;
                return;
            } else if (action === 'delete') {
                currentInput = currentInput.slice(0, -1);
                input.value = currentInput;
                return;
            } else if (action === 'equals') {
                try {
                    result = tokenize(currentInput.toString());
                    input.value = result;
                    currentInput = "";
                    currentInput += result.toString();
                } catch (error) {
                    input.value = "Error";
                    currentInput = "";
                    result = null;
                }
                return;
            } else {
                let operators = ['+', '-', '*', '/'];

                if (operators.includes(action)) {
                    if (!currentInput && action !== '-') {
                        return;   // Prevent adding other operators at the start
                    } else if (/[+\-*/]$/.test(currentInput)) {
                        currentInput = currentInput.slice(0, -1) + action;
                    } else {
                        currentInput += action;
                    }
                }
                input.value = currentInput;
                console.log(currentInput);
            }
        }

    });
});