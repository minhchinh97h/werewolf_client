import chosenCards from '../local-data-holder/cardArray'

class chooseCardEvent{
    addCard(name){
        chosenCards.push(name)
    }
}

export default chooseCardEvent