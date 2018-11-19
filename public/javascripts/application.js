const FEE = 0.0001;
let unspentTxList = document.querySelectorAll("input[type='checkbox']");

if (unspentTxList.length) {
  let unspentSelection = [];
  
  let elAmount      = document.querySelector("input[name='amount']");
  let elAvailable   = document.querySelector("input[name='available']");
  let elChange      = document.querySelector("input[name='change']");
  let elFee         = document.querySelector("input[name='fee']");
  let elForm        = document.querySelector("form");

  elFee.value = FEE;

  let adjustAvailable = (array) => {
    let sum = array.reduce((total, tx) => total += Number(tx.amount), 0);
    elAvailable.value = (sum / 1e8);
    adjustChange();
  }

  let adjustChange = () => {
    let amount = elAmount.value || 0;
    let change = Number(elAvailable.value) - amount - FEE;
    elChange.value = parseFloat(change.toFixed(8));
  }

  for (txCheckbox of unspentTxList) {
    txCheckbox.addEventListener('click', function(event) {
      let target  = event.target;
      let index   = unspentSelection.findIndex(tx => tx.txid === target.id);

      if (index === -1)
        unspentSelection.push({ txid: target.id, amount: target.value });
      else
        unspentSelection.splice(index, 1);

      adjustAvailable(unspentSelection);
    });
  }

  elAmount.addEventListener('input', function(event) {
    adjustChange()
  });

  elForm.addEventListener('submit', function(event) {
    if (Number(elChange.value) < 0) {
      alert("Unspendable Transaction; Output is greater than input! Reduce amount you are sending");
      event.preventDefault();
      return false;
    }
  });
}

