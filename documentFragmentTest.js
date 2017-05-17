var dom = nodeToFragment(document.getElementById('app'));
console.log(dom);

function nodeToFragment(node) {
    var flag = document.createDocumentFragment();
    var child;
    while(child = node.firstChild) {
        flag.appendChild(child);
    }
    return flag;
}

document.getElementById('app').appendChild(dom);
