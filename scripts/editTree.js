function DecisionBox(did, parent, content = '', responses = [], children = []) {
    this.did = did;
    this.parent = parent;
    this.content = content;
    this.responses = responses;
    this.children = children;
    this.selectedChild = null;
    this.makeResponseButtons = () => {
        let string = '';
        this.responses.forEach((response, index) => {
            string += `<button class="d-response edit-response" tabIndex="-1">
                    <textarea placeholder="Response ${index + 1}" onkeydown="clearTimeout(t);" onkeyup="getBoxFromDid('${this.did}').responses[${index}] = this.value; autoSave(this);">${response}</textarea>
                </button>
                <a href="#decision-box-number-${this.children[index]}"><button class="small arrow-to-box">&dArr;</button></a>
                <button class="remove-box small" onclick="getBoxFromDid('${this.children[index]}').removeBox();"  tabIndex="-1")>x</button>`;
        });
        return string
    };

    this.getHTML = () => {
        //displays the parent and the response selected to get to the current box. Allows you to edit the content, add responses, edit responses and remove the element
        //onkeydown the timeout is cleared to avoid refreshing the boxes prematurely
        //onkeyup the data is captured and saved to the object
        return `<div class="d-box-edit box-border"><a id="decision-box-number-${this.did}"></a>
        ${this.parent ? `<button class="remove-box" onclick="getBoxFromDid('${this.did}').removeBox()">x</button><br>` : ''}
        <div class="context">Previous Question: ${this.parent ? this.getParent().content : 'None'}
            ${this.parent ? `<a title="Jump to previous question" href="#decision-box-number-${this.getParent().did}"><button class="small arrow-to-box">&uArr;</button></a>` : ''}
            <br>
            Previous Response: ${this.parent ? this.getParent().isChild(this) : 'None'}
        </div>
            <textarea placeholder="${this.parent ? `Click here to enter another question or resolution` : `Enter the first question here`}" onkeydown="clearTimeout(t);" onkeyup="getBoxFromDid('${this.did}').content = this.value; autoSave(this);">${this.content}</textarea>
            <div class="d-response-container">
                ${this.responses ? this.makeResponseButtons() : ''}
                ${this.parent ? '' : '<div class="add-new-response">Click the button to add a response</div>'}
                <button class="new-response" onclick="getBoxFromDid('${this.did}').addNewResponse();">+</button>
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
        const newDid = makeNewId();
        //creates a new child and response
        this.children.push(newDid);
        this.responses.push(this.parent ? `Response ${this.responses.length + 1}` : `Edit Response ${this.responses.length + 1} Here`);
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
            indexes.sort(function (a, b) { return a - b });
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
        if (box.did == lookupDid) {
            foundPos = index;
        }
    });
    return foundPos;
};

function makeNewId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 12; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    if (!getBoxFromDid(text))
        return text
    else return makeNewId()
}

//refreshes the boxes
function refreshBoxes() {
    document.querySelector('#display').innerHTML = decisionBoxes.map(box => box.getHTML()).join('');
    getAllJson();
};

function makeJSONObject(did, content, responses, children, parent) {
    this.did = did;
    this.content = content;
    this.responses = responses;
    this.children = children;
    this.parent = parent;
};

//prints out all of the boxes in a JSON format and saves to local storage
function getAllJson() {
    const data = {
        dids: decisionBoxes.map(box => new makeJSONObject(box.did, box.content, box.responses, box.children, box.parent))
    }
    const jsonData = JSON.stringify(data, null, 4);
    if (lsAvailable()) localStorage.setItem('localStoredDecisionTree', jsonData);

    const dataString = `const data = ${jsonData};`;
    document.querySelector('#data-text').value = dataString;
    document.querySelector('#data-text').rows = dataString.match(/\n/g).length + 2;

    return dataString
};

//creates a variable for the timeout
var t;
//refreshes the page when a user has stopped typing for three seconds
function autoSave(el) {
    //clears the timeout so work is not lost while typing
    clearTimeout(t);
    //waits before refreshing all of the data
    t = setTimeout(() => {
        //saves the information if user is in a TEXTAREA
        //puts the cursor at the end of the textarea
        if (document.activeElement.tagName == 'TEXTAREA') {
            const savedVal = document.activeElement.value;
            if (savedVal != '') {
                refreshBoxes();
                Array.from(document.querySelectorAll('textarea')).forEach(textarea => {
                    if (textarea.value == savedVal) {
                        textarea.focus();
                        textarea.value = '';
                        textarea.value = savedVal;
                    }
                });
            }
        } else refreshBoxes();
    }, 5000);
};

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
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
    return location.href.replace(location.hash, '')
};

function messageBox(path) {
    //makes a dialog for the user to accept
    const overlay = document.createElement('DIV');
    overlay.className = 'overlay';
    overlay.innerHTML = `<div class="message-box">You must save this file in: <b>${path}</b>
    <ol>
        <li>The PATH is already copied to your clipboard. Open a new file explorer and paste the PATH in the navigation.</li>
        <li>In the browser, click "Show in Folder" and copy the new "dataForTree.js" to the old file in the PATH.</li>
        <li>Replace the old file with the new one.</li>
    </ol>
    You can also copy the data manually and paste it into ${path}dataForTree.js
    <button id="download" class="new-response">Ok</button>
    </div>`;
    document.body.append(overlay);
    //the OK #download button triggers the download
    document.querySelector('#download').addEventListener('click', () => {
        document.body.removeChild(overlay);
        //download(getAllJson(), 'dataForTree', 'text/javascript');
    });
};

//This will copy and paste whatever to put into it
function copyStringToClipBoard(input) {
    const string = input;
    //create a textarea to copy the url to clipboard
    const textarea = document.createElement('TEXTAREA');
    textarea.className = 'hidden-textarea';
    textarea.value = string;
    document.body.append(textarea);
    copy(textarea);
    document.body.removeChild(textarea);
};

//The save button shows a dialog the first time. Downloads a JSON-like file
document.querySelector('#save').addEventListener('click', () => {
    refreshBoxes();
    const url = copyCurrentLocation().replace('Edit_Tree.html', 'data/');
    copyStringToClipBoard(url);
    messageBox(url);
    download(getAllJson(), 'dataForTree', 'text/javascript');
});

//Opens the Decision_Tree.html file
document.querySelector('#test').addEventListener('click', () => {
    const url = copyCurrentLocation().replace('Edit_Tree', 'Decision_Tree');
    window.open(url);
});

//copies an element that has selectable content
function copy(element) {
    element.focus();
    element.select();
    document.execCommand('copy');
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection) { document.selection.empty(); }
    //element.blur();
};

//The main copy button copies the #data-text in case user cannot use the save function
document.querySelector('#copy').addEventListener('click', (e) => {
    refreshBoxes();
    const btn = e.target;
    copy(document.querySelector('#data-text'));
    btn.style.animation = 'pop-in .5s';
    setTimeout(() => { btn.style.animation = '' }, 600);
});

//copy buttons in the formater-container
Array.from(document.querySelectorAll('.copy')).forEach(btn => {
    btn.addEventListener('click', () => {
        copy(btn.previousElementSibling);
        btn.style.animation = 'pop-in .5s';
        setTimeout(() => { btn.style.animation = '' }, 600);
    });
});

//formater functions
function toggleFormaterContainer(btn) {
    document.querySelector('.formater-container').classList.toggle('invisible');
    btn.innerHTML == '-' ? btn.innerHTML = '+' : btn.innerHTML = '-';
};

function makeLink(btn) {
    const href = btn.previousElementSibling.previousElementSibling.value;
    const text = btn.previousElementSibling.value;
    const output = `<a href="${href}" target="_blank">${text}</a>`;
    btn.nextElementSibling.value = output;

};

function makeImg(btn) {
    const src = btn.previousElementSibling.previousElementSibling.value;
    const styles = btn.previousElementSibling.value;
    const output = `<img src="${src}" style="${styles == '' ? 'width: 100%;' : styles}">`;
    btn.nextElementSibling.value = output;
};

//This is the main array for the DecisionBoxes
const decisionBoxes = [];

//imports data from array. Otherwise, starts blank.
function populateDecisionBoxes(arr) {
    if (arr.length)
        arr.forEach(box => {
            //returns empty arrays for the nulls 
            decisionBoxes.push(new DecisionBox(
                box.did,
                box.parent,
                box.content,
                box.responses,
                box.children
            ));
            //will change didCount depending on what is imported. The didCount variable increments once a new response is added. 
            //index == data.dids.length - 1 ? didCount = Number(box.did) : null;
        })
    else
        decisionBoxes.push(new DecisionBox(makeNewId(), null));
};

function lsAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}

if (lsAvailable()) {
    //checks for the local storage
    const localStoredDecisionTree = JSON.parse(localStorage.getItem('localStoredDecisionTree'));
    //checks if the localStoredTree and dataForTree.js are the same
    if (localStoredDecisionTree && JSON.stringify(localStoredDecisionTree) !== JSON.stringify(data)) {
        const localData = confirm('There is data from a decision tree in the browswer that is different from the dataForTree.js. Would you like to pull the data from the browser?')
        if (localData === true)
            populateDecisionBoxes(localStoredDecisionTree.dids);
        else {
            populateDecisionBoxes(data.dids);
            localStorage.removeItem('localStoredDecisionTree');
        }
    } else populateDecisionBoxes(data.dids);
} else populateDecisionBoxes(data.dids);

//requires confirm before closing the page
window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    const leavePage = confirm();
    if (leavePage === true) {
        return true
    } else {
        e.returnValue = '';
    }
});

//initial display
refreshBoxes();
document.querySelector('textarea').focus();
