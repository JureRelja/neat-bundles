//Embeding the widget in the page

window.onload = function () {
    const widgetContainer = document.getElementById('neat-bundles-widget-347204u230');

    const mainContentShopify = document.getElementById('MainContent');

    let clone = widgetContainer.content.cloneNode(true);

    //Inserting the widget at the top of the page, right before the page content itself

    //first_child() returns the first child that is not whitespace or type text (in this case, that child would be <section> tag)

    //If there is only one section in the #MainContent div (that means that the user hasn't added anything), display the widget after the first child of #MainContent
    if (!mainContentShopify.hasChildNodes()) {
        mainContentShopify.insertBefore(clone, first_child(mainContentShopify));
    }
    //If ther eare multiple sections in the #MainContent div, display the widget after the first section
    else {
        mainContentShopify.childNodes.forEach((child) => {
            const text = data_of(child);

            if (text.includes('section-template') && text.includes('__main')) {
                mainContentShopify.insertBefore(clone, child.nextSibling);
                return;
            }
        });

        mainContentShopify.insertBefore(clone, first_child(mainContentShopify));
    }
};

//https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace#whitespace_helper_functions

/**
 * Throughout, whitespace is defined as one of the characters
 *  "\t" TAB \u0009
 *  "\n" LF  \u000A
 *  "\r" CR  \u000D
 *  " "  SPC \u0020
 *
 * This does not use JavaScript's "\s" because that includes non-breaking
 * spaces (and also some other characters).
 */

/**
 * Determine whether a node's text content is entirely whitespace.
 *
 * @param nod  A node implementing the |CharacterData| interface (i.e.,
 *               a |Text|, |Comment|, or |CDATASection| node
 * @return     True if all of the text content of |nod| is whitespace,
 *             otherwise false.
 */
function is_all_ws(nod) {
    return !/[^\t\n\r ]/.test(nod.textContent);
}

/**
 * Determine if a node should be ignored by the iterator functions.
 *
 * @param nod  An object implementing the DOM1 |Node| interface.
 * @return     true if the node is:
 *                1) A |Text| node that is all whitespace
 *                2) A |Comment| node
 *             and otherwise false.
 */

function is_ignorable(nod) {
    return (
        nod.nodeType === 8 || // A comment node
        (nod.nodeType === 3 && is_all_ws(nod))
    ); // a text node, all ws
}

/**
 * Version of |firstChild| that skips nodes that are entirely
 * whitespace and comments.
 *
 * @param sib  The reference node.
 * @return     Either:
 *               1) The first child of |sib| that is not
 *                  ignorable according to |is_ignorable|, or
 *               2) null if no such node exists.
 */
function first_child(par) {
    let res = par.firstChild;
    while (res) {
        if (!is_ignorable(res)) {
            return res;
        }
        res = res.nextSibling;
    }
    return null;
}

/**
 * Version of |data| that doesn't include whitespace at the beginning
 * and end and normalizes all whitespace to a single space. (Normally
 * |data| is a property of text nodes that gives the text of the node.)
 *
 * @param txt  The text node whose data should be returned
 * @return     A string giving the contents of the text node with
 *             whitespace collapsed.
 */
function data_of(txt) {
    let data = txt.textContent;
    data = data.replace(/[\t\n\r ]+/g, ' ');
    if (data[0] === ' ') {
        data = data.substring(1, data.length);
    }
    if (data[data.length - 1] === ' ') {
        data = data.substring(0, data.length - 1);
    }
    return data;
}
