(function ($) {
    $("#kruskal").click(function () {
        var k = new Kruskal();
        k.compute();
    });
})(jQuery);


class Kruskal extends Algoritmus {
    compute() {
        let edges_sorted = super.edges_sorted();
        this.log('Vybrali sme vsetky hrany a zotriedili ich podla hodnoty hrany. Poznamka: paramter label je hodnota hrany.', edges_sorted);


    }
}