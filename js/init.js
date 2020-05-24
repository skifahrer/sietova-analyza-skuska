(function ($) {
    $(function () {
        $("#graphinput").val("digraph { 1; 2; 1 -> 2}");
        M.textareaAutoResize($('#graphinput'));
    }); // end of document ready
})(jQuery); // end of jQuery name space


class Algoritmus {
    constructor() {
        this.dot = $("#graphinput").val();
        this.graph = new graphlibDot.read(this.dot);
        this.plot();
    }

    plot() {
        let network = new vis.Network(document.getElementById('canvas'), {});
        let data = vis.parseDOTNetwork(this.dot);
        network.setData(data);
    }

    compute() {
    }
}