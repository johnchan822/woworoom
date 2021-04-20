let data =[];
let cartData =[];
let total;
let userUrl =`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/johnchan/`
let adminUrl =`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/johnchan/`
init();

function init(){
  getProduct();
  getProductCart();
}
function getProduct(){
  axios.get(userUrl +`products`)
  .then(function(response){
    // console.log(response.data.products)
    data = response.data.products;
    printList(data);
    printSelectFilter();
  })
}
function printList(allData) {
  // console.log(data)
  let str ='';
  allData.forEach(item =>{
    str +=` <li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}"
            alt="">
          <a href="#" id="addCardBtn" data-id=${item.id} data->加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">${item.origin_price}</del>
          <p class="nowPrice">${item.price}</p>
        </li>`
  })
  document.querySelector('.productWrap').innerHTML = str;
}
function getProductCart(){
    // console.log(cartData)
    axios.get(userUrl +`carts`)
      .then(function (response) {
        cartData =response.data.carts;
        total = response.data.finalTotal;
        // console.log(total)
        printCartList()
      })
}
function printCartList() {
  // console.log(data)
  console.log(cartData)
  let str = '';
  cartData.forEach(item => {
    str += `<tr>
          <td>
            <div class="cardItem-title">
              <img src="https://i.imgur.com/HvT3zlU.png" alt="">
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>${item.product.price}</td>

          <td class="quantityEdit">
          <button class="lessBtn" data-num=${item.quantity - 1} data-id=${item.id}>-</button>
          ${item.quantity}
          <button class="plusBtn" data-num=${item.quantity + 1} data-id=${item.id}>+</button>
          </td>
          <td>${item.product.price * item.quantity}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons " id="delBtn" data-id=${item.id} >
              clear
            </a>
          </td>
        </tr>`
  })
  document.querySelector('.totalPrice').textContent = total;
  document.querySelector('.table').innerHTML = str;
}
function printSelectFilter() {
  //  console.log(data)
  //第一次篩選出所有的品項
  let dataSelect = data.map((item) => {
    return item.category;
  })
  //第二次篩選將同名稱的品項汰換
  // console.log(dataSelect)
  let select = dataSelect.filter((item, i) => {
    return dataSelect.indexOf(item) === i;
  })
  //將select重新接回去
  str = ``;
  select.forEach((item) => {
    str += `<option value="${item}">${item}</option>`
  })
  firstStr = `<option value="全部">全部</option>`
  document.querySelector('.productSelect').innerHTML = firstStr + str;

}

function dellCartAllProduct(e){
  e.preventDefault();
  axios.delete(userUrl+`carts`)
    .then(function (response) {
    alert('以清除購物車')
      init()

  })
    .catch(function (errors) {
      alert("已無商品")
    })
}
function selectProduct(e) {
  // console.log(data)
  let productSelectValue = document.querySelector('.productSelect').value;
  let filterData = data.filter((item)=>{
    if (productSelectValue == item.category){
      return item;
    }
    else if (productSelectValue =="全部"){
      return item;
    }
  })
  printList(filterData)
}

function addProduct(e){
  e.preventDefault();
  if (e.target.getAttribute('id') !=='addCardBtn'){
    return ;
  }
  //這段要注意!!
  let productId = e.target.dataset.id;
  let numCheck =1;
    cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  })
  axios.post(`${userUrl}carts`, {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }}).then(function() {
      init();
      alert('已加入到購物車')
    })
}

function Product(e) {
  e.preventDefault();
  let productId = e.target.dataset.id;
  let num = e.target.dataset.num;
  if (e.target.getAttribute('id') =='delBtn'){
    delProduct(productId);
  }
  if (e.target.getAttribute('class') == 'lessBtn' || e.target.getAttribute('class') == 'plusBtn'){
    if(num <1){
      alert('購物車商品不能小於0')
      return
    }
    editProduct(productId, num);
  }
}
function delProduct(productId){

  axios.delete(`${userUrl}carts/${productId}`)
  .then(function(response) {
    alert("已刪除此筆訂單")
    init();
  })
  .catch(function(respnse){
    alert('錯誤')
  })
}
function editProduct(productId,num){
 
  axios.patch(`${userUrl}carts`, 
  {
    "data": {
      "id": productId,
      "quantity": parseInt(num)
    }
  }).then(function(response){
    // console.log(response)
    init();
  })
  .catch(function(response){
    alert('錯誤')
  })
}


const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "信箱": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};

//認證

inputs.forEach((item) => {
  item.addEventListener("change", function () {
    let errors = validate(form, constraints);
    item.nextElementSibling.textContent = '';
    // console.log(errors)

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
        document.querySelector('.orderInfo-btn').disabled = false;
        // alert('麻煩填寫正確')
      })
    }
  });
});


function sumbitOrder(e){
e.preventDefault();
  let errors = validate(form, constraints);
  if (cartData.length == 0) {
    alert("麻煩將商品加入到購物車喔!")
    return
  }
  if (errors){
    alert('麻煩填寫正確')
    return;
  }
  let name = document.querySelector('#customerName').value;
  let tel = document.querySelector('#customerPhone').value;
  let email = document.querySelector('#customerEmail').value;
  let address = document.querySelector('#customerAddress').value;
  let tradeWay = document.querySelector('#tradeWay').value;

  axios.post(userUrl + `orders`, {
    "data": {
      "user": {
        "name": name,
        "tel": tel,
        "email": email,
        "address": address,
        "payment": tradeWay
      }
    }
  }).then(function (response) {
    // console.log(response)
    alert('已送出訂單')
    document.querySelector("#customerName").value = "";
    document.querySelector("#customerPhone").value = "";
    document.querySelector("#customerEmail").value = "";
    document.querySelector("#customerAddress").value = "";
    document.querySelector("#tradeWay").value = "ATM";

  }).catch(function(response){
    // console.log(response)
  })


}

document.querySelector('.table').addEventListener('click',Product)
document.querySelector('.productWrap').addEventListener('click',addProduct)
document.querySelector('.discardAllBtn').addEventListener('click',dellCartAllProduct)
document.querySelector('.productSelect').addEventListener('change',selectProduct)
document.querySelector('.orderInfo-btn').addEventListener('click',sumbitOrder)

