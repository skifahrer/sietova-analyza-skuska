(function ($) {
    $("#djikstra").click(function () {
        let k = new Djikstra(plot);
        k.compute();
    });
})(jQuery);


class Djikstra extends Algoritmus {
    compute() {
        let self = this;
        super.compute('Djikstrov Algoritmus');

        this.K = []; //na kreslenie
        let Visited = [];
        let Distances = this.node_matrix(this.graph.nodes()); //zoznam
        let node = this.starting_node(); // zaciatocny vrchol
        let zaciatocny_vrchol = node;
        Distances[node] = 0; //nastavime vzdialensot na -1
        Visited.push(node);
        this.log('Začiatočnému vrcholu nastavíme vzdialenosť na 0. Zvyšné majú -1 ako nekonecno', Distances, false);

        let i = 0;
        while (Visited.length < this.graph.nodes().length) {
            let edges = this.include_label_to_edges(this.graph.outEdges(node))
            this.log('Cyklus: ' + i + '. </br></br>Pozerame hrany z vrcholu <b>' + node + '</b>', edges, true, '#00a3e3');
            Distances = this.update_distances(edges, node, Distances, Visited);
            let Distances_sorted = this.sort_assoc(Distances); //utriedime
            this.log('Cyklus: ' + i + '. </br></br> Updatli sme vzdialenosti', Distances_sorted, false);
            node = this.pick_node(Distances_sorted, Visited);

            this.log('Cyklus: ' + i + '. </br></br> Vybrali sme dalsi vrchol na pozeranie <b>' + node + '</b>', node, true, '#00a3e3');
            Visited.push(node);
            i++;

        }
        let Distances_sorted = this.sort_assoc(Distances); //utriedime

        this.log('Presli sme vsetky vrcholy od vrcholu: <b>' + zaciatocny_vrchol + '</b>, mame vzdialenosti zo zaciatocneho ku kazdemu vrcholu', this.K, true);
        this.log('Vzdialenosti z vrcholu: <b>' + zaciatocny_vrchol + '</b>', Distances_sorted, false);
    }

    pick_node(Distances_sorted, Visited) {
        let final = '';
        _.forEach(Distances_sorted, function (distance, node) {

            if (distance === -1) {
                return;
            }

            if (_.includes(Visited, node)) {
                return;
            } else {
                final = node;
                return false;
            }
        });
        return final;
    }

    update_distances(edges, node, Distances, Visited) {
        let self = this;
        _.forEach(edges, function (edge) {
            let nova_vzdialenost = Distances[node] + parseInt(self.label(edge));
            if (nova_vzdialenost < Distances[edge.w] || Distances[edge.w] === -1) {
                Distances[edge.w] = nova_vzdialenost;
                self.update_final_edges(node, edge.w);
            }
        });
        return Distances;
    }

    update_final_edges(v, w) {
        let incoming_edges = this.graph.inEdges(w);
        this.K = _.differenceWith(this.K, incoming_edges, _.isEqual);
        let edge = {v: v, w: w};
        this.K.push(edge);
    }
}