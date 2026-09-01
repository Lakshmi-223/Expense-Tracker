// Select the HTML elements we need once, at the top of the file.
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const clearBtn = document.getElementById("clear-btn");
const emptyMessage = document.getElementById("empty-message");
const formMessage = document.getElementById("form-message");

const storageKey = "transactions";
let transactions = loadTransactions();

form.addEventListener("submit", addTransaction);
clearBtn.addEventListener("click", clearTransactions);

// Load saved transactions. If saved data is invalid, start with an empty list.
function loadTransactions() {
    try {
        const savedTransactions = localStorage.getItem(storageKey);
        const parsedTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];

        return Array.isArray(parsedTransactions) ? parsedTransactions : [];
    } catch (error) {
        return [];
    }
}

function addTransaction(event) {
    event.preventDefault();

    const transactionText = text.value.trim();
    const transactionAmount = Number(amount.value);

    if (transactionText === "") {
        showMessage("Please enter a description.");
        text.focus();
        return;
    }

    if (!Number.isFinite(transactionAmount) || transactionAmount === 0) {
        showMessage("Please enter an amount other than zero.");
        amount.focus();
        return;
    }

    transactions.push({
        id: Date.now(),
        text: transactionText,
        amount: transactionAmount
    });

    saveTransactions();
    render();
    form.reset();
    text.focus();
}

function deleteTransaction(id) {
    transactions = transactions.filter(function (transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    render();
}

function clearTransactions() {
    if (transactions.length === 0) {
        return;
    }

    const shouldClear = window.confirm("Clear every transaction? This cannot be undone.");

    if (!shouldClear) {
        return;
    }

    transactions = [];
    localStorage.removeItem(storageKey);
    render();
}

function saveTransactions() {
    localStorage.setItem(storageKey, JSON.stringify(transactions));
}

function render() {
    updateDOM();
    updateValues();
    clearBtn.disabled = transactions.length === 0;
    emptyMessage.hidden = transactions.length > 0;
}

function updateDOM() {
    list.innerHTML = "";

    transactions.forEach(function (transaction) {
        const isExpense = transaction.amount < 0;
        const item = document.createElement("li");
        item.className = "transaction-item " + (isExpense ? "expense-item" : "income-item");

        const marker = document.createElement("span");
        marker.className = "transaction-marker";
        marker.setAttribute("aria-hidden", "true");

        const name = document.createElement("span");
        name.className = "transaction-name";
        name.textContent = transaction.text;

        const value = document.createElement("span");
        value.className = "transaction-amount";
        value.textContent = (isExpense ? "−" : "+") + formatMoney(Math.abs(transaction.amount));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Delete " + transaction.text);
        deleteButton.addEventListener("click", function () {
            deleteTransaction(transaction.id);
        });

        item.append(marker, name, value, deleteButton);
        list.appendChild(item);
    });
}

function updateValues() {
    const total = transactions.reduce(function (sum, transaction) {
        return sum + transaction.amount;
    }, 0);

    const incomeTotal = transactions
        .filter(function (transaction) {
            return transaction.amount > 0;
        })
        .reduce(function (sum, transaction) {
            return sum + transaction.amount;
        }, 0);

    const expenseTotal = transactions
        .filter(function (transaction) {
            return transaction.amount < 0;
        })
        .reduce(function (sum, transaction) {
            return sum + transaction.amount;
        }, 0);

    balance.textContent = formatMoney(total);
    income.textContent = "+" + formatMoney(incomeTotal);
    expense.textContent = "−" + formatMoney(Math.abs(expenseTotal));
}

function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(value);
}

function showMessage(message) {
    formMessage.textContent = message;
}

text.addEventListener("input", function () {
    formMessage.textContent = "";
});

amount.addEventListener("input", function () {
    formMessage.textContent = "";
});

// Draw saved transactions as soon as the page opens.
render();
