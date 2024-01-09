document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  displayLeaderboard();

  if (!token) {
    window.location.href = "/login.html";
  } else {
    axios
      .get("/verifyToken", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        checkPremiumStatus();
        getExpense();
      })
      .catch((error) => {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      });
  }
  async function checkPremiumStatus() {
    try {
      const response = await axios.get("/check-premium", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.isPremium) {
        document.getElementById("buy-premium-btn").style.display = "none";
        document.getElementById("premiumMessage").style.display = "block";
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    }
  }

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
            const {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            } = response;
            const verifyResponse = await axios.post(
              "/razorpay/verify-payment",
              {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
                signature: razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              alert("Payment successful and verified!");
              checkPremiumStatus();
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

  async function fetchLeaderboardData() {
    try {
      const response = await axios.get("/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  }
  async function displayLeaderboard() {
    const leaderboardData = await fetchLeaderboardData();
    const leaderboardList = document.getElementById("leaderboards");
    console.log(leaderboardData);
    leaderboardData.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${user.username}-${user.totalExpense ? user.totalExpense + ' Rs' : '0'}`;
      leaderboardList.appendChild(listItem);
    });
  }
  getExpense();
});
