
let data=[];
function init() {
  listPrint();
  c3cPrint();
}

getOrderList();


function getOrderList() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${apiKey}/orders`,
    {
      headers: {
        'Authorization': token,

      }
    })
    .then(function (response) {
      data = response.data.orders;
      console.log(data)
      init();
    })
}

//刷新表格
function listPrint(){
        let str ='';
      data.forEach((item ,index) => {
      //組訂單品項
      let productStr ='';
      item.products.forEach(secItem=>{
        productStr += `<p> ${secItem.title}*${secItem.quantity}</p>`
      })

      //組訂單狀態
      let productStatus ='';
      productStatus = item.paid ? "以處理":"未處理"
  
      //組時間排序
      let nowDate = new Date(item.updatedAt*1000);
      let timeStatus = "";
        timeStatus = ` ${nowDate.getFullYear()}/${nowDate.getMonth()+1}/${nowDate.getDate()}`;
        console.log(timeStatus)
      str +=`  <tr>
          <td>${item.id}</td>
          <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
          </td>
          <td>${item.user.address}</td>
          <td>${item.user.email}</td>
          <td>
          ${productStr}
          </td>
          <td>  ${timeStatus}</td>
          <td class="orderStatus">
            <a href="#" class="statusBtn" data-id=${item.id} data-status=${item.paid}>${productStatus}</a>
          </td>
          <td>
            <input type="button" class="delSingleOrder-Btn" data-id=${item.id} value="刪除">
              </td>
            </tr>`
      });
      document.querySelector(".tbody").innerHTML =str;

}
//刷新圖表
function c3cPrint() {
  // 資料彙整
  let newData = {};
  data.forEach((item) => {
    item.products.forEach(secItem => {

      if (newData[secItem.title] == undefined) {
        newData[secItem.title] = secItem.price * secItem.quantity;
      }
      else {
        newData[secItem.title] += secItem.price * secItem.quantity;
      }
    })

  })
  console.log(newData)
  //資料整理
  let objName = Object.keys(newData);
  let newArray = [];
  objName.forEach(item => {
    let array = [];
    array.push(item);
    array.push(newData[item]);
    newArray.push(array)
  })
  console.log(newArray)

  newArray.sort(function (a, b) {
    return b - a;
  })

  let otherTotal = 0;
  if (newArray.length > 3) {
    newArray.forEach((item, index) => {
      if (index > 2) {
        otherTotal += item[1];
      }
    })
    newArray.splice(3, newArray.length - 1);
    newArray.push(["其他", otherTotal])
  }
  console.log(otherTotal)




  //圖表呈現

  let chart = c3.generate({
    data: {
      // iris data from R
      columns: newArray,
      type: 'pie',
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
  });


}





//個別資料處理
function PersonProduct(e){
  let productId = e.target.getAttribute("data-id");
  let productStatus = e.target.getAttribute("data-status")
  let newStatus = true;
  if (e.target.getAttribute("class") == "delSingleOrder-Btn"){
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${apiKey}/orders/${productId}`,
      {
        headers: {
          'Authorization': token,

        }
      }).then(function () {
        getOrderList();
      })
  }

  if (e.target.getAttribute("class") =="statusBtn"){
    productStatus ? newStatus : newStatus;
    axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${apiKey}/orders`, {
      "data": {
        "id": productId,
        "paid":  newStatus
      }
    }, {
      headers: {
        'Authorization': token,
      }
    })
      .then(function (reponse) {
        alert("修改訂單成功");
        getOrderList();
      })
  }

}

//刪除全部資料
function delAllProduct(){
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${apiKey}/orders`,{
      headers: {
        'Authorization': token,

      }
    })
  .then(function(){
    getOrderList();
  })
  .catch(function(){
    alert("已全部清空了!")
  })
}


document.querySelector(".discardAllBtn").addEventListener("click",delAllProduct);
document.querySelector(".orderPage-table").addEventListener('click', PersonProduct)

