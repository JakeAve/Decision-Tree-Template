const pulledData = data.dids;
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
    //returns the individual responses in individual buttons. When clicked the button passes information into the selectResponse function. 
    this.getResponsesHTML = () => {
        let resHtml = '<div class="d-response-container">\n';
        this.responses.forEach((response, index) => {
            resHtml += `\t<button class="d-response${this.selectedChild !== null ? index == this.selectedChild ? ' selected' : '' : ''}" onclick="selectResponse(${this.did}, ${this.children[index]}, ${index})">
                ${response}
            </button>\n`;
        });
        resHtml += '</div>\n'
        return resHtml
    };
    //returns the box's html. Gets the responses if applicable.
    this.getHTML = () => {
        return `<div class="d-box box-border">${this.content}
            ${this.responses ? this.getResponsesHTML() : ''}
        </div>`
    };
};

//changes the button color, finds the new box to display
function selectResponse(originDid, selectedDid, selectedResponse) {
    //finds the new box to display
    boxes.forEach(box => {
        //hides the box by default
        box.hideBox();
        //changes the selectedChild property using the originDid and selectedResponse
        box.did == originDid ? box.selectedChild = selectedResponse : null;
        if (box.did == selectedDid) {
            //shows the new box that was just selected
            box.showBox();
            //finds each parent from the new box to the top of the tree and shows them
            let x = box;
            let w = 0; //This makes sure the loop is not infinite. Just in case!
            while (x.parent && w < 100) {
                boxes.forEach(boxNextLevel => {
                    if (boxNextLevel.did == x.parent) {
                        boxNextLevel.showBox();
                        x = boxNextLevel;
                    }
                });
                w ++;
            };
        }
    });
    //calls the displayBoxes function everytime button is clicked
    displayBoxes(boxes);
    printSummary(boxes);//will not complete if there is no #data-text element
};

//checks that the showing property is true for the boxes
//then displays those boxes in the #display div
function displayBoxes(arr) {
    let output = '';
    arr.forEach(box => {
        box.showing ? output += box.getHTML() : null;
    });
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
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
};

//The main copy button copies the #summary-note in case user cannot use the save function
document.querySelector('#copy').addEventListener('click', (e) => {
    const btn = e.target;
    copy(document.querySelector('#summary-note'));
    btn.style.animation = 'pop-in .5s';
    setTimeout(() => {btn.style.animation = ''}, 600);
});

//constructs the Box objects
pulledData.forEach(item => {
    boxes.push(new Box(item));
});

//initail call to show the top of the tree
displayBoxes(boxes);