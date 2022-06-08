let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
}

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
}

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('new_transaction');
  transactionObjectStore.add(record);
  alert('Looks like you\'re offline! The transaction has been saved and will update when you reconnect to the internet.');
}

function uploadTransaction() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('new_transaction');
  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(serverRes => {
          if (serverRes.message) {
            throw new Error(serverRes);
          }
          const transaction = db.transaction(['new_transaction'], 'readwrite');
          const transactionObjectStore = transaction.objectStore('new_transaction');
          transactionObjectStore.clear();
        })
        .catch(err => {
          console.log(err);
        })
    }
  }
}

window.addEventListener('online', uploadTransaction);