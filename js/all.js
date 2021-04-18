
let data = [];
let dataCart = [];

function init() {
  getProduct()
  getProductCart();
}
function getProduct() {
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/products`)
    .then(function (response) {
      data = response.data.products
      // console.log(data)
      printList(data);
    })
}
function printList(forData) {
  let str = '';
  forData.forEach(item => {
    str += `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src=${item.images}
          alt="">
        <a href="#" id="addCardBtn" data-id=${item.id} data-title=${item.title.replace(/\s+/g, '')}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">${toThousands(item.origin_price)}</del>
        <p class="nowPrice">${toThousands(item.price)}</p>
      </li>`
  })
  document.querySelector(".productWrap").innerHTML = str;
}
function selectChange(){
  let select = document.querySelector(".productSelect").value;
  let filterData = data.filter((item) => {
    if (item.category == select) {
      return item;
    }
    else if (select == "全部") {
      return item;
    }
  })
  printList(filterData)
}
function getProductCart(){
  axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/carts`)
    .then(function (response) {
      dataCart = response.data.carts;
      // console.log(dataCart)
      let total = response.data.finalTotal;
      let str = '';
      dataCart.forEach(item => {
        str +=
          ` <tr>
          <td>
            <div class="cardItem-title">
              <img src=${item.product.images}>
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>${toThousands(item.product.price)}</td>
          <td><input type="number" class="quantity" value='${item.quantity}' data-num="${item.id}"></td>
          <td>${toThousands(item.quantity * item.product.price)}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons " id="delectBtn" data-title=${item.product.title.replace(/\s+/g, '')} data-id=${item.id}>
              clear
            </a>
          </td>
        </tr>
        <tr>
    `
      })
      document.querySelector(".tbody").innerHTML = str;
      document.querySelector(".totalPrice").textContent = toThousands(total);


    })
}
function addProductCart(e){
  e.preventDefault();
  let selectId = e.target.dataset.id;
  let selectTitle = e.target.dataset.title;
  if (e.target.getAttribute("id") !== "addCardBtn") {
    return;
  }
  let numCheck = 1;
  dataCart.forEach(item => {
    if (item.product.id === selectId) {
      numCheck = item.quantity += 1;
    }
  })
  //這邊使用post!!
  axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/carts`, {
    "data": {
      "productId": selectId,
      "quantity": numCheck
    }
  })
    .then(function () {
      alert(`"${selectTitle}"加入購物車`)
      init();
    })
}
function delAllProductCart(e){
  e.preventDefault();
  axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/carts`)
    .then(function () {
      init();
      alert("以清除購物車")
    })
    .catch(function (error) {
      console.log(error);
    });

}
function editProduct(e){
  e.preventDefault();
  let productId = e.target.dataset.id;
  let productTitle = e.target.dataset.title;
  if (e.target.getAttribute("id") == "delectBtn") {
    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/carts/${productId}`)
      .then(function () {
        alert(`已刪除${productTitle}品項`)
        init();
      })
  }
  if(e.target.getAttribute("class") == "quantity"){
    let numId = e.target.dataset.num;
    let num = parseInt(e.target.value);

    if (e.target.value < 1) {
      alert('商品數量必須大於1');
      e.target.value = 1;
      return;
    }
    axios.patch(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/carts`, {
      "data": {
        "id": numId,
        "quantity": num
      }
    }).then(function (response) {
      // alert('修改商品數量成功');
      init();
    }).catch(function (error) {
      console.log(error);
    })
  }

}
function formSumbit(e) {
  e.preventDefault();
  let name = document.querySelector("#customerName").value;
  let phone = document.querySelector("#customerPhone").value;
  let email = document.querySelector("#customerEmail").value;
  let address = document.querySelector("#customerAddress").value;
  let trade = document.querySelector("#tradeWay").value;
  let errors = validate(form, constraints);

  if (dataCart.length == 0) {
    alert("麻煩將商品加入到購物車喔!")
    // return
  }
  if (errors) {

    checkErrors();
    return;
  }
  axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${apiKey}/orders`, {
    "data": {
      "user": {
        "name": name,
        "tel": phone,
        "email": email,
        "address": address,
        "payment": trade
      }
    }
  }).then(function () {
    alert('已送出表單');
    document.querySelector("#customerName").value = "";
    document.querySelector("#customerPhone").value = "";
    document.querySelector("#customerEmail").value = "";
    document.querySelector("#customerAddress").value = "";
    document.querySelector("#tradeWay").value = "ATM";
  })
    .catch(function (error) {
      console.log(error);
    });
}
const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email]");
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

  //認證機制
  inputs.forEach(function (item) {
    item.addEventListener("blur", function (e) {
      item.nextElementSibling.textContent = " ";
      let errors = validate(form, constraints) || "";
      item.nextElementSibling.textContent =
        errors[e.target.getAttribute("name")];
    });
  });
  //
  function checkErrors() {
    let errors = validate(form, constraints) || "";
    let list = Object.keys(errors);
      console.log(errors)
      list.forEach(function (keys) {
    document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
  });
}
  getProduct();
  getProductCart();
  document.querySelector(".productWrap").addEventListener('click', addProductCart)
  document.querySelector('.discardAllBtn').addEventListener('click', delAllProductCart)
  document.querySelector(".productSelect").addEventListener('change', selectChange)
  document.querySelector(".tbody").addEventListener("click", editProduct)
  document.querySelector(".orderInfo-btn").addEventListener("click", formSumbit)





  // util js、元件
  function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }