document.addEventListener('DOMContentLoaded', function() {
    const queryForm = document.getElementById('query-form');
    const queryResult = document.getElementById('query-result');

    queryForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 防止表單提交刷新頁面

        const formData = new FormData(queryForm);
        const orderId = formData.get('order-id');
        const username = formData.get('user-name');

        fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId, username })
        })
        .then(response => response.json())
        .then(data => {
            // 清空上次的結果
            queryResult.innerHTML = '';
            
            // 處理返回的數據並添加到結果區域中
            if (data.message === "查無資料") {
                queryResult.innerText = '未找到相關用戶數據';
            } else {
                const userList = document.createElement('ul');
                data.forEach(user => {
                    const listItem = document.createElement('li');
                    listItem.innerText = `訂單編號: ${user.orderId}, 用戶名稱: ${user.userName}, 測驗結果: ${user.result}`;
                    userList.appendChild(listItem);
                });
                queryResult.appendChild(userList);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            queryResult.innerText = '發生錯誤，請稍後重試';
        });
    });
});
