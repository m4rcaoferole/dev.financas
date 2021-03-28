const Modal = {
  open(){
      //ABRIR MODAL
      //ADICIONAR A CLASS AO MODAL
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active')
  },
  close(){
      //FECHAR O MODAL
      //REMOVERA A CLASS ACTIVE MODAL
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }

}

const Transactions = {
    all: Storage.get(),
    
    add(transaction){
      Transactions.all.push(transaction)

      App.reload()
    },

    remove(index){
      Transactions.all.splice(index, 1)

      App.reload()
    },

    incomes() {
      let income = 0;
      // pegar todos as transações
      // para cada transação
      Transactions.all.forEach(transaction => {
        // se ela for maior que zero
        if(transaction.amount > 0) {
          // somar a uma Variavel
          income += transaction.amount;
        }
      })
      return income;
    },
    expenses() {
      let expense = 0;
      // pegar todos as transações
      // para cada transação
      Transactions.all.forEach(transaction => {
        // se ela for menor que zero
        if(transaction.amount < 0) {
          // somar a uma Variavel
          expense += transaction.amount;
        }
      })
      return expense;
    },
    total() {
      return Transactions.incomes() + Transactions.expenses();
    },

}

const DOM = {
    transactionsContainer: document.querySelector('#datatable tbody'),

    addTransaction(transaction, index) {
      const tr = document.createElement('tr')
      tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
      tr.dataset.index = index

      DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
      const CSSclass = transaction.amount > 0 ? "income" : "expense"

      const amount = Utils.formatCurrency(transaction.amount)

      const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="remove transaction">
      </td>
      `

      return html
    },

    updateBalance() {
      document
          .getElementById('incomeDisplay')
          .innerHTML = Utils.formatCurrency(Transactions.incomes())
      document
          .getElementById('expenseDisplay')
          .innerHTML = Utils.formatCurrency(Transactions.expenses())
      document
          .getElementById('totalDisplay')
          .innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransactions() {
      DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
  formatAmount(value) {
    value = value * 100

    return Math.round(value)
  },

  formatDate(date) {
    const splitttedDate = date.split("-")

    return `${splitttedDate[2]}/${splitttedDate[1]}/${splitttedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""

    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('#description'),
  amount: document.querySelector('#amount'),
  date: document.querySelector('#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if( description.trim() === "" ||
        amount.trim() === "" ||
        date.trim() === "" ) {
          throw new Error("Por favor, preencha todos os campos.")
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date,
    }
  },
  
  clearFieds() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()
    try {
      // Verificar(validar) se todas as informações foram preenchidas
      Form.validateFields()
      
      // Formatar os dados para salvar
      const transaction = Form.formatValues()

      // salvar
      Transactions.add(transaction)

      // Apagar os dados do formulario
      Form.clearFieds()

      // Modal fechar
      Modal.close()

    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transactions.all.forEach(DOM.addTransaction)
    
    DOM.updateBalance()

    Storage.set(Transactions.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  },
}

App.init()