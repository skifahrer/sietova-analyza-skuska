(function ($) {
    $("#kruskal").click(function () {
        var k = new Kruskal();
        k.compute();
    });
})(jQuery);


class Kruskal extends Algoritmus {
    compute() {
        let G = graphlib.alg.components(this.graph)[0]; //pretoze to vrati pole poli
        var A = [];
        var S = [];
        var K = [];

        let edges_sorted = super.edges_sorted();
        S = edges_sorted;         //pridame hrany do priority queue
        this.log('Vybrali sme vsetky hrany a zotriedili ich podla hodnoty hrany. Poznamka: paramter label je hodnota hrany.', edges_sorted, false);

        while (S.length > 0 && _.difference(G, A) !== []) //ideme dokym neminieme vsetky casti pola alebo uz to nebude obsahovat vsetky vrcholy
        {
            let edge = S[0]; //prvy element z pola
            S.shift(); //aj vymazaeme rovno prvy element z pola
            let output = 'Vybrali sme hranu z vrcholu: <b>' + edge.v + '</b> do vrcholu: <b>' + edge.w + '</b> s hodnotou: <b>' + edge.value.label + '</b><br/>';

            if (_.includes(A, edge.v) && _.includes(A, edge.w)) {
                output += 'Avsak nepridame ju do kostry lebo uz obidva vrcholy mame v kostre';
                this.log(output, edge, false);
            } else {
                if (!_.includes(A, edge.v)) {
                    output += 'Kedze hrana spaja vrchol <b>' + edge.v + '</b> ktory nemame v kostre, tak ju pridame do kostry.</br>';
                }
                if (!_.includes(A, edge.w)) {
                    output += 'Kedze hrana spaja vrchol <b>' + edge.w + '</b> ktory nemame v kostre, tak ju pridame do kostry.</br>';
                }
                K.push(edge); //pridame do kostry na kreselnie
                A.push(edge.v); // pridame do A na porovnanie
                A.push(edge.w); // pridame do A na porovnanie
                A = _.uniq(A); // ostranime z A
                this.log(output, K, true);
            }
        }
        let hodnoty = _.map(K, function (e) {
            return parseInt(e.value.label)
        });
        this.log('Hura mame minimalnu finalnu kostru grafu. Celkove ohodnotenie minimalnej kostry je: ' + _.join(hodnoty, ' + ') + ' =  ' + _.sum(hodnoty), K, true);
    }
}