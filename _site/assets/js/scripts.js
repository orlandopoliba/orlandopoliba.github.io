function menu() {
    var x = document.getElementById('menuButton');
    if (x.className === 'navElement-menu') {
        x.className = 'navElement-menuClicked';
        finished = false
        do {
            var y = document.getElementsByClassName('navElement current');
            if (y.length != 0) {
                y[0].className = 'navElementResponsive current';
            } else {
                finished = true;
            }
        } 
        while (!finished);
        finished = false
        do {
            var y = document.getElementsByClassName('navElement');
            if (y.length != 0) {
                y[0].className = 'navElementResponsive';
            } else {
                finished = true;
            }
        } 
        while (!finished);
    } else {
        x.className = 'navElement-menu';
        finished = false
        do {
            var y = document.getElementsByClassName('navElementResponsive current');
            if (y.length != 0) {
                y[0].className = 'navElement current';
            } else {
                finished = true;
            }
        } 
        while (!finished);
        finished = false
        do {
            var y = document.getElementsByClassName('navElementResponsive');
            if (y.length != 0) {
                y[0].className = 'navElement';
            } else {
                finished = true;
            }
        } 
        while (!finished);
    }
}



function decodeEmail(encodedString) {
    // Holds the final output
    var email = ""; 

    // Extract the first 2 letters
    var keyInHex = encodedString.substr(0, 2);

    // Convert the hex-encoded key into decimal
    var key = parseInt(keyInHex, 16);

    // Loop through the remaining encoded characters in steps of 2
    for (var n = 2; n < encodedString.length; n += 2) {

        // Get the next pair of characters
        var charInHex = encodedString.substr(n, 2)

        // Convert hex to decimal
        var char = parseInt(charInHex, 16);

        // XOR the character with the key to get the original character
        var output = char ^ key;

        // Append the decoded character to the output
        email += String.fromCharCode(output);
    }
    return email;
}


function updateAnchor(el,show) {
    // fetch the hex-encoded string
    var encoded = '9cfbf5fdf2f0e9fffdb2f3eef0fdf2f8f3dcecf3f0f5fefdb2f5e8';

    // decode the email, using the decodeEmail() function from before
    var decoded = decodeEmail(encoded);

    // Replace the text (displayed) content
    el.textContent = decoded;

    // Set the link to be a "mailto:" link
    el.href = 'mailto:' + decoded;

    show.textContent = '';
}



// Find all the elements on the page that use class="eml-protected"


