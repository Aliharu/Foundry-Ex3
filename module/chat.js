export function addChatListeners(html) {
    html.on('click', '.collapsable', _collapsableToggle);

    function _collapsableToggle(ev) {
        const li = $(ev.currentTarget).next();
        li.toggle("fast");
    }
}
