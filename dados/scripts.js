function goHome(){
    window.location.href = '/';
}

function rollDice(n){
    const x = Math.floor(Math.random() * n + 1)
    var element = document.getElementById('resultView')
    if(element) {
        element.textContent = x
    }
}