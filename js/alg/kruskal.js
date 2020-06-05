
(function ($) {
    $("#kruskal").click(function () {
        var k = new Kruskal(plot);
        k.compute();
    });
})(jQuery);


class Kruskal extends Algoritmus {
    compute() {
        super.compute('Kruskalov Algoritmus');

        if (this.graph.isDirected()) {
            this.orientovany();
        } else {
            this.neorientovany();
        }
    }

    orientovany() {
        var K = [];
        let bad_edges = [];
        let self = this;
        //
        let kostra = new graphlib.Graph({directed: this.graph.isDirected()});

        //utriedene hrany
        let S = this.edges_sorted();

        //ziskaj oznaceny vrchol
        let nodes = this.plot.vis.getSelectedNodes();
        var node;
        if (nodes.length === 0) {
            node = S[0].v;
            this.log('Kedze vrchol nebol oznaceny, tak vyberieme najmensiu hranu a z vychodiskoveho vrcholu spravime nas hlavny vrchol. A tym vrcholom je: <b>' + node + '</b>', node, false);

        } else {
            node = nodes[0];
            this.log('Ideme hladat kostru z oznaceneho vrcholu: <b>' + node + '</b>', node, false);
        }

        //ziskaj hrany z vychodiskoveho bodu
        let edges = this.include_label_to_edges(this.graph.outEdges(node));

        //utried
        let vytriedene_hrany = this.sort_edges(edges, 'asc');

        //pridaj do kostry
        let edge = vytriedene_hrany[0]; //prva hrana z pola
        kostra.setEdge(edge.v, edge.w); //pridame hranu do naseho grafu
        K.push(edge); //pridame do inej kostry na kreselnie
        let output = 'Vybrali sme uvodnu hranu z vrcholu: <b>' + edge.v + '</b> do vrcholu: <b>' + edge.w + '</b> s hodnotou: <b>' + edge.value.label + '</b><br/>';
        this.log(output, K, true);

        let i = 0;
        let j = 0;
        while (kostra.nodes().length < this.graph.nodes().length) {
            let kostra_edges = this.include_label_to_edges(kostra.edges());
            let con_edges = this.get_outgoing_edges_from_selected_nodes_and_sort(kostra.nodes());
            let con_edges_without_bad_visited = _.differenceWith(con_edges, bad_edges, _.isEqual);
            let edges = _.differenceWith(con_edges_without_bad_visited, kostra_edges, _.isEqual);

            this.log('Cyklus: ' + i + '. </br></br>Vybrali sme vsetky hrany ktore nemame v kostre a vychadzaju z vrholov kostry. Tie hrany sme potom zotriedili podla hodnoty. Z nich budeme potom vyberat najmensiu.', edges, true, '#00a3e3');

            _.forEach(edges, function (edge) {

                let output = 'Cyklus: ' + i + '. </br> Hrana zo zonamu: ' + j + '. </br></br>Vybrali sme hranu z vrcholu: <b>' + edge.v + '</b> do vrcholu: <b>' + edge.w + '</b> s hodnotou: <b>' + edge.value.label + '</b><br/>';

                let component_prev = graphlib.alg.components(kostra);
                kostra.setEdge(edge.v, edge.w); //pridame hranu do naseho grafu
                let component_afte = graphlib.alg.components(kostra);

                if (_.isEqual(self.sort(component_prev), self.sort(component_afte))) {
                    kostra.removeEdge(edge.v, edge.w);
                    bad_edges.push(edge);
                    output += 'Avsak nepridame ju do kostry lebo uz by sme mali cyklus.';
                    self.log(output, [edge], true, '#ea5646');
                } else {
                    output += 'Kedze hrana spaja dva komponenty a nemame cyklus, tak ju pridame do kostry. </br></br>Cyklus: ' + i + '. koncime, lebo sme pridali hranu a musime nanovo spravit zoznam hran.</br>';
                    K.push(edge); //pridame do inej kostry na kreselnie
                    self.log(output, K, true);
                    return false;
                }
                j++;
            });
            j = 0;
            i++;
        }

        let hodnoty = _.map(K, function (e) {
            return parseInt(e.value.label)
        });
        this.log('Kedze graf uz obsahuje vsetky vrcholy, tak cyklusy koncime.<br/>Hura mame minimalnu finalnu kostru grafu. Celkove ohodnotenie minimalnej kostry je: ' + _.join(hodnoty, ' + ') + ' =  ' + _.sum(hodnoty), K, true);

    }

    neorientovany() {
        var K = [];
        let kostra = new graphlib.Graph({directed: this.graph.isDirected()});

        let S = this.edges_sorted();
        this.log('Vybrali sme vsetky hrany a zotriedili ich podla hodnoty hrany. Poznamka: paramter label je hodnota hrany.', S, false);

        let j = 0;
        while (kostra.nodes().length < this.graph.nodes().length) //ideme dokym neminieme vsetky casti pola alebo uz to nebude obsahovat vsetky vrcholy
        {
            let component_prev = graphlib.alg.components(kostra);

            let edge = S[0]; //prva hrana z pola
            S.shift(); //aj vymazaeme rovno prvy element z pola
            kostra.setEdge(edge.v, edge.w); //pridame hranu do naseho grafu

            let component_afte = graphlib.alg.components(kostra);

            let output = 'Hrana zo zonamu: ' + j + '<br/><br/>Vybrali sme hranu z vrcholu: <b>' + edge.v + '</b> do vrcholu: <b>' + edge.w + '</b> s hodnotou: <b>' + edge.value.label + '</b><br/>';

            /** kontrola ci prepaja komponenty*/
            if (_.isEqual(this.sort(component_prev), this.sort(component_afte))) {
                kostra.removeEdge(edge.v, edge.w);
                output = 'Avsak nepridame ju do kostry lebo uz by sme mali cyklus.';
                this.log(output, [edge], true, '#ea5646');
            } else {
                output += 'Kedze hrana spaja dva komponenty a nemame cyklus, tak ju pridame do kostry.</br>';
                K.push(edge); //pridame do inej kostry na kreselnie
                this.log(output, K, true);
            }
            j++;
        }
        let hodnoty = _.map(K, function (e) {
            return parseInt(e.value.label)
        });
        this.log('Kedze graf uz obsahuje vsetky vrcholy, tak cyklusy koncime. <br/>Hura mame minimalnu finalnu kostru grafu. Celkove ohodnotenie minimalnej kostry je: ' + _.join(hodnoty, ' + ') + ' =  ' + _.sum(hodnoty), K, true);
    }
}