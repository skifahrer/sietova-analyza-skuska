(function ($) {
    $("#prim").click(function () {
        var k = new Prim(plot);
        k.compute();
    });
})(jQuery);


class Prim extends Algoritmus {
    compute() {
        let self = this;
        super.compute('Primov Algoritmus');

        let kostra = new graphlib.Graph({directed: this.graph.isDirected()});
        let K = [];
        let S = this.include_label_to_edges(this.graph.edges());

        let nodes = this.plot.vis.getSelectedNodes();
        let node;
        if (nodes.length === 0) {
            node = S[(_.random(0, S.length - 1))].v;
            this.log('Kedze vrchol nebol oznaceny, tak vyberieme nahodne jeden vrchol, a tym vrcholom je: <b>' + node + '</b>', node, false);

        } else {
            node = nodes[0];
            this.log('Ideme hladat kostru z oznaceneho vrcholu: <b>' + node + '</b>', node, false);
        }

        //pridaj zaciatocny vrchol do grafu
        kostra.setNode(node);

        let i = 0;
        let j = 0;
        while (kostra.nodes().length < this.graph.nodes().length) {
            let kostra_edges = this.include_label_to_edges(kostra.edges());
            let con_edges = this.get_outgoing_edges_from_selected_nodes_and_sort(kostra.nodes());
            let edges = _.differenceWith(con_edges, kostra_edges, _.isEqual);

            this.log('Cyklus: ' + i + '. </br></br>Vybrali sme vsetky hrany ktore nemame v kostre a su spojene s vrcholmi kostry. Tie hrany sme potom zotriedili podla hodnoty a z nich budeme potom vyberat najmensiu.', edges, true, '#00a3e3');

            _.forEach(edges, function (edge) {

                let output = 'Cyklus: ' + i + '. </br> Hrana zo zonamu: ' + j + '. </br></br>Vybrali sme hranu z vrcholu: <b>' + edge.v + '</b> do vrcholu: <b>' + edge.w + '</b> s hodnotou: <b>' + edge.value.label + '</b><br/>';
                let component_prev = graphlib.alg.components(kostra);
                kostra.setEdge(edge.v, edge.w); //pridame hranu do naseho grafu
                let component_afte = graphlib.alg.components(kostra);

                if (_.isEqual(self.sort(component_prev), self.sort(component_afte))) {
                    kostra.removeEdge(edge.v, edge.w);
                    output += 'Avsak nepridame ju do kostry lebo uz by sme mali cyklus.';
                    self.log(output, [edge], false, '#ea5646');
                } else {
                    output += 'Kedze hrana spaja dva komponenty a nemame cyklus, tak ju pridame do kostry.</br></br>Cyklus: ' + i + '. koncime, lebo sme pridali hranu a musime nanovo spravit zoznam hran.</br>';
                    K.push(edge); //pridame do inej kostry na kreselnie
                    self.log(output, K, true);
                    return false;
                }
                j++;
            });
            j = 0;
            i++;
        }
        ;

        let hodnoty = _.map(K, function (e) {
            return parseInt(e.value.label)
        });
        this.log('Kedze graf uz obsahuje vsetky vrcholy, tak cyklusy koncime. Hura mame minimalnu finalnu kostru grafu. Celkove ohodnotenie minimalnej kostry je: ' + _.join(hodnoty, ' + ') + ' =  ' + _.sum(hodnoty), K, true);
    }
}