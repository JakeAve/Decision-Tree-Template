const input = data.dids;
const boxes = [];


//main constructor
function Box(box) {
    this.did = box.did; //decision id 
    this.content = box.content;
    this.responses = box.responses;
    this.children = box.children;
    this.selectedChild = null;
    this.parent = box.parent;
    this.showing = !this.parent ? true : false; //the top of the tree displays by default
    this.showBox = () => {this.showing = true};
    this.hideBox = () => {this.showing = false};
    
    this.getHTML = () => {
        let output = `<div class="d-box box-border">${this.content}\n`;
        if (this.responses) {
            output += `<div class="d-response-container">\n`
            for (let i = 0; i < this.responses.length; i ++) {
                //if the button has been selected, it will add the class 'selected', the paramaters in the selectResponse() make sure the right button is colored and the right new box displays 
                output += `<button class="d-response${this.selectedChild !== null ? i == this.selectedChild ? ' selected' : '' : ''}" onclick="selectResponse(${this.did}, ${i}, ${this.children[i]})">${this.responses[i]}</button>\n`;
            };
            output += `</div>\n`;
        }
        output += `</div>\n`;
        return output
    };
};

//constructs the Box objects
for (let i = 0; i < input.length; i ++) {
    boxes.push(new Box(input[i]));
};

//checks that the showing property is true for the boxes
//then displays those boxes in the #display div
function displayBoxes(arr) {
    let output = '';
    for (let i = 0; i < arr.length; i ++) {
        if (arr[i].showing) {
            output += arr[i].getHTML();
        }
    };
    document.querySelector('#display').innerHTML = output;
    const nodes = document.querySelectorAll('.d-box');
    const last = nodes[nodes.length - 1];
    last.scrollIntoView({behavior: 'smooth'});
};

//prints all of the steps and selectedChilds of the showing boxes
//displays the information in the #summary-note if it exists
function printSummary(arr) {
    const summaryNote = document.querySelector('#summary-note');
    if (summaryNote) {
        let output = '';
        let lineCount = 0;
        arr.forEach(box => {
            if (box.showing) {
                //creates a dummy div so we only get the text conent and not images/link code
                const div = document.createElement('div');
                div.innerHTML = box.content;
                //gets the text conent of the response and displays the selected child
                output += `${++lineCount}.) ${div.textContent} ${box.selectedChild !== null ? ': ' + box.responses[box.selectedChild] : ''}\n`;
            }
        })
        summaryNote.value = output;
        summaryNote.rows = lineCount + 2;
    }
};

//changes the button color, finds the new box to display
function selectResponse(originDid, selectedBtn, selectedDid) {
    //hides all the boxes
    for (let i = 0; i < boxes.length; i ++) {
        boxes[i].hideBox();
    };
    //changes the selectedChild property using the originDid and selectedBtn
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].did == originDid) { 
            boxes[i].selectedChild = selectedBtn;
        }
    };
    //finds the new box to display
    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].did == selectedDid) {
            boxes[i].showBox();
            //finds each parent from the new box to the top of the tree and shows
            let x = boxes[i];
            let w = 0; //This makes sure the loop is not infinite. Just in case!
            while (x.parent && w < 100) {
                for (let i = 0; i < boxes.length; i ++) {
                    if (boxes[i].did == x.parent) {
                        boxes[i].showBox();
                        x = boxes[i];
                    }
                };
                w ++;
            };
        }
    };
    //calls the displayBoxes function everytime button is clicked
    displayBoxes(boxes);
    printSummary(boxes);//will not complete if there is no #data-text element
};

//initail call to show the top of the tree
displayBoxes(boxes);

//reset function
document.querySelector('#reset').addEventListener('click', () => {
    boxes.forEach((box, index) => {
        index === 0 ? box.showBox() : box.hideBox();
        box.selectedChild = null;
    });
    displayBoxes(boxes);
    document.querySelector('.reset').blur();
});

//copies an element that has selectable content
function copy(element) {
    element.focus();
    element.select();
    document.execCommand('copy');
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
    //element.blur();
};

//The main copy button copies the #summary-note in case user cannot use the save function
document.querySelector('#copy').addEventListener('click', (e) => {
    const btn = e.target;
    copy(document.querySelector('#summary-note'));
    btn.style.animation = 'pop-in .5s';
    setTimeout(() => {btn.style.animation = ''}, 600);
});