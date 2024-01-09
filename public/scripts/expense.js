document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("my-form");
  const userList = document.getElementById("user-list");
  document
    .getElementById("buy-premium-btn")
    .addEventListener("click", initiatePremiumPurchase);
  let updateExpenseId = null;

  function getAuthToken() {
    return localStorage.getItem("token");
  }
  axios.interceptors.request.use(function (config) {
    const token = getAuthToken();
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const expenseAmount = document.querySelector("#expense-amount").value;
    const description = document.querySelector("#expense-description").value;
    const category = document.querySelector("#expense-category").value;

    try {
      if (updateExpenseId) {
        await axios.put(`/user/expense/${updateExpenseId}`, {
          expenseAmount,
          description,
          category,
        });
        updateExpenseId = null;
      } else {
        await axios.post("/user/expense", {
          expenseAmount,
          description,
          category,
        });
      }

      getExpense();
    } catch (error) {
      console.error("Error:", error);
    }
    document.getElementById("expense-amount").value = "";
    document.getElementById("expense-description").value = "";
    document.getElementById("expense-category").value = "";
  });

  async function getExpense() {
    try {
      const response = await axios.get("/user/expense");
      showExpenses(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function showExpenses(data) {
    userList.innerHTML = "";
    data.forEach((expense) => {
      const listItem = document.createElement("li");
      listItem.style.listStyle = "none";
      listItem.textContent = `${expense.expenseAmount} Rs - ${expense.description} - ${expense.category}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete Expense";
      deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Expense";
      editBtn.addEventListener("click", () => editExpense(expense));

      listItem.appendChild(deleteBtn);
      listItem.appendChild(editBtn);
      userList.appendChild(listItem);
    });
  }

  async function deleteExpense(id) {
    try {
      await axios.delete(`/user/expense/${id}`);
      getExpense();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function editExpense(expense) {
    updateExpenseId = expense.id;
    document.getElementById("expense-amount").value = expense.expenseAmount;
    document.getElementById("expense-description").value = expense.description;
    document.getElementById("expense-category").value = expense.category;
  }
  async function initiatePremiumPurchase() {
    try {
      const orderResponse = await axios.post("/razorpay/create-order", {});
      const { order_id } = orderResponse.data;

      const options = {
        key: "rzp_test_KHf7trqaOUGJWq",
        amount: orderResponse.data.amount,
        currency: "INR",
        name: "Expense Tracker Premium",
        description: "Purchase of premium plan",
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              "/razorpay/verify-payment",
              {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }
            );
            console.log(`${order_id}, ${payment_id}, ${signature}`);
            if (verifyResponse.data.status === "success") {
              alert("Payment successful and verified!");
            } else {
              alert("Payment verification failed");
            }
          } catch (error) {
            console.error("Error:", error);
          }
        },
        prefill: {},
        theme: {
          color: "#3399cc",
        },
      };
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  getExpense();
});
