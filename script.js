// Select the HTML elements we need once, at the top of the file.
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const clearBtn = document.getElementById("clear-btn");
const incomeBtn = document.getElementById("income-btn");
const outgoingBtn = document.getElementById("outgoing-btn");
const emptyMessage = document.getElementById("empty-message");
const formMessage = document.getElementById("form-message");

const storageKey = "transactions";
let transactions = loadTransactions();
let transactionType = "income";

form.addEventListener("submit", addTransaction);
clearBtn.addEventListener("click", clearTransactions);

incomeBtn.addEventListener("click", function () {
    transactionType = "income";
    incomeBtn.classList.add("active");
    outgoingBtn.classList.remove("active");
});

outgoingBtn.addEventListener("click", function () {
    transactionType = "outgoing";
    outgoingBtn.classList.add("active");
    incomeBtn.classList.remove("active");
});

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

function addTransaction(e) {
    e.preventDefault();
    const transactionText = text.value;
    let transactionAmount = +amount.value;
    // Check description
    if (transactionText.trim() === "") {
        alert("Please enter a description");
        return;
    }
    // Check amount
    if (transactionAmount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    // Convert outgoing amount to negative
    if (transactionType === "outgoing") {
        transactionAmount = -transactionAmount;
    }
    // Create transaction
    const transaction = {
        id: Date.now(),
        text: transactionText,
        amount: transactionAmount
    };
    // Store transaction
    transactions.push(transaction);
    // Save to localStorage
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
    // Update UI
    updateDOM();
    updateValues();
    // Clear inputs
    text.value = "";
    amount.value = "";
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
