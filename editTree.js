function DecisionBox(did, parent, content = '', responses = [], children = []) {
    this.did = did;
    this.parent = parent;
    this.content = content;
    this.responses = responses;
    this.children = children;
    this.selectedChild = null;
    this.getJson = () => {
        return `{"did" : "${this.did}", "content" : "${this.content}", "responses" : ${this.responses.length ? `["${this.responses.join('", "')}"]` : null}, "children" : ${this.children.length ? `["${this.children.join('", "')}"]` : null}, "parent": ${this.parent ? `"${this.parent}"` : null}}`
    };

    this.makeResponseButtons = () => {
        let string = '';
        this.responses.forEach((response, index) => {
            string += `<button class="d-response"><textarea placeholder="Response ${index + 1}" onkeydown="clearTimeout(t);" onkeyup="getBoxFromDid(${this.did}).responses[${index}] = this.value; refreshPage(this);">${response}</textarea></button>`;
        });
        return string
    };

    this.getHTML = () => {
        //displays the parent and the response selected to get to the current box. Allows you to edit the content, add responses, edit responses and remove the element
        //onkeydown the timeout is cleared to avoid refreshing the boxes prematurely
        //onkeyup the data is captured and saved to the object
        return `<div class="d-box-edit">
        ${this.parent ? `<button class="remove-box" onclick="getBoxFromDid(${this.did}).removeBox()">x</button><br>` : ''}
        <span class="context">Previous Question: ${this.getParent() ? this.getParent().content : 'None'}</span><br><span class="context">Previous Response: ${this.getParent() ? this.getParent().isChild(this) : 'None'}</span>
            <textarea placeholder="${this.parent ? `Enter a question or resolution here` : `Enter the first question here`}" onkeydown="clearTimeout(t);" onkeyup="getBoxFromDid(${this.did}).content = this.value; refreshPage(this);">${this.content}</textarea>
            <div class="d-response-container">
                ${this.responses ? this.makeResponseButtons() : ''}
                ${this.parent ? '' : '<span class="add-new-response">Click the button to add a response</span>'}
                <button class="new-response" onclick="getBoxFromDid(${this.did}).addNewResponse();">+</button>
            </div>
        </div>`
    };

    //returns the parent box using this.parent
    this.getParent = () => {
        let theParentIs = null;
        decisionBoxes.forEach(box => {
            if (this.parent == box.did) {
                theParentIs = box;
            }
        });
        return theParentIs
    };

    //used to identify the response from the parent that leads to this box
    this.isChild = (box) => {
        let thisChildis = null;
        this.children.forEach((child, index) => {
            if (child == box.did) {
                thisChildis = this.responses[index];
            }
        });
        return thisChildis
    };

    this.addNewResponse = () => {
        //assigns a unique did
        const newDid = ++ didCount;
        //creates a new child and response
        this.children.push(newDid);
        this.responses.push(this.parent ? `Response ${this.responses.length + 1}` :  `Edit Response ${this.responses.length + 1} Here`);
        //create a new box
        decisionBoxes.push(new DecisionBox(newDid, this.did));
        refreshBoxes();
    };

    this.removeBox = () => {
        //makes sure it is not the top/original box
        if (this.parent == null) {
            return
        } else {
            //makes an array of the dids to delete
            const removables = [];
            //finds each child and their children forever
            function getAll(box) {
                !removables.includes(box.did) ? removables.push(box.did) : null;
                if (box.children.length) {
                    box.children.forEach(child => {
                        getAll(getBoxFromDid(child));
                    });
                }
            };
            getAll(this);
            //finds the indexes of the dids from removables array
            const indexes = [];
            removables.forEach(value => {
                indexes.push(findIndex(value));
            });
            indexes.sort(function(a, b){return a - b});
            //deletes each of the boxes using the indexes array
            indexes.forEach((value, index) => {
                decisionBoxes.splice(value - index, 1);
            });
            //removes traces of the child in its parent 
            getBoxFromDid(this.parent).children.forEach((child, index) => {
                if (this.did == child) {
                    getBoxFromDid(this.parent).children.splice(index, 1);
                    getBoxFromDid(this.parent).responses.splice(index, 1);
                }
            });
            //refreshes boxes
            refreshBoxes();
        }
    };
};

//returns the box using a did
function getBoxFromDid(lookupDid) {
    let foundDid = null;
    decisionBoxes.forEach(box => {
        if (box.did == lookupDid) {
            foundDid = box;
        }
    });
    return foundDid;
};

//returns the position in decisionBoxes using a did
function findIndex(lookupDid) {
    foundPos = null;
    decisionBoxes.forEach((box, index) => {
        if(box.did == lookupDid) {
            foundPos = index;
        }
    });
    return foundPos;
};

//refreshes the boxes
function refreshBoxes() {
    let html = '';
    decisionBoxes.forEach(box => {
        html += box.getHTML();
    });
    document.querySelector('#display').innerHTML = html;
    getAllJson();
};

//prints out all of the boxes in a JSON format
function getAllJson() {
    const jsonData = [];
    decisionBoxes.forEach(box => {
        jsonData.push(box.getJson());
    });
    const dataString = `const data = {\n\t"dids" : [\n\t\t${jsonData.join(',\n\t\t')} \n]};`;
    document.querySelector('#data-text').value = dataString;
    document.querySelector('#data-text').rows = jsonData.length + 5;
    return dataString
};



//creates a variable for the timeout
var t;
//refreshes the page when a user has stopped typing for three seconds
function refreshPage(el) {
    //clears the timeout so work is not lost while typing
    clearTimeout(t);
    //waits before refreshing all of the data
    t = setTimeout(() => {
        //saves the information if user is in a TEXTAREA
        //puts the cursor at the end of the textarea
        if (document.activeElement.tagName == 'TEXTAREA') {
            const savedVal = document.activeElement.value;
            refreshBoxes();
            Array.from(document.querySelectorAll('textarea')).forEach(textarea => {
                if(textarea.value == savedVal && savedVal != '') {
                    textarea.focus();
                    textarea.value = '';
                    textarea.value = savedVal;
                }
            });
        } else refreshBoxes();
    }, 3000);
};

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a");
        const location = new URL('/data/', copyCurrentLocation());
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
};

function copyCurrentLocation() {
    const url = window.location.href;
    return url
};

copyCurrentLocation();

document.querySelector('#save').addEventListener('click', () => {
    refreshBoxes();
    download(getAllJson(), 'dataForTree', 'text/javascript');
});

document.querySelector('#test').addEventListener('click', () => {
    const url = copyCurrentLocation().replace('Edit_Tree','Decision_Tree');
    window.open(url);
});

document.querySelector('#copy').addEventListener('click', (e) => {
    document.querySelector('#data-text').focus();
    document.querySelector('#data-text').select();
    document.execCommand('copy');
    if (window.getSelection) {window.getSelection().removeAllRanges();}
    else if (document.selection) {document.selection.empty();}
    document.querySelector('#data-text').blur();
    e.target.style.animation = 'pop-in .5s';
    setTimeout(() => {e.target.style.animation = ''}, 600);
});

var didCount = 1;
const decisionBoxes = [];
if (data.dids.length) {
    data.dids.forEach((box, index) => {
        decisionBoxes.push(new DecisionBox(Number(box.did), box.parent, box.content, box.responses ? box.responses : [], box.children ? box.children : []));
        index == data.dids.length - 1 ? didCount = Number(box.did) + 1 : null;
    })
} else {
    decisionBoxes.push(new DecisionBox(didCount, null));
}
refreshBoxes();
document.querySelector('textarea').focus();